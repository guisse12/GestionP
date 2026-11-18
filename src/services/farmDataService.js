import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  INITIAL_POULETS_BOXES,
  INITIAL_PRODUCTION,
  INITIAL_STOCKAGE_ALIMENT,
  INITIAL_STOCKAGE_OEUFS,
  INITIAL_FACTURES,
  INITIAL_CONSTRUCTIONS,
  INITIAL_AUTRES_DEPENSES,
  INITIAL_EMPLOYES,
  INITIAL_BILAN_PARAMS,
} from '../data/initialExcelData';

const STORAGE_WORKBOOK_KEY = '@gps_workbook_data_v4';
const FIRESTORE_COLLECTION = 'gps_poulailler';
const FIRESTORE_DOC_ID = 'workbook_state_v4';

const INITIAL_COMMANDES = [];

const sortNewestFirst = (arr) =>
  [...(arr || [])].sort((a, b) => {
    const da = String(a?.date || '');
    const dbStr = String(b?.date || '');
    if (da !== dbStr) return da < dbStr ? 1 : -1;
    return (Number(b?.excelRow) || 0) - (Number(a?.excelRow) || 0);
  });

export const getDefaultWorkbookState = () => ({
  pouletsBoxes: INITIAL_POULETS_BOXES,
  production: sortNewestFirst(INITIAL_PRODUCTION),
  stockageAliment: sortNewestFirst(INITIAL_STOCKAGE_ALIMENT),
  stockageOeufs: sortNewestFirst(INITIAL_STOCKAGE_OEUFS),
  factures: sortNewestFirst(INITIAL_FACTURES),
  constructions: sortNewestFirst(INITIAL_CONSTRUCTIONS),
  autresDepenses: sortNewestFirst(INITIAL_AUTRES_DEPENSES),
  versementsAliment: [],
  entretiens: [],
  employes: INITIAL_EMPLOYES,
  bilanParams: INITIAL_BILAN_PARAMS,
  commandes: INITIAL_COMMANDES,
  lastUpdated: '2026-11-03T23:59:59.000Z',
});

// Calcul du nombre de mois complets entre la date de début et aujourd'hui (ou la date de fin)
export const calculateCompleteMonths = (dateDebutStr, dateFinStr = '') => {
  if (!dateDebutStr) return 0;
  const start = new Date(dateDebutStr);
  if (isNaN(start.getTime())) return 0;

  const end = dateFinStr ? new Date(dateFinStr) : new Date();
  if (isNaN(end.getTime()) || end < start) return 0;

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
};

// Moteur de calcul automatique fidèle à 100% aux formules de GestionP.xlsx
export const computeFarmSummary = (state) => {
  const wb = state || getDefaultWorkbookState();

  // 1. Effectifs initiaux de Poulets_Boxes
  const entriesPB = wb.pouletsBoxes?.entries || [];
  const boxe1Initial = entriesPB.reduce((sum, e) => sum + (Number(e.boxe1) || 0), 0) || 4051;
  const boxe2Initial = entriesPB.reduce((sum, e) => sum + (Number(e.boxe2) || 0), 0) || 3952;
  const malesInitial = entriesPB.reduce((sum, e) => sum + (Number(e.males) || 0), 0) || 17;
  const totalPouletsInitial = boxe1Initial + boxe2Initial + malesInitial; // 8 020

  // 2. Cumuls Production & Mortalité (Feuille Production)
  const prodList = wb.production || [];
  let totalProdBoxe1 = 0;
  let totalProdBoxe2 = 0;
  let totalMortaliteBoxe1 = 0;
  let totalMortaliteBoxe2 = 0;
  let totalTablettesVenduesProd = 0;
  let totalConsoAlimentProd = 0;

  for (const row of prodList) {
    totalProdBoxe1 += Number(row.boxe1Produits) || 0;
    totalProdBoxe2 += Number(row.boxe2Produits) || 0;
    totalMortaliteBoxe1 += Number(row.boxe1Mortalite) || 0;
    totalMortaliteBoxe2 += Number(row.boxe2Mortalite) || 0;
    totalTablettesVenduesProd += Number(row.tablettesVendues) || 0;
    totalConsoAlimentProd += Number(row.consoAliment) || 0;
  }

  const totalProductionTablettes = totalProdBoxe1 + totalProdBoxe2;
  const totalMortalite = totalMortaliteBoxe1 + totalMortaliteBoxe2;
  const vivantsBoxe1 = Math.max(0, boxe1Initial - totalMortaliteBoxe1);
  const vivantsBoxe2 = Math.max(0, boxe2Initial - totalMortaliteBoxe2);
  const vivantsTotal = Math.max(0, totalPouletsInitial - totalMortalite);

  // 3. Stockage Aliment & Œufs (Feuille Stockage)
  const alimList = wb.stockageAliment || [];
  let totalSacsAlimentEntres = 0;
  let totalSacsAlimentSortis = 0;
  for (const item of alimList) {
    totalSacsAlimentEntres += Number(item.entrees) || 0;
    totalSacsAlimentSortis += Number(item.sorties) || 0;
  }
  const baseStockOffset = 29;
  const stockSacsAlimentRestant = Math.max(0, totalSacsAlimentEntres - totalSacsAlimentSortis + baseStockOffset);

  const oeufsList = wb.stockageOeufs || [];
  let totalOeufsEntres = 0;
  let totalOeufsSortis = 0;
  for (const item of oeufsList) {
    totalOeufsEntres += Number(item.entrees) || 0;
    totalOeufsSortis += Number(item.sorties) || 0;
  }
  const baseOeufsOffset = -104;
  const stockTablettesDisponibles = Math.max(0, totalOeufsEntres - totalOeufsSortis + baseOeufsOffset);

  // 4. Factures & Ventes (Feuille Facture)
  const facturesList = wb.factures || [];
  let totalVentesPayees = 0;
  let totalVentesNonPayees = 0;
  let totalQuantiteFacturee = 0;

  for (const f of facturesList) {
    const qte = Number(f.quantite) || 0;
    const pu = Number(f.prixUnitaire) || 0;
    const montant = Number(f.total) || qte * pu;
    totalQuantiteFacturee += qte;
    if (String(f.statut || '').toLowerCase().includes('non')) {
      totalVentesNonPayees += montant;
    } else {
      totalVentesPayees += montant;
    }
  }
  const totalFacturesGeneral = totalVentesPayees + totalVentesNonPayees;

  // 5. Constructions (Feuille Constructions)
  const constructionsList = wb.constructions || [];
  const totalConstructions = constructionsList.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);

  // 6. Autres Dépenses, Versements Aliment & Entretien
  const autresDepensesList = wb.autresDepenses || [];
  const totalAutresDepenses = autresDepensesList.reduce((sum, d) => sum + (Number(d.montant) || 0), 0);

  const versementsAlimentList = wb.versementsAliment || [];
  const totalVersementsAliment = versementsAlimentList.reduce((sum, v) => sum + (Number(v.montant) || 0), 0);

  const entretiensList = wb.entretiens || [];
  const totalEntretiens = entretiensList.reduce((sum, e) => sum + (Number(e.montant) || 0), 0);

  // 7. Salaires (Feuille Salaires - réservé Admin, COLY est le Gérant à Thiès, sans les exemples initiaux)
  const LEGACY_EXAMPLE_EMP_IDS = new Set(['emp_2', 'emp_3', 'emp_4']);
  const employesList = (wb.employes || []).filter((e) => e && !LEGACY_EXAMPLE_EMP_IDS.has(e.id));
  const employesCalcules = employesList.map((emp) => {
    const isColy = emp.id === 'emp_1' || String(emp.nom || '').trim().toUpperCase() === 'COLY';
    const salaireMensuel = Number(emp.salaireMensuel) || 0;
    const moisComplets =
      emp.nbMoisManuel !== null && emp.nbMoisManuel !== undefined && emp.nbMoisManuel !== ''
        ? Number(emp.nbMoisManuel)
        : calculateCompleteMonths(emp.dateDebut, emp.dateFin);
    const paiements = Array.isArray(emp.paiements) ? emp.paiements : [];
    const totalPaiementsIndividuels = paiements
      .filter((p) => p.statut !== 'En attente')
      .reduce((sum, p) => sum + (Number(p.montant) || 0), 0);
    const totalEnAttenteIndividuel = paiements
      .filter((p) => p.statut === 'En attente')
      .reduce((sum, p) => sum + (Number(p.montant) || 0), 0);

    // Si des paiements individuels ont été enregistrés sur l'interface de l'employé, on utilise leur somme exacte ;
    // sinon on utilise le calcul par mois (salaireMensuel * moisComplets)
    const totalForfaitMois = salaireMensuel * moisComplets;
    const totalPaye = paiements.length > 0 ? totalPaiementsIndividuels : totalForfaitMois;
    const isGerantRole =
      isColy ||
      emp.categorie === 'gerant' ||
      String(emp.poste || '').toLowerCase().includes('gérant') ||
      String(emp.poste || '').toLowerCase().includes('gerant');

    const resolvedPoste =
      isColy && (!emp.poste || emp.poste === 'Aviculteur - Boxe 1')
        ? 'Gérant du poulailler'
        : emp.poste || (isGerantRole ? 'Gérant du poulailler' : 'Employé');

    return {
      ...emp,
      categorie: isGerantRole ? 'gerant' : 'employe',
      poste: resolvedPoste,
      adresse: emp.adresse || 'Thiès',
      telephone: emp.telephone || (isColy ? '777527561' : ''),
      salaireMensuel,
      moisComplets,
      paiements,
      nbPaiements: paiements.length,
      totalPaiementsIndividuels,
      totalEnAttenteIndividuel,
      totalForfaitMois,
      totalPaye,
    };
  });
  const totalSalaires = employesCalcules.reduce((sum, emp) => sum + emp.totalPaye, 0);

  // 8. Bilan Automatique (Feuille Bilan + les 2 Cases Jaunes + Versements Aliment)
  const prixSacAliment = Number(wb.bilanParams?.prixSacAliment) || 0;
  const prixPoussin = Number(wb.bilanParams?.prixPoussin) || 0;
  const prixTabletteDefaut = Number(wb.bilanParams?.prixTabletteDefaut) || 2200;

  const depenseAlimentParSac = totalSacsAlimentEntres * prixSacAliment;
  const depenseAliment = depenseAlimentParSac + totalVersementsAliment;
  const depensePoussins = totalPouletsInitial * prixPoussin;
  const depenseSalaires = totalSalaires;
  const depenseConstructions = totalConstructions;
  const depenseEntretiens = totalEntretiens;
  const depenseAutres = totalAutresDepenses;

  const totalDepenses =
    depenseAliment + depensePoussins + depenseSalaires + depenseConstructions + depenseEntretiens + depenseAutres;

  const resteApresDepenses = totalVentesPayees - totalDepenses;

  const commandesList = wb.commandes || [];
  const commandesEnAttente = commandesList.filter((c) => c.statut === 'En attente').length;

  return {
    boxe1Initial,
    boxe2Initial,
    malesInitial,
    totalPouletsInitial,
    vivantsBoxe1,
    vivantsBoxe2,
    vivantsTotal,
    totalMortaliteBoxe1,
    totalMortaliteBoxe2,
    totalMortalite,

    totalProdBoxe1,
    totalProdBoxe2,
    totalProductionTablettes,
    totalTablettesVenduesProd,
    totalConsoAlimentProd,

    totalSacsAlimentEntres,
    totalSacsAlimentSortis,
    stockSacsAlimentRestant,
    totalOeufsEntres,
    totalOeufsSortis,
    stockTablettesDisponibles,

    totalVentesPayees,
    totalVentesNonPayees,
    totalFacturesGeneral,
    totalQuantiteFacturee,

    employesCalcules,
    totalSalaires,
    totalConstructions,
    totalAutresDepenses,
    totalVersementsAliment,
    totalEntretiens,

    prixSacAliment,
    prixPoussin,
    prixTabletteDefaut,
    depenseAlimentParSac,
    depenseAliment,
    depensePoussins,
    depenseSalaires,
    depenseConstructions,
    depenseEntretiens,
    depenseAutres,
    totalDepenses,
    resteApresDepenses,

    commandesEnAttente,
  };
};

// --- CACHE MÉMOIRE SYNCHRONE (Pour chargement instantané 0 ms entre les écrans) ---
let cachedWorkbook = getDefaultWorkbookState();
let cachedSummary = computeFarmSummary(cachedWorkbook);
let hasLoadedFromDisk = false;
let isSyncingCloud = false;

export const getCachedWorkbook = () => cachedWorkbook;
export const getCachedSummary = () => cachedSummary;

const updateMemoryCache = (newState) => {
  cachedWorkbook = newState;
  cachedSummary = computeFarmSummary(newState);
};

// Synchronisation Firestore en arrière-plan (non-bloquante)
const syncFromFirestoreInBackground = async () => {
  if (isSyncingCloud) return;
  isSyncingCloud = true;
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cloudData = snap.data();
      if (
        cloudData &&
        cloudData.lastUpdated &&
        (!cachedWorkbook.lastUpdated || cloudData.lastUpdated > cachedWorkbook.lastUpdated)
      ) {
        const merged = {
          ...cachedWorkbook,
          ...cloudData,
        };
        updateMemoryCache(merged);
        await AsyncStorage.setItem(STORAGE_WORKBOOK_KEY, JSON.stringify(merged));
      }
    } else {
      syncMetaToFirestore(cachedWorkbook);
    }
  } catch (e) {
    // Hors-ligne : ignorer
  } finally {
    isSyncingCloud = false;
  }
};

// Charger l'état du classeur (Instantané depuis le cache mémoire après le 1er chargement)
export const loadFarmWorkbook = async () => {
  if (hasLoadedFromDisk && cachedWorkbook) {
    syncFromFirestoreInBackground();
    return cachedWorkbook;
  }

  try {
    const raw = await AsyncStorage.getItem(STORAGE_WORKBOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      updateMemoryCache(parsed);
      hasLoadedFromDisk = true;
    } else {
      const def = getDefaultWorkbookState();
      updateMemoryCache(def);
      hasLoadedFromDisk = true;
      AsyncStorage.setItem(STORAGE_WORKBOOK_KEY, JSON.stringify(def)).catch(() => {});
    }
  } catch (e) {
    hasLoadedFromDisk = true;
  }

  syncFromFirestoreInBackground();
  return cachedWorkbook;
};

const syncMetaToFirestore = (state) => {
  try {
    const compactPayload = {
      pouletsBoxes: state.pouletsBoxes,
      bilanParams: state.bilanParams,
      employes: state.employes,
      constructions: state.constructions,
      autresDepenses: state.autresDepenses,
      versementsAliment: state.versementsAliment || [],
      entretiens: state.entretiens || [],
      factures: state.factures,
      commandes: state.commandes,
      production: state.production,
      stockageAliment: state.stockageAliment,
      stockageOeufs: state.stockageOeufs,
      lastUpdated: state.lastUpdated,
    };
    setDoc(doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID), compactPayload, { merge: true }).catch(() => {});
  } catch (e) {}
};

export const saveFarmWorkbook = async (newState) => {
  const updated = {
    ...newState,
    lastUpdated: new Date().toISOString(),
  };
  updateMemoryCache(updated);
  hasLoadedFromDisk = true;
  await AsyncStorage.setItem(STORAGE_WORKBOOK_KEY, JSON.stringify(updated));
  syncMetaToFirestore(updated);
  return updated;
};

// --- CALCUL DU RAPPORT (JOURNALIER, SEMAINE / HEBDOMADAIRE, ET ANNUEL) ---
export const getAvailableReportDates = (state) => {
  const wb = state || cachedWorkbook;
  const dateSet = new Set();

  (wb.production || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.stockageAliment || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.stockageOeufs || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.autresDepenses || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.versementsAliment || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.entretiens || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.constructions || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.factures || []).forEach((r) => r.date && dateSet.add(r.date));
  (wb.commandes || []).forEach((r) => r.date && dateSet.add(r.date));

  if (dateSet.size === 0) {
    dateSet.add(new Date().toISOString().split('T')[0]);
  }

  return Array.from(dateSet).sort((a, b) => (a < b ? 1 : -1));
};

export const getAvailableReportYears = (state) => {
  const dates = getAvailableReportDates(state);
  const yearSet = new Set();
  dates.forEach((d) => {
    const yr = String(d || '').slice(0, 4);
    if (/^\d{4}$/.test(yr)) yearSet.add(yr);
  });
  if (yearSet.size === 0) yearSet.add(String(new Date().getFullYear()));
  return Array.from(yearSet).sort((a, b) => (a < b ? 1 : -1));
};

export const getAvailableReportMonths = (state) => {
  const dates = getAvailableReportDates(state);
  const monthSet = new Set();
  dates.forEach((d) => {
    const ym = String(d || '').slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(ym)) monthSet.add(ym);
  });
  if (monthSet.size === 0) {
    monthSet.add(new Date().toISOString().slice(0, 7));
  }
  return Array.from(monthSet).sort((a, b) => (a < b ? 1 : -1));
};

const addDaysISO = (isoDate, deltaDays) => {
  const parts = String(isoDate || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    const d = new Date();
    d.setDate(d.getDate() + deltaDays);
    return d.toISOString().split('T')[0];
  }
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().split('T')[0];
};

const MONTH_NAMES_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const formatMonthLabelFr = (ym) => {
  const parts = String(ym || '').split('-');
  if (parts.length >= 2) {
    const yr = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${MONTH_NAMES_FR[mIdx]} ${yr}`;
    }
  }
  return String(ym || '');
};

export const computePeriodReport = (state, options = {}) => {
  const wb = state || cachedWorkbook;
  const periodType = options.periodType || 'day'; // 'day' | 'week' | 'month' | 'year'
  const cleanDate = (options.date || new Date().toISOString().split('T')[0]).trim();
  const cleanMonth = String(options.month || cleanDate.slice(0, 7) || new Date().toISOString().slice(0, 7)).trim();
  const cleanYear = String(options.year || cleanDate.slice(0, 4) || new Date().getFullYear()).trim();

  let startDate = cleanDate;
  let endDate = cleanDate;
  let periodTitle = `Rapport Journalier (${cleanDate})`;
  let periodLabel = cleanDate;
  let periodBadge = 'JOURNALIER';

  if (periodType === 'week') {
    endDate = cleanDate;
    startDate = addDaysISO(cleanDate, -6);
    periodTitle = `Rapport Hebdomadaire (${startDate} au ${endDate})`;
    periodLabel = `${startDate} au ${endDate}`;
    periodBadge = 'SEMAINE (7 JOURS)';
  } else if (periodType === 'month') {
    startDate = `${cleanMonth}-01`;
    endDate = `${cleanMonth}-31`;
    const mLabel = formatMonthLabelFr(cleanMonth);
    periodTitle = `Rapport Mensuel (${mLabel})`;
    periodLabel = mLabel;
    periodBadge = 'MENSUEL';
  } else if (periodType === 'year') {
    startDate = `${cleanYear}-01-01`;
    endDate = `${cleanYear}-12-31`;
    periodTitle = `Rapport Annuel (${cleanYear})`;
    periodLabel = `Année ${cleanYear}`;
    periodBadge = 'ANNUEL';
  }

  const inRange = (d) => {
    if (!d) return false;
    const s = String(d).trim();
    return s >= startDate && s <= endDate;
  };

  // 1. Production de la période
  const prodRows = (wb.production || []).filter((r) => inRange(r.date));
  const boxe1Produits = prodRows.reduce((s, r) => s + (Number(r.boxe1Produits) || 0), 0);
  const boxe2Produits = prodRows.reduce((s, r) => s + (Number(r.boxe2Produits) || 0), 0);
  const totalProduits = boxe1Produits + boxe2Produits;
  const boxe1Mortalite = prodRows.reduce((s, r) => s + (Number(r.boxe1Mortalite) || 0), 0);
  const boxe2Mortalite = prodRows.reduce((s, r) => s + (Number(r.boxe2Mortalite) || 0), 0);
  const totalMortalite = boxe1Mortalite + boxe2Mortalite;
  const consoAliment = prodRows.reduce((s, r) => s + (Number(r.consoAliment) || 0), 0);
  const tablettesVenduesProd = prodRows.reduce((s, r) => s + (Number(r.tablettesVendues) || 0), 0);

  // Trier par date décroissante pour obtenir le dernier effectif vivant connu sur la période
  const sortedProd = [...prodRows].sort((a, b) => (a.date < b.date ? 1 : -1));
  const restantVivant =
    sortedProd.length > 0 && sortedProd[0].restantVivant !== undefined
      ? sortedProd[0].restantVivant
      : cachedSummary.vivantsTotal;

  // 2. Mouvements de Stock Aliment de la période
  const alimRows = (wb.stockageAliment || []).filter((r) => inRange(r.date));
  const alimEntrees = alimRows.reduce((s, r) => s + (Number(r.entrees) || 0), 0);
  const alimSorties = alimRows.reduce((s, r) => s + (Number(r.sorties) || 0), 0);
  const consoAlimentFinal = alimSorties > 0 ? alimSorties : consoAliment;

  // 3. Mouvements de Stock Œufs de la période
  const oeufsRows = (wb.stockageOeufs || []).filter((r) => inRange(r.date));
  const oeufsEntreesRaw = oeufsRows.reduce((s, r) => s + (Number(r.entrees) || 0), 0);
  const oeufsEntrees = Math.max(oeufsEntreesRaw, totalProduits);
  const oeufsSorties = oeufsRows.reduce((s, r) => s + (Number(r.sorties) || 0), 0);

  // 4. Dépenses de la période (Autres Achats + Versements Aliment + Entretien + Constructions)
  const autresRows = (wb.autresDepenses || []).filter((d) => inRange(d.date));
  const versementsAlimentRows = (wb.versementsAliment || []).filter((v) => inRange(v.date));
  const entretiensRows = (wb.entretiens || []).filter((e) => inRange(e.date));
  const constRows = (wb.constructions || []).filter((c) => inRange(c.date));
  const totalAutresJour = autresRows.reduce((s, d) => s + (Number(d.montant) || 0), 0);
  const totalVersementsAlimentJour = versementsAlimentRows.reduce((s, v) => s + (Number(v.montant) || 0), 0);
  const totalEntretiensJour = entretiensRows.reduce((s, e) => s + (Number(e.montant) || 0), 0);
  const totalConstJour = constRows.reduce((s, c) => s + (Number(c.montant) || 0), 0);
  const totalDepensesJour = totalAutresJour + totalVersementsAlimentJour + totalEntretiensJour + totalConstJour;

  // 5. Factures & Commandes de la période
  const facturesRows = (wb.factures || []).filter((f) => inRange(f.date));
  const commandesRows = (wb.commandes || []).filter((c) => inRange(c.date));
  let ventesPayeesJour = 0;
  let ventesNonPayeesJour = 0;
  let tablettesFactureesJour = 0;
  const prixMap = new Map();

  for (const f of facturesRows) {
    const qte = Number(f.quantite) || 0;
    const pu = Number(f.prixUnitaire) || Number(wb.bilanParams?.prixTabletteDefaut) || 2200;
    const montant = Number(f.total) || qte * pu;
    tablettesFactureesJour += qte;
    if (String(f.statut || '').toLowerCase().includes('non')) {
      ventesNonPayeesJour += montant;
    } else {
      ventesPayeesJour += montant;
    }
    if (pu > 0) {
      const prev = prixMap.get(pu) || { prixUnitaire: pu, quantite: 0, total: 0, count: 0 };
      prev.quantite += qte;
      prev.total += montant;
      prev.count += 1;
      prixMap.set(pu, prev);
    }
  }

  const prixTabletteDefaut = Number(wb.bilanParams?.prixTabletteDefaut) || 2200;
  const prixUnitairesDetails = Array.from(prixMap.values()).sort(
    (a, b) => a.prixUnitaire - b.prixUnitaire
  );
  const prixUnitairesTablettes =
    prixUnitairesDetails.length > 0
      ? prixUnitairesDetails.map((d) => d.prixUnitaire)
      : [prixTabletteDefaut];
  const prixUnitaireLabel =
    prixUnitairesDetails.length === 0
      ? `${prixTabletteDefaut.toLocaleString('fr-FR')} FCFA / tab. (tarif actuel)`
      : prixUnitairesDetails.length === 1
      ? `${prixUnitairesDetails[0].prixUnitaire.toLocaleString('fr-FR')} FCFA / tab.`
      : `${prixUnitairesDetails
          .map((d) => `${d.prixUnitaire.toLocaleString('fr-FR')} FCFA`)
          .join(' • ')} / tab.`;

  const soldeNetJour = ventesPayeesJour - totalDepensesJour;

  const getDayOrMonthPriceLabel = (fList) => {
    const pSet = new Set();
    for (const f of fList) {
      const pu = Number(f.prixUnitaire) || prixTabletteDefaut;
      if (pu > 0) pSet.add(pu);
    }
    if (pSet.size === 0) return `${prixTabletteDefaut.toLocaleString('fr-FR')} FCFA`;
    return Array.from(pSet)
      .sort((a, b) => a - b)
      .map((p) => `${p.toLocaleString('fr-FR')} FCFA`)
      .join(' / ');
  };

  // 6. Tableau récapitulatif détaillé (par jour pour Semaine, par mois pour Annuel)
  const breakdownRows = [];
  if (periodType === 'week') {
    for (let i = 0; i < 7; i++) {
      const d = addDaysISO(endDate, -i);
      const pDay = prodRows.filter((r) => r.date === d);
      const fDay = facturesRows.filter((r) => r.date === d);
      const aDay = autresRows.filter((r) => r.date === d);
      const vDay = versementsAlimentRows.filter((r) => r.date === d);
      const eDay = entretiensRows.filter((r) => r.date === d);
      const cDay = constRows.filter((r) => r.date === d);
      const prodTot = pDay.reduce((s, r) => s + (Number(r.boxe1Produits) || 0) + (Number(r.boxe2Produits) || 0), 0);
      const mortTot = pDay.reduce((s, r) => s + (Number(r.boxe1Mortalite) || 0) + (Number(r.boxe2Mortalite) || 0), 0);
      const consoTot = pDay.reduce((s, r) => s + (Number(r.consoAliment) || 0), 0);
      const tabFactTot = fDay.reduce((s, f) => s + (Number(f.quantite) || 0), 0);
      const ventesTot = fDay.reduce((s, f) => {
        if (String(f.statut || '').toLowerCase().includes('non')) return s;
        return s + (Number(f.total) || (Number(f.quantite) || 0) * (Number(f.prixUnitaire) || 0));
      }, 0);
      const depTot =
        aDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        vDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        eDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        cDay.reduce((s, x) => s + (Number(x.montant) || 0), 0);

      breakdownRows.push({
        key: d,
        label: d,
        totalProduits: prodTot,
        totalMortalite: mortTot,
        consoAliment: consoTot,
        tablettesFacturees: tabFactTot,
        prixUnitaireLabel: getDayOrMonthPriceLabel(fDay),
        ventesPayees: ventesTot,
        depenses: depTot,
        solde: ventesTot - depTot,
      });
    }
  } else if (periodType === 'month') {
    const activeDatesInMonth = new Set();
    prodRows.forEach((r) => r.date && activeDatesInMonth.add(r.date));
    facturesRows.forEach((f) => f.date && activeDatesInMonth.add(f.date));
    autresRows.forEach((d) => d.date && activeDatesInMonth.add(d.date));
    versementsAlimentRows.forEach((v) => v.date && activeDatesInMonth.add(v.date));
    entretiensRows.forEach((e) => e.date && activeDatesInMonth.add(e.date));
    constRows.forEach((c) => c.date && activeDatesInMonth.add(c.date));

    const sortedDays = Array.from(activeDatesInMonth).sort((a, b) => (a < b ? 1 : -1));
    for (const d of sortedDays) {
      const pDay = prodRows.filter((r) => r.date === d);
      const fDay = facturesRows.filter((r) => r.date === d);
      const aDay = autresRows.filter((r) => r.date === d);
      const vDay = versementsAlimentRows.filter((r) => r.date === d);
      const eDay = entretiensRows.filter((r) => r.date === d);
      const cDay = constRows.filter((r) => r.date === d);
      const prodTot = pDay.reduce((s, r) => s + (Number(r.boxe1Produits) || 0) + (Number(r.boxe2Produits) || 0), 0);
      const mortTot = pDay.reduce((s, r) => s + (Number(r.boxe1Mortalite) || 0) + (Number(r.boxe2Mortalite) || 0), 0);
      const consoTot = pDay.reduce((s, r) => s + (Number(r.consoAliment) || 0), 0);
      const tabFactTot = fDay.reduce((s, f) => s + (Number(f.quantite) || 0), 0);
      const ventesTot = fDay.reduce((s, f) => {
        if (String(f.statut || '').toLowerCase().includes('non')) return s;
        return s + (Number(f.total) || (Number(f.quantite) || 0) * (Number(f.prixUnitaire) || 0));
      }, 0);
      const depTot =
        aDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        vDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        eDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        cDay.reduce((s, x) => s + (Number(x.montant) || 0), 0);

      breakdownRows.push({
        key: d,
        label: d,
        totalProduits: prodTot,
        totalMortalite: mortTot,
        consoAliment: consoTot,
        tablettesFacturees: tabFactTot,
        prixUnitaireLabel: getDayOrMonthPriceLabel(fDay),
        ventesPayees: ventesTot,
        depenses: depTot,
        solde: ventesTot - depTot,
      });
    }
  } else if (periodType === 'year') {
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, '0');
      const prefix = `${cleanYear}-${mm}`;
      const pMonth = prodRows.filter((r) => String(r.date || '').startsWith(prefix));
      const fMonth = facturesRows.filter((r) => String(r.date || '').startsWith(prefix));
      const aMonth = autresRows.filter((r) => String(r.date || '').startsWith(prefix));
      const vMonth = versementsAlimentRows.filter((r) => String(r.date || '').startsWith(prefix));
      const eMonth = entretiensRows.filter((r) => String(r.date || '').startsWith(prefix));
      const cMonth = constRows.filter((r) => String(r.date || '').startsWith(prefix));
      if (
        pMonth.length === 0 &&
        fMonth.length === 0 &&
        aMonth.length === 0 &&
        vMonth.length === 0 &&
        eMonth.length === 0 &&
        cMonth.length === 0
      ) {
        continue;
      }
      const prodTot = pMonth.reduce((s, r) => s + (Number(r.boxe1Produits) || 0) + (Number(r.boxe2Produits) || 0), 0);
      const mortTot = pMonth.reduce((s, r) => s + (Number(r.boxe1Mortalite) || 0) + (Number(r.boxe2Mortalite) || 0), 0);
      const consoTot = pMonth.reduce((s, r) => s + (Number(r.consoAliment) || 0), 0);
      const tabFactTot = fMonth.reduce((s, f) => s + (Number(f.quantite) || 0), 0);
      const ventesTot = fMonth.reduce((s, f) => {
        if (String(f.statut || '').toLowerCase().includes('non')) return s;
        return s + (Number(f.total) || (Number(f.quantite) || 0) * (Number(f.prixUnitaire) || 0));
      }, 0);
      const depTot =
        aMonth.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        vMonth.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        eMonth.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        cMonth.reduce((s, x) => s + (Number(x.montant) || 0), 0);

      breakdownRows.push({
        key: prefix,
        label: `${MONTH_NAMES_FR[m - 1]} ${cleanYear}`,
        totalProduits: prodTot,
        totalMortalite: mortTot,
        consoAliment: consoTot,
        tablettesFacturees: tabFactTot,
        prixUnitaireLabel: getDayOrMonthPriceLabel(fMonth),
        ventesPayees: ventesTot,
        depenses: depTot,
        solde: ventesTot - depTot,
      });
    }
  }

  return {
    periodType,
    periodTitle,
    periodLabel,
    periodBadge,
    date: cleanDate,
    month: cleanMonth,
    year: cleanYear,
    startDate,
    endDate,
    hasActivity:
      prodRows.length > 0 ||
      alimRows.length > 0 ||
      oeufsRows.length > 0 ||
      autresRows.length > 0 ||
      versementsAlimentRows.length > 0 ||
      entretiensRows.length > 0 ||
      constRows.length > 0 ||
      facturesRows.length > 0 ||
      commandesRows.length > 0,
    prodRows,
    boxe1Produits,
    boxe2Produits,
    totalProduits,
    boxe1Mortalite,
    boxe2Mortalite,
    totalMortalite,
    consoAliment: consoAlimentFinal,
    tablettesVenduesProd,
    restantVivant,
    alimRows,
    alimEntrees,
    alimSorties,
    oeufsRows,
    oeufsEntrees,
    oeufsSorties,
    autresRows,
    versementsAlimentRows,
    entretiensRows,
    constRows,
    totalAutresJour,
    totalVersementsAlimentJour,
    totalEntretiensJour,
    totalConstJour,
    totalDepensesJour,
    facturesRows,
    commandesRows,
    ventesPayeesJour,
    ventesNonPayeesJour,
    tablettesFactureesJour,
    prixTabletteDefaut,
    prixUnitairesTablettes,
    prixUnitairesDetails,
    prixUnitaireLabel,
    soldeNetJour,
    breakdownRows,
  };
};

export const computeDailyReport = (state, targetDate) =>
  computePeriodReport(state, { periodType: 'day', date: targetDate });

// --- ACTIONS MÉTIERS (MULTI-DÉTAILS PAR DATE + BLOCAGE DES DÉTAILS DÉJÀ AJOUTÉS) ---

// 1. Ajouter ou compléter les détails journaliers de Production pour une date
export const addDailyProduction = async ({
  date,
  boxe1Produits = 0,
  boxe2Produits = 0,
  boxe1Mortalite = 0,
  boxe2Mortalite = 0,
  tablettesVendues = 0,
  consoAliment = 0,
  autoSyncStockage = true,
  auteur = '',
}) => {
  const state = await loadFarmWorkbook();
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();

  const b1P = Number(boxe1Produits) || 0;
  const b2P = Number(boxe2Produits) || 0;
  const b1M = Number(boxe1Mortalite) || 0;
  const b2M = Number(boxe2Mortalite) || 0;
  const vendus = Number(tablettesVendues) || 0;
  const conso = Number(consoAliment) || 0;

  const prodList = [...(state.production || [])];
  const existingIdx = prodList.findIndex((r) => r.date === cleanDate);

  // Si une fiche existe déjà pour cette date, vérifier qu'on ne ressaisit pas un détail déjà ajouté (> 0)
  // tout en permettant d'ajouter les autres détails de la même date !
  if (existingIdx >= 0) {
    const existing = prodList[existingIdx];
    const duplicateFields = [];
    if (b1P > 0 && Number(existing.boxe1Produits) > 0) duplicateFields.push('Production Boxe 1');
    if (b2P > 0 && Number(existing.boxe2Produits) > 0) duplicateFields.push('Production Boxe 2');
    if (b1M > 0 && Number(existing.boxe1Mortalite) > 0) duplicateFields.push('Mortalité Boxe 1');
    if (b2M > 0 && Number(existing.boxe2Mortalite) > 0) duplicateFields.push('Mortalité Boxe 2');
    if (conso > 0 && Number(existing.consoAliment) > 0) duplicateFields.push('Aliment (Sacs)');
    if (vendus > 0 && Number(existing.tablettesVendues) > 0) duplicateFields.push('Tablettes Vendues');

    if (duplicateFields.length > 0) {
      return {
        ...state,
        alreadyExists: true,
        duplicateFields,
        existingRecord: existing,
      };
    }

    // Fusionner les nouveaux détails saisis dans la fiche de cette date
    const nextB1P = (Number(existing.boxe1Produits) || 0) + b1P;
    const nextB2P = (Number(existing.boxe2Produits) || 0) + b2P;
    const nextTotalProd = nextB1P + nextB2P;
    const nextB1M = (Number(existing.boxe1Mortalite) || 0) + b1M;
    const nextB2M = (Number(existing.boxe2Mortalite) || 0) + b2M;
    const nextTotalMort = nextB1M + nextB2M;
    const nextVendus = (Number(existing.tablettesVendues) || 0) + vendus;
    const nextConso = (Number(existing.consoAliment) || 0) + conso;

    const summaryBefore = computeFarmSummary(state);
    const deltaMort = b1M + b2M;
    const restantVivant = Math.max(0, summaryBefore.vivantsTotal - deltaMort);

    const updatedRecord = {
      ...existing,
      boxe1Produits: nextB1P,
      boxe2Produits: nextB2P,
      totalProduits: nextTotalProd,
      boxe1Mortalite: nextB1M,
      boxe2Mortalite: nextB2M,
      totalMortalite: nextTotalMort,
      tablettesVendues: nextVendus,
      consoAliment: nextConso,
      restantVivant,
      auteur: auteur || existing.auteur || '',
    };

    prodList[existingIdx] = updatedRecord;

    let nextStockAliment = [...(state.stockageAliment || [])];
    let nextStockOeufs = [...(state.stockageOeufs || [])];

    const deltaProd = b1P + b2P;
    if (autoSyncStockage) {
      if (deltaProd > 0 || vendus > 0) {
        const newStockOeuf = Math.max(0, summaryBefore.stockTablettesDisponibles + deltaProd - vendus);
        nextStockOeufs = [
          {
            id: 'oeuf_' + Date.now(),
            date: cleanDate,
            entrees: deltaProd,
            sorties: vendus,
            stockRestant: newStockOeuf,
            note: 'Complément production du jour',
            auteur,
          },
          ...nextStockOeufs,
        ];
      }
      if (conso > 0) {
        const newStockAlim = Math.max(0, summaryBefore.stockSacsAlimentRestant - conso);
        nextStockAliment = [
          {
            id: 'alim_' + Date.now(),
            date: cleanDate,
            entrees: 0,
            sorties: conso,
            stockRestant: newStockAlim,
            note: 'Consommation production du jour',
            auteur,
          },
          ...nextStockAliment,
        ];
      }
    }

    return await saveFarmWorkbook({
      ...state,
      production: prodList,
      stockageAliment: nextStockAliment,
      stockageOeufs: nextStockOeufs,
    });
  }

  // Première saisie de détails pour cette date
  const totalProduits = b1P + b2P;
  const totalMortalite = b1M + b2M;
  const summaryBefore = computeFarmSummary(state);
  const restantVivant = Math.max(0, summaryBefore.vivantsTotal - totalMortalite);

  const newEntry = {
    id: 'prod_' + Date.now(),
    date: cleanDate,
    boxe1Produits: b1P,
    boxe2Produits: b2P,
    totalProduits,
    boxe1Mortalite: b1M,
    boxe2Mortalite: b2M,
    totalMortalite,
    tablettesVendues: vendus,
    consoAliment: conso,
    restantVivant,
    auteur,
  };

  const nextProduction = [newEntry, ...prodList];
  let nextStockAliment = [...(state.stockageAliment || [])];
  let nextStockOeufs = [...(state.stockageOeufs || [])];

  if (autoSyncStockage) {
    if (totalProduits > 0 || vendus > 0) {
      const newStockOeuf = Math.max(0, summaryBefore.stockTablettesDisponibles + totalProduits - vendus);
      nextStockOeufs = [
        {
          id: 'oeuf_' + Date.now(),
          date: cleanDate,
          entrees: totalProduits,
          sorties: vendus,
          stockRestant: newStockOeuf,
          note: 'Production du jour',
          auteur,
        },
        ...nextStockOeufs,
      ];
    }
    if (conso > 0) {
      const newStockAlim = Math.max(0, summaryBefore.stockSacsAlimentRestant - conso);
      nextStockAliment = [
        {
          id: 'alim_' + Date.now(),
          date: cleanDate,
          entrees: 0,
          sorties: conso,
          stockRestant: newStockAlim,
          note: 'Consommation du jour',
          auteur,
        },
        ...nextStockAliment,
      ];
    }
  }

  return await saveFarmWorkbook({
    ...state,
    production: nextProduction,
    stockageAliment: nextStockAliment,
    stockageOeufs: nextStockOeufs,
  });
};

// Suggérer un prochain numéro de facture tout en autorisant tout numéro personnalisé
export const getNextSuggestedFactureNumber = (state) => {
  const wb = state || cachedWorkbook;
  const factures = wb?.factures || [];
  let maxNum = 0;
  for (const f of factures) {
    const num = parseInt(String(f?.numeroFacture || '').replace(/\D+/g, ''), 10);
    if (!isNaN(num) && num > maxNum && num < 100000) {
      maxNum = num;
    }
  }
  return String(maxNum > 0 ? maxNum + 1 : 1);
};

// Recalculer proprement le stockRestant progressif d'une liste de mouvements de stock
const recalculateStockListBalances = (list, baseOffset) => {
  const chronological = [...(list || [])].sort((a, b) => {
    const da = String(a?.date || '');
    const dbStr = String(b?.date || '');
    if (da !== dbStr) return da < dbStr ? -1 : 1;
    return (Number(a?.excelRow) || 0) - (Number(b?.excelRow) || 0);
  });
  let running = baseOffset;
  const balanceMap = new Map();
  for (const item of chronological) {
    running += (Number(item.entrees) || 0) - (Number(item.sorties) || 0);
    balanceMap.set(item.id, Math.max(0, running));
  }
  return (list || []).map((item) => ({
    ...item,
    stockRestant: balanceMap.has(item.id) ? balanceMap.get(item.id) : item.stockRestant,
  }));
};

// Modifier une fiche de production en cas d'erreur de saisie (et synchroniser le stock d'œufs)
export const updateProductionEntry = async ({
  id,
  date,
  boxe1Produits = 0,
  boxe2Produits = 0,
  boxe1Mortalite = 0,
  boxe2Mortalite = 0,
  consoAliment,
  tablettesVendues,
  auteur = '',
}) => {
  const state = await loadFarmWorkbook();
  const prodList = [...(state.production || [])];
  const idx = prodList.findIndex((r) => r.id === id);
  if (idx < 0) return state;

  const oldRecord = prodList[idx];
  const cleanDate = (date || oldRecord.date || new Date().toISOString().split('T')[0]).trim();

  // Vérifier qu'une autre fiche de production n'existe pas déjà à la nouvelle date choisie
  const otherDateConflict = prodList.find((r) => r.id !== id && r.date === cleanDate);
  if (otherDateConflict) {
    return {
      ...state,
      dateConflict: true,
      existingRecord: otherDateConflict,
    };
  }

  const b1P = Math.max(0, Number(boxe1Produits) || 0);
  const b2P = Math.max(0, Number(boxe2Produits) || 0);
  const nextTotalProd = b1P + b2P;
  const b1M = Math.max(0, Number(boxe1Mortalite) || 0);
  const b2M = Math.max(0, Number(boxe2Mortalite) || 0);
  const nextTotalMort = b1M + b2M;
  const nextConso =
    consoAliment !== undefined ? Math.max(0, Number(consoAliment) || 0) : Number(oldRecord.consoAliment) || 0;
  const nextVendus =
    tablettesVendues !== undefined
      ? Math.max(0, Number(tablettesVendues) || 0)
      : Number(oldRecord.tablettesVendues) || 0;

  const oldTotalProd = (Number(oldRecord.boxe1Produits) || 0) + (Number(oldRecord.boxe2Produits) || 0);
  const deltaProd = nextTotalProd - oldTotalProd;

  // Synchroniser automatiquement le mouvement d'entrée d'œufs lié à la production de cette date
  let nextStockOeufs = [...(state.stockageOeufs || [])];
  const stockProdIdx = nextStockOeufs.findIndex(
    (m) =>
      m.date === oldRecord.date &&
      Number(m.entrees) > 0 &&
      (String(m.note || '').toLowerCase().includes('production du jour') || Number(m.entrees) === oldTotalProd)
  );

  if (stockProdIdx >= 0) {
    const existingMov = nextStockOeufs[stockProdIdx];
    const updatedEntrees = Math.max(0, (Number(existingMov.entrees) || 0) + deltaProd);
    nextStockOeufs[stockProdIdx] = {
      ...existingMov,
      date: cleanDate,
      entrees: updatedEntrees,
    };
    nextStockOeufs = recalculateStockListBalances(nextStockOeufs, -104);
  } else if (deltaProd !== 0 && nextTotalProd > 0) {
    const summaryBefore = computeFarmSummary(state);
    nextStockOeufs = [
      {
        id: 'oeuf_' + Date.now(),
        date: cleanDate,
        entrees: nextTotalProd,
        sorties: 0,
        stockRestant: Math.max(0, summaryBefore.stockTablettesDisponibles + deltaProd),
        note: 'Production du jour',
        auteur: auteur || oldRecord.auteur || '',
      },
      ...nextStockOeufs,
    ];
    nextStockOeufs = recalculateStockListBalances(nextStockOeufs, -104);
  }

  prodList[idx] = {
    ...oldRecord,
    date: cleanDate,
    boxe1Produits: b1P,
    boxe2Produits: b2P,
    totalProduits: nextTotalProd,
    boxe1Mortalite: b1M,
    boxe2Mortalite: b2M,
    totalMortalite: nextTotalMort,
    consoAliment: nextConso,
    tablettesVendues: nextVendus,
    auteur: auteur || oldRecord.auteur || '',
  };

  // Recalculer l'effectif vivant après modification
  const tempSummary = computeFarmSummary({
    ...state,
    production: prodList,
  });
  prodList[idx].restantVivant = tempSummary.vivantsTotal;

  return await saveFarmWorkbook({
    ...state,
    production: sortNewestFirst(prodList),
    stockageOeufs: sortNewestFirst(nextStockOeufs),
  });
};

export const deleteProductionEntry = async (id) => {
  const state = await loadFarmWorkbook();
  const target = (state.production || []).find((r) => r.id === id);
  let nextStockOeufs = [...(state.stockageOeufs || [])];

  if (target) {
    const oldTotalProd = (Number(target.boxe1Produits) || 0) + (Number(target.boxe2Produits) || 0);
    const movIdx = nextStockOeufs.findIndex(
      (m) =>
        m.date === target.date &&
        Number(m.entrees) === oldTotalProd &&
        String(m.note || '').toLowerCase().includes('production')
    );
    if (movIdx >= 0) {
      nextStockOeufs.splice(movIdx, 1);
      nextStockOeufs = recalculateStockListBalances(nextStockOeufs, -104);
    }
  }

  return await saveFarmWorkbook({
    ...state,
    production: (state.production || []).filter((r) => r.id !== id),
    stockageOeufs: nextStockOeufs,
  });
};

// 2. Ajouter un détail de mouvement dans Stockage (plusieurs détails possibles par date, blocage d'un doublon identique et contrôle de stock disponible)
export const addStockageAlimentMovement = async ({ date, entrees = 0, sorties = 0, note = '', auteur = '' }) => {
  const state = await loadFarmWorkbook();
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const ent = Number(entrees) || 0;
  const sort = Number(sorties) || 0;
  const cleanNote = String(note || '').trim();

  const summary = computeFarmSummary(state);

  // Contrôle anti-erreur : impossible de sortir plus de sacs que le stock disponible
  if (sort > 0 && ent === 0 && sort > summary.stockSacsAlimentRestant) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: summary.stockSacsAlimentRestant,
    };
  }

  // Bloquer si exactement le même détail (même date, même entrée, même sortie, même note) a déjà été ajouté
  const existingRecord = (state.stockageAliment || []).find(
    (r) =>
      r.date === cleanDate &&
      Number(r.entrees) === ent &&
      Number(r.sorties) === sort &&
      String(r.note || '').trim().toLowerCase() === cleanNote.toLowerCase()
  );
  if (existingRecord) {
    return {
      ...state,
      alreadyExists: true,
      existingRecord,
    };
  }

  const stockRestant = Math.max(0, summary.stockSacsAlimentRestant + ent - sort);

  const newEntry = {
    id: 'alim_' + Date.now(),
    date: cleanDate,
    entrees: ent,
    sorties: sort,
    stockRestant,
    note: cleanNote || (ent > 0 ? 'Arrivage sacs aliment' : 'Consommation du jour'),
    auteur,
  };

  return await saveFarmWorkbook({
    ...state,
    stockageAliment: [newEntry, ...(state.stockageAliment || [])],
  });
};

export const addStockageOeufsMovement = async ({
  date,
  entrees = 0,
  sorties = 0,
  note = '',
  auteur = '',
  createFacture = false,
  numeroFacture = '',
  prixUnitaire = 0,
  statutFacture = 'Payé',
}) => {
  const state = await loadFarmWorkbook();
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const ent = Number(entrees) || 0;
  const sort = Number(sorties) || 0;
  const cleanNote = String(note || '').trim();
  const cleanNumFacture = String(numeroFacture || '').trim();

  const summary = computeFarmSummary(state);

  // Contrôle anti-erreur : impossible de sortir plus de tablettes que le stock disponible
  if (sort > 0 && ent === 0 && sort > summary.stockTablettesDisponibles) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: summary.stockTablettesDisponibles,
    };
  }

  // Si création de facture activée et numéro de facture saisi :
  // Deux factures peuvent avoir le même numéro si leurs dates sont différentes,
  // mais PAS le même numéro à la même date !
  if (createFacture && sort > 0 && cleanNumFacture) {
    const duplicateSameDate = (state.factures || []).find(
      (f) =>
        String(f.numeroFacture || '').trim().toLowerCase() === cleanNumFacture.toLowerCase() &&
        String(f.date || '').trim() === cleanDate
    );
    if (duplicateSameDate) {
      return {
        ...state,
        duplicateInvoiceNumberForDate: true,
        existingInvoice: duplicateSameDate,
      };
    }
  }

  // Bloquer si exactement le même détail a déjà été ajouté à cette date (sans numéro de facture différent)
  const existingRecord = (state.stockageOeufs || []).find(
    (r) =>
      r.date === cleanDate &&
      Number(r.entrees) === ent &&
      Number(r.sorties) === sort &&
      String(r.note || '').trim().toLowerCase() === cleanNote.toLowerCase() &&
      (!cleanNumFacture || String(r.numeroFacture || '').trim().toLowerCase() === cleanNumFacture.toLowerCase())
  );
  if (existingRecord) {
    return {
      ...state,
      alreadyExists: true,
      existingRecord,
    };
  }

  const stockRestant = Math.max(0, summary.stockTablettesDisponibles + ent - sort);
  const movId = 'oeuf_' + Date.now();
  const factId = createFacture && sort > 0 ? 'fact_' + (Date.now() + 1) : null;
  const finalNumeroFacture =
    createFacture && sort > 0
      ? cleanNumFacture || getNextSuggestedFactureNumber(state)
      : '';

  const newEntry = {
    id: movId,
    date: cleanDate,
    entrees: ent,
    sorties: sort,
    stockRestant,
    note: cleanNote || 'Sortie stock tablettes',
    auteur,
    ...(factId ? { linkedFactureId: factId, numeroFacture: finalNumeroFacture } : {}),
  };

  let nextFactures = [...(state.factures || [])];
  if (createFacture && sort > 0) {
    const pu = Number(prixUnitaire) || summary.prixTabletteDefaut || 2200;
    nextFactures = [
      {
        id: factId,
        date: cleanDate,
        numeroFacture: finalNumeroFacture,
        quantite: sort,
        designation: 'Tablettes',
        prixUnitaire: pu,
        total: sort * pu,
        client: String(cleanNote || 'CLIENT COMPTOIR').toUpperCase(),
        statut: statutFacture === 'Non Payé' ? 'Non Payé' : 'Payé',
        cachet: true,
        linkedStockMovementId: movId,
      },
      ...nextFactures,
    ];
  }

  return await saveFarmWorkbook({
    ...state,
    stockageOeufs: [newEntry, ...(state.stockageOeufs || [])],
    factures: nextFactures,
  });
};

// Modifier un mouvement de stock (Aliment ou Œufs) en cas d'erreur de saisie
export const updateStockageMovement = async ({
  type = 'aliment',
  id,
  date,
  entrees = 0,
  sorties = 0,
  note = '',
  auteur = '',
}) => {
  const state = await loadFarmWorkbook();
  const isAliment = type === 'aliment';
  const listKey = isAliment ? 'stockageAliment' : 'stockageOeufs';
  const baseOffset = isAliment ? 29 : -104;
  const list = [...(state[listKey] || [])];
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return state;

  const oldItem = list[idx];
  const cleanDate = (date || oldItem.date || new Date().toISOString().split('T')[0]).trim();
  const ent = Math.max(0, Number(entrees) || 0);
  const sort = Math.max(0, Number(sorties) || 0);
  const cleanNote = String(note || '').trim();

  const summary = computeFarmSummary(state);
  const currentAvailable = isAliment ? summary.stockSacsAlimentRestant : summary.stockTablettesDisponibles;
  const oldNet = (Number(oldItem.entrees) || 0) - (Number(oldItem.sorties) || 0);
  const newNet = ent - sort;
  const projectedGlobalStock = currentAvailable - oldNet + newNet;

  if (projectedGlobalStock < 0) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: currentAvailable - oldNet,
    };
  }

  list[idx] = {
    ...oldItem,
    date: cleanDate,
    entrees: ent,
    sorties: sort,
    note: cleanNote || oldItem.note,
    auteur: auteur || oldItem.auteur || '',
  };

  const recalculatedList = sortNewestFirst(recalculateStockListBalances(list, baseOffset));

  // Si c'est un mouvement d'œufs lié à une facture, mettre à jour la facture correspondante
  let nextFactures = [...(state.factures || [])];
  if (!isAliment && sort > 0) {
    const factIdx = nextFactures.findIndex(
      (f) =>
        (oldItem.linkedFactureId && f.id === oldItem.linkedFactureId) ||
        (f.linkedStockMovementId && f.linkedStockMovementId === oldItem.id) ||
        (f.date === oldItem.date &&
          Number(f.quantite) === Number(oldItem.sorties) &&
          String(oldItem.note || '')
            .toUpperCase()
            .includes(String(f.client || '').toUpperCase()))
    );
    if (factIdx >= 0) {
      const targetFact = nextFactures[factIdx];
      const pu = Number(targetFact.prixUnitaire) || summary.prixTabletteDefaut || 2200;
      const updatedClient =
        cleanNote && !cleanNote.toLowerCase().startsWith('facture n°')
          ? cleanNote.toUpperCase()
          : targetFact.client;
      nextFactures[factIdx] = {
        ...targetFact,
        date: cleanDate,
        quantite: sort,
        total: sort * pu,
        client: updatedClient,
      };
      nextFactures = sortNewestFirst(nextFactures);
    }
  }

  return await saveFarmWorkbook({
    ...state,
    [listKey]: recalculatedList,
    factures: nextFactures,
  });
};

// Supprimer un mouvement de stock (Aliment ou Œufs) en cas d'erreur
export const deleteStockageMovement = async (type = 'aliment', id) => {
  const state = await loadFarmWorkbook();
  const isAliment = type === 'aliment';
  const listKey = isAliment ? 'stockageAliment' : 'stockageOeufs';
  const baseOffset = isAliment ? 29 : -104;
  const list = [...(state[listKey] || [])];
  const target = list.find((r) => r.id === id);
  const filtered = list.filter((r) => r.id !== id);
  const recalculatedList = sortNewestFirst(recalculateStockListBalances(filtered, baseOffset));

  let nextFactures = [...(state.factures || [])];
  if (!isAliment && target && Number(target.sorties) > 0) {
    nextFactures = nextFactures.filter(
      (f) =>
        !(
          (target.linkedFactureId && f.id === target.linkedFactureId) ||
          (f.linkedStockMovementId && f.linkedStockMovementId === target.id)
        )
    );
  }

  return await saveFarmWorkbook({
    ...state,
    [listKey]: recalculatedList,
    factures: nextFactures,
  });
};

// 3. Ajouter / Modifier / Supprimer un lot dans Poulets_Boxes
export const addPouletsBoxesBatch = async ({ date, boxe1 = 0, boxe2 = 0, males = 0, note = '', auteur = '' }) => {
  const state = await loadFarmWorkbook();
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const b1 = Number(boxe1) || 0;
  const b2 = Number(boxe2) || 0;
  const m = Number(males) || 0;
  const total = b1 + b2 + m;

  const existingRecord = (state.pouletsBoxes?.entries || []).find(
    (e) => e.date === cleanDate && Number(e.boxe1) === b1 && Number(e.boxe2) === b2
  );
  if (existingRecord) {
    return {
      ...state,
      alreadyExists: true,
      existingRecord,
    };
  }

  const newEntry = {
    id: 'pb_' + Date.now(),
    date: cleanDate,
    boxe1: b1,
    boxe2: b2,
    males: m,
    total,
    note: note || `Ajout Boxe 1: ${b1}, Boxe 2: ${b2}`,
    auteur,
  };

  const nextEntries = [...(state.pouletsBoxes?.entries || []), newEntry];
  return await saveFarmWorkbook({
    ...state,
    pouletsBoxes: {
      ...state.pouletsBoxes,
      entries: nextEntries,
    },
  });
};

export const updatePouletsBoxesBatch = async ({ id, date, boxe1 = 0, boxe2 = 0, males = 0, note = '' }) => {
  const state = await loadFarmWorkbook();
  const entries = [...(state.pouletsBoxes?.entries || [])];
  const idx = entries.findIndex((e) => e.id === id);
  if (idx < 0) return state;

  const b1 = Math.max(0, Number(boxe1) || 0);
  const b2 = Math.max(0, Number(boxe2) || 0);
  const m = Math.max(0, Number(males) || 0);
  const cleanDate = (date || entries[idx].date || new Date().toISOString().split('T')[0]).trim();

  entries[idx] = {
    ...entries[idx],
    date: cleanDate,
    boxe1: b1,
    boxe2: b2,
    males: m,
    total: b1 + b2 + m,
    note: String(note || entries[idx].note || '').trim(),
  };

  return await saveFarmWorkbook({
    ...state,
    pouletsBoxes: {
      ...state.pouletsBoxes,
      entries,
    },
  });
};

export const deletePouletsBoxesBatch = async (id) => {
  const state = await loadFarmWorkbook();
  const entries = (state.pouletsBoxes?.entries || []).filter((e) => e.id !== id);
  return await saveFarmWorkbook({
    ...state,
    pouletsBoxes: {
      ...state.pouletsBoxes,
      entries,
    },
  });
};

// 4. Ajouter / Modifier / Supprimer une dépense (Autres Achats, Versements Aliment, Constructions)
export const addExpenseItem = async ({ type = 'autres', date, designation, montant, auteur = '' }) => {
  const state = await loadFarmWorkbook();
  const cleanMontant = Number(montant) || 0;
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const cleanDesig = String(designation || '').trim();
  const lowerDesig = cleanDesig.toLowerCase();

  if (type === 'constructions') {
    const existingRecord = (state.constructions || []).find(
      (c) =>
        c.date === cleanDate &&
        String(c.designation || '').trim().toLowerCase() === lowerDesig &&
        Number(c.montant) === cleanMontant
    );
    if (existingRecord) {
      return {
        ...state,
        alreadyExists: true,
        existingRecord,
      };
    }

    const newConst = {
      id: 'const_' + Date.now(),
      date: cleanDate,
      designation: cleanDesig,
      montant: cleanMontant,
      auteur,
    };
    return await saveFarmWorkbook({
      ...state,
      constructions: [newConst, ...(state.constructions || [])],
    });
  } else if (type === 'aliment') {
    const existingRecord = (state.versementsAliment || []).find(
      (v) =>
        v.date === cleanDate &&
        String(v.designation || v.produit || '').trim().toLowerCase() === lowerDesig &&
        Number(v.montant) === cleanMontant
    );
    if (existingRecord) {
      return {
        ...state,
        alreadyExists: true,
        existingRecord,
      };
    }

    const newVers = {
      id: 'valim_' + Date.now(),
      date: cleanDate,
      designation: cleanDesig,
      produit: cleanDesig,
      montant: cleanMontant,
      auteur,
    };
    return await saveFarmWorkbook({
      ...state,
      versementsAliment: [newVers, ...(state.versementsAliment || [])],
    });
  } else if (type === 'entretien') {
    const existingRecord = (state.entretiens || []).find(
      (e) =>
        e.date === cleanDate &&
        String(e.designation || e.produit || '').trim().toLowerCase() === lowerDesig &&
        Number(e.montant) === cleanMontant
    );
    if (existingRecord) {
      return {
        ...state,
        alreadyExists: true,
        existingRecord,
      };
    }

    const newEnt = {
      id: 'entr_' + Date.now(),
      date: cleanDate,
      designation: cleanDesig,
      produit: cleanDesig,
      montant: cleanMontant,
      auteur,
    };
    return await saveFarmWorkbook({
      ...state,
      entretiens: [newEnt, ...(state.entretiens || [])],
    });
  } else {
    const existingRecord = (state.autresDepenses || []).find(
      (d) =>
        d.date === cleanDate &&
        String(d.produit || '').trim().toLowerCase() === lowerDesig &&
        Number(d.montant) === cleanMontant
    );
    if (existingRecord) {
      return {
        ...state,
        alreadyExists: true,
        existingRecord,
      };
    }

    const newDep = {
      id: 'dep_' + Date.now(),
      date: cleanDate,
      produit: cleanDesig,
      montant: cleanMontant,
      auteur,
    };
    return await saveFarmWorkbook({
      ...state,
      autresDepenses: [newDep, ...(state.autresDepenses || [])],
    });
  }
};

export const updateExpenseItem = async ({ type = 'autres', id, date, designation, montant }) => {
  const state = await loadFarmWorkbook();
  const cleanMontant = Math.max(0, Number(montant) || 0);
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const cleanDesig = String(designation || '').trim();

  if (type === 'constructions') {
    const list = (state.constructions || []).map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        date: cleanDate,
        designation: cleanDesig || c.designation,
        montant: cleanMontant,
      };
    });
    return await saveFarmWorkbook({
      ...state,
      constructions: sortNewestFirst(list),
    });
  } else if (type === 'aliment') {
    const list = (state.versementsAliment || []).map((v) => {
      if (v.id !== id) return v;
      return {
        ...v,
        date: cleanDate,
        designation: cleanDesig || v.designation || v.produit,
        produit: cleanDesig || v.produit || v.designation,
        montant: cleanMontant,
      };
    });
    return await saveFarmWorkbook({
      ...state,
      versementsAliment: sortNewestFirst(list),
    });
  } else if (type === 'entretien') {
    const list = (state.entretiens || []).map((e) => {
      if (e.id !== id) return e;
      return {
        ...e,
        date: cleanDate,
        designation: cleanDesig || e.designation || e.produit,
        produit: cleanDesig || e.produit || e.designation,
        montant: cleanMontant,
      };
    });
    return await saveFarmWorkbook({
      ...state,
      entretiens: sortNewestFirst(list),
    });
  } else {
    const list = (state.autresDepenses || []).map((d) => {
      if (d.id !== id) return d;
      return {
        ...d,
        date: cleanDate,
        produit: cleanDesig || d.produit,
        montant: cleanMontant,
      };
    });
    return await saveFarmWorkbook({
      ...state,
      autresDepenses: sortNewestFirst(list),
    });
  }
};

export const deleteExpenseItem = async (type, id) => {
  const state = await loadFarmWorkbook();
  if (type === 'constructions') {
    return await saveFarmWorkbook({
      ...state,
      constructions: (state.constructions || []).filter((c) => c.id !== id),
    });
  } else if (type === 'aliment') {
    return await saveFarmWorkbook({
      ...state,
      versementsAliment: (state.versementsAliment || []).filter((v) => v.id !== id),
    });
  } else if (type === 'entretien') {
    return await saveFarmWorkbook({
      ...state,
      entretiens: (state.entretiens || []).filter((e) => e.id !== id),
    });
  } else {
    return await saveFarmWorkbook({
      ...state,
      autresDepenses: (state.autresDepenses || []).filter((d) => d.id !== id),
    });
  }
};

// 5. Mettre à jour les 2 Cases Jaunes du Bilan
export const updateBilanYellowBoxes = async ({ prixSacAliment, prixPoussin, prixTabletteDefaut }) => {
  const state = await loadFarmWorkbook();
  return await saveFarmWorkbook({
    ...state,
    bilanParams: {
      ...state.bilanParams,
      ...(prixSacAliment !== undefined ? { prixSacAliment: Number(prixSacAliment) || 0 } : {}),
      ...(prixPoussin !== undefined ? { prixPoussin: Number(prixPoussin) || 0 } : {}),
      ...(prixTabletteDefaut !== undefined ? { prixTabletteDefaut: Number(prixTabletteDefaut) || 2200 } : {}),
    },
  });
};

// 6. Gestion des Salaires des Employés & Gérants + Paiements Individuels (Réservé strictement à l'Administrateur)
export const saveEmployeSalary = async (employeData) => {
  const state = await loadFarmWorkbook();
  const LEGACY_EXAMPLE_EMP_IDS = new Set(['emp_2', 'emp_3', 'emp_4']);
  const list = [...(state.employes || [])].filter((e) => e && !LEGACY_EXAMPLE_EMP_IDS.has(e.id));
  const idx = list.findIndex((e) => e.id === employeData.id);
  const existing = idx >= 0 ? list[idx] : null;

  const normalized = {
    id: employeData.id || 'emp_' + Date.now(),
    nom: String(employeData.nom || '').trim(),
    categorie: employeData.categorie === 'gerant' ? 'gerant' : 'employe',
    poste: String(
      employeData.poste || (employeData.categorie === 'gerant' ? 'Gérant du poulailler' : 'Employé')
    ).trim(),
    adresse: String(employeData.adresse || existing?.adresse || 'Thiès').trim(),
    telephone: String(employeData.telephone ?? existing?.telephone ?? '').trim(),
    salaireMensuel: Number(employeData.salaireMensuel) || 0,
    dateDebut: employeData.dateDebut || existing?.dateDebut || '2026-03-24',
    dateFin: employeData.dateFin ?? existing?.dateFin ?? '',
    nbMoisManuel:
      employeData.nbMoisManuel === '' || employeData.nbMoisManuel === null || employeData.nbMoisManuel === undefined
        ? null
        : Number(employeData.nbMoisManuel),
    paiements: Array.isArray(employeData.paiements)
      ? employeData.paiements
      : Array.isArray(existing?.paiements)
      ? existing.paiements
      : [],
    actif: employeData.actif !== false,
  };

  if (idx >= 0) {
    list[idx] = normalized;
  } else {
    list.push(normalized);
  }

  return await saveFarmWorkbook({
    ...state,
    employes: list,
  });
};

export const addEmployePayment = async (employeId, paymentData) => {
  const state = await loadFarmWorkbook();
  const list = [...(state.employes || [])];
  const idx = list.findIndex((e) => e.id === employeId);
  if (idx < 0) return state;

  const emp = list[idx];
  const currentPayments = Array.isArray(emp.paiements) ? [...emp.paiements] : [];
  const montant = Number(paymentData.montant) || 0;

  const newPayment = {
    id: paymentData.id || 'pay_' + Date.now(),
    date: (paymentData.date || new Date().toISOString().split('T')[0]).trim(),
    periode: String(paymentData.periode || '').trim(),
    type: String(paymentData.type || 'Salaire Mensuel').trim(),
    modePaiement: String(paymentData.modePaiement || 'Espèces').trim(),
    montant,
    statut: paymentData.statut === 'En attente' ? 'En attente' : 'Payé',
    note: String(paymentData.note || '').trim(),
  };

  const existingPayIdx = currentPayments.findIndex((p) => p.id === newPayment.id);
  if (existingPayIdx >= 0) {
    currentPayments[existingPayIdx] = newPayment;
  } else {
    currentPayments.unshift(newPayment);
  }

  list[idx] = {
    ...emp,
    paiements: currentPayments,
  };

  return await saveFarmWorkbook({
    ...state,
    employes: list,
  });
};

export const toggleEmployePaymentStatus = async (employeId, paymentId) => {
  const state = await loadFarmWorkbook();
  const list = [...(state.employes || [])];
  const idx = list.findIndex((e) => e.id === employeId);
  if (idx < 0) return state;

  const emp = list[idx];
  const nextPayments = (emp.paiements || []).map((p) => {
    if (p.id !== paymentId) return p;
    return {
      ...p,
      statut: p.statut === 'En attente' ? 'Payé' : 'En attente',
    };
  });

  list[idx] = {
    ...emp,
    paiements: nextPayments,
  };

  return await saveFarmWorkbook({
    ...state,
    employes: list,
  });
};

export const deleteEmployePayment = async (employeId, paymentId) => {
  const state = await loadFarmWorkbook();
  const list = [...(state.employes || [])];
  const idx = list.findIndex((e) => e.id === employeId);
  if (idx < 0) return state;

  const emp = list[idx];
  list[idx] = {
    ...emp,
    paiements: (emp.paiements || []).filter((p) => p.id !== paymentId),
  };

  return await saveFarmWorkbook({
    ...state,
    employes: list,
  });
};

export const deleteEmployeSalary = async (id) => {
  const state = await loadFarmWorkbook();
  return await saveFarmWorkbook({
    ...state,
    employes: (state.employes || []).filter((e) => e.id !== id),
  });
};

// 7. Factures & Ventes (Feuille Facture + déduction/synchronisation automatique du stock d'œufs)
// Deux factures peuvent avoir le même numéro si leurs dates sont différentes, mais PAS à la même date.
export const addFactureEntry = async ({
  date,
  numeroFacture,
  quantite,
  designation = 'Tablettes',
  prixUnitaire,
  client,
  statut = 'Payé',
  cachet = true,
  signatureGerant = null,
  signataireGerantNom = '',
  signatureAdmin = null,
  signataireAdminNom = '',
  sommeEnLettres = '',
  deductStock = true,
  auteur = '',
}) => {
  const state = await loadFarmWorkbook();
  const qte = Number(quantite) || 0;
  const pu = Number(prixUnitaire) || Number(state.bilanParams?.prixTabletteDefaut) || 2200;
  const total = qte * pu;
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const cleanClient = String(client || 'Client').trim().toUpperCase();
  const cleanNumero = String(numeroFacture || '').trim() || getNextSuggestedFactureNumber(state);
  const cleanDesignation = String(designation || 'Tablettes').trim() || 'Tablettes';

  // Vérification : même numéro de facture autorisé à une date différente, mais interdit à la même date
  const duplicateSameDate = (state.factures || []).find(
    (f) =>
      String(f.numeroFacture || '').trim().toLowerCase() === cleanNumero.toLowerCase() &&
      String(f.date || '').trim() === cleanDate
  );
  if (duplicateSameDate) {
    return {
      ...state,
      duplicateInvoiceNumberForDate: true,
      existingInvoice: duplicateSameDate,
    };
  }

  const summary = computeFarmSummary(state);
  if (deductStock && qte > summary.stockTablettesDisponibles) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: summary.stockTablettesDisponibles,
    };
  }

  const factId = 'fact_' + Date.now();
  const stockMovId = deductStock && qte > 0 ? 'oeuf_fact_' + (Date.now() + 1) : null;

  const newFacture = {
    id: factId,
    date: cleanDate,
    numeroFacture: cleanNumero,
    quantite: qte,
    designation: cleanDesignation,
    prixUnitaire: pu,
    total,
    client: cleanClient,
    statut: statut === 'Non Payé' ? 'Non Payé' : 'Payé',
    cachet: cachet !== false,
    ...(signatureGerant ? { signatureGerant } : {}),
    ...(signataireGerantNom ? { signataireGerantNom } : {}),
    ...(signatureAdmin ? { signatureAdmin } : {}),
    ...(signataireAdminNom ? { signataireAdminNom } : {}),
    ...(sommeEnLettres ? { sommeEnLettres } : {}),
    ...(stockMovId ? { linkedStockMovementId: stockMovId } : {}),
  };

  let nextStockOeufs = [...(state.stockageOeufs || [])];
  if (deductStock && qte > 0) {
    nextStockOeufs = [
      {
        id: stockMovId,
        date: cleanDate,
        entrees: 0,
        sorties: qte,
        stockRestant: Math.max(0, summary.stockTablettesDisponibles - qte),
        note: `Facture N°${newFacture.numeroFacture} - ${cleanClient}`,
        auteur,
        linkedFactureId: factId,
        numeroFacture: cleanNumero,
      },
      ...nextStockOeufs,
    ];
  }

  return await saveFarmWorkbook({
    ...state,
    factures: sortNewestFirst([newFacture, ...(state.factures || [])]),
    stockageOeufs: sortNewestFirst(nextStockOeufs),
  });
};

// Modifier une facture existante en cas d'erreur (numéro, date, client, quantité, prix unitaire, statut, signatures, cachet)
// Deux factures peuvent avoir le même numéro si leurs dates sont différentes.
export const updateFactureEntry = async ({
  id,
  date,
  numeroFacture,
  quantite,
  designation,
  prixUnitaire,
  client,
  statut,
  cachet,
  signatureGerant,
  signataireGerantNom,
  signatureAdmin,
  signataireAdminNom,
  sommeEnLettres,
}) => {
  const state = await loadFarmWorkbook();
  const facturesList = [...(state.factures || [])];
  const idx = facturesList.findIndex((f) => f.id === id);
  if (idx < 0) return state;

  const oldFacture = facturesList[idx];
  const cleanDate = (date || oldFacture.date || new Date().toISOString().split('T')[0]).trim();
  const cleanNumero = String(numeroFacture ?? oldFacture.numeroFacture ?? '').trim() || oldFacture.numeroFacture;
  const cleanClient = String(client || oldFacture.client || 'CLIENT').trim().toUpperCase();
  const cleanDesignation = String(designation ?? oldFacture.designation ?? 'Tablettes').trim() || 'Tablettes';
  const qte = Math.max(1, Number(quantite) || Number(oldFacture.quantite) || 1);
  const pu = Math.max(1, Number(prixUnitaire) || Number(oldFacture.prixUnitaire) || 2200);
  const nextStatut = statut ? (statut === 'Non Payé' ? 'Non Payé' : 'Payé') : oldFacture.statut;

  // Vérification : deux factures peuvent avoir le même numéro si elles ont des dates différentes,
  // mais pas le même numéro à la même date !
  const duplicateSameDate = facturesList.find(
    (f) =>
      f.id !== id &&
      String(f.numeroFacture || '').trim().toLowerCase() === cleanNumero.toLowerCase() &&
      String(f.date || '').trim() === cleanDate
  );
  if (duplicateSameDate) {
    return {
      ...state,
      duplicateInvoiceNumberForDate: true,
      existingInvoice: duplicateSameDate,
    };
  }

  const oldQte = Number(oldFacture.quantite) || 0;
  const deltaQte = qte - oldQte;
  const summary = computeFarmSummary(state);

  if (deltaQte > 0 && deltaQte > summary.stockTablettesDisponibles) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: summary.stockTablettesDisponibles + oldQte,
    };
  }

  // Synchroniser automatiquement le mouvement de sortie de stock d'œufs associé à cette facture
  let nextStockOeufs = [...(state.stockageOeufs || [])];
  const linkedMovIdx = nextStockOeufs.findIndex(
    (m) =>
      (oldFacture.linkedStockMovementId && m.id === oldFacture.linkedStockMovementId) ||
      (m.linkedFactureId && m.linkedFactureId === oldFacture.id) ||
      (m.date === oldFacture.date &&
        Number(m.sorties) === oldQte &&
        (String(m.note || '')
          .toUpperCase()
          .includes(String(oldFacture.client || '').toUpperCase()) ||
          String(m.note || '').includes(`N°${oldFacture.numeroFacture}`)))
  );

  if (linkedMovIdx >= 0) {
    const mov = nextStockOeufs[linkedMovIdx];
    const isFromFactureNote = String(mov.note || '').startsWith('Facture N°');
    nextStockOeufs[linkedMovIdx] = {
      ...mov,
      date: cleanDate,
      sorties: qte,
      numeroFacture: cleanNumero,
      linkedFactureId: oldFacture.id,
      note: isFromFactureNote ? `Facture N°${cleanNumero} - ${cleanClient}` : cleanClient,
    };
    nextStockOeufs = sortNewestFirst(recalculateStockListBalances(nextStockOeufs, -104));
  }

  facturesList[idx] = {
    ...oldFacture,
    date: cleanDate,
    numeroFacture: cleanNumero,
    client: cleanClient,
    designation: cleanDesignation,
    quantite: qte,
    prixUnitaire: pu,
    total: qte * pu,
    statut: nextStatut,
    cachet: cachet !== undefined ? cachet !== false : oldFacture.cachet !== false,
    ...(signatureGerant !== undefined ? { signatureGerant } : {}),
    ...(signataireGerantNom !== undefined ? { signataireGerantNom } : {}),
    ...(signatureAdmin !== undefined ? { signatureAdmin } : {}),
    ...(signataireAdminNom !== undefined ? { signataireAdminNom } : {}),
    ...(sommeEnLettres !== undefined ? { sommeEnLettres } : {}),
  };

  return await saveFarmWorkbook({
    ...state,
    factures: sortNewestFirst(facturesList),
    stockageOeufs: nextStockOeufs,
  });
};

export const signFactureEntry = async ({
  id,
  role = 'gerant',
  signerName = '',
  signatureData = null,
  cachet = true,
}) => {
  const state = await loadFarmWorkbook();
  const nextFactures = (state.factures || []).map((f) => {
    if (f.id !== id) return f;
    if (role === 'admin') {
      return {
        ...f,
        signatureAdmin: signatureData,
        signataireAdminNom: signerName || 'Administrateur',
        cachet: cachet !== false,
      };
    }
    return {
      ...f,
      signatureGerant: signatureData,
      signataireGerantNom: signerName || 'Gérant',
      cachet: cachet !== false,
    };
  });
  return await saveFarmWorkbook({
    ...state,
    factures: nextFactures,
  });
};

export const toggleFacturePaymentStatus = async (factureId) => {
  const state = await loadFarmWorkbook();
  const nextFactures = (state.factures || []).map((f) => {
    if (f.id !== factureId) return f;
    return {
      ...f,
      statut: f.statut === 'Payé' ? 'Non Payé' : 'Payé',
    };
  });
  return await saveFarmWorkbook({
    ...state,
    factures: nextFactures,
  });
};

export const deleteFactureEntry = async (factureId, restoreStock = true) => {
  const state = await loadFarmWorkbook();
  const target = (state.factures || []).find((f) => f.id === factureId);
  let nextStockOeufs = [...(state.stockageOeufs || [])];

  if (target && restoreStock) {
    const movIdx = nextStockOeufs.findIndex(
      (m) =>
        (target.linkedStockMovementId && m.id === target.linkedStockMovementId) ||
        (m.linkedFactureId && m.linkedFactureId === target.id) ||
        (m.date === target.date &&
          Number(m.sorties) === Number(target.quantite) &&
          String(m.note || '').includes(`N°${target.numeroFacture}`))
    );
    if (movIdx >= 0) {
      nextStockOeufs.splice(movIdx, 1);
      nextStockOeufs = sortNewestFirst(recalculateStockListBalances(nextStockOeufs, -104));
    }
  }

  return await saveFarmWorkbook({
    ...state,
    factures: (state.factures || []).filter((f) => f.id !== factureId),
    stockageOeufs: nextStockOeufs,
  });
};

// 8. Commandes Clients
export const createClientOrder = async ({
  clientId,
  clientNom,
  clientTelephone,
  adresseLivraison,
  modeReception = 'Retrait au poulailler',
  quantiteTablettes,
  prixUnitaire,
  note = '',
}) => {
  const state = await loadFarmWorkbook();
  const qte = Number(quantiteTablettes) || 1;
  const pu = Number(prixUnitaire) || Number(state.bilanParams?.prixTabletteDefaut) || 2200;
  const total = qte * pu;
  const nextNum = 101 + (state.commandes?.length || 0);

  const newOrder = {
    id: 'cmd_' + Date.now(),
    numeroCommande: `CMD-${nextNum}`,
    date: new Date().toISOString().split('T')[0],
    clientId: clientId || 'guest',
    clientNom: String(clientNom || 'Client').trim(),
    clientTelephone: String(clientTelephone || '').trim(),
    adresseLivraison: String(adresseLivraison || 'Thiès').trim(),
    modeReception,
    quantiteTablettes: qte,
    prixUnitaire: pu,
    total,
    statut: 'En attente',
    note: String(note || '').trim(),
    factureGeneree: false,
  };

  return await saveFarmWorkbook({
    ...state,
    commandes: [newOrder, ...(state.commandes || [])],
  });
};

export const updateClientOrder = async ({
  id,
  clientNom,
  clientTelephone,
  adresseLivraison,
  modeReception,
  quantiteTablettes,
  prixUnitaire,
  note,
  date,
}) => {
  const state = await loadFarmWorkbook();
  const nextCommandes = (state.commandes || []).map((cmd) => {
    if (cmd.id !== id) return cmd;
    const qte = Math.max(1, Number(quantiteTablettes) || Number(cmd.quantiteTablettes) || 1);
    const pu = Math.max(1, Number(prixUnitaire) || Number(cmd.prixUnitaire) || 2200);
    return {
      ...cmd,
      date: (date || cmd.date || new Date().toISOString().split('T')[0]).trim(),
      clientNom: String(clientNom || cmd.clientNom || 'Client').trim(),
      clientTelephone: String(clientTelephone ?? cmd.clientTelephone ?? '').trim(),
      adresseLivraison: String(adresseLivraison ?? cmd.adresseLivraison ?? 'Thiès').trim(),
      modeReception: modeReception || cmd.modeReception || 'Retrait au poulailler',
      quantiteTablettes: qte,
      prixUnitaire: pu,
      total: qte * pu,
      note: String(note ?? cmd.note ?? '').trim(),
    };
  });

  return await saveFarmWorkbook({
    ...state,
    commandes: nextCommandes,
  });
};

export const updateOrderStatusByManager = async (commandeId, newStatut, customPrixUnitaire) => {
  const state = await loadFarmWorkbook();
  let targetOrder = null;

  const nextCommandes = (state.commandes || []).map((cmd) => {
    if (cmd.id !== commandeId) return cmd;
    const pu =
      customPrixUnitaire !== undefined && Number(customPrixUnitaire) > 0
        ? Number(customPrixUnitaire)
        : Number(cmd.prixUnitaire) || Number(state.bilanParams?.prixTabletteDefaut) || 2200;
    const qte = Number(cmd.quantiteTablettes) || 0;
    targetOrder = {
      ...cmd,
      prixUnitaire: pu,
      total: qte * pu,
      statut: newStatut,
    };
    return targetOrder;
  });

  let nextFactures = [...(state.factures || [])];
  let nextStockOeufs = [...(state.stockageOeufs || [])];

  if (
    targetOrder &&
    !targetOrder.factureGeneree &&
    (newStatut === 'Livrée & Payée' || newStatut === 'Livrée (Non Payé)')
  ) {
    const summary = computeFarmSummary(state);
    if (targetOrder.quantiteTablettes > summary.stockTablettesDisponibles) {
      return {
        ...state,
        insufficientStock: true,
        availableStock: summary.stockTablettesDisponibles,
      };
    }

    targetOrder.factureGeneree = true;
    const isPaye = newStatut === 'Livrée & Payée';
    const factId = 'fact_cmd_' + Date.now();
    const movId = 'oeuf_cmd_' + (Date.now() + 1);
    const newFacture = {
      id: factId,
      date: new Date().toISOString().split('T')[0],
      numeroFacture: targetOrder.numeroCommande.replace('CMD-', ''),
      quantite: targetOrder.quantiteTablettes,
      designation: 'Tablettes',
      prixUnitaire: targetOrder.prixUnitaire,
      total: targetOrder.total,
      client: String(targetOrder.clientNom || 'CLIENT').toUpperCase(),
      statut: isPaye ? 'Payé' : 'Non Payé',
      cachet: true,
      linkedStockMovementId: movId,
    };
    nextFactures = [newFacture, ...nextFactures];

    nextStockOeufs = [
      {
        id: movId,
        date: newFacture.date,
        entrees: 0,
        sorties: targetOrder.quantiteTablettes,
        stockRestant: Math.max(0, summary.stockTablettesDisponibles - targetOrder.quantiteTablettes),
        note: `Commande ${targetOrder.numeroCommande} - ${targetOrder.clientNom}`,
        linkedFactureId: factId,
      },
      ...nextStockOeufs,
    ];
  }

  return await saveFarmWorkbook({
    ...state,
    commandes: nextCommandes,
    factures: nextFactures,
    stockageOeufs: nextStockOeufs,
  });
};

export const deleteClientOrder = async (commandeId) => {
  const state = await loadFarmWorkbook();
  return await saveFarmWorkbook({
    ...state,
    commandes: (state.commandes || []).filter((c) => c.id !== commandeId),
  });
};
