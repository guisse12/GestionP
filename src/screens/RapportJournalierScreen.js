import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import NavigationLayout from '../components/NavigationLayout';
import { COLORS, SHADOWS, formatFCFA, formatNumber } from '../theme/colors';
import { getCachedUser, getCurrentUser } from '../services/authService';
import {
  getCachedWorkbook,
  getCachedSummary,
  loadFarmWorkbook,
  computeFarmSummary,
  computePeriodReport,
  getAvailableReportDates,
  getAvailableReportYears,
} from '../services/farmDataService';
import {
  savePdfToDevice,
  printPdfReport,
  generatePdfHtml,
  generateRawPdfBase64,
  getReportPdfFileName,
} from '../utils/pdfReportGenerator';

const PERIOD_MODES = [
  { key: 'day', label: 'Journalier', icon: 'today-outline' },
  { key: 'week', label: 'Semaine', icon: 'calendar-outline' },
  { key: 'year', label: 'Annuel', icon: 'stats-chart-outline' },
];

export default function RapportJournalierScreen({ navigation, route }) {
  const initialWb = getCachedWorkbook();
  const initialDates = getAvailableReportDates(initialWb);
  const initialYears = getAvailableReportYears(initialWb);
  const defaultDate =
    route?.params?.date ||
    (initialDates.length > 0 ? initialDates[0] : new Date().toISOString().split('T')[0]);
  const defaultYear =
    initialYears.length > 0 ? initialYears[0] : String(new Date().getFullYear());

  const [user, setUser] = useState(() => getCachedUser());
  const [workbook, setWorkbook] = useState(() => initialWb);
  const [summary, setSummary] = useState(() => getCachedSummary());
  const [periodType, setPeriodType] = useState('day'); // 'day' | 'week' | 'year'
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [printingPdf, setPrintingPdf] = useState(false);
  const [pdfModalData, setPdfModalData] = useState(null);

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
  const availableYears = getAvailableReportYears(workbook);
  const report = computePeriodReport(workbook, {
    periodType,
    date: selectedDate,
    year: selectedYear,
  });
  const s = summary || {};

  const stepPeriod = (direction) => {
    if (periodType === 'year') {
      const nextYr = String((Number(selectedYear) || 2026) + direction);
      setSelectedYear(nextYr);
      return;
    }

    if (periodType === 'week') {
      const parts = String(selectedDate || '').split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        dt.setUTCDate(dt.getUTCDate() + direction * 7);
        setSelectedDate(dt.toISOString().split('T')[0]);
        return;
      }
    }

    const idx = availableDates.indexOf(selectedDate.trim());
    if (idx >= 0) {
      const nextIdx = idx - direction; // availableDates est trié du plus récent au plus ancien
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

  // Télécharger / Enregistrer directement le fichier .PDF
  const handleDirectDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await savePdfToDevice(report, s);
    } catch (e) {
      Alert.alert('Erreur PDF', 'Impossible de télécharger le fichier PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Imprimer / Enregistrer au format PDF via le système Android/iOS
  const handleDirectPrintPdf = async () => {
    setPrintingPdf(true);
    try {
      await printPdfReport(report, s);
    } catch (e) {
      Alert.alert('Erreur Impression', "Impossible de lancer l'impression du rapport.");
    } finally {
      setPrintingPdf(false);
    }
  };

  // Ouvrir l'aperçu visuel A4 du document PDF
  const handleOpenPdfPreview = () => {
    const fileName = getReportPdfFileName(report);
    const pdfBase64 = generateRawPdfBase64(report, s);
    const html = generatePdfHtml(report, s, { showInteractiveButtons: true });
    setPdfModalData({ html, pdfBase64, fileName });
  };

  // Réception des clics sur les boutons à l'intérieur du WebView d'aperçu
  const handleWebViewMessage = async (event) => {
    const msg = String(event?.nativeEvent?.data || '');
    if (msg === 'DOWNLOAD_PDF') {
      await handleDirectDownloadPdf();
    } else if (msg === 'PRINT_PDF') {
      await handleDirectPrintPdf();
    }
  };

  const handleShareTextReport = async () => {
    const lines = [
      `📊 ${report.periodTitle.toUpperCase()} - GestionP`,
      `📅 Période : ${report.periodLabel}`,
      `--------------------------------`,
      `🥚 PRODUCTION (${report.periodBadge}) :`,
      `• Boxe 1 : ${formatNumber(report.boxe1Produits)} tab.`,
      `• Boxe 2 : ${formatNumber(report.boxe2Produits)} tab.`,
      `• Total Production : ${formatNumber(report.totalProduits)} tablettes`,
      `• Mortalité : ${report.boxe1Mortalite} (B1) / ${report.boxe2Mortalite} (B2) = ${report.totalMortalite} morts`,
      `• Poulets vivants : ${formatNumber(report.restantVivant)}`,
      `• Aliment consommé : ${formatNumber(report.consoAliment)} sacs`,
      `--------------------------------`,
      `📦 MOUVEMENTS DE STOCK :`,
      `• Aliment : +${formatNumber(report.alimEntrees)} entrés / -${formatNumber(report.alimSorties)} sortis (Stock actuel: ${formatNumber(s.stockSacsAlimentRestant)} sacs)`,
      `• Œufs : +${formatNumber(report.oeufsEntrees)} entrés / -${formatNumber(report.oeufsSorties)} sortis (Stock actuel: ${formatNumber(s.stockTablettesDisponibles)} tab.)`,
      `--------------------------------`,
      `💸 DÉPENSES (${report.autresRows.length + report.constRows.length}) :`,
      `• Autres achats : ${formatFCFA(report.totalAutresJour)}`,
      `• Constructions : ${formatFCFA(report.totalConstJour)}`,
      `• Total Dépenses : ${formatFCFA(report.totalDepensesJour)}`,
      `--------------------------------`,
      `🧾 VENTES & FACTURES (${report.facturesRows.length}) :`,
      `• Tablettes facturées : ${formatNumber(report.tablettesFactureesJour)} tab.`,
      `• Ventes Payées : ${formatFCFA(report.ventesPayeesJour)}`,
      `• Ventes Non Payées : ${formatFCFA(report.ventesNonPayeesJour)}`,
      `• Solde Net de la période : ${formatFCFA(report.soldeNetJour)}`,
    ];

    try {
      await Share.share({
        title: report.periodTitle,
        message: lines.join('\n'),
      });
    } catch (e) {}
  };

  return (
    <NavigationLayout
      user={user}
      activeTab="RapportJournalier"
      title="Rapports & PDF"
      navigation={navigation}
      pendingOrdersCount={s.commandesEnAttente || 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* 1. Sélecteur de Mode : Journalier | Semaine | Annuel */}
        <View style={styles.modeTabsBar}>
          {PERIOD_MODES.map((m) => {
            const active = periodType === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeTabBtn, active && styles.modeTabBtnActive]}
                onPress={() => setPeriodType(m.key)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={m.icon}
                  size={16}
                  color={active ? '#FFFFFF' : COLORS.primaryDark}
                />
                <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Sélecteur de Date / Semaine / Année + Boutons PDF & Impression */}
        <View style={styles.dateCard}>
          <View style={styles.dateNavRow}>
            <TouchableOpacity style={styles.navArrowBtn} onPress={() => stepPeriod(-1)}>
              <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
            </TouchableOpacity>

            <View style={styles.dateCenterBox}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} />
              {periodType === 'year' ? (
                <TextInput
                  style={styles.dateTextInput}
                  value={selectedYear}
                  onChangeText={setSelectedYear}
                  keyboardType="numeric"
                  placeholder="2026"
                />
              ) : (
                <TextInput
                  style={styles.dateTextInput}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                />
              )}
            </View>

            <TouchableOpacity style={styles.navArrowBtn} onPress={() => stepPeriod(1)}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primaryDark} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShareTextReport}>
              <Ionicons name="share-social" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {periodType === 'week' && (
            <View style={styles.periodRangePill}>
              <Ionicons name="time-outline" size={15} color={COLORS.primaryDark} />
              <Text style={styles.periodRangeText}>
                Semaine du {report.startDate} au {report.endDate} (7 jours)
              </Text>
            </View>
          )}

          {periodType === 'year' ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recentDatesScroll}
            >
              {availableYears.map((yr) => {
                const active = yr === selectedYear.trim();
                return (
                  <TouchableOpacity
                    key={yr}
                    style={[styles.dateChip, active && styles.dateChipActive]}
                    onPress={() => setSelectedYear(yr)}
                  >
                    <Text style={[styles.dateChipText, active && { color: '#FFFFFF' }]}>
                      Année {yr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
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
                    <Text style={[styles.dateChipText, active && { color: '#FFFFFF' }]}>
                      {periodType === 'week' ? `Sem. fin ${d}` : d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Barre d'actions PDF : Télécharger, Imprimer, Aperçu */}
          <View style={styles.pdfActionsRow}>
            <TouchableOpacity
              style={styles.pdfDownloadBtn}
              onPress={handleDirectDownloadPdf}
              disabled={downloadingPdf}
              activeOpacity={0.85}
            >
              {downloadingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.pdfDownloadBtnText}>Télécharger .PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pdfPrintBtn}
              onPress={handleDirectPrintPdf}
              disabled={printingPdf}
              activeOpacity={0.85}
            >
              {printingPdf ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="print-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.pdfPrintBtnText}>Imprimer</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pdfPreviewBtn}
              onPress={handleOpenPdfPreview}
              activeOpacity={0.85}
            >
              <Ionicons name="eye-outline" size={18} color={COLORS.primaryDark} />
              <Text style={styles.pdfPreviewBtnText}>Aperçu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Résumé Financier & Production de la Période */}
        <View style={styles.heroSummary}>
          <View style={styles.heroCol}>
            <Text style={styles.heroLbl}>PRODUCTION ({report.periodBadge})</Text>
            <Text style={styles.heroBigVal}>{formatNumber(report.totalProduits)} tab.</Text>
            <Text style={styles.heroSub}>
              Boxe 1 : {formatNumber(report.boxe1Produits)} • Boxe 2 :{' '}
              {formatNumber(report.boxe2Produits)}
            </Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroCol}>
            <Text style={styles.heroLbl}>SOLDE ({report.periodBadge})</Text>
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
            <Text style={styles.sectionTitle}>Production & Boxes ({report.periodLabel})</Text>
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

        {/* Tableau Récapitulatif par Jour (Semaine) ou par Mois (Annuel) */}
        {report.breakdownRows && report.breakdownRows.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="calendar" size={18} color={COLORS.primaryDark} />
              </View>
              <Text style={styles.sectionTitle}>
                {periodType === 'week'
                  ? 'Récapitulatif des 7 Jours de la Semaine'
                  : `Récapitulatif Mensuel (${report.year})`}
              </Text>
            </View>

            {report.breakdownRows.map((row) => (
              <View key={row.key} style={styles.breakdownRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLineTitle}>{row.label}</Text>
                  <Text style={styles.detailLineSub}>
                    🥚 {formatNumber(row.totalProduits)} tab. • 💀 {row.totalMortalite} morts • 🌾{' '}
                    {formatNumber(row.consoAliment)} sacs
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.detailLineVal, { color: COLORS.secondary }]}>
                    +{formatFCFA(row.ventesPayees)}
                  </Text>
                  {row.depenses > 0 && (
                    <Text style={[styles.detailLineSub, { color: COLORS.danger, fontWeight: '700' }]}>
                      -{formatFCFA(row.depenses)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 2. Section Mouvements de Stock de la période */}
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
                  +{formatNumber(report.alimEntrees)} entrés
                </Text>{' '}
                •{' '}
                <Text style={{ color: '#DC2626', fontWeight: '800' }}>
                  -{formatNumber(report.alimSorties)} sortis
                </Text>
              </Text>
            </View>
            <View style={styles.stockSummaryBox}>
              <Text style={styles.stockTypeTitle}>Tablettes d’Œufs</Text>
              <Text style={styles.stockFlowText}>
                <Text style={{ color: '#15803D', fontWeight: '800' }}>
                  +{formatNumber(report.oeufsEntrees)} entrées
                </Text>{' '}
                •{' '}
                <Text style={{ color: '#DC2626', fontWeight: '800' }}>
                  -{formatNumber(report.oeufsSorties)} sorties
                </Text>
              </Text>
            </View>
          </View>

          {report.alimRows.slice(0, 12).map((item) => (
            <View key={item.id} style={styles.detailLine}>
              <Text style={styles.detailLineTitle}>
                🌾 {item.date} {item.note ? `(${item.note})` : ''}
              </Text>
              <Text style={styles.detailLineVal}>
                +{item.entrees} / -{item.sorties} (Stock: {item.stockRestant})
              </Text>
            </View>
          ))}

          {report.oeufsRows.slice(0, 12).map((item) => (
            <View key={item.id} style={styles.detailLine}>
              <Text style={styles.detailLineTitle}>
                🥚 {item.date} {item.note ? `(${item.note})` : ''}
              </Text>
              <Text style={styles.detailLineVal}>
                +{item.entrees} / -{item.sorties} (Stock: {item.stockRestant})
              </Text>
            </View>
          ))}
        </View>

        {/* 3. Section Dépenses de la période */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="wallet" size={18} color="#0284C7" />
            </View>
            <Text style={styles.sectionTitle}>
              Dépenses ({report.autresRows.length + report.constRows.length})
            </Text>
            <Text style={styles.sectionRightTotal}>
              {formatFCFA(report.totalDepensesJour)}
            </Text>
          </View>

          {report.autresRows.length === 0 && report.constRows.length === 0 ? (
            <Text style={styles.emptyText}>Aucune dépense enregistrée sur cette période</Text>
          ) : (
            <>
              {report.autresRows.slice(0, 20).map((d) => (
                <View key={d.id} style={styles.detailLine}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLineTitle}>{d.produit}</Text>
                    <Text style={styles.detailLineSub}>{d.date}</Text>
                  </View>
                  <Text style={[styles.detailLineVal, { color: COLORS.danger }]}>
                    {formatFCFA(d.montant)}
                  </Text>
                </View>
              ))}
              {report.constRows.slice(0, 20).map((c) => (
                <View key={c.id} style={styles.detailLine}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLineTitle}>🔨 {c.designation}</Text>
                    <Text style={styles.detailLineSub}>{c.date}</Text>
                  </View>
                  <Text style={[styles.detailLineVal, { color: COLORS.danger }]}>
                    {formatFCFA(c.montant)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* 4. Section Factures & Ventes de la période */}
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
            <Text style={styles.emptyText}>Aucune vente facturée sur cette période</Text>
          ) : (
            <>
              {report.facturesRows.slice(0, 25).map((f) => (
                <View key={f.id} style={styles.detailLine}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLineTitle}>
                      {f.client} (N° {f.numeroFacture})
                    </Text>
                    <Text style={styles.detailLineSub}>
                      {f.date} • {f.quantite} tab. × {formatFCFA(f.prixUnitaire)} • {f.statut}
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

        {/* Bouton bas de page pour télécharger le rapport PDF */}
        <TouchableOpacity
          style={styles.bottomPdfBtn}
          onPress={handleDirectDownloadPdf}
          disabled={downloadingPdf}
          activeOpacity={0.85}
        >
          <Ionicons name="download-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bottomPdfBtnText}>
            Télécharger le {report.periodTitle} en PDF
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal d'Aperçu & Téléchargement du Document PDF A4 */}
      <Modal
        visible={!!pdfModalData}
        animationType="slide"
        onRequestClose={() => setPdfModalData(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Document PDF Officiel</Text>
              <Text style={styles.modalSub} numberOfLines={1}>
                {pdfModalData?.fileName || 'Rapport_GestionP.pdf'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalActionBtnGreen}
              onPress={handleDirectDownloadPdf}
              disabled={downloadingPdf}
            >
              <Ionicons name="download-outline" size={16} color="#FFFFFF" />
              <Text style={styles.modalActionBtnText}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionBtnOrange}
              onPress={handleDirectPrintPdf}
              disabled={printingPdf}
            >
              <Ionicons name="print-outline" size={16} color="#FFFFFF" />
              <Text style={styles.modalActionBtnText}>Imprimer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPdfModalData(null)}
            >
              <Ionicons name="close" size={22} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>

          {pdfModalData?.html && (
            <WebView
              originWhitelist={['*']}
              source={{ html: pdfModalData.html }}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              style={{ flex: 1, backgroundColor: '#F5EFE6' }}
            />
          )}
        </View>
      </Modal>
    </NavigationLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 36 },
  modeTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#EFECE6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 6,
  },
  modeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  modeTabBtnActive: {
    backgroundColor: COLORS.primaryDark,
    ...SHADOWS.small,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
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
  periodRangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    gap: 6,
  },
  periodRangeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
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
  pdfActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pdfDownloadBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    height: 42,
    borderRadius: 11,
    gap: 6,
    ...SHADOWS.small,
  },
  pdfDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  pdfPrintBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 42,
    borderRadius: 11,
    gap: 5,
    ...SHADOWS.small,
  },
  pdfPrintBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  pdfPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EFE6',
    borderWidth: 1,
    borderColor: '#E7E0D3',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 11,
    gap: 4,
  },
  pdfPreviewBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
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
    fontSize: 14,
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
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F5EFE6',
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
  bottomPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    height: 50,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
    ...SHADOWS.medium,
  },
  bottomPdfBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 8,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  modalSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modalActionBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    gap: 4,
  },
  modalActionBtnOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    gap: 4,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5EFE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
