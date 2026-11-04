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
import { COLORS, SHADOWS, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  addDailyProduction,
  addPouletsBoxesBatch,
} from '../services/farmDataService';

export default function ProductionScreen({ navigation }) {
  // Initialisation synchrone en 0 ms depuis le cache mémoire (aucun flash d'interface)
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [subTab, setSubTab] = useState('production');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [boxe1Prod, setBoxe1Prod] = useState('');
  const [boxe2Prod, setBoxe2Prod] = useState('');
  const [boxe1Mort, setBoxe1Mort] = useState('');
  const [boxe2Mort, setBoxe2Mort] = useState('');
  const [tablettesVendues, setTablettesVendues] = useState('');
  const [consoAliment, setConsoAliment] = useState('');
  const [autoSyncStock, setAutoSyncStock] = useState(true);

  const [batchModal, setBatchModal] = useState(false);
  const [newBoxe1, setNewBoxe1] = useState('');
  const [newBoxe2, setNewBoxe2] = useState('');
  const [newMales, setNewMales] = useState('0');
  const [newBatchNote, setNewBatchNote] = useState('');

  const loadData = async () => {
    const u = await getCurrentUser();
    if (u) setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    setSummary(computeFarmSummary(wb));
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  // Seuls l'employé et le gérant ont accès aux formulaires de saisie.
  // L'administrateur voit immédiatement la supervision dès la milliseconde 0.
  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'employe' || user?.role === 'gerant';

  const prodList = workbook?.production || [];
  const cleanDate = date.trim();
  const existingForDate = prodList.find((r) => r.date === cleanDate);

  // Détails déjà ajoutés sur cette date (chaque détail déjà renseigné > 0 est verrouillé individuellement)
  const b1ProdLocked = Number(existingForDate?.boxe1Produits) > 0;
  const b2ProdLocked = Number(existingForDate?.boxe2Produits) > 0;
  const b1MortLocked = Number(existingForDate?.boxe1Mortalite) > 0;
  const b2MortLocked = Number(existingForDate?.boxe2Mortalite) > 0;
  const alimLocked = Number(existingForDate?.consoAliment) > 0;
  const vendusLocked = Number(existingForDate?.tablettesVendues) > 0;

  const liveBoxe1P = b1ProdLocked ? 0 : Number(boxe1Prod) || 0;
  const liveBoxe2P = b2ProdLocked ? 0 : Number(boxe2Prod) || 0;
  const totalDayProduction =
    (Number(existingForDate?.boxe1Produits) || 0) +
    (Number(existingForDate?.boxe2Produits) || 0) +
    liveBoxe1P +
    liveBoxe2P;

  const liveBoxe1M = b1MortLocked ? 0 : Number(boxe1Mort) || 0;
  const liveBoxe2M = b2MortLocked ? 0 : Number(boxe2Mort) || 0;
  const liveConso = alimLocked ? 0 : Number(consoAliment) || 0;
  const liveVendus = vendusLocked ? 0 : Number(tablettesVendues) || 0;

  const s = summary || {};
  const liveRestantVivant = Math.max(0, (s.vivantsTotal || 7385) - (liveBoxe1M + liveBoxe2M));

  const handleSaveProduction = async () => {
    if (!canEdit) return;

    if (
      liveBoxe1P === 0 &&
      liveBoxe2P === 0 &&
      liveBoxe1M === 0 &&
      liveBoxe2M === 0 &&
      liveConso === 0 &&
      liveVendus === 0
    ) {
      Alert.alert('Saisie requise', 'Veuillez renseigner au moins un nouveau détail pour cette date.');
      return;
    }

    const updated = await addDailyProduction({
      date: cleanDate,
      boxe1Produits: liveBoxe1P,
      boxe2Produits: liveBoxe2P,
      boxe1Mortalite: liveBoxe1M,
      boxe2Mortalite: liveBoxe2M,
      tablettesVendues: liveVendus,
      consoAliment: liveConso,
      autoSyncStockage: autoSyncStock,
      auteur: user?.nom || user?.role || '',
    });

    if (updated?.alreadyExists) {
      Alert.alert(
        'Détail déjà ajouté',
        `Ce détail (${(updated.duplicateFields || []).join(', ')}) a déjà été enregistré pour le ${cleanDate}.`
      );
      return;
    }

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setBoxe1Prod('');
    setBoxe2Prod('');
    setBoxe1Mort('');
    setBoxe2Mort('');
    setTablettesVendues('');
    setConsoAliment('');

    Alert.alert('Enregistré', `Détails du ${cleanDate} mis à jour.`);
  };

  const handleAddBatch = async () => {
    if (!canEdit) return;
    const b1 = Number(newBoxe1) || 0;
    const b2 = Number(newBoxe2) || 0;
    const m = Number(newMales) || 0;
    if (b1 + b2 + m <= 0) {
      Alert.alert('Champs requis', 'Veuillez saisir le nombre de poulets.');
      return;
    }
    const updated = await addPouletsBoxesBatch({
      date: new Date().toISOString().split('T')[0],
      boxe1: b1,
      boxe2: b2,
      males: m,
      note: newBatchNote,
      auteur: user?.nom || user?.role || '',
    });

    if (updated?.alreadyExists) {
      Alert.alert('Déjà enregistré', 'Ce lot a déjà été ajouté aujourd’hui.');
      return;
    }

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setBatchModal(false);
    setNewBoxe1('');
    setNewBoxe2('');
    setNewMales('0');
    setNewBatchNote('');
  };

  const displayedProd = showAllHistory ? prodList : prodList.slice(0, 25);

  return (
    <NavigationLayout
      user={user}
      activeTab="Production"
      title="Production & Boxes"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabBtn, subTab === 'production' && styles.tabBtnActive]}
            onPress={() => setSubTab('production')}
          >
            <Ionicons
              name="egg"
              size={17}
              color={subTab === 'production' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabBtnText, subTab === 'production' && { color: '#FFFFFF' }]}>
              Production
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, subTab === 'boxes' && styles.tabBtnActive]}
            onPress={() => setSubTab('boxes')}
          >
            <Ionicons
              name="home"
              size={17}
              color={subTab === 'boxes' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.tabBtnText, subTab === 'boxes' && { color: '#FFFFFF' }]}>
              Boxes ({formatNumber(s.vivantsTotal)})
            </Text>
          </TouchableOpacity>
        </View>

        {isAdmin && (
          <View style={styles.adminWatchBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Ionicons name="eye" size={18} color="#1E40AF" />
              <Text style={styles.adminWatchText}>Supervision Administrateur</Text>
            </View>
            <TouchableOpacity
              style={styles.reportMiniBtn}
              onPress={() => navigation.navigate('RapportJournalier')}
            >
              <Ionicons name="document-text" size={14} color="#FFFFFF" />
              <Text style={styles.reportMiniBtnText}>Rapport</Text>
            </TouchableOpacity>
          </View>
        )}

        {subTab === 'production' ? (
          <>
            <View style={styles.summaryStrip}>
              <View style={styles.summaryStripItem}>
                <Text style={styles.stripVal}>{formatNumber(s.totalProdBoxe1)}</Text>
                <Text style={styles.stripLbl}>Boxe 1</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.summaryStripItem}>
                <Text style={styles.stripVal}>{formatNumber(s.totalProdBoxe2)}</Text>
                <Text style={styles.stripLbl}>Boxe 2</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.summaryStripItem}>
                <Text style={[styles.stripVal, { color: '#FEF08A' }]}>
                  {formatNumber(s.totalProductionTablettes)}
                </Text>
                <Text style={styles.stripLbl}>Total</Text>
              </View>
              <View style={styles.stripDivider} />
              <View style={styles.summaryStripItem}>
                <Text style={[styles.stripVal, { color: '#86EFAC' }]}>
                  {formatNumber(s.vivantsTotal)}
                </Text>
                <Text style={styles.stripLbl}>Vivants</Text>
              </View>
            </View>

            {/* Formulaire affiché uniquement si canEdit (Employé ou Gérant) */}
            {canEdit && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="add-circle" size={22} color={COLORS.primary} />
                    <Text style={styles.formTitle}>Saisie des détails du jour</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reportMiniBtn}
                    onPress={() => navigation.navigate('RapportJournalier', { date: cleanDate })}
                  >
                    <Ionicons name="document-text" size={14} color="#FFFFFF" />
                    <Text style={styles.reportMiniBtnText}>Rapport</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026-11-04"
                />

                <Text style={styles.sectionSubHeader}>Tablettes par Boxe</Text>
                <View style={styles.twoColRow}>
                  <View style={styles.colBox}>
                    <Text style={styles.colLabel}>Boxe 1</Text>
                    {b1ProdLocked ? (
                      <View style={styles.lockedFieldBox}>
                        <Ionicons name="lock-closed" size={14} color="#15803D" />
                        <Text style={styles.lockedFieldText}>
                          Déjà ajouté : {existingForDate.boxe1Produits}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={styles.numInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={boxe1Prod}
                        onChangeText={setBoxe1Prod}
                      />
                    )}
                  </View>

                  <View style={styles.colBox}>
                    <Text style={styles.colLabel}>Boxe 2</Text>
                    {b2ProdLocked ? (
                      <View style={styles.lockedFieldBox}>
                        <Ionicons name="lock-closed" size={14} color="#15803D" />
                        <Text style={styles.lockedFieldText}>
                          Déjà ajouté : {existingForDate.boxe2Produits}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={styles.numInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={boxe2Prod}
                        onChangeText={setBoxe2Prod}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.autoCalcBanner}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="calculator" size={20} color="#78350F" />
                    <Text style={styles.autoCalcLabel}>Total Production ({cleanDate})</Text>
                  </View>
                  <Text style={styles.autoCalcValue}>{formatNumber(totalDayProduction)} tab.</Text>
                </View>

                <Text style={styles.sectionSubHeader}>Mortalité par Boxe</Text>
                <View style={styles.twoColRow}>
                  <View style={styles.colBox}>
                    <Text style={styles.colLabel}>Boxe 1 (Morts)</Text>
                    {b1MortLocked ? (
                      <View style={styles.lockedFieldBox}>
                        <Ionicons name="lock-closed" size={14} color="#B91C1C" />
                        <Text style={[styles.lockedFieldText, { color: '#B91C1C' }]}>
                          Déjà ajouté : {existingForDate.boxe1Mortalite}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={[styles.numInput, { borderColor: '#FCA5A5' }]}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={boxe1Mort}
                        onChangeText={setBoxe1Mort}
                      />
                    )}
                  </View>

                  <View style={styles.colBox}>
                    <Text style={styles.colLabel}>Boxe 2 (Morts)</Text>
                    {b2MortLocked ? (
                      <View style={styles.lockedFieldBox}>
                        <Ionicons name="lock-closed" size={14} color="#B91C1C" />
                        <Text style={[styles.lockedFieldText, { color: '#B91C1C' }]}>
                          Déjà ajouté : {existingForDate.boxe2Mortalite}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={[styles.numInput, { borderColor: '#FCA5A5' }]}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={boxe2Mort}
                        onChangeText={setBoxe2Mort}
                      />
                    )}
                  </View>
                </View>

                <Text style={styles.sectionSubHeader}>Aliment & Ventes</Text>
                <View style={styles.twoColRow}>
                  <View style={styles.colBox}>
                    <Text style={styles.colLabel}>Aliment (Sacs)</Text>
                    {alimLocked ? (
                      <View style={styles.lockedFieldBox}>
                        <Ionicons name="lock-closed" size={14} color="#15803D" />
                        <Text style={styles.lockedFieldText}>
                          Déjà ajouté : {existingForDate.consoAliment} sacs
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={styles.numInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={consoAliment}
                        onChangeText={setConsoAliment}
                      />
                    )}
                  </View>

                  <View style={styles.colBox}>
                    <Text style={styles.colLabel}>Tablettes Vendues</Text>
                    {vendusLocked ? (
                      <View style={styles.lockedFieldBox}>
                        <Ionicons name="lock-closed" size={14} color="#15803D" />
                        <Text style={styles.lockedFieldText}>
                          Déjà ajouté : {existingForDate.tablettesVendues}
                        </Text>
                      </View>
                    ) : (
                      <TextInput
                        style={styles.numInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        value={tablettesVendues}
                        onChangeText={setTablettesVendues}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.livingInfoBar}>
                  <Text style={styles.livingInfoText}>
                    Restant vivant :{' '}
                    <Text style={{ fontWeight: '900', color: COLORS.secondary }}>
                      {formatNumber(liveRestantVivant)}
                    </Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAutoSyncStock(!autoSyncStock)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={autoSyncStock ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={COLORS.secondary}
                  />
                  <Text style={styles.checkboxLabel}>Synchroniser avec le stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProduction}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Enregistrer les nouveaux détails</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.historyHeaderRow}>
              <Text style={styles.historyTitle}>Historique ({prodList.length})</Text>
              <TouchableOpacity onPress={() => setShowAllHistory(!showAllHistory)}>
                <Text style={styles.toggleAllLink}>
                  {showAllHistory ? 'Réduire' : 'Tout voir'}
                </Text>
              </TouchableOpacity>
            </View>

            {displayedProd.map((row) => (
              <TouchableOpacity
                key={row.id}
                style={styles.prodRowCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('RapportJournalier', { date: row.date })}
              >
                <View style={styles.prodRowTop}>
                  <View style={styles.datePill}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.primaryDark} />
                    <Text style={styles.datePillText}>{row.date}</Text>
                  </View>
                  <View style={styles.totalProdBadge}>
                    <Text style={styles.totalProdBadgeText}>
                      {formatNumber(row.totalProduits)} tab.
                    </Text>
                  </View>
                </View>

                <View style={styles.prodMetricsGrid}>
                  <View style={styles.metricMini}>
                    <Text style={styles.metricMiniLbl}>Boxe 1</Text>
                    <Text style={styles.metricMiniVal}>{row.boxe1Produits}</Text>
                  </View>
                  <View style={styles.metricMini}>
                    <Text style={styles.metricMiniLbl}>Boxe 2</Text>
                    <Text style={styles.metricMiniVal}>{row.boxe2Produits}</Text>
                  </View>
                  <View style={styles.metricMini}>
                    <Text style={styles.metricMiniLbl}>Morts</Text>
                    <Text
                      style={[
                        styles.metricMiniVal,
                        row.boxe1Mortalite + row.boxe2Mortalite > 0 && { color: COLORS.danger },
                      ]}
                    >
                      {row.boxe1Mortalite} / {row.boxe2Mortalite}
                    </Text>
                  </View>
                  <View style={styles.metricMini}>
                    <Text style={styles.metricMiniLbl}>Aliment</Text>
                    <Text style={styles.metricMiniVal}>{row.consoAliment} sacs</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View>
            <View style={styles.boxesOverviewCard}>
              <Text style={styles.boxesCardTitle}>Effectifs par Boxes</Text>

              <View style={styles.boxDetailCard}>
                <View style={styles.boxDetailHeader}>
                  <Text style={styles.boxName}>BOXE 1</Text>
                  <Text style={styles.boxLivingBadge}>{formatNumber(s.vivantsBoxe1)} vivants</Text>
                </View>
                <View style={styles.boxStatsRow}>
                  <Text style={styles.boxStatText}>Initial : {formatNumber(s.boxe1Initial)}</Text>
                  <Text style={[styles.boxStatText, { color: COLORS.danger }]}>
                    Morts : -{formatNumber(s.totalMortaliteBoxe1)}
                  </Text>
                </View>
              </View>

              <View style={styles.boxDetailCard}>
                <View style={styles.boxDetailHeader}>
                  <Text style={styles.boxName}>BOXE 2</Text>
                  <Text style={styles.boxLivingBadge}>{formatNumber(s.vivantsBoxe2)} vivants</Text>
                </View>
                <View style={styles.boxStatsRow}>
                  <Text style={styles.boxStatText}>Initial : {formatNumber(s.boxe2Initial)}</Text>
                  <Text style={[styles.boxStatText, { color: COLORS.danger }]}>
                    Morts : -{formatNumber(s.totalMortaliteBoxe2)}
                  </Text>
                </View>
              </View>

              <View style={styles.boxDetailCard}>
                <View style={styles.boxDetailHeader}>
                  <Text style={styles.boxName}>TOTAL POULAILLER</Text>
                  <Text style={[styles.boxLivingBadge, { backgroundColor: COLORS.primary }]}>
                    {formatNumber(s.vivantsTotal)} vivants
                  </Text>
                </View>
                <View style={styles.boxStatsRow}>
                  <Text style={styles.boxStatText}>
                    Initial : {formatNumber(s.totalPouletsInitial)} (dont {s.malesInitial} mâles)
                  </Text>
                  <Text style={[styles.boxStatText, { color: COLORS.danger }]}>
                    Morts : -{formatNumber(s.totalMortalite)}
                  </Text>
                </View>
              </View>

              {user?.role === 'gerant' && (
                <TouchableOpacity
                  style={styles.addBatchBtn}
                  onPress={() => setBatchModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.addBatchBtnText}>Ajouter un lot</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={batchModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nouveau lot</Text>
            <Text style={styles.colLabel}>Boxe 1</Text>
            <TextInput
              style={styles.numInput}
              keyboardType="numeric"
              placeholder="0"
              value={newBoxe1}
              onChangeText={setNewBoxe1}
            />
            <Text style={[styles.colLabel, { marginTop: 10 }]}>Boxe 2</Text>
            <TextInput
              style={styles.numInput}
              keyboardType="numeric"
              placeholder="0"
              value={newBoxe2}
              onChangeText={setNewBoxe2}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, backgroundColor: '#78716C', marginTop: 0 }]}
                onPress={() => setBatchModal(false)}
              >
                <Text style={styles.saveButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { flex: 1, marginTop: 0 }]}
                onPress={handleAddBatch}
              >
                <Text style={styles.saveButtonText}>Ajouter</Text>
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
  tabBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  adminWatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  adminWatchText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  reportMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    gap: 4,
  },
  reportMiniBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
    alignItems: 'center',
  },
  summaryStripItem: {
    flex: 1,
    alignItems: 'center',
  },
  stripVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  stripLbl: {
    color: '#FDE68A',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  stripDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 18,
    ...SHADOWS.medium,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  sectionSubHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 6,
    marginBottom: 6,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  colBox: {
    flex: 1,
  },
  colLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  numInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.4,
    borderColor: '#D6CFC2',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  lockedFieldBox: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#86EFAC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  lockedFieldText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  autoCalcBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF08A',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginVertical: 6,
  },
  autoCalcLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#713F12',
  },
  autoCalcValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#78350F',
  },
  livingInfoBar: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  livingInfoText: {
    fontSize: 13,
    color: '#14532D',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  checkboxLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  toggleAllLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  prodRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  prodRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5EFE6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  totalProdBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalProdBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  prodMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricMini: {
    flex: 1,
  },
  metricMiniLbl: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  metricMiniVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  boxesOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  boxesCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  boxDetailCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E7E0D3',
  },
  boxDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  boxName: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  boxLivingBadge: {
    backgroundColor: COLORS.secondary,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  boxStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  boxStatText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  addBatchBtn: {
    backgroundColor: COLORS.primaryDark,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  addBatchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
});
