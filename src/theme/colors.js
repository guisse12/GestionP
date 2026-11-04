// Palette de couleurs officielle GPS Poulailler
// Inspirée de l'aviculture : Ambre doré (œufs/poussins), Terracotta (ferme), Vert émeraude (aliment/nature)

export const COLORS = {
  // Couleurs principales
  primary: '#B45309',        // Ambre foncé / Terracotta doré
  primaryDark: '#78350F',    // Brun ферme profond
  primaryLight: '#F59E0B',   // Jaune d'or vif
  primarySoft: '#FEF3C7',    // Crème doré doux

  // Couleur secondaire (Nature / Aliment / Croissance)
  secondary: '#15803D',      // Vert émeraude ferme
  secondaryDark: '#14532D',  // Vert forêt profond
  secondaryLight: '#22C55E', // Vert vif
  secondarySoft: '#DCFCE7',  // Fond vert tendre

  // Accent terracotta (Poulailler / Crête de coq)
  accent: '#C84B31',         // Rouge brique / Terracotta
  accentSoft: '#FEE2E2',

  // Cases jaunes du Bilan (comme dans GestionP.xlsx)
  yellowBoxBg: '#FEF08A',    // Jaune vif Excel
  yellowBoxBorder: '#EAB308',// Bordure dorée
  yellowBoxText: '#713F12',

  // Fonds & Surfaces
  background: '#FFFDF7',     // Crème ivoire très doux
  surface: '#FFFFFF',        // Blanc pur pour les cartes
  surfaceElevated: '#FFFBEB',// Surface légèrement dorée
  cardBorder: '#F3E8D2',     // Bordure chaude subtile

  // Textes
  textPrimary: '#1C1917',    // Noir chaud
  textSecondary: '#57534E',  // Gris chaud
  textMuted: '#A8A29E',      // Gris clair
  textOnPrimary: '#FFFFFF',

  // Statuts
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#0284C7',
  infoBg: '#E0F2FE',
};

export const SHADOWS = {
  small: {
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const formatFCFA = (amount) => {
  const num = Number(amount) || 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
};

export const formatNumber = (num) => {
  const n = Number(num) || 0;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
