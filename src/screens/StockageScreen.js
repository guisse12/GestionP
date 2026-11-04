import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
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
  addStockageAlimentMovement,
  addStockageOeufsMovement,
} from '../services/farmDataService';

export default function StockageScreen({ navigation }) {
  // Initialisation synchrone en 0 ms depuis le cache mémoire (aucun flash d'interface)
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [activeType, setActiveType] = useState('aliment');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entrees, setEntrees] = useState('');
  const [sorties, setSorties] = useState('');
  const [note, setNote] = useState('');

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

  // Seuls l'employé et le gérant ont accès au formulaire.
  // L'administrateur voit immédiatement la supervision dès la milliseconde 0.
  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'employe' || user?.role === 'gerant';

  const s = summary || {};
  const entNum = Number(entrees) || 0;
  const sortNum = Number(sorties) || 0;

  const fullList =
    activeType === 'aliment'
      ? workbook?.stockageAliment || []
      : workbook?.stockageOeufs || [];

  const cleanDate = date.trim();
  const detailsOfDate = fullList.filter((r) => r.date === cleanDate);

  const currentStock =
    activeType === 'aliment' ? s.stockSacsAlimentRestant || 0 : s.stockTablettesDisponibles || 0;
  const projectedStock = Math.max(0, currentStock + entNum - sortNum);

  const handleSaveMovement = async () => {
    if (!canEdit) return;

    if (entNum === 0 && sortNum === 0) {
      Alert.alert('Champs requis', 'Veuillez saisir un nombre en Entrées ou Sorties.');
      return;
    }

    let updated;
    if (activeType === 'aliment') {
      updated = await addStockageAlimentMovement({
        date: cleanDate,
        entrees: entNum,
        sorties: sortNum,
        note: note.trim(),
        auteur: user?.nom || user?.role || '',
      });
    } else {
      updated = await addStockageOeufsMovement({
        date: cleanDate,
        entrees: entNum,
        sorties: sortNum,
        note: note.trim(),
        auteur: user?.nom || user?.role || '',
      });
    }

    if (updated?.alreadyExists) {
      Alert.alert(
        'Détail déjà ajouté',
        `Ce détail (+${entNum} / -${sortNum}${note.trim() ? ` - ${note.trim()}` : ''}) a déjà été enregistré pour le ${cleanDate}.`
      );
      return;
    }

    const nextSummary = computeFarmSummary(updated);
    setWorkbook(updated);
    setSummary(nextSummary);
    setEntrees('');
    setSorties('');
    setNote('');

    Alert.alert('Enregistré', `Nouveau stock : ${projectedStock}`);
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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.switchBar}>
          <TouchableOpacity
            style={[styles.switchBtn, activeType === 'aliment' && styles.switchBtnActive]}
            onPress={() => setActiveType('aliment')}
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
            onPress={() => setActiveType('oeufs')}
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
              <Text style={styles.summaryLabel}>TOTAL ENTRÉES</Text>
              <Text style={styles.summaryBigVal}>{formatNumber(s.totalSacsAlimentEntres)} sacs</Text>
            </View>
            <View style={styles.summaryBadgeBox}>
              <Text style={styles.stockRestantNum}>{formatNumber(s.stockSacsAlimentRestant)}</Text>
              <Text style={styles.stockRestantLbl}>En Stock</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.summaryHero, { backgroundColor: COLORS.secondaryDark }]}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>TOTAL ENTRÉES</Text>
              <Text style={styles.summaryBigVal}>{formatNumber(s.totalOeufsEntres)} tab.</Text>
            </View>
            <View style={[styles.summaryBadgeBox, { backgroundColor: '#22C55E' }]}>
              <Text style={[styles.stockRestantNum, { color: '#FFFFFF' }]}>
                {formatNumber(s.stockTablettesDisponibles)}
              </Text>
              <Text style={[styles.stockRestantLbl, { color: '#DCFCE7' }]}>En Stock</Text>
            </View>
          </View>
        )}

        {/* Formulaire affiché uniquement si canEdit (Employé ou Gérant) */}
        {canEdit && (
          <View style={styles.formCard}>
            <View style={styles.formHeaderRow}>
              <Text style={styles.formTitle}>Nouveau détail de stock</Text>
              <TouchableOpacity
                style={styles.reportMiniBtn}
                onPress={() => navigation.navigate('RapportJournalier', { date: cleanDate })}
              >
                <Ionicons name="document-text" size={14} color="#FFFFFF" />
                <Text style={styles.reportMiniBtnText}>Rapport</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Date</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />

            {detailsOfDate.length > 0 && (
              <View style={styles.alreadyAddedBox}>
                <Text style={styles.alreadyAddedTitle}>
                  Détails déjà ajoutés le {cleanDate} ({detailsOfDate.length}) :
                </Text>
                {detailsOfDate.map((d) => (
                  <View key={d.id} style={styles.alreadyAddedRow}>
                    <Ionicons name="lock-closed" size={13} color="#15803D" />
                    <Text style={styles.alreadyAddedText}>
                      +{d.entrees} / -{d.sorties} {d.note ? `(${d.note})` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: COLORS.secondary }]}>+ Entrées</Text>
                <TextInput
                  style={[styles.numInput, { borderColor: '#86EFAC' }]}
                  keyboardType="numeric"
                  placeholder="0"
                  value={entrees}
                  onChangeText={setEntrees}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: COLORS.danger }]}>- Sorties</Text>
                <TextInput
                  style={[styles.numInput, { borderColor: '#FCA5A5' }]}
                  keyboardType="numeric"
                  placeholder="0"
                  value={sorties}
                  onChangeText={setSorties}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Détail / Motif (Optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Livraison, Boxe 1, Boxe 2..."
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
            />

            <View style={styles.livePreviewBox}>
              <Ionicons name="sync-circle" size={20} color="#78350F" />
              <Text style={styles.livePreviewText}>
                Stock restant :{' '}
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
          <TouchableOpacity
            key={item.id}
            style={styles.rowCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('RapportJournalier', { date: item.date })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowDate}>{item.date}</Text>
              {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
            </View>
            <View style={styles.rowMetrics}>
              <View style={styles.badgeEntree}>
                <Text style={styles.badgeEntreeText}>+{item.entrees}</Text>
              </View>
              <View style={styles.badgeSortie}>
                <Text style={styles.badgeSortieText}>-{item.sorties}</Text>
              </View>
              <View style={styles.badgeStock}>
                <Text style={styles.badgeStockText}>Stock: {item.stockRestant}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginBottom: 14,
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
    fontSize: 23,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryBadgeBox: {
    backgroundColor: '#FEF08A',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 92,
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
    fontSize: 15.5,
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
    borderRadius: 12,
    padding: 10,
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
    gap: 6,
    marginTop: 2,
  },
  alreadyAddedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  numInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  livePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  livePreviewText: {
    fontSize: 13,
    color: '#78350F',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  rowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  rowDate: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rowNote: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
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
    fontSize: 12,
    fontWeight: '800',
  },
  badgeSortie: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSortieText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
  badgeStock: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeStockText: {
    color: '#78350F',
    fontSize: 12,
    fontWeight: '800',
  },
});
