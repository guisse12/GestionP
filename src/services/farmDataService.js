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

  // 6. Autres Dépenses (Feuille Autres_Depenses)
  const autresDepensesList = wb.autresDepenses || [];
  const totalAutresDepenses = autresDepensesList.reduce((sum, d) => sum + (Number(d.montant) || 0), 0);

  // 7. Salaires (Feuille Salaires - réservé Admin)
  const employesList = wb.employes || [];
  const employesCalcules = employesList.map((emp) => {
    const salaireMensuel = Number(emp.salaireMensuel) || 0;
    const moisComplets =
      emp.nbMoisManuel !== null && emp.nbMoisManuel !== undefined && emp.nbMoisManuel !== ''
        ? Number(emp.nbMoisManuel)
        : calculateCompleteMonths(emp.dateDebut, emp.dateFin);
    const totalPaye = salaireMensuel * moisComplets;
    return {
      ...emp,
      salaireMensuel,
      moisComplets,
      totalPaye,
    };
  });
  const totalSalaires = employesCalcules.reduce((sum, emp) => sum + emp.totalPaye, 0);

  // 8. Bilan Automatique (Feuille Bilan + les 2 Cases Jaunes)
  const prixSacAliment = Number(wb.bilanParams?.prixSacAliment) || 0;
  const prixPoussin = Number(wb.bilanParams?.prixPoussin) || 0;
  const prixTabletteDefaut = Number(wb.bilanParams?.prixTabletteDefaut) || 2200;

  const depenseAliment = totalSacsAlimentEntres * prixSacAliment;
  const depensePoussins = totalPouletsInitial * prixPoussin;
  const depenseSalaires = totalSalaires;
  const depenseConstructions = totalConstructions;
  const depenseAutres = totalAutresDepenses;

  const totalDepenses =
    depenseAliment + depensePoussins + depenseSalaires + depenseConstructions + depenseAutres;

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

    prixSacAliment,
    prixPoussin,
    prixTabletteDefaut,
    depenseAliment,
    depensePoussins,
    depenseSalaires,
    depenseConstructions,
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

export const computePeriodReport = (state, options = {}) => {
  const wb = state || cachedWorkbook;
  const periodType = options.periodType || 'day'; // 'day' | 'week' | 'year'
  const cleanDate = (options.date || new Date().toISOString().split('T')[0]).trim();
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

  // 4. Dépenses de la période (Autres Achats + Constructions)
  const autresRows = (wb.autresDepenses || []).filter((d) => inRange(d.date));
  const constRows = (wb.constructions || []).filter((c) => inRange(c.date));
  const totalAutresJour = autresRows.reduce((s, d) => s + (Number(d.montant) || 0), 0);
  const totalConstJour = constRows.reduce((s, c) => s + (Number(c.montant) || 0), 0);
  const totalDepensesJour = totalAutresJour + totalConstJour;

  // 5. Factures & Commandes de la période
  const facturesRows = (wb.factures || []).filter((f) => inRange(f.date));
  const commandesRows = (wb.commandes || []).filter((c) => inRange(c.date));
  let ventesPayeesJour = 0;
  let ventesNonPayeesJour = 0;
  let tablettesFactureesJour = 0;

  for (const f of facturesRows) {
    const montant = Number(f.total) || (Number(f.quantite) || 0) * (Number(f.prixUnitaire) || 0);
    tablettesFactureesJour += Number(f.quantite) || 0;
    if (String(f.statut || '').toLowerCase().includes('non')) {
      ventesNonPayeesJour += montant;
    } else {
      ventesPayeesJour += montant;
    }
  }

  const soldeNetJour = ventesPayeesJour - totalDepensesJour;

  // 6. Tableau récapitulatif détaillé (par jour pour Semaine, par mois pour Annuel)
  const breakdownRows = [];
  if (periodType === 'week') {
    for (let i = 0; i < 7; i++) {
      const d = addDaysISO(endDate, -i);
      const pDay = prodRows.filter((r) => r.date === d);
      const fDay = facturesRows.filter((r) => r.date === d);
      const aDay = autresRows.filter((r) => r.date === d);
      const cDay = constRows.filter((r) => r.date === d);
      const prodTot = pDay.reduce((s, r) => s + (Number(r.boxe1Produits) || 0) + (Number(r.boxe2Produits) || 0), 0);
      const mortTot = pDay.reduce((s, r) => s + (Number(r.boxe1Mortalite) || 0) + (Number(r.boxe2Mortalite) || 0), 0);
      const consoTot = pDay.reduce((s, r) => s + (Number(r.consoAliment) || 0), 0);
      const ventesTot = fDay.reduce((s, f) => {
        if (String(f.statut || '').toLowerCase().includes('non')) return s;
        return s + (Number(f.total) || (Number(f.quantite) || 0) * (Number(f.prixUnitaire) || 0));
      }, 0);
      const depTot =
        aDay.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        cDay.reduce((s, x) => s + (Number(x.montant) || 0), 0);

      breakdownRows.push({
        key: d,
        label: d,
        totalProduits: prodTot,
        totalMortalite: mortTot,
        consoAliment: consoTot,
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
      const cMonth = constRows.filter((r) => String(r.date || '').startsWith(prefix));
      if (pMonth.length === 0 && fMonth.length === 0 && aMonth.length === 0 && cMonth.length === 0) {
        continue;
      }
      const prodTot = pMonth.reduce((s, r) => s + (Number(r.boxe1Produits) || 0) + (Number(r.boxe2Produits) || 0), 0);
      const mortTot = pMonth.reduce((s, r) => s + (Number(r.boxe1Mortalite) || 0) + (Number(r.boxe2Mortalite) || 0), 0);
      const consoTot = pMonth.reduce((s, r) => s + (Number(r.consoAliment) || 0), 0);
      const ventesTot = fMonth.reduce((s, f) => {
        if (String(f.statut || '').toLowerCase().includes('non')) return s;
        return s + (Number(f.total) || (Number(f.quantite) || 0) * (Number(f.prixUnitaire) || 0));
      }, 0);
      const depTot =
        aMonth.reduce((s, x) => s + (Number(x.montant) || 0), 0) +
        cMonth.reduce((s, x) => s + (Number(x.montant) || 0), 0);

      breakdownRows.push({
        key: prefix,
        label: `${MONTH_NAMES_FR[m - 1]} ${cleanYear}`,
        totalProduits: prodTot,
        totalMortalite: mortTot,
        consoAliment: consoTot,
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
    year: cleanYear,
    startDate,
    endDate,
    hasActivity:
      prodRows.length > 0 ||
      alimRows.length > 0 ||
      oeufsRows.length > 0 ||
      autresRows.length > 0 ||
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
    constRows,
    totalAutresJour,
    totalConstJour,
    totalDepensesJour,
    facturesRows,
    commandesRows,
    ventesPayeesJour,
    ventesNonPayeesJour,
    tablettesFactureesJour,
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

export const deleteProductionEntry = async (id) => {
  const state = await loadFarmWorkbook();
  return await saveFarmWorkbook({
    ...state,
    production: (state.production || []).filter((r) => r.id !== id),
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
  prixUnitaire = 0,
  statutFacture = 'Payé',
}) => {
  const state = await loadFarmWorkbook();
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const ent = Number(entrees) || 0;
  const sort = Number(sorties) || 0;
  const cleanNote = String(note || '').trim();

  const summary = computeFarmSummary(state);

  // Contrôle anti-erreur : impossible de sortir plus de tablettes que le stock disponible
  if (sort > 0 && ent === 0 && sort > summary.stockTablettesDisponibles) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: summary.stockTablettesDisponibles,
    };
  }

  // Bloquer si exactement le même détail a déjà été ajouté à cette date
  const existingRecord = (state.stockageOeufs || []).find(
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

  const stockRestant = Math.max(0, summary.stockTablettesDisponibles + ent - sort);

  const newEntry = {
    id: 'oeuf_' + Date.now(),
    date: cleanDate,
    entrees: ent,
    sorties: sort,
    stockRestant,
    note: cleanNote || 'Sortie stock tablettes',
    auteur,
  };

  let nextFactures = [...(state.factures || [])];
  if (createFacture && sort > 0) {
    const pu = Number(prixUnitaire) || summary.prixTabletteDefaut || 2200;
    nextFactures = [
      {
        id: 'fact_' + Date.now(),
        date: cleanDate,
        numeroFacture: String(92 + nextFactures.length),
        quantite: sort,
        prixUnitaire: pu,
        total: sort * pu,
        client: String(cleanNote || 'VENTE DIRECTE').toUpperCase(),
        statut: statutFacture === 'Non Payé' ? 'Non Payé' : 'Payé',
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

// 3. Ajouter un lot dans Poulets_Boxes
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

// 4. Ajouter une dépense (plusieurs dépenses possibles dans la même date, blocage d'un détail déjà ajouté)
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

export const deleteExpenseItem = async (type, id) => {
  const state = await loadFarmWorkbook();
  if (type === 'constructions') {
    return await saveFarmWorkbook({
      ...state,
      constructions: (state.constructions || []).filter((c) => c.id !== id),
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

// 6. Gestion des Salaires des Employés (Réservé strictement à l'Administrateur)
export const saveEmployeSalary = async (employeData) => {
  const state = await loadFarmWorkbook();
  const list = [...(state.employes || [])];
  const idx = list.findIndex((e) => e.id === employeData.id);

  const normalized = {
    id: employeData.id || 'emp_' + Date.now(),
    nom: String(employeData.nom || '').trim(),
    poste: String(employeData.poste || 'Employé').trim(),
    salaireMensuel: Number(employeData.salaireMensuel) || 0,
    dateDebut: employeData.dateDebut || '2026-03-24',
    dateFin: employeData.dateFin || '',
    nbMoisManuel:
      employeData.nbMoisManuel === '' || employeData.nbMoisManuel === null || employeData.nbMoisManuel === undefined
        ? null
        : Number(employeData.nbMoisManuel),
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

export const deleteEmployeSalary = async (id) => {
  const state = await loadFarmWorkbook();
  return await saveFarmWorkbook({
    ...state,
    employes: (state.employes || []).filter((e) => e.id !== id),
  });
};

// 7. Factures & Ventes (Feuille Facture + déduction automatique du stock d'œufs)
export const addFactureEntry = async ({
  date,
  numeroFacture,
  quantite,
  prixUnitaire,
  client,
  statut = 'Payé',
  deductStock = true,
  auteur = '',
}) => {
  const state = await loadFarmWorkbook();
  const qte = Number(quantite) || 0;
  const pu = Number(prixUnitaire) || Number(state.bilanParams?.prixTabletteDefaut) || 2200;
  const total = qte * pu;
  const cleanDate = (date || new Date().toISOString().split('T')[0]).trim();
  const cleanClient = String(client || 'Client').trim().toUpperCase();

  const summary = computeFarmSummary(state);
  if (deductStock && qte > summary.stockTablettesDisponibles) {
    return {
      ...state,
      insufficientStock: true,
      availableStock: summary.stockTablettesDisponibles,
    };
  }

  const newFacture = {
    id: 'fact_' + Date.now(),
    date: cleanDate,
    numeroFacture: String(numeroFacture || Math.floor(100 + Math.random() * 900)),
    quantite: qte,
    prixUnitaire: pu,
    total,
    client: cleanClient,
    statut: statut === 'Non Payé' ? 'Non Payé' : 'Payé',
  };

  let nextStockOeufs = [...(state.stockageOeufs || [])];
  if (deductStock && qte > 0) {
    nextStockOeufs = [
      {
        id: 'oeuf_fact_' + Date.now(),
        date: cleanDate,
        entrees: 0,
        sorties: qte,
        stockRestant: Math.max(0, summary.stockTablettesDisponibles - qte),
        note: `Facture N°${newFacture.numeroFacture} - ${cleanClient}`,
        auteur,
      },
      ...nextStockOeufs,
    ];
  }

  return await saveFarmWorkbook({
    ...state,
    factures: [newFacture, ...(state.factures || [])],
    stockageOeufs: nextStockOeufs,
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

export const deleteFactureEntry = async (factureId) => {
  const state = await loadFarmWorkbook();
  return await saveFarmWorkbook({
    ...state,
    factures: (state.factures || []).filter((f) => f.id !== factureId),
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
    adresseLivraison: String(adresseLivraison || 'GestionP').trim(),
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
    const newFacture = {
      id: 'fact_cmd_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      numeroFacture: targetOrder.numeroCommande.replace('CMD-', ''),
      quantite: targetOrder.quantiteTablettes,
      prixUnitaire: targetOrder.prixUnitaire,
      total: targetOrder.total,
      client: String(targetOrder.clientNom || 'CLIENT').toUpperCase(),
      statut: isPaye ? 'Payé' : 'Non Payé',
    };
    nextFactures = [newFacture, ...nextFactures];

    nextStockOeufs = [
      {
        id: 'oeuf_cmd_' + Date.now(),
        date: newFacture.date,
        entrees: 0,
        sorties: targetOrder.quantiteTablettes,
        stockRestant: Math.max(0, summary.stockTablettesDisponibles - targetOrder.quantiteTablettes),
        note: `Commande ${targetOrder.numeroCommande} - ${targetOrder.clientNom}`,
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
