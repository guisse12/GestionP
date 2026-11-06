import { Platform, Share, Alert } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { formatFCFA, formatNumber } from '../theme/colors';

const sanitizePdfText = (str) => {
  return String(str || '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/•/g, '-')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/\u202F|\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
};

const escapePdfLiteral = (str) => {
  const clean = sanitizePdfText(str);
  let out = '';
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    if (code === 40 || code === 41 || code === 92) {
      out += '\\' + clean[i];
    } else if (code >= 32 && code <= 126) {
      out += clean[i];
    } else if (code >= 160 && code <= 255) {
      out += '\\' + code.toString(8).padStart(3, '0');
    }
  }
  return out;
};

const uint8ToBase64 = (bytes) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    result += chars[b1 >> 2];
    result += chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < len ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += i + 2 < len ? chars[b3 & 63] : '=';
  }
  return result;
};

const getNativePrintModule = () =>
  requireOptionalNativeModule('ExpoPrint') || requireOptionalNativeModule('ExponentPrint');

const getNativeSharingModule = () =>
  requireOptionalNativeModule('ExpoSharing') || requireOptionalNativeModule('ExponentSharing');

const getNativeFileSystemModule = () =>
  requireOptionalNativeModule('ExponentFileSystem') || requireOptionalNativeModule('FileSystem');

const normalizeDirSlash = (dir) => {
  if (!dir) return null;
  return String(dir).replace(/\/*$/, '') + '/';
};

export const getReportPdfFileName = (report) => {
  const safeSlug = String(report?.periodLabel || report?.date || 'Rapport')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  return `Rapport_GestionP_${safeSlug}.pdf`;
};

// Générateur PDF 1.4 A4 autonome (aucune dépendance native requise)
export const generateRawPdfBase64 = (report, summary = {}) => {
  const s = summary || {};
  const ops = [];

  const rectFill = (x, y, w, h, r, g, b) => {
    ops.push(`${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${x} ${y} ${w} ${h} re f`);
  };

  const textAt = (x, y, font, size, r, g, b, txt) => {
    ops.push(
      `BT /${font} ${size} Tf ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg ${x} ${y} Td (${escapePdfLiteral(
        txt
      )}) Tj ET`
    );
  };

  // En-tête A4 (595 x 842 pt)
  rectFill(0, 756, 595, 86, 0.49, 0.18, 0.07); // Brun doré foncé (#7C2D12)
  textAt(36, 808, 'F2', 20, 1, 0.98, 0.92, 'GestionP - Ferme Avicole');
  textAt(36, 786, 'F2', 13, 0.99, 0.9, 0.54, report.periodTitle || "Rapport d'Activite");
  textAt(
    36,
    768,
    'F1',
    9.5,
    0.95,
    0.95,
    0.95,
    `Periode : ${report.periodLabel || report.date}   |   Effectif vivant : ${formatNumber(
      report.restantVivant
    )} poulets`
  );

  let y = 724;

  // Cartes KPI principales
  rectFill(36, y - 44, 255, 48, 0.99, 0.95, 0.78);
  textAt(46, y - 14, 'F2', 9.5, 0.52, 0.3, 0.05, `PRODUCTION (${report.periodBadge})`);
  textAt(46, y - 33, 'F2', 15, 0.44, 0.25, 0.07, `${formatNumber(report.totalProduits)} tablettes`);

  rectFill(304, y - 44, 255, 48, 0.86, 0.99, 0.9);
  textAt(314, y - 14, 'F2', 9.5, 0.08, 0.33, 0.18, `SOLDE NET (${report.periodBadge})`);
  textAt(314, y - 33, 'F2', 15, 0.08, 0.5, 0.24, `${formatFCFA(report.soldeNetJour)}`);

  y -= 66;

  const drawSectionHeader = (title) => {
    rectFill(36, y - 16, 523, 20, 0.96, 0.94, 0.9);
    textAt(44, y - 10, 'F2', 11, 0.49, 0.18, 0.07, title);
    y -= 28;
  };

  const drawKeyValRow = (label, value, bold = false) => {
    textAt(44, y, bold ? 'F2' : 'F1', 10, 0.15, 0.15, 0.15, label);
    textAt(350, y, bold ? 'F2' : 'F1', 10, 0.1, 0.1, 0.1, value);
    y -= 15;
  };

  // 1. Production & Boxes
  drawSectionHeader("1. PRODUCTION D'OEUFS & EFFECTIF DES BOXES");
  drawKeyValRow('Production Boxe 1 :', `${formatNumber(report.boxe1Produits)} tablettes`);
  drawKeyValRow('Production Boxe 2 :', `${formatNumber(report.boxe2Produits)} tablettes`);
  drawKeyValRow('Total Production de la periode :', `${formatNumber(report.totalProduits)} tablettes`, true);
  drawKeyValRow(
    'Mortalite (Boxe 1 / Boxe 2) :',
    `${report.boxe1Mortalite} / ${report.boxe2Mortalite} (Total : ${report.totalMortalite} morts)`
  );
  drawKeyValRow("Consommation d'aliment :", `${formatNumber(report.consoAliment)} sacs`);
  drawKeyValRow('Poulets vivants restants :', `${formatNumber(report.restantVivant)} poulets`, true);
  y -= 6;

  // 2. Stockage
  drawSectionHeader('2. MOUVEMENTS DE STOCK & DISPONIBILITES');
  drawKeyValRow(
    "Sacs d'aliment (Entrees / Sorties) :",
    `+${formatNumber(report.alimEntrees)} sacs entres / -${formatNumber(report.alimSorties)} sacs sortis`
  );
  drawKeyValRow(
    "Stock actuel de sacs d'aliment :",
    `${formatNumber(s.stockSacsAlimentRestant)} sacs disponibles`,
    true
  );
  drawKeyValRow(
    "Tablettes d'oeufs (Entrees / Sorties) :",
    `+${formatNumber(report.oeufsEntrees)} tab. entrees / -${formatNumber(report.oeufsSorties)} tab. sorties`
  );
  drawKeyValRow(
    "Stock actuel de tablettes d'oeufs :",
    `${formatNumber(s.stockTablettesDisponibles)} tablettes disponibles`,
    true
  );
  y -= 6;

  // 3. Ventes & Factures
  drawSectionHeader('3. VENTES, FACTURATION & TRESORERIE');
  drawKeyValRow('Nombre de factures sur la periode :', `${report.facturesRows.length} facture(s)`);
  drawKeyValRow('Tablettes vendues / facturees :', `${formatNumber(report.tablettesFactureesJour)} tablettes`);
  drawKeyValRow('Ventes Payees (Encaissees) :', `${formatFCFA(report.ventesPayeesJour)}`, true);
  drawKeyValRow('Ventes Non Payees (Creances) :', `${formatFCFA(report.ventesNonPayeesJour)}`);
  y -= 6;

  // 4. Dépenses
  drawSectionHeader('4. DEPENSES & CHARGES DE LA PERIODE');
  drawKeyValRow('Autres achats et charges :', `${formatFCFA(report.totalAutresJour)} (${report.autresRows.length})`);
  drawKeyValRow('Constructions et amenagements :', `${formatFCFA(report.totalConstJour)} (${report.constRows.length})`);
  drawKeyValRow('Total des depenses de la periode :', `${formatFCFA(report.totalDepensesJour)}`, true);
  drawKeyValRow('SOLDE NET DE LA PERIODE :', `${formatFCFA(report.soldeNetJour)}`, true);
  y -= 8;

  // 5. Détail par jour (Semaine) ou par mois (Annuel) ou dernières lignes
  if (report.breakdownRows && report.breakdownRows.length > 0 && y > 130) {
    drawSectionHeader(
      report.periodType === 'week'
        ? '5. RECAPITULATIF DETAILLE DES 7 JOURS DE LA SEMAINE'
        : "5. RECAPITULATIF MENSUEL DE L'ANNEE"
    );
    textAt(44, y, 'F2', 9, 0.35, 0.35, 0.35, 'Periode');
    textAt(165, y, 'F2', 9, 0.35, 0.35, 0.35, 'Production');
    textAt(255, y, 'F2', 9, 0.35, 0.35, 0.35, 'Morts');
    textAt(310, y, 'F2', 9, 0.35, 0.35, 0.35, 'Ventes Payees');
    textAt(440, y, 'F2', 9, 0.35, 0.35, 0.35, 'Depenses');
    y -= 13;

    for (const row of report.breakdownRows.slice(0, 12)) {
      if (y < 60) break;
      textAt(44, y, 'F1', 9, 0.15, 0.15, 0.15, row.label);
      textAt(165, y, 'F1', 9, 0.15, 0.15, 0.15, `${formatNumber(row.totalProduits)} tab.`);
      textAt(255, y, 'F1', 9, 0.15, 0.15, 0.15, `${row.totalMortalite}`);
      textAt(310, y, 'F1', 9, 0.08, 0.45, 0.2, formatFCFA(row.ventesPayees));
      textAt(440, y, 'F1', 9, 0.75, 0.15, 0.15, formatFCFA(row.depenses));
      y -= 13;
    }
  } else if (report.facturesRows.length > 0 && y > 130) {
    drawSectionHeader('5. DETAIL DES FACTURES');
    for (const f of report.facturesRows.slice(0, 8)) {
      if (y < 60) break;
      drawKeyValRow(
        `${f.client} (Facture N°${f.numeroFacture} - ${f.quantite} tab.)`,
        `${formatFCFA(f.total)} [${f.statut}]`
      );
    }
  }

  // Pied de page
  rectFill(0, 0, 595, 34, 0.96, 0.94, 0.9);
  textAt(
    36,
    13,
    'F1',
    8.5,
    0.4,
    0.4,
    0.4,
    `Document officiel genere par l'application GestionP  -  Bilan global ferme : ${formatFCFA(s.soldeNet)}`
  );

  const streamContent = ops.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdfStr = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(pdfStr.length);
    pdfStr += obj;
  }
  const xrefPos = pdfStr.length;
  pdfStr += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdfStr += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdfStr += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const bytes = new Uint8Array(pdfStr.length);
  for (let i = 0; i < pdfStr.length; i++) {
    bytes[i] = pdfStr.charCodeAt(i) & 0xff;
  }
  return uint8ToBase64(bytes);
};

// Générateur HTML A4 haute définition pour impression PDF et aperçu WebView
export const generatePdfHtml = (report, summary = {}, options = {}) => {
  const s = summary || {};
  const showInteractiveButtons = options.showInteractiveButtons !== false;

  const breakdownHtml =
    report.breakdownRows && report.breakdownRows.length > 0
      ? `
      <div class="section">
        <div class="section-title">${
          report.periodType === 'week'
            ? '5. RÉCAPITULATIF PAR JOUR (7 JOURS)'
            : '5. RÉCAPITULATIF MENSUEL DE L’ANNÉE'
        }</div>
        <table>
          <thead>
            <tr>
              <th>${report.periodType === 'week' ? 'Date' : 'Mois'}</th>
              <th>Production</th>
              <th>Mortalité</th>
              <th>Aliment</th>
              <th>Ventes Payées</th>
              <th>Dépenses</th>
              <th>Solde Net</th>
            </tr>
          </thead>
          <tbody>
            ${report.breakdownRows
              .map(
                (r) => `
              <tr>
                <td><strong>${r.label}</strong></td>
                <td>${formatNumber(r.totalProduits)} tab.</td>
                <td>${r.totalMortalite}</td>
                <td>${formatNumber(r.consoAliment)} sacs</td>
                <td class="pos">${formatFCFA(r.ventesPayees)}</td>
                <td class="neg">${formatFCFA(r.depenses)}</td>
                <td><strong>${formatFCFA(r.solde)}</strong></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
      : '';

  const facturesHtml =
    report.facturesRows && report.facturesRows.length > 0
      ? `
      <div class="section">
        <div class="section-title">DÉTAIL DES FACTURES (${report.facturesRows.length})</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>N° Facture</th>
              <th>Client</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Statut</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${report.facturesRows
              .slice(0, 40)
              .map(
                (f) => `
              <tr>
                <td>${f.date}</td>
                <td>N° ${f.numeroFacture}</td>
                <td><strong>${f.client}</strong></td>
                <td>${formatNumber(f.quantite)} tab.</td>
                <td>${formatFCFA(f.prixUnitaire)}</td>
                <td>${f.statut}</td>
                <td class="${f.statut === 'Payé' ? 'pos' : 'neg'}"><strong>${formatFCFA(f.total)}</strong></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
      : '';

  const depensesHtml =
    report.autresRows.length + report.constRows.length > 0
      ? `
      <div class="section">
        <div class="section-title">DÉTAIL DES DÉPENSES (${report.autresRows.length + report.constRows.length})</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Désignation</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${report.autresRows
              .slice(0, 35)
              .map(
                (d) => `
              <tr>
                <td>${d.date}</td>
                <td>Achat / Charge</td>
                <td>${d.produit}</td>
                <td class="neg"><strong>${formatFCFA(d.montant)}</strong></td>
              </tr>`
              )
              .join('')}
            ${report.constRows
              .slice(0, 20)
              .map(
                (c) => `
              <tr>
                <td>${c.date}</td>
                <td>Construction</td>
                <td>${c.designation}</td>
                <td class="neg"><strong>${formatFCFA(c.montant)}</strong></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${report.periodTitle}</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { margin: 0; padding: 14px; background: #F5EFE6; color: #1C1917; }
    .page { max-width: 800px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; padding: 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.08); }
    .banner { background: #7C2D12; color: #FFFFFF; padding: 18px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .banner h1 { margin: 0; font-size: 20px; color: #FEF3C7; }
    .banner h2 { margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #FFFFFF; }
    .badge { background: #F59E0B; color: #7C2D12; padding: 6px 10px; border-radius: 8px; font-weight: 900; font-size: 11px; }
    .kpi-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
    .kpi-card { flex: 1; min-width: 135px; padding: 12px; border-radius: 10px; border: 1px solid #E7E0D3; background: #FAF7F2; }
    .kpi-label { font-size: 10px; font-weight: 800; color: #78716C; text-transform: uppercase; }
    .kpi-val { font-size: 16px; font-weight: 900; color: #7C2D12; margin-top: 4px; }
    .section { margin-bottom: 16px; }
    .section-title { background: #F5EFE6; color: #7C2D12; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 12.5px; margin-bottom: 8px; border-left: 4px solid #C84B31; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #E7E0D3; padding: 7px 8px; text-align: left; }
    th { background: #FAF7F2; color: #57534E; font-weight: 800; }
    .pos { color: #15803D; font-weight: 700; }
    .neg { color: #DC2626; font-weight: 700; }
    .toolbar { display: flex; gap: 10px; margin-bottom: 14px; }
    .btn { flex: 1; background: #15803D; color: #FFFFFF; text-decoration: none; border: none; padding: 12px 10px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; text-align: center; }
    .btn-print { background: #C84B31; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #E7E0D3; font-size: 11px; color: #78716C; display: flex; justify-content: space-between; }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .page { box-shadow: none; padding: 0; max-width: 100%; }
      .toolbar { display: none !important; }
    }
  </style>
  <script>
    function triggerDownload() {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage('DOWNLOAD_PDF');
      }
    }
    function triggerPrint() {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage('PRINT_PDF');
      } else {
        window.print();
      }
    }
  </script>
</head>
<body>
  <div class="page">
    ${
      showInteractiveButtons
        ? `<div class="toolbar">
            <button class="btn" onclick="triggerDownload()">⬇ Télécharger le fichier .PDF</button>
            <button class="btn btn-print" onclick="triggerPrint()">🖨 Imprimer / Enregistrer en PDF</button>
          </div>`
        : ''
    }
    <div class="banner">
      <div>
        <h1>GestionP — Ferme Avicole</h1>
        <h2>${report.periodTitle}</h2>
      </div>
      <div class="badge">${report.periodBadge}</div>
    </div>

    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">Production d'Œufs</div>
        <div class="kpi-val">${formatNumber(report.totalProduits)} tablettes</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Ventes Encaissées</div>
        <div class="kpi-val" style="color:#15803D;">${formatFCFA(report.ventesPayeesJour)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Dépenses Période</div>
        <div class="kpi-val" style="color:#DC2626;">${formatFCFA(report.totalDepensesJour)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Solde Net Période</div>
        <div class="kpi-val" style="color:${report.soldeNetJour >= 0 ? '#15803D' : '#DC2626'};">${formatFCFA(
    report.soldeNetJour
  )}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">1. PRODUCTION & EFFECTIF DES BOXES (${report.periodLabel})</div>
      <table>
        <tbody>
          <tr>
            <th>Production Boxe 1</th>
            <td>${formatNumber(report.boxe1Produits)} tablettes</td>
            <th>Mortalité Boxe 1</th>
            <td>${report.boxe1Mortalite} poulets</td>
          </tr>
          <tr>
            <th>Production Boxe 2</th>
            <td>${formatNumber(report.boxe2Produits)} tablettes</td>
            <th>Mortalité Boxe 2</th>
            <td>${report.boxe2Mortalite} poulets</td>
          </tr>
          <tr>
            <th>Total Production</th>
            <td><strong>${formatNumber(report.totalProduits)} tablettes</strong></td>
            <th>Total Mortalité</th>
            <td class="neg"><strong>${report.totalMortalite} morts</strong></td>
          </tr>
          <tr>
            <th>Aliment Consommé</th>
            <td>${formatNumber(report.consoAliment)} sacs</td>
            <th>Effectif Vivant Actuel</th>
            <td class="pos"><strong>${formatNumber(report.restantVivant)} poulets vivants</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">2. MOUVEMENTS DE STOCK & DISPONIBILITÉS</div>
      <table>
        <thead>
          <tr>
            <th>Type de Stock</th>
            <th>Entrées</th>
            <th>Sorties</th>
            <th>Stock Actuel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Sacs d'Aliment</strong></td>
            <td class="pos">+${formatNumber(report.alimEntrees)} sacs</td>
            <td class="neg">-${formatNumber(report.alimSorties)} sacs</td>
            <td><strong>${formatNumber(s.stockSacsAlimentRestant)} sacs</strong></td>
          </tr>
          <tr>
            <td><strong>Tablettes d'Œufs</strong></td>
            <td class="pos">+${formatNumber(report.oeufsEntrees)} tab.</td>
            <td class="neg">-${formatNumber(report.oeufsSorties)} tab.</td>
            <td><strong>${formatNumber(s.stockTablettesDisponibles)} tab.</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">3. SYNTHÈSE FINANCIÈRE DE LA PÉRIODE</div>
      <table>
        <tbody>
          <tr>
            <th>Tablettes Facturées</th>
            <td>${formatNumber(report.tablettesFactureesJour)} tab. (${report.facturesRows.length} factures)</td>
            <th>Autres Achats & Charges</th>
            <td class="neg">${formatFCFA(report.totalAutresJour)}</td>
          </tr>
          <tr>
            <th>Ventes Payées</th>
            <td class="pos"><strong>${formatFCFA(report.ventesPayeesJour)}</strong></td>
            <th>Constructions</th>
            <td class="neg">${formatFCFA(report.totalConstJour)}</td>
          </tr>
          <tr>
            <th>Ventes Non Payées</th>
            <td class="neg">${formatFCFA(report.ventesNonPayeesJour)}</td>
            <th>Total Dépenses Période</th>
            <td class="neg"><strong>${formatFCFA(report.totalDepensesJour)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    ${breakdownHtml}
    ${facturesHtml}
    ${depensesHtml}

    <div class="footer">
      <span>Document officiel généré par GestionP</span>
      <span>Bilan Global Net Ferme : <strong>${formatFCFA(s.soldeNet)}</strong></span>
    </div>
  </div>
</body>
</html>`;
};

// ACTION 1 : Enregistrer / Télécharger directement le fichier .PDF sur le téléphone
export const savePdfToDevice = async (report, summary) => {
  const fileName = getReportPdfFileName(report);
  const cleanHtml = generatePdfHtml(report, summary, { showInteractiveButtons: false });
  let pdfBase64 = generateRawPdfBase64(report, summary);
  let generatedUri = null;

  const NativePrint = getNativePrintModule();
  const NativeSharing = getNativeSharingModule();
  const NativeFS = getNativeFileSystemModule();

  // 1. Sur le Web : téléchargement direct du fichier .pdf
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'web-download', fileName };
    } catch (e) {}
  }

  // 2. Générer le PDF haute résolution via ExpoPrint si disponible
  if (NativePrint && typeof NativePrint.printToFileAsync === 'function') {
    try {
      const res = await NativePrint.printToFileAsync({
        html: cleanHtml,
        base64: true,
      });
      if (res?.uri) generatedUri = res.uri;
      if (res?.base64) pdfBase64 = res.base64;
    } catch (e) {}
  }

  // 3. Sur Android : utiliser le StorageAccessFramework (SAF) d'ExponentFileSystem pour enregistrer
  // directement le fichier .PDF dans le dossier choisi par l'utilisateur (ex: Téléchargements)
  if (
    Platform.OS === 'android' &&
    NativeFS &&
    typeof NativeFS.requestDirectoryPermissionsAsync === 'function' &&
    typeof NativeFS.createSAFFileAsync === 'function' &&
    typeof NativeFS.writeAsStringAsync === 'function'
  ) {
    try {
      const permissions = await NativeFS.requestDirectoryPermissionsAsync(null);
      if (permissions && permissions.granted && permissions.directoryUri) {
        const baseNameNoExt = fileName.replace(/\.pdf$/i, '');
        const safFileUri = await NativeFS.createSAFFileAsync(
          permissions.directoryUri,
          baseNameNoExt,
          'application/pdf'
        );
        await NativeFS.writeAsStringAsync(safFileUri, pdfBase64, { encoding: 'base64' });
        Alert.alert(
          'Téléchargement réussi ✅',
          `Le fichier PDF « ${fileName} » a été enregistré dans votre dossier avec succès.`
        );
        return { success: true, method: 'android-saf', uri: safFileUri, fileName };
      } else if (permissions && permissions.granted === false) {
        // Si l'utilisateur a annulé le sélecteur de dossier, ne pas bloquer : proposer le partage direct
      }
    } catch (e) {}
  }

  // 4. Partage / Enregistrement du fichier .pdf via ExpoSharing (ou écriture dans le cache local)
  if (NativeFS && typeof NativeFS.writeAsStringAsync === 'function') {
    try {
      const dir =
        normalizeDirSlash(NativeFS.cacheDirectory) ||
        normalizeDirSlash(NativeFS.documentDirectory);
      if (dir) {
        const localFileUri = `${dir}${fileName}`;
        await NativeFS.writeAsStringAsync(localFileUri, pdfBase64, { encoding: 'base64' });
        generatedUri = localFileUri;
      }
    } catch (e) {}
  }

  if (generatedUri && NativeSharing && typeof NativeSharing.shareAsync === 'function') {
    try {
      await NativeSharing.shareAsync(generatedUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Télécharger ${fileName}`,
        UTI: 'com.adobe.pdf',
      });
      return { success: true, method: 'native-share', uri: generatedUri, fileName };
    } catch (e) {}
  }

  // 5. Fallback vers la boîte de dialogue système "Enregistrer en PDF / Imprimer" d'Android/iOS
  if (NativePrint && typeof NativePrint.print === 'function') {
    try {
      await NativePrint.print({ html: cleanHtml });
      return { success: true, method: 'native-print-save', fileName };
    } catch (e) {}
  }

  // 6. Fallback universel via Share natif de React Native
  if (generatedUri) {
    try {
      await Share.share({
        title: fileName,
        url: generatedUri,
        message: `${report.periodTitle} (${fileName})`,
      });
      return { success: true, method: 'rn-share-uri', uri: generatedUri, fileName };
    } catch (e) {}
  }

  return { success: false, fileName };
};

// ACTION 2 : Imprimer / Enregistrer en PDF via le gestionnaire d'impression système Android/iOS
export const printPdfReport = async (report, summary) => {
  const cleanHtml = generatePdfHtml(report, summary, { showInteractiveButtons: false });
  const NativePrint = getNativePrintModule();

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.print();
    return { success: true, method: 'web-print' };
  }

  // Attention : sur le module natif ExpoPrint, la méthode s'appelle `.print(options)` !
  if (NativePrint && typeof NativePrint.print === 'function') {
    try {
      await NativePrint.print({ html: cleanHtml });
      return { success: true, method: 'native-print' };
    } catch (e) {}
  }

  if (NativePrint && typeof NativePrint.printAsync === 'function') {
    try {
      await NativePrint.printAsync({ html: cleanHtml });
      return { success: true, method: 'native-print-async' };
    } catch (e) {}
  }

  // Si le gestionnaire d'impression n'est pas disponible, lancer directement l'enregistrement du fichier .PDF
  return await savePdfToDevice(report, summary);
};

// Action principale appelée par le bouton "Télécharger en PDF (.pdf)"
export const downloadOrSharePdfReport = async (report, summary, onOpenPreviewModal) => {
  const fileName = getReportPdfFileName(report);
  const pdfBase64 = generateRawPdfBase64(report, summary);
  const html = generatePdfHtml(report, summary, { showInteractiveButtons: true });

  if (typeof onOpenPreviewModal === 'function') {
    onOpenPreviewModal({ html, pdfBase64, fileName });
    return { success: true, method: 'modal-preview', fileName };
  }

  return await savePdfToDevice(report, summary);
};
