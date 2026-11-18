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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatNumber, formatFCFA } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  addStockageAlimentMovement,
  addStockageOeufsMovement,
  updateStockageMovement,
  deleteStockageMovement,
  getNextSuggestedFactureNumber,
} from '../services/farmDataService';

export default function StockageScreen({ navigation }) {
  // Initialisation synchrone en 0 ms depuis le cache mémoire (aucun flash d'interface)
  const initS = getCachedSummary();
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => initS);
  const [activeType, setActiveType] = useState('aliment');

  // Pour les sacs d'aliment : choix clair entre 'sortie' (Consommation) ou 'entree' (Arrivage)
  const [alimentMode, setAlimentMode] = useState('sortie');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantite, setQuantite] = useState('');
  const [note, setNote] = useState('');

  // Pour une sortie de tablettes d'œufs : prise en compte du prix unitaire et du numéro de facture
  const [isSaleFacture, setIsSaleFacture] = useState(true);
  const [numeroFactureOeuf, setNumeroFactureOeuf] = useState('');
  const [prixUnitaireOeuf, setPrixUnitaireOeuf] = useState(() =>
    String(initS?.prixTabletteDefaut || 2200)
  );
  const [statutPaiement, setStatutPaiement] = useState('Payé');

  // Modale de modification d'un mouvement en cas d'erreur de saisie
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editMode, setEditMode] = useState('sortie');
  const [editQuantite, setEditQuantite] = useState('');
  const [editNote, setEditNote] = useState('');

  const loadData = async () => {
    const u = await getCurrentUser();
    if (u) setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    const s = computeFarmSummary(wb);
    setSummary(s);
    setPrixUnitaireOeuf(String(s.prixTabletteDefaut || 2200));
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'employe' || user?.role === 'gerant';
  const canModifyHistory = user?.role === 'admin' || user?.role === 'gerant' || user?.role === 'employe';

  const s = summary || {};
  const qteNum = Number(quantite) || 0;
  const cleanDate = date.trim();

  // Production d'œufs déjà enregistrée automatiquement depuis la page Production à cette date
  const prodRecordOfDate = (workbook?.production || []).find((r) => r.date === cleanDate);
  const autoProdTablettesOfDate = Number(prodRecordOfDate?.totalProduits) || 0;

  const fullList =
    activeType === 'aliment'
      ? workbook?.stockageAliment || []
      : workbook?.stockageOeufs || [];

  const detailsOfDate = fullList.filter((r) => r.date === cleanDate);

  // Dans Aliment : soit entrée (arrivage), soit sortie (consommation).
  // Dans Œufs : les entrées viennent 100% automatiquement de Production, donc ici uniquement Sortie !
  const entNum = activeType === 'aliment' && alimentMode === 'entree' ? qteNum : 0;
  const sortNum = activeType === 'aliment' ? (alimentMode === 'sortie' ? qteNum : 0) : qteNum;

  const currentStock =
    activeType === 'aliment' ? s.stockSacsAlimentRestant || 0 : s.stockTablettesDisponibles || 0;
  const projectedStock = Math.max(0, currentStock + entNum - sortNum);
  const puNum = Number(prixUnitaireOeuf) || s.prixTabletteDefaut || 2200;
  const liveMontantVente = sortNum * puNum;

  const handleSaveMovement = async () => {
    if (!canEdit) return;

    if (qteNum <= 0) {
      Alert.alert('Quantité requise', 'Veuillez saisir une quantité supérieure à 0.');
      return;
    }

    let updated;
    if (activeType === 'aliment') {
      updated = await addStockageAlimentMovement({
        date: cleanDate,
        entrees: entNum,
        sorties: sortNum,
        note:
          note.trim() ||
          (entNum > 0 ? 'Arrivage sacs aliment' : 'Consommation du jour'),
        auteur: user?.nom || user?.role || '',
      });
    } else {
      updated = await addStockageOeufsMovement({
        date: cleanDate,
        entrees: 0, // Les entrées d'œufs proviennent uniquement et automatiquement de la page Production
        sorties: sortNum,
        note: note.trim() || (isSaleFacture ? 'Client Comptoir' : 'Sortie stock'),
        auteur: user?.nom || user?.role || '',
        createFacture: isSaleFacture,
        numeroFacture: numeroFactureOeuf.trim(),
        prixUnitaire: puNum,
        statutFacture: statutPaiement,
      });
    }

    if (updated?.duplicateInvoiceNumberForDate) {
      Alert.alert(
        'Numéro de facture déjà utilisé à cette date',
        `La facture N° ${numeroFactureOeuf.trim()} existe déjà pour le ${cleanDate} (${updated.existingInvoice?.client}).\n\nDeux factures peuvent avoir le même numéro uniquement si leurs dates sont différentes.`
      );
      return;
    }

    if (updated?.insufficientStock) {
      Alert.alert(
        'Stock insuffisant',
        `Impossible de sortir ${qteNum} ${activeType === 'aliment' ? 'sacs' : 'tablettes'} : il ne reste que ${updated.availableStock} en stock.`
      );
      return;
    }

    if (updated?.alreadyExists) {
      Alert.alert(
        'Détail déjà ajouté',
        `Ce mouvement a déjà été enregistré pour le ${cleanDate}. Vous pouvez le modifier en cas d’erreur.`
      );
      return;
    }

    const nextSummary = computeFarmSummary(updated);
    setWorkbook(updated);
    setSummary(nextSummary);
    setQuantite('');
    setNote('');
    setNumeroFactureOeuf('');

    Alert.alert(
      'Enregistré',
      activeType === 'oeufs' && isSaleFacture
        ? `Sortie de ${sortNum} tablettes enregistrée (${formatFCFA(liveMontantVente)}). Nouveau stock : ${projectedStock} tab.`
        : `Mouvement enregistré. Nouveau stock : ${projectedStock}`
    );
  };

  const openEditMovementModal = (item) => {
    setEditingItem(item);
    setEditDate(item.date || new Date().toISOString().split('T')[0]);
    const isEnt = Number(item.entrees) > 0;
    setEditMode(isEnt ? 'entree' : 'sortie');
    setEditQuantite(String(isEnt ? item.entrees : item.sorties));
    setEditNote(item.note || '');
    setEditModalVisible(true);
  };

  const handleSaveEditedMovement = async () => {
    if (!editingItem) return;
    const qte = Number(editQuantite) || 0;
    if (qte <= 0) {
      Alert.alert('Quantité requise', 'Veuillez saisir une quantité supérieure à 0.');
      return;
    }

    const updated = await updateStockageMovement({
      type: activeType,
      id: editingItem.id,
      date: editDate.trim(),
      entrees: editMode === 'entree' ? qte : 0,
      sorties: editMode === 'sortie' ? qte : 0,
      note: editNote.trim(),
      auteur: user?.nom || user?.role || '',
    });

    if (updated?.insufficientStock) {
      Alert.alert(
        'Stock insuffisant',
        `Impossible d’appliquer cette modification : le stock disponible maximal est de ${updated.availableStock}.`
      );
      return;
    }

    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    setEditModalVisible(false);
    setEditingItem(null);
    Alert.alert('Modifié ✅', 'Le mouvement de stock a été corrigé avec succès.');
  };

  const handleDeleteMovement = (item) => {
    const label = `${item.date} • ${Number(item.entrees) > 0 ? `+${item.entrees}` : `-${item.sorties}`} (${item.note || ''})`;
    Alert.alert('Supprimer ce mouvement ?', label, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteStockageMovement(activeType, item.id);
          setWorkbook(updated);
          setSummary(computeFarmSummary(updated));
          if (editingItem?.id === item.id) {
            setEditModalVisible(false);
            setEditingItem(null);
          }
        },
      },
    ]);
  };

  const listData = fullList.slice(0, 35);

  return (
    <NavigationLayout
      user={user}
      activeTab="Stockage"
      title="Stockage"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.switchBar}>
          <TouchableOpacity
            style={[styles.switchBtn, activeType === 'aliment' && styles.switchBtnActive]}
            onPress={() => {
              setActiveType('aliment');
              setQuantite('');
            }}
          >
            <Ionicons
              name="cube"
              size={18}
              color={activeType === 'aliment' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.switchText, activeType === 'aliment' && { color: '#FFFFFF' }]}>
              Sacs d’Aliment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchBtn, activeType === 'oeufs' && styles.switchBtnActive]}
            onPress={() => {
              setActiveType('oeufs');
              setQuantite('');
            }}
          >
            <Ionicons
              name="egg"
              size={18}
              color={activeType === 'oeufs' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text style={[styles.switchText, activeType === 'oeufs' && { color: '#FFFFFF' }]}>
              Œufs / Tablettes
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

        {activeType === 'aliment' ? (
          <View style={styles.summaryHero}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>TOTAL ENTRÉES • SORTIES</Text>
              <Text style={styles.summaryBigVal}>
                +{formatNumber(s.totalSacsAlimentEntres)} / -{formatNumber(s.totalSacsAlimentSortis)}
              </Text>
            </View>
            <View style={styles.summaryBadgeBox}>
              <Text style={styles.stockRestantNum}>{formatNumber(s.stockSacsAlimentRestant)}</Text>
              <Text style={styles.stockRestantLbl}>Sacs en Stock</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.summaryHero, { backgroundColor: COLORS.secondaryDark }]}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>PRODUITS (AUTO) • SORTIS</Text>
              <Text style={styles.summaryBigVal}>
                +{formatNumber(s.totalOeufsEntres)} / -{formatNumber(s.totalOeufsSortis)}
              </Text>
            </View>
            <View style={[styles.summaryBadgeBox, { backgroundColor: '#22C55E' }]}>
              <Text style={[styles.stockRestantNum, { color: '#FFFFFF' }]}>
                {formatNumber(s.stockTablettesDisponibles)}
              </Text>
              <Text style={[styles.stockRestantLbl, { color: '#DCFCE7' }]}>Tab. en Stock</Text>
            </View>
          </View>
        )}

        {/* Bandeau d'information automatique pour les Œufs : aucune ressaisie de la production ! */}
        {activeType === 'oeufs' && (
          <View style={styles.autoProdInfoCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Ionicons name="checkmark-done-circle" size={20} color="#15803D" />
              <View style={{ flex: 1 }}>
                <Text style={styles.autoProdTitle}>
                  Production du {cleanDate} reçue automatiquement : +{formatNumber(autoProdTablettesOfDate)} tab.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Formulaire affiché uniquement si canEdit (Employé ou Gérant) */}
        {canEdit && (
          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>
                {activeType === 'aliment'
                  ? 'Mouvement de Sacs d’Aliment'
                  : 'Sortie / Vente de Tablettes'}
              </Text>
              <TouchableOpacity
                style={styles.reportMiniBtn}
                onPress={() => navigation.navigate('RapportJournalier', { date: cleanDate })}
              >
                <Ionicons name="document-text" size={14} color="#FFFFFF" />
                <Text style={styles.reportMiniBtnText}>Rapport</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
            />

            {detailsOfDate.length > 0 && (
              <View style={styles.alreadyAddedBox}>
                <Text style={styles.alreadyAddedTitle}>
                  Mouvements du {cleanDate} ({detailsOfDate.length}) :
                </Text>
                {detailsOfDate.map((d) => (
                  <View key={d.id} style={styles.alreadyAddedRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                    <Text style={[styles.alreadyAddedText, { flex: 1 }]}>
                      {d.entrees > 0 ? `+${d.entrees} entrés ` : ''}
                      {d.sorties > 0 ? `-${d.sorties} sortis ` : ''}
                      {d.note ? `(${d.note})` : ''}
                    </Text>
                    <TouchableOpacity
                      style={styles.inlineEditBtn}
                      onPress={() => openEditMovementModal(d)}
                    >
                      <Ionicons name="create-outline" size={14} color="#78350F" />
                      <Text style={styles.inlineEditBtnText}>Modifier</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {activeType === 'aliment' ? (
              <>
                <Text style={styles.inputLabel}>Type d’opération</Text>
                <View style={styles.modeSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeChip,
                      alimentMode === 'sortie' && styles.modeChipSortieActive,
                    ]}
                    onPress={() => setAlimentMode('sortie')}
                  >
                    <Ionicons
                      name="remove-circle"
                      size={17}
                      color={alimentMode === 'sortie' ? '#FFFFFF' : COLORS.danger}
                    />
                    <Text
                      style={[
                        styles.modeChipText,
                        alimentMode === 'sortie' && { color: '#FFFFFF' },
                      ]}
                    >
                      Consommation (- Sortie)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeChip,
                      alimentMode === 'entree' && styles.modeChipEntreeActive,
                    ]}
                    onPress={() => setAlimentMode('entree')}
                  >
                    <Ionicons
                      name="add-circle"
                      size={17}
                      color={alimentMode === 'entree' ? '#FFFFFF' : COLORS.secondary}
                    />
                    <Text
                      style={[
                        styles.modeChipText,
                        alimentMode === 'entree' && { color: '#FFFFFF' },
                      ]}
                    >
                      Arrivage (+ Entrée)
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    { color: alimentMode === 'entree' ? COLORS.secondary : COLORS.danger },
                  ]}
                >
                  {alimentMode === 'entree'
                    ? 'Nombre de sacs reçus (+ Entrée)'
                    : 'Nombre de sacs consommés (- Sortie)'}
                </Text>
                <TextInput
                  style={[
                    styles.numInput,
                    { borderColor: alimentMode === 'entree' ? '#86EFAC' : '#FCA5A5' },
                  ]}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  value={quantite}
                  onChangeText={setQuantite}
                />
              </>
            ) : (
              <>
                {/* Pour les œufs : uniquement Sortie/Vente car les Entrées viennent de Production */}
                <View style={styles.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: COLORS.danger }]}>
                      Tablettes sorties / vendues *
                    </Text>
                    <TextInput
                      style={[styles.numInput, { borderColor: '#FCA5A5' }]}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      value={quantite}
                      onChangeText={setQuantite}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: COLORS.primaryDark }]}>
                      Prix / Tablette (FCFA)
                    </Text>
                    <TextInput
                      style={[styles.numInput, { borderColor: '#FCD34D' }]}
                      keyboardType="numeric"
                      placeholder="2200"
                      placeholderTextColor={COLORS.textMuted}
                      value={prixUnitaireOeuf}
                      onChangeText={setPrixUnitaireOeuf}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saleCheckRow}
                  onPress={() => setIsSaleFacture(!isSaleFacture)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSaleFacture ? 'checkbox' : 'square-outline'}
                    size={21}
                    color={COLORS.primary}
                  />
                  <Text style={styles.saleCheckText}>
                    Créer automatiquement la facture ({formatFCFA(liveMontantVente)})
                  </Text>
                </TouchableOpacity>

                {isSaleFacture && (
                  <>
                    <View style={styles.payStatusRow}>
                      {['Payé', 'Non Payé'].map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.payStatusChip,
                            statutPaiement === st && {
                              backgroundColor: st === 'Payé' ? COLORS.secondary : COLORS.danger,
                              borderColor: st === 'Payé' ? COLORS.secondary : COLORS.danger,
                            },
                          ]}
                          onPress={() => setStatutPaiement(st)}
                        >
                          <Text
                            style={[
                              styles.payStatusChipText,
                              statutPaiement === st && { color: '#FFFFFF' },
                            ]}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>
                      N° de Facture (personnalisable)
                    </Text>
                    <TextInput
                      style={[styles.input, { borderColor: '#F59E0B', borderWidth: 1.4 }]}
                      placeholder={`Auto : N° ${getNextSuggestedFactureNumber(workbook)} (ou saisir votre N°)`}
                      placeholderTextColor={COLORS.textMuted}
                      value={numeroFactureOeuf}
                      onChangeText={setNumeroFactureOeuf}
                    />
                  </>
                )}
              </>
            )}

            <Text style={styles.inputLabel}>
              {activeType === 'oeufs' && isSaleFacture ? 'Nom du Client / Détail' : 'Détail / Motif'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={
                activeType === 'aliment'
                  ? 'Consommation Boxe 1 & 2, Livraison...'
                  : 'Nom du client ou détail...'
              }
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.livePreviewBox}>
              <Ionicons name="sync-circle" size={20} color="#78350F" />
              <Text style={styles.livePreviewText}>
                Stock restant après opération :{' '}
                <Text style={{ fontWeight: '900' }}>
                  {formatNumber(projectedStock)} {activeType === 'aliment' ? 'sacs' : 'tablettes'}
                </Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMovement}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Historique ({fullList.length})</Text>

        {listData.map((item) => (
          <View key={item.id} style={styles.rowCard}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RapportJournalier', { date: item.date })}
            >
              <Text style={styles.rowDate}>{item.date}</Text>
              {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
            </TouchableOpacity>

            <View style={styles.rowMetrics}>
              {Number(item.entrees) > 0 && (
                <View style={styles.badgeEntree}>
                  <Text style={styles.badgeEntreeText}>+{item.entrees}</Text>
                </View>
              )}
              {Number(item.sorties) > 0 && (
                <View style={styles.badgeSortie}>
                  <Text style={styles.badgeSortieText}>-{item.sorties}</Text>
                </View>
              )}
              <View style={styles.badgeStock}>
                <Text style={styles.badgeStockText}>Stock: {item.stockRestant}</Text>
              </View>

              {canModifyHistory && (
                <TouchableOpacity
                  style={styles.rowEditBtn}
                  onPress={() => openEditMovementModal(item)}
                >
                  <Ionicons name="create-outline" size={16} color="#78350F" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modale de modification / suppression d'un mouvement de stock en cas d'erreur */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollInner}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Modifier le mouvement</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={editDate}
                onChangeText={setEditDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>Type de mouvement</Text>
              <View style={styles.modeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.modeChip,
                    editMode === 'sortie' && styles.modeChipSortieActive,
                  ]}
                  onPress={() => setEditMode('sortie')}
                >
                  <Text
                    style={[
                      styles.modeChipText,
                      editMode === 'sortie' && { color: '#FFFFFF' },
                    ]}
                  >
                    Sortie (-)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeChip,
                    editMode === 'entree' && styles.modeChipEntreeActive,
                  ]}
                  onPress={() => setEditMode('entree')}
                >
                  <Text
                    style={[
                      styles.modeChipText,
                      editMode === 'entree' && { color: '#FFFFFF' },
                    ]}
                  >
                    Entrée (+)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Quantité *</Text>
              <TextInput
                style={styles.numInput}
                keyboardType="numeric"
                value={editQuantite}
                onChangeText={setEditQuantite}
              />

              <Text style={styles.inputLabel}>Nom du Client / Détail</Text>
              <TextInput
                style={styles.input}
                value={editNote}
                onChangeText={setEditNote}
              />

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                {editingItem && (
                  <TouchableOpacity
                    style={[styles.modalActionBtn, { backgroundColor: '#FEE2E2', flex: 0.8 }]}
                    onPress={() => handleDeleteMovement(editingItem)}
                  >
                    <Ionicons name="trash-outline" size={17} color={COLORS.danger} />
                    <Text style={[styles.modalActionBtnText, { color: COLORS.danger }]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: '#78716C', flex: 0.8 }]}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalActionBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: COLORS.primary, flex: 1.2 }]}
                  onPress={handleSaveEditedMovement}
                >
                  <Text style={styles.modalActionBtnText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 30 },
  switchBar: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  switchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  switchBtnActive: {
    backgroundColor: COLORS.primary,
  },
  switchText: {
    fontSize: 13.5,
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
  summaryHero: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },
  summaryBigVal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryBadgeBox: {
    backgroundColor: '#FEF08A',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 96,
  },
  stockRestantNum: {
    fontSize: 21,
    fontWeight: '900',
    color: '#713F12',
  },
  stockRestantLbl: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
    marginTop: 2,
  },
  autoProdInfoCard: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoProdTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#14532D',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 6,
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
  alreadyAddedBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    padding: 9,
    marginTop: 8,
  },
  alreadyAddedTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#14532D',
    marginBottom: 4,
  },
  alreadyAddedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  alreadyAddedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  inlineEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  inlineEditBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#78350F',
  },
  modeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.2,
    borderColor: '#E7E0D3',
  },
  modeChipSortieActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  modeChipEntreeActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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
  saleCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  saleCheckText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  payStatusRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  payStatusChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#D6CFC2',
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payStatusChipText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  livePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  livePreviewText: {
    fontSize: 13,
    color: '#78350F',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  rowDate: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rowNote: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rowMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeEntree: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeEntreeText: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 12,
  },
  badgeSortie: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSortieText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12,
  },
  badgeStock: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeStockText: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 12,
  },
  rowEditBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 5,
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalScrollInner: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  modalActionBtn: {
    height: 44,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
