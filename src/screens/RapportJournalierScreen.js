import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
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
  computeDailyReport,
  getAvailableReportDates,
} from '../services/farmDataService';

export default function RapportJournalierScreen({ navigation, route }) {
  const initialWb = getCachedWorkbook();
  const initialDates = getAvailableReportDates(initialWb);
  const defaultDate =
    route?.params?.date ||
    (initialDates.length > 0 ? initialDates[0] : new Date().toISOString().split('T')[0]);

  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => initialWb);
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [selectedDate, setSelectedDate] = useState(defaultDate);

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

  const availableDates = getAvailableReportDates(workbook);
  const report = computeDailyReport(workbook, selectedDate);
  const s = summary || {};

  const stepDate = (direction) => {
    const idx = availableDates.indexOf(selectedDate.trim());
    if (idx >= 0) {
      const nextIdx = idx - direction; // availableDates is sorted descending (newest first)
      if (nextIdx >= 0 && nextIdx < availableDates.length) {
        setSelectedDate(availableDates[nextIdx]);
        return;
      }
    }
    const d = new Date(selectedDate);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + direction);
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  const handleShareReport = async () => {
    const lines = [
      `📊 RAPPORT JOURNALIER - GestionP`,
      `📅 Date : ${report.date}`,
      `--------------------------------`,
      `🥚 PRODUCTION DU JOUR :`,
      `• Boxe 1 : ${formatNumber(report.boxe1Produits)} tab.`,
      `• Boxe 2 : ${formatNumber(report.boxe2Produits)} tab.`,
      `• Total Production : ${formatNumber(report.totalProduits)} tablettes`,
      `• Mortalité : ${report.boxe1Mortalite} (B1) / ${report.boxe2Mortalite} (B2) = ${report.totalMortalite} morts`,
      `• Poulets vivants : ${formatNumber(report.restantVivant)}`,
      `• Aliment consommé : ${formatNumber(report.consoAliment)} sacs`,
      `--------------------------------`,
      `📦 STOCKAGE DU JOUR :`,
      `• Aliment : +${report.alimEntrees} entrés / -${report.alimSorties} sortis (Stock: ${formatNumber(s.stockSacsAlimentRestant)} sacs)`,
      `• Œufs : +${report.oeufsEntrees} entrés / -${report.oeufsSorties} sortis (Stock: ${formatNumber(s.stockTablettesDisponibles)} tab.)`,
      `--------------------------------`,
      `💸 DÉPENSES DU JOUR (${report.autresRows.length + report.constRows.length}) :`,
      ...report.autresRows.map((d) => `• ${d.produit} : ${formatFCFA(d.montant)}`),
      ...report.constRows.map((c) => `• [Construction] ${c.designation} : ${formatFCFA(c.montant)}`),
      `• Total Dépenses du jour : ${formatFCFA(report.totalDepensesJour)}`,
      `--------------------------------`,
      `🧾 VENTES & FACTURES DU JOUR (${report.facturesRows.length}) :`,
      `• Tablettes facturées : ${formatNumber(report.tablettesFactureesJour)} tab.`,
      `• Ventes Payées : ${formatFCFA(report.ventesPayeesJour)}`,
      `• Ventes Non Payées : ${formatFCFA(report.ventesNonPayeesJour)}`,
      `• Solde Net du jour : ${formatFCFA(report.soldeNetJour)}`,
    ];

    try {
      await Share.share({
        message: lines.join('\n'),
      });
    } catch (e) {}
  };

  return (
    <NavigationLayout
      user={user}
      activeTab="RapportJournalier"
      title="Rapport Journalier"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Sélecteur de Date */}
        <View style={styles.dateCard}>
          <View style={styles.dateNavRow}>
            <TouchableOpacity style={styles.navArrowBtn} onPress={() => stepDate(-1)}>
              <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
            </TouchableOpacity>

            <View style={styles.dateCenterBox}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
              <TextInput
                style={styles.dateTextInput}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <TouchableOpacity style={styles.navArrowBtn} onPress={() => stepDate(1)}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primaryDark} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShareReport}>
              <Ionicons name="share-social" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentDatesScroll}
          >
            {availableDates.slice(0, 12).map((d) => {
              const active = d === selectedDate.trim();
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dateChip, active && styles.dateChipActive]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.dateChipText, active && { color: '#FFFFFF' }]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Résumé Financier & Production du Jour */}
        <View style={styles.heroSummary}>
          <View style={styles.heroCol}>
            <Text style={styles.heroLbl}>PRODUCTION DU JOUR</Text>
            <Text style={styles.heroBigVal}>{formatNumber(report.totalProduits)} tab.</Text>
            <Text style={styles.heroSub}>
              Boxe 1 : {report.boxe1Produits} • Boxe 2 : {report.boxe2Produits}
            </Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroCol}>
            <Text style={styles.heroLbl}>SOLDE DU JOUR</Text>
            <Text
              style={[
                styles.heroBigVal,
                { color: report.soldeNetJour >= 0 ? '#86EFAC' : '#FCA5A5' },
              ]}
            >
              {formatFCFA(report.soldeNetJour)}
            </Text>
            <Text style={styles.heroSub}>
              Dépenses : {formatFCFA(report.totalDepensesJour)}
            </Text>
          </View>
        </View>

        {/* 1. Section Production & Mortalité */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="egg" size={18} color="#B45309" />
            </View>
            <Text style={styles.sectionTitle}>Production & Boxes ({report.date})</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLbl}>Boxe 1</Text>
              <Text style={styles.metricVal}>{formatNumber(report.boxe1Produits)} tab.</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLbl}>Boxe 2</Text>
              <Text style={styles.metricVal}>{formatNumber(report.boxe2Produits)} tab.</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: '#FEF9C3' }]}>
              <Text style={[styles.metricLbl, { color: '#854D0E' }]}>Total Produit</Text>
              <Text style={[styles.metricVal, { color: '#713F12' }]}>
                {formatNumber(report.totalProduits)} tab.
              </Text>
            </View>
          </View>

          <View style={[styles.metricsGrid, { marginTop: 8 }]}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLbl}>Morts (B1 / B2)</Text>
              <Text
                style={[
                  styles.metricVal,
                  report.totalMortalite > 0 && { color: COLORS.danger },
                ]}
              >
                {report.boxe1Mortalite} / {report.boxe2Mortalite}
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLbl}>Conso Aliment</Text>
              <Text style={styles.metricVal}>{formatNumber(report.consoAliment)} sacs</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.metricLbl, { color: '#14532D' }]}>Vivants</Text>
              <Text style={[styles.metricVal, { color: '#15803D' }]}>
                {formatNumber(report.restantVivant)}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Section Mouvements de Stock du jour */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="cube" size={18} color="#15803D" />
            </View>
            <Text style={styles.sectionTitle}>
              Mouvements de Stock ({report.alimRows.length + report.oeufsRows.length})
            </Text>
          </View>

          <View style={styles.stockRowSummary}>
            <View style={styles.stockSummaryBox}>
              <Text style={styles.stockTypeTitle}>Sacs d’Aliment</Text>
              <Text style={styles.stockFlowText}>
                <Text style={{ color: '#15803D', fontWeight: '800' }}>
                  +{report.alimEntrees} entrés
                </Text>{' '}
                •{' '}
                <Text style={{ color: '#DC2626', fontWeight: '800' }}>
                  -{report.alimSorties} sortis
                </Text>
              </Text>
            </View>
            <View style={styles.stockSummaryBox}>
              <Text style={styles.stockTypeTitle}>Tablettes d’Œufs</Text>
              <Text style={styles.stockFlowText}>
                <Text style={{ color: '#15803D', fontWeight: '800' }}>
                  +{report.oeufsEntrees} entrées
                </Text>{' '}
                •{' '}
                <Text style={{ color: '#DC2626', fontWeight: '800' }}>
                  -{report.oeufsSorties} sorties
                </Text>
              </Text>
            </View>
          </View>

          {report.alimRows.map((item) => (
            <View key={item.id} style={styles.detailLine}>
              <Text style={styles.detailLineTitle}>
                🌾 Aliment {item.note ? `(${item.note})` : ''}
              </Text>
              <Text style={styles.detailLineVal}>
                +{item.entrees} / -{item.sorties} (Stock: {item.stockRestant})
              </Text>
            </View>
          ))}

          {report.oeufsRows.map((item) => (
            <View key={item.id} style={styles.detailLine}>
              <Text style={styles.detailLineTitle}>
                🥚 Œufs {item.note ? `(${item.note})` : ''}
              </Text>
              <Text style={styles.detailLineVal}>
                +{item.entrees} / -{item.sorties} (Stock: {item.stockRestant})
              </Text>
            </View>
          ))}
        </View>

        {/* 3. Section Dépenses du jour */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="wallet" size={18} color="#0284C7" />
            </View>
            <Text style={styles.sectionTitle}>
              Dépenses du jour ({report.autresRows.length + report.constRows.length})
            </Text>
            <Text style={styles.sectionRightTotal}>
              {formatFCFA(report.totalDepensesJour)}
            </Text>
          </View>

          {report.autresRows.length === 0 && report.constRows.length === 0 ? (
            <Text style={styles.emptyText}>Aucune dépense enregistrée à cette date</Text>
          ) : (
            <>
              {report.autresRows.map((d) => (
                <View key={d.id} style={styles.detailLine}>
                  <Text style={styles.detailLineTitle}>{d.produit}</Text>
                  <Text style={[styles.detailLineVal, { color: COLORS.danger }]}>
                    {formatFCFA(d.montant)}
                  </Text>
                </View>
              ))}
              {report.constRows.map((c) => (
                <View key={c.id} style={styles.detailLine}>
                  <Text style={styles.detailLineTitle}>🔨 {c.designation}</Text>
                  <Text style={[styles.detailLineVal, { color: COLORS.danger }]}>
                    {formatFCFA(c.montant)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* 4. Section Factures & Ventes du jour */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="receipt" size={18} color="#C84B31" />
            </View>
            <Text style={styles.sectionTitle}>
              Ventes & Factures ({report.facturesRows.length})
            </Text>
            <Text style={[styles.sectionRightTotal, { color: COLORS.secondary }]}>
              {formatFCFA(report.ventesPayeesJour)}
            </Text>
          </View>

          {report.facturesRows.length === 0 && report.commandesRows.length === 0 ? (
            <Text style={styles.emptyText}>Aucune vente facturée à cette date</Text>
          ) : (
            <>
              {report.facturesRows.map((f) => (
                <View key={f.id} style={styles.detailLine}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLineTitle}>
                      {f.client} (N° {f.numeroFacture})
                    </Text>
                    <Text style={styles.detailLineSub}>
                      {f.quantite} tab. × {formatFCFA(f.prixUnitaire)} • {f.statut}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.detailLineVal,
                      { color: f.statut === 'Payé' ? COLORS.secondary : COLORS.danger },
                    ]}
                  >
                    {formatFCFA(f.total)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 32 },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  dateNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 10,
    gap: 6,
  },
  dateTextInput: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textAlign: 'center',
    minWidth: 100,
    paddingVertical: 0,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentDatesScroll: {
    marginTop: 10,
  },
  dateChip: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    marginRight: 6,
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  dateChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  heroSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  heroCol: {
    flex: 1,
  },
  heroDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  heroLbl: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '800',
  },
  heroBigVal: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 3,
  },
  heroSub: {
    color: '#E7E5E4',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  sectionRightTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.danger,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  metricLbl: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  stockRowSummary: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  stockSummaryBox: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
  },
  stockTypeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  stockFlowText: {
    fontSize: 12,
    marginTop: 3,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
  },
  detailLineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailLineSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  detailLineVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  emptyText: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
