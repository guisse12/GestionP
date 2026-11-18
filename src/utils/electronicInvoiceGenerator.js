import { Platform, Share, Alert } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { formatNumber } from '../theme/colors';
import { suppressAutoLock } from '../services/authService';
import { CACHET_IMAGE_DATA_URI, LOGO_IMAGE_DATA_URI } from './officialStampData';

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

// Conversion automatique d'un montant en lettres (Français) pour :
// "Arrêtée la présente facture à la somme de : ..."
const UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const TENS = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante',
  'quatre-vingt',
  'quatre-vingt',
];

const convertUnder100 = (n) => {
  if (n < 20) return UNITS[n];
  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7 || ten === 9) {
    const sub = 10 + unit;
    if (ten === 7 && sub === 11) return 'soixante et onze';
    return `${TENS[ten]}-${UNITS[sub]}`;
  }

  if (unit === 0) {
    return ten === 8 ? 'quatre-vingts' : TENS[ten];
  }
  if (unit === 1 && ten !== 8) {
    return `${TENS[ten]} et un`;
  }
  return `${TENS[ten]}-${UNITS[unit]}`;
};

const convertUnder1000 = (n) => {
  if (n === 0) return '';
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let res = '';

  if (hundred === 1) {
    res = 'cent';
  } else if (hundred > 1) {
    res = `${UNITS[hundred]} cent${rest === 0 ? 's' : ''}`;
  }

  if (rest > 0) {
    res = res ? `${res} ${convertUnder100(rest)}` : convertUnder100(rest);
  }
  return res;
};

export const numberToFrenchWords = (amount) => {
  const num = Math.floor(Math.max(0, Number(amount) || 0));
  if (num === 0) return 'Zéro';

  const milliards = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const milliers = Math.floor((num % 1000000) / 1000);
  const reste = num % 1000;

  const parts = [];

  if (milliards > 0) {
    parts.push(`${convertUnder1000(milliards)} milliard${milliards > 1 ? 's' : ''}`);
  }
  if (millions > 0) {
    parts.push(`${convertUnder1000(millions)} million${millions > 1 ? 's' : ''}`);
  }
  if (milliers > 0) {
    if (milliers === 1) {
      parts.push('mille');
    } else {
      parts.push(
        `${convertUnder1000(milliers)
          .replace(/cents$/, 'cent')
          .replace(/quatre-vingts$/, 'quatre-vingt')} mille`
      );
    }
  }
  if (reste > 0) {
    parts.push(convertUnder1000(reste));
  }

  const full = parts.join(' ').trim();
  return full.charAt(0).toUpperCase() + full.slice(1);
};

export const formatDateSlashFr = (isoDate) => {
  if (!isoDate) return '';
  const s = String(isoDate).trim();
  const parts = s.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return s;
};

export const formatInvoiceNumberPad = (num) => {
  const s = String(num ?? '').trim();
  if (!s) return '01';
  if (/^\d+$/.test(s) && s.length === 1) {
    return `0${s}`;
  }
  return s;
};

// Rendu SVG de la signature dessinée (tableau de traits SVG) ou nom du signataire
export const renderSignatureSvgHtml = (sigData, signerName = '', signerRole = '') => {
  const paths = Array.isArray(sigData?.paths) ? sigData.paths : [];
  if (paths.length === 0 && !signerName) {
    return `
      <div class="sig-card">
        <div class="sig-role-label">Signature ${signerRole}</div>
        <div class="sig-empty">Non signée</div>
      </div>
    `;
  }
  if (paths.length > 0) {
    return `
      <div class="sig-card sig-card-signed">
        <div class="sig-role-label">Signature ${signerRole}</div>
        <svg viewBox="0 0 260 90" width="110" height="40" style="overflow:visible; margin: 2px auto;">
          ${paths
            .map(
              (d) =>
                `<path d="${d}" fill="none" stroke="#1D4ED8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`
            )
            .join('')}
        </svg>
        ${signerName ? `<div class="sig-signer-name">${signerName}</div>` : ''}
      </div>
    `;
  }
  return `
    <div class="sig-card sig-card-signed">
      <div class="sig-role-label">Signature ${signerRole}</div>
      <div class="sig-signer-name" style="font-size: 14px; margin: 8px 0 4px 0;">${signerName}</div>
      <div class="sig-verified-badge">✓ Validée</div>
    </div>
  `;
};

export const generateElectronicInvoiceHtml = (facture = {}) => {
  const numStr = formatInvoiceNumberPad(facture.numeroFacture || '01');
  const dateStr = formatDateSlashFr(facture.date || new Date().toISOString().split('T')[0]);
  const clientStr = facture.client || 'Client Comptant';
  const qte = Number(facture.quantite) || 0;
  const designation = facture.designation || 'Tablettes';
  const pu = Number(facture.prixUnitaire) || 2200;
  const total = Number(facture.total) || qte * pu;
  const isPaye = facture.statut !== 'Non Payé';
  const cachetVisible = facture.cachet !== false;
  const sommeEnLettres =
    facture.sommeEnLettres && String(facture.sommeEnLettres).trim()
      ? facture.sommeEnLettres
      : numberToFrenchWords(total);

  const gerantSigHtml = renderSignatureSvgHtml(
    facture.signatureGerant,
    facture.signataireGerantNom,
    'Gérant'
  );
  const adminSigHtml = renderSignatureSvgHtml(
    facture.signatureAdmin,
    facture.signataireAdminNom,
    'Admin'
  );

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0" />
  <title>Facture N° ${numStr} - TERA AGRO - SUARL</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 12px;
      background: #F5EFE6;
      color: #1C1917;
    }
    .invoice-card {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFDF7;
      border-radius: 20px;
      overflow: hidden;
      border: 1.5px solid #F3E8D2;
      box-shadow: 0 8px 24px rgba(120, 53, 15, 0.12);
    }
    /* BANNIÈRE D'EN-TÊTE AU DESIGN DE L'APPLICATION */
    .hero-banner {
      background: linear-gradient(135deg, #0F4C25 0%, #15803D 100%);
      color: #FFFFFF;
      padding: 16px 16px 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 3px solid #F59E0B;
    }
    .logo-badge {
      width: 68px;
      height: 68px;
      border-radius: 18px;
      background: #FFFFFF;
      border: 2.5px solid #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
    }
    .company-info {
      flex: 1;
    }
    .company-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.6px;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.1;
    }
    .company-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 5px;
    }
    .ninea-pill {
      background: rgba(254, 243, 199, 0.18);
      border: 1px solid rgba(253, 230, 138, 0.45);
      color: #FEF3C7;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 8px;
    }
    .poulailler-pill {
      background: #F59E0B;
      color: #0F4C25;
      font-size: 10.5px;
      font-weight: 900;
      padding: 2px 8px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }
    .company-addr {
      font-size: 10.5px;
      font-weight: 700;
      color: #FDE68A;
      margin-top: 6px;
      line-height: 1.3;
    }
    .invoice-body {
      padding: 14px;
    }
    /* CARTES D'INFORMATIONS : FACTURE N°, DATE, STATUT */
    .meta-grid {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .meta-box {
      flex: 1;
      background: #FFFFFF;
      border: 1px solid #F3E8D2;
      border-radius: 12px;
      padding: 8px 10px;
    }
    .meta-box-highlight {
      background: #FFFBEB;
      border-color: #FCD34D;
    }
    .meta-label {
      font-size: 10px;
      font-weight: 800;
      color: #78716C;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .meta-value {
      font-size: 16px;
      font-weight: 900;
      color: #78350F;
      margin-top: 2px;
      white-space: nowrap;
    }
    .status-pill {
      display: inline-block;
      margin-top: 3px;
      padding: 3px 9px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.3px;
    }
    .status-paye {
      background: #DCFCE7;
      color: #15803D;
      border: 1px solid #86EFAC;
    }
    .status-non-paye {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid #FCD34D;
    }
    /* CARTE CLIENT */
    .client-card {
      background: #FFFFFF;
      border: 1px solid #F3E8D2;
      border-left: 4px solid #B45309;
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .client-label {
      font-size: 11px;
      font-weight: 800;
      color: #78716C;
      text-transform: uppercase;
    }
    .client-name {
      font-size: 16px;
      font-weight: 900;
      color: #1C1917;
    }
    /* TABLEAU MODERNE DES LIGNES DE FACTURE */
    .table-card {
      background: #FFFFFF;
      border: 1.5px solid #E7E0D3;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    table.invoice-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    table.invoice-table th {
      background: #FAF7F2;
      color: #78350F;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 9px 6px;
      border-bottom: 1.5px solid #E7E0D3;
      border-right: 1px solid #F3E8D2;
      text-align: center;
      white-space: nowrap;
    }
    table.invoice-table th:last-child {
      border-right: none;
    }
    table.invoice-table td {
      padding: 12px 6px;
      font-size: 14px;
      font-weight: 800;
      color: #1C1917;
      border-bottom: 1px solid #F5EFE6;
      border-right: 1px solid #F5EFE6;
      white-space: nowrap;
      overflow: hidden;
    }
    table.invoice-table td:last-child {
      border-right: none;
    }
    .qty-badge {
      background: #FEF3C7;
      color: #78350F;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 7px;
      display: inline-block;
    }
    .total-footer-bar {
      background: #0F4C25;
      color: #FFFFFF;
      padding: 11px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-footer-label {
      font-size: 13px;
      font-weight: 900;
      color: #FEF3C7;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .total-footer-amount {
      font-size: 18px;
      font-weight: 900;
      color: #FFFFFF;
      white-space: nowrap;
    }
    /* ARRÊTÉE LA PRÉSENTE FACTURE À LA SOMME DE */
    .words-card {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .words-label {
      font-size: 11px;
      font-weight: 700;
      color: #78350F;
    }
    .words-value {
      font-size: 14px;
      font-weight: 900;
      color: #B45309;
      margin-top: 2px;
    }
    /* ZONE CACHET OFFICIEL, TAMPON PAYÉ & SIGNATURES */
    .validation-card {
      background: #FFFFFF;
      border: 1.5px solid #F3E8D2;
      border-radius: 14px;
      padding: 12px;
    }
    .validation-top-stamp {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
    }
    .stamp-paye-wrap {
      transform: rotate(-12deg);
      display: inline-block;
      padding: 2px 12px;
    }
    .stamp-paye-top-bar {
      height: 2.5px;
      background: #1D4ED8;
      width: 75%;
      margin: 0 auto 2px auto;
      border-radius: 2px;
    }
    .stamp-paye-text {
      color: #1D4ED8;
      font-size: 23px;
      font-weight: 900;
      letter-spacing: 2px;
      line-height: 1;
    }
    .stamp-non-paye {
      color: #1D4ED8;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.5px;
      border: 2.5px solid #1D4ED8;
      border-radius: 5px;
      padding: 3px 10px;
      transform: rotate(-8deg);
      text-transform: uppercase;
      white-space: nowrap;
    }
    .validation-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .sig-card {
      flex: 1;
      background: #FAF7F2;
      border: 1px dashed #D6D3D1;
      border-radius: 11px;
      padding: 8px 6px;
      text-align: center;
      min-height: 76px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .sig-card-signed {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
    }
    .sig-role-label {
      font-size: 10px;
      font-weight: 800;
      color: #57534E;
      text-transform: uppercase;
    }
    .sig-signer-name {
      font-size: 12px;
      font-weight: 900;
      color: #1D4ED8;
    }
    .sig-verified-badge {
      font-size: 9.5px;
      font-weight: 800;
      color: #15803D;
    }
    .sig-empty {
      font-size: 10.5px;
      color: #A8A29E;
      margin-top: 6px;
    }
    .cachet-center-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 2px;
    }
    .invoice-footer-note {
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #78716C;
      margin-top: 10px;
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .invoice-card { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <!-- EN-TÊTE MODERNE TERA AGRO - SUARL -->
    <div class="hero-banner">
      <div class="logo-badge">
        <img src="${LOGO_IMAGE_DATA_URI}" width="58" height="58" alt="Logo TERA AGRO-SUARL" style="display: block; border-radius: 13px;" />
      </div>
      <div class="company-info">
        <div class="company-title">TERA AGRO - SUARL</div>
        <div class="company-pills">
          <span class="poulailler-pill">POULAILLER</span>
          <span class="ninea-pill">NINEA : 013274551</span>
        </div>
        <div class="company-addr">📍 Keur Issa Thiès • 📞 +221 77 977 42 42</div>
      </div>
    </div>

    <div class="invoice-body">
      <!-- MÉTADONNÉES : FACTURE N°, DATE, STATUT -->
      <div class="meta-grid">
        <div class="meta-box meta-box-highlight">
          <div class="meta-label">Facture N°</div>
          <div class="meta-value">N° ${numStr}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Date</div>
          <div class="meta-value" style="font-size: 14.5px;">${dateStr}</div>
        </div>
        <div class="meta-box" style="text-align: right;">
          <div class="meta-label">Statut</div>
          <span class="status-pill ${isPaye ? 'status-paye' : 'status-non-paye'}">
            ${isPaye ? '✓ PAYÉ' : '⏳ LIVRÉ NON PAYÉ'}
          </span>
        </div>
      </div>

      <!-- CLIENT -->
      <div class="client-card">
        <div>
          <div class="client-label">Client</div>
          <div class="client-name">${clientStr}</div>
        </div>
        <div style="font-size: 11px; font-weight: 800; color: #B45309; background: #FEF3C7; padding: 4px 9px; border-radius: 8px;">
          Facture Officielle
        </div>
      </div>

      <!-- TABLEAU DES ARTICLES -->
      <div class="table-card">
        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 18%;">Quantité</th>
              <th style="width: 34%;">Désignation</th>
              <th style="width: 22%;">Prix Unit.</th>
              <th style="width: 26%;">Prix Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">
                <span class="qty-badge">${formatNumber(qte)}</span>
              </td>
              <td style="text-align: center;">${designation}</td>
              <td style="text-align: right;">${formatNumber(pu)} F</td>
              <td style="text-align: right; color: #15803D; font-size: 15px;">${formatNumber(total)} F</td>
            </tr>
          </tbody>
        </table>

        <div class="total-footer-bar">
          <span class="total-footer-label">Total Facture</span>
          <span class="total-footer-amount">${formatNumber(total)} FCFA</span>
        </div>
      </div>

      <!-- SOMME EN LETTRES -->
      <div class="words-card">
        <div class="words-label">Arrêtée la présente facture à la somme de :</div>
        <div class="words-value">${sommeEnLettres} francs CFA</div>
      </div>

      <!-- VALIDATION : TAMPON STATUT + CACHET ROND OFFICIEL + SIGNATURES -->
      <div class="validation-card">
        <div class="validation-top-stamp">
          ${
            isPaye
              ? `<div class="stamp-paye-wrap">
                  <div class="stamp-paye-top-bar"></div>
                  <div class="stamp-paye-text">PAYE</div>
                </div>`
              : `<div class="stamp-non-paye">LIVRE NON PAYE</div>`
          }
        </div>

        <div class="validation-row">
          ${gerantSigHtml}

          ${
            cachetVisible
              ? `<div class="cachet-center-wrap">
                  <img src="${CACHET_IMAGE_DATA_URI}" width="122" height="122" alt="Cachet TERA AGRO-SUARL" style="display: block;" />
                </div>`
              : ''
          }

          ${adminSigHtml}
        </div>
      </div>

      <div class="invoice-footer-note">
        TERA AGRO - SUARL • Poulailler Keur Issa Thiès • NINEA : 013274551
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const printElectronicInvoice = async (facture) => {
  suppressAutoLock(45000);
  const html = generateElectronicInvoiceHtml(facture);
  const NativePrint = getNativePrintModule();

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.print();
    return { success: true };
  }

  if (NativePrint && typeof NativePrint.print === 'function') {
    try {
      await NativePrint.print({ html });
      return { success: true };
    } catch (e) {}
  }

  if (NativePrint && typeof NativePrint.printAsync === 'function') {
    try {
      await NativePrint.printAsync({ html });
      return { success: true };
    } catch (e) {}
  }

  return await downloadElectronicInvoicePdf(facture);
};

export const downloadElectronicInvoicePdf = async (facture) => {
  suppressAutoLock(45000);
  const numStr = formatInvoiceNumberPad(facture?.numeroFacture || '01');
  const safeClient = String(facture?.client || 'Client')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  const fileName = `Facture_TERA_AGRO_N${numStr}_${safeClient}.pdf`;
  const html = generateElectronicInvoiceHtml(facture);

  const NativePrint = getNativePrintModule();
  const NativeSharing = getNativeSharingModule();
  const NativeFS = getNativeFileSystemModule();

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => {
          printWin.focus();
          printWin.print();
        }, 350);
        return { success: true, fileName };
      }
      window.print();
      return { success: true, fileName };
    } catch (e) {}
  }

  let generatedUri = null;
  let pdfBase64 = null;

  if (NativePrint && typeof NativePrint.printToFileAsync === 'function') {
    try {
      const res = await NativePrint.printToFileAsync({ html, base64: true });
      if (res?.uri) generatedUri = res.uri;
      if (res?.base64) pdfBase64 = res.base64;
    } catch (e) {}
  }

  // Sur iPhone (iOS) ou Android : renommer avec le vrai nom de fichier Facture_TERA_AGRO_Nxx.pdf dans le cache local
  if (pdfBase64 && NativeFS && typeof NativeFS.writeAsStringAsync === 'function') {
    try {
      const rawDir = NativeFS.cacheDirectory || NativeFS.documentDirectory;
      if (rawDir) {
        const cleanDir = String(rawDir).replace(/\/*$/, '') + '/';
        const namedUri = `${cleanDir}${fileName}`;
        await NativeFS.writeAsStringAsync(namedUri, pdfBase64, { encoding: 'base64' });
        generatedUri = namedUri;
      }
    } catch (e) {}
  }

  if (
    Platform.OS === 'android' &&
    pdfBase64 &&
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
          'Facture PDF enregistrée ✅',
          `La facture « ${fileName} » a été enregistrée dans votre dossier.`
        );
        return { success: true, uri: safFileUri, fileName };
      }
    } catch (e) {}
  }

  if (generatedUri && NativeSharing && typeof NativeSharing.shareAsync === 'function') {
    try {
      await NativeSharing.shareAsync(generatedUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Facture N° ${numStr} - TERA AGRO - SUARL`,
        UTI: 'com.adobe.pdf',
      });
      return { success: true, uri: generatedUri, fileName };
    } catch (e) {}
  }

  if (NativePrint && typeof NativePrint.print === 'function') {
    try {
      await NativePrint.print({ html });
      return { success: true, fileName };
    } catch (e) {}
  }

  if (generatedUri) {
    try {
      await Share.share({
        title: fileName,
        url: generatedUri,
        message: `Facture N° ${numStr} - TERA AGRO - SUARL (${facture?.client})`,
      });
      return { success: true, uri: generatedUri, fileName };
    } catch (e) {}
  }

  return { success: false, fileName };
};
