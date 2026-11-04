import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  updateOrderStatusByManager,
  deleteClientOrder,
  addFactureEntry,
  toggleFacturePaymentStatus,
} from '../services/farmDataService';

export default function CommandesScreen({ navigation }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [activeTab, setActiveTab] = useState('commandes');
  const [factureFilter, setFactureFilter] = useState('tous');

  const [modalVisible, setModalVisible] = useState(false);
  const [clientNom, setClientNom] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('2200');
  const [numeroFacture, setNumeroFacture] = useState('');
  const [statutFacture, setStatutFacture] = useState('Payé');

  const loadData = async () => {
    const u = await getCurrentUser();
    if (!u || (u.role !== 'admin' && u.role !== 'gerant')) {
      Alert.alert('Accès Réservé', 'Page réservée au Gérant et à l’Administrateur.');
      navigation.replace('Dashboard');
      return;
    }
    setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    setSummary(computeFarmSummary(wb));
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const handleOrderStatus = async (cmd, newStatut) => {
    const updated = await updateOrderStatusByManager(cmd.id, newStatut);
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
  };

  const handleCreateFacture = async () => {
    const qte = Number(quantite) || 0;
    const pu = Number(prixUnitaire) || 2200;
    if (!clientNom.trim() || qte <= 0) {
      Alert.alert('Champs requis', 'Veuillez saisir le client et la quantité.');
      return;
    }

    const updated = await addFactureEntry({
      date: new Date().toISOString().split('T')[0],
      numeroFacture: numeroFacture.trim() || String(92 + (workbook?.factures?.length || 0)),
      quantite: qte,
      prixUnitaire: pu,
      client: clientNom.trim(),
      statut: statutFacture,
    });

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setModalVisible(false);
    setClientNom('');
    setQuantite('');
    setNumeroFacture('');
  };

  const handleToggleFacture = async (facture) => {
    const updated = await toggleFacturePaymentStatus(facture.id);
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
  };

  const s = summary || {};
  const commandesList = workbook?.commandes || [];
  const allFactures = workbook?.factures || [];
  const filteredFactures = allFactures.filter((f) => {
    if (factureFilter === 'tous') return true;
    return f.statut === factureFilter;
  });

  const liveFactureTotal = (Number(quantite) || 0) * (Number(prixUnitaire) || 0);

  return (
    <NavigationLayout
      user={user}
      activeTab="Commandes"
      title="Commandes & Factures"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'commandes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('commandes')}
          >
            <Ionicons
              name="bag-check"
              size={17}
              color={activeTab === 'commandes' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'commandes' && { color: '#FFFFFF' }]}>
              Commandes ({commandesList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'factures' && styles.tabBtnActive]}
            onPress={() => setActiveTab('factures')}
          >
            <Ionicons
              name="receipt"
              size={17}
              color={activeTab === 'factures' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'factures' && { color: '#FFFFFF' }]}>
              Factures ({allFactures.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryHero}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>VENTES PAYÉES</Text>
            <Text style={[styles.summaryVal, { color: '#86EFAC' }]}>
              {formatFCFA(s.totalVentesPayees)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>NON PAYÉES</Text>
            <Text style={[styles.summaryVal, { color: '#FDE047' }]}>
              {formatFCFA(s.totalVentesNonPayees)}
            </Text>
          </View>
        </View>

        {activeTab === 'commandes' ? (
          <>
            {commandesList.length === 0 ? (
              <View style={styles.orderCard}>
                <Text style={{ textAlign: 'center', fontWeight: '800', color: COLORS.textSecondary, paddingVertical: 12 }}>
                  Aucune commande en cours
                </Text>
              </View>
            ) : (
              commandesList.map((cmd) => {
                const isPending = cmd.statut === 'En attente';
                const isConfirmed = cmd.statut === 'Confirmée';
                const isPaid = cmd.statut === 'Livrée & Payée';
                return (
                  <View key={cmd.id} style={styles.orderCard}>
                    <View style={styles.orderTopRow}>
                      <View>
                        <Text style={styles.orderNum}>
                          {cmd.numeroCommande} • {cmd.clientNom}
                        </Text>
                        <Text style={styles.orderMeta}>
                          📞 {cmd.clientTelephone} • {cmd.date}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isPending && { backgroundColor: '#FEF3C7' },
                          isConfirmed && { backgroundColor: '#E0F2FE' },
                          isPaid && { backgroundColor: '#DCFCE7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isPending && { color: '#B45309' },
                            isConfirmed && { color: '#0284C7' },
                            isPaid && { color: '#15803D' },
                          ]}
                        >
                          {cmd.statut}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderDetailsBox}>
                      <Text style={styles.orderQtyText}>
                        🥚 <Text style={{ fontWeight: '900' }}>{cmd.quantiteTablettes} tab.</Text> ×{' '}
                        {formatFCFA(cmd.prixUnitaire)} ={' '}
                        <Text style={{ fontWeight: '900', color: COLORS.primary }}>
                          {formatFCFA(cmd.total)}
                        </Text>
                      </Text>
                      <Text style={styles.orderAddress}>
                        📍 {cmd.modeReception} : {cmd.adresseLivraison}
                      </Text>
                      {cmd.note ? <Text style={styles.orderNote}>💬 "{cmd.note}"</Text> : null}
                    </View>

                    <View style={styles.orderActionsRow}>
                      {cmd.statut === 'En attente' && (
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: '#0284C7' }]}
                          onPress={() => handleOrderStatus(cmd, 'Confirmée')}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          <Text style={styles.actionBtnText}>Confirmer</Text>
                        </TouchableOpacity>
                      )}

                      {!cmd.factureGeneree && cmd.statut !== 'Annulée' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: COLORS.secondary }]}
                            onPress={() => handleOrderStatus(cmd, 'Livrée & Payée')}
                          >
                            <Ionicons name="cash" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Payée</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#D97706' }]}
                            onPress={() => handleOrderStatus(cmd, 'Livrée (Non Payé)')}
                          >
                            <Ionicons name="time" size={16} color="#FFFFFF" />
                            <Text style={styles.actionBtnText}>Crédit</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={async () => {
                          const next = await deleteClientOrder(cmd.id);
                          setWorkbook(next);
                          setSummary(computeFarmSummary(next));
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                        <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <View style={styles.factureTopControls}>
              <View style={styles.filterPills}>
                {['tous', 'Payé', 'Non Payé'].map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, factureFilter === f && styles.filterPillActive]}
                    onPress={() => setFactureFilter(f)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        factureFilter === f && { color: '#FFFFFF' },
                      ]}
                    >
                      {f === 'tous' ? 'Toutes' : f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.newFactureBtn}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.newFactureBtnText}>+ Facture</Text>
              </TouchableOpacity>
            </View>

            {filteredFactures.map((f) => {
              const isPaye = f.statut === 'Payé';
              return (
                <View key={f.id} style={styles.factureCard}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.factureClient}>{f.client}</Text>
                      <Text style={styles.factureNumBadge}>N° {f.numeroFacture || '-'}</Text>
                    </View>
                    <Text style={styles.factureDetail}>
                      {f.date} • {formatNumber(f.quantite)} tab. × {formatFCFA(f.prixUnitaire)}
                    </Text>
                    <Text style={styles.factureTotal}>{formatFCFA(f.total)}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.payStatusToggle,
                      isPaye
                        ? { backgroundColor: '#DCFCE7', borderColor: '#16A34A' }
                        : { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
                    ]}
                    onPress={() => handleToggleFacture(f)}
                  >
                    <Ionicons
                      name={isPaye ? 'checkmark-circle' : 'alert-circle'}
                      size={15}
                      color={isPaye ? '#15803D' : '#DC2626'}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: isPaye ? '#15803D' : '#DC2626',
                      }}
                    >
                      {f.statut}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouvelle Facture</Text>

            <Text style={styles.label}>Client *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du client"
              value={clientNom}
              onChangeText={setClientNom}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Quantité *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  value={quantite}
                  onChangeText={setQuantite}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Prix Unitaire</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={prixUnitaire}
                  onChangeText={setPrixUnitaire}
                />
              </View>
            </View>

            <Text style={styles.label}>Statut</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginVertical: 6 }}>
              {['Payé', 'Non Payé'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusChoice,
                    statutFacture === st && {
                      backgroundColor: st === 'Payé' ? COLORS.secondary : COLORS.danger,
                    },
                  ]}
                  onPress={() => setStatutFacture(st)}
                >
                  <Text
                    style={{
                      fontWeight: '800',
                      color: statutFacture === st ? '#FFFFFF' : COLORS.textPrimary,
                    }}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.previewTotalBox}>
              <Text style={styles.previewTotalText}>
                Total : {formatFCFA(liveFactureTotal)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#78716C' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleCreateFacture}
              >
                <Text style={styles.modalBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  summaryHero: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  summaryLabel: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontWeight: '800',
  },
  summaryVal: {
    fontSize: 16.5,
    fontWeight: '900',
    marginTop: 4,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  orderMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  orderDetailsBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  orderQtyText: {
    fontSize: 13.5,
    color: COLORS.textPrimary,
  },
  orderAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  orderNote: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#78350F',
    marginTop: 4,
  },
  orderActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  factureTopControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    backgroundColor: '#EFECE6',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryDark,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  newFactureBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  newFactureBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  factureCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  factureClient: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  factureNumBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  factureDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  factureTotal: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 3,
  },
  payStatusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusChoice: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EFECE6',
    alignItems: 'center',
  },
  previewTotalBox: {
    backgroundColor: '#FEF08A',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  previewTotalText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#713F12',
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
