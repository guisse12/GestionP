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
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  updateBilanYellowBoxes,
} from '../services/farmDataService';

export default function BilanScreen({ navigation }) {
  const initS = getCachedSummary();
  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => getCachedWorkbook());
  const [summary, setSummary] = useState(() => initS);

  const [prixSacInput, setPrixSacInput] = useState(() => String(initS?.prixSacAliment || 0));
  const [prixPoussinInput, setPrixPoussinInput] = useState(() => String(initS?.prixPoussin || 0));
  const [prixTabletteInput, setPrixTabletteInput] = useState(() => String(initS?.prixTabletteDefaut || 2200));

  const loadData = async () => {
    const u = await getCurrentUser();
    setUser(u);
    const wb = await loadFarmWorkbook();
    setWorkbook(wb);
    const s = computeFarmSummary(wb);
    setSummary(s);
    setPrixSacInput(String(s.prixSacAliment || 0));
    setPrixPoussinInput(String(s.prixPoussin || 0));
    setPrixTabletteInput(String(s.prixTabletteDefaut || 2200));
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const isAdmin = user?.role === 'admin';
  const canEditPrices = user?.role === 'admin' || user?.role === 'gerant';
  const s = summary || {};

  const livePrixSac = Number(prixSacInput) || 0;
  const livePrixPoussin = Number(prixPoussinInput) || 0;
  const livePrixTablette = Number(prixTabletteInput) || 2200;
  const liveDepenseAliment = (s.totalSacsAlimentEntres || 3041) * livePrixSac;
  const liveDepensePoussins = (s.totalPouletsInitial || 8020) * livePrixPoussin;
  const liveTotalDepenses =
    liveDepenseAliment +
    liveDepensePoussins +
    (s.depenseSalaires || 0) +
    (s.depenseConstructions || 0) +
    (s.depenseAutres || 0);
  const liveReste = (s.totalVentesPayees || 0) - liveTotalDepenses;

  const handleSaveYellowBoxes = async () => {
    const updated = await updateBilanYellowBoxes({
      prixSacAliment: livePrixSac,
      prixPoussin: livePrixPoussin,
      prixTabletteDefaut: livePrixTablette,
    });
    setWorkbook(updated);
    setSummary(computeFarmSummary(updated));
    Alert.alert('Enregistré', 'Les nouveaux prix unitaires et le Bilan ont été mis à jour.');
  };

  return (
    <NavigationLayout
      user={user}
      activeTab="Bilan"
      title="Bilan"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBilanCard}>
          <Text style={styles.heroTopTag}>RESTE APRÈS DÉPENSES</Text>
          <Text
            style={[
              styles.heroResteAmount,
              liveReste < 0 && { color: '#FCA5A5' },
            ]}
          >
            {formatFCFA(liveReste)}
          </Text>
        </View>

        <View style={styles.yellowBoxesSection}>
          <View style={styles.yellowHeaderRow}>
            <View style={styles.yellowBadgeIcon}>
              <Ionicons name="pricetag" size={18} color="#713F12" />
            </View>
            <Text style={styles.yellowSectionTitle}>Prix unitaires (modifiables)</Text>
          </View>

          <View style={styles.yellowInputCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowInputTitle}>Prix d’une tablette d’œufs</Text>
              <Text style={styles.yellowInputDesc}>
                Tarif actuel appliqué aux ventes & commandes
              </Text>
              <Text style={styles.yellowCalcResult}>{formatFCFA(livePrixTablette)} / tab.</Text>
            </View>
            <TextInput
              style={styles.yellowTextInput}
              keyboardType="numeric"
              value={prixTabletteInput}
              onChangeText={setPrixTabletteInput}
              editable={canEditPrices}
              placeholder="2200"
            />
          </View>

          <View style={styles.yellowInputCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowInputTitle}>Prix d’un sac d’aliment</Text>
              <Text style={styles.yellowInputDesc}>
                {formatNumber(s.totalSacsAlimentEntres)} sacs
              </Text>
              <Text style={styles.yellowCalcResult}>{formatFCFA(liveDepenseAliment)}</Text>
            </View>
            <TextInput
              style={styles.yellowTextInput}
              keyboardType="numeric"
              value={prixSacInput}
              onChangeText={setPrixSacInput}
              editable={canEditPrices}
              placeholder="0"
            />
          </View>

          <View style={styles.yellowInputCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.yellowInputTitle}>Prix d’un poussin</Text>
              <Text style={styles.yellowInputDesc}>
                {formatNumber(s.totalPouletsInitial)} poussins
              </Text>
              <Text style={styles.yellowCalcResult}>{formatFCFA(liveDepensePoussins)}</Text>
            </View>
            <TextInput
              style={styles.yellowTextInput}
              keyboardType="numeric"
              value={prixPoussinInput}
              onChangeText={setPrixPoussinInput}
              editable={canEditPrices}
              placeholder="0"
            />
          </View>

          {canEditPrices && (
            <TouchableOpacity style={styles.saveYellowBtn} onPress={handleSaveYellowBoxes}>
              <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveYellowBtnText}>Enregistrer les prix</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.tableHeaderTitle}>ARGENT REÇU</Text>

          <View style={styles.bilanRow}>
            <Text style={styles.bilanRowTitle}>Ventes payées</Text>
            <Text style={[styles.bilanRowAmount, { color: COLORS.secondary }]}>
              {formatFCFA(s.totalVentesPayees)}
            </Text>
          </View>

          <View style={[styles.bilanRow, { borderBottomWidth: 0, paddingTop: 8 }]}>
            <Text style={styles.bilanMutedText}>Factures non payées</Text>
            <Text style={[styles.bilanMutedText, { fontWeight: '800', color: COLORS.warning }]}>
              {formatFCFA(s.totalVentesNonPayees)}
            </Text>
          </View>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.tableHeaderTitle}>DÉPENSES</Text>

          <View style={styles.bilanRow}>
            <Text style={styles.bilanRowTitle}>
              Aliment ({formatNumber(s.totalSacsAlimentEntres)} sacs)
            </Text>
            <Text style={styles.bilanRowAmount}>{formatFCFA(liveDepenseAliment)}</Text>
          </View>

          <View style={styles.bilanRow}>
            <Text style={styles.bilanRowTitle}>
              Poussins ({formatNumber(s.totalPouletsInitial)})
            </Text>
            <Text style={styles.bilanRowAmount}>{formatFCFA(liveDepensePoussins)}</Text>
          </View>

          {isAdmin && (
            <TouchableOpacity
              style={styles.bilanRow}
              onPress={() => navigation.navigate('Salaires')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.bilanRowTitle}>Salaires</Text>
                <Ionicons name="lock-closed" size={13} color={COLORS.primary} />
              </View>
              <Text style={styles.bilanRowAmount}>{formatFCFA(s.depenseSalaires)}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.bilanRow}
            onPress={() => navigation.navigate('Depenses')}
          >
            <Text style={styles.bilanRowTitle}>Constructions</Text>
            <Text style={styles.bilanRowAmount}>{formatFCFA(s.depenseConstructions)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bilanRow}
            onPress={() => navigation.navigate('Depenses')}
          >
            <Text style={styles.bilanRowTitle}>Autres dépenses</Text>
            <Text style={styles.bilanRowAmount}>{formatFCFA(s.depenseAutres)}</Text>
          </TouchableOpacity>

          <View style={styles.totalDepensesBar}>
            <Text style={styles.totalDepensesLabel}>TOTAL DÉPENSES</Text>
            <Text style={styles.totalDepensesValue}>{formatFCFA(liveTotalDepenses)}</Text>
          </View>

          <View style={styles.resteFinalBar}>
            <Text style={styles.resteFinalLabel}>RESTE NET</Text>
            <Text style={styles.resteFinalValue}>{formatFCFA(liveReste)}</Text>
          </View>
        </View>
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  heroBilanCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    ...SHADOWS.large,
  },
  heroTopTag: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  heroResteAmount: {
    color: '#86EFAC',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 6,
  },
  yellowBoxesSection: {
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#EAB308',
    borderRadius: 20,
    padding: 15,
    marginBottom: 14,
    ...SHADOWS.small,
  },
  yellowHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  yellowBadgeIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CA8A04',
  },
  yellowSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#713F12',
  },
  yellowInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    borderWidth: 1.5,
    borderColor: '#CA8A04',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  yellowInputTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#713F12',
  },
  yellowInputDesc: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#854D0E',
    marginTop: 1,
  },
  yellowCalcResult: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 2,
  },
  yellowTextInput: {
    width: 110,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#B45309',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#713F12',
  },
  saveYellowBtn: {
    backgroundColor: '#B45309',
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  saveYellowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  tableHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  bilanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE6',
    gap: 10,
  },
  bilanRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bilanRowAmount: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  bilanMutedText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  totalDepensesBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  totalDepensesLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#991B1B',
  },
  totalDepensesValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
  },
  resteFinalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  resteFinalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#14532D',
  },
  resteFinalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#15803D',
  },
});
