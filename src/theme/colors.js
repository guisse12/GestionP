// Palette de couleurs officielle TERA AGRO - SUARL
// Directement inspirée du logo officiel : Vert Émeraude/Forêt (TERA & Feuilles), Or Solaire (Soleil & Arc), Brun Terre (AGRO-SUARL & Sillons)

export const COLORS = {
  // Couleurs principales (Vert TERA & Or Solaire du logo)
  primary: '#15803D',        // Vert Émeraude TERA (Navbar, onglets actifs, boutons principaux)
  primaryDark: '#0F4C25',    // Vert Forêt profond TERA (Bannières, en-têtes, cartes principales)
  primaryLight: '#F59E0B',   // Jaune d'Or Solaire vif (Soleil et arc supérieur du logo)
  primarySoft: '#DCFCE7',    // Vert tendre lumineux (Onglets actifs & badges doux)

  // Couleur secondaire (Croissance / Validation / Soleil)
  secondary: '#16A34A',      // Vert vif validation
  secondaryDark: '#14532D',  // Vert forêt profond
  secondaryLight: '#4ADE80', // Vert feuille clair
  secondarySoft: '#ECFCCB',  // Fond vert feuille tendre

  // Accent Brun Terre (Couleur de "AGRO-SUARL" et des sillons de terre du logo)
  accent: '#78350F',         // Brun Terre AGRO-SUARL
  accentSoft: '#FEF3C7',

  // Cases jaunes du Bilan (Or Solaire du logo)
  yellowBoxBg: '#FEF08A',    // Jaune solaire vif
  yellowBoxBorder: '#F59E0B',// Bordure dorée solaire
  yellowBoxText: '#78350F',

  // Fonds & Surfaces
  background: '#F7FAF7',     // Crème-vert très doux et lumineux
  surface: '#FFFFFF',        // Blanc pur pour les cartes
  surfaceElevated: '#F0FDF4',// Surface légèrement verte
  cardBorder: '#D8E8DC',     // Bordure verte subtile assortie au logo

  // Textes
  textPrimary: '#14261A',    // Noir-forêt profond
  textSecondary: '#4B5E51',  // Gris-vert sobre
  textMuted: '#94A398',      // Gris-vert clair
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
    shadowColor: '#0F4C25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0F4C25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#0F4C25',
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
