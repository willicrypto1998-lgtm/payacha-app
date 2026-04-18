export const COLORS = {
  primary:    '#085041',
  primary2:   '#0F6E56',
  primary3:   '#1D9E75',
  primaryLight:'#E1F5EE',
  white:      '#FFFFFF',
  bg:         '#F4F6F5',
  card:       '#FFFFFF',
  border:     '#E5E7EB',
  textMain:   '#111827',
  textSub:    '#6B7280',
  textHint:   '#9CA3AF',
  success:    '#3B6D11',
  successBg:  '#EAF3DE',
  warning:    '#854F0B',
  warningBg:  '#FAEEDA',
  danger:     '#A32D2D',
  dangerBg:   '#FCEBEB',
  info:       '#185FA5',
  infoBg:     '#E6F1FB',
  scanBg:     '#0a1628',
  scanGreen:  '#1D9E75',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  mono: 'Courier',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  radius: 12,
  radiusSm: 8,
  padding: 16,
};

export const CATEGORIES = [
  'Tous', 'Vêtements', 'Chaussures', 'Accessoires', 'Beauté', 'Maison', 'Autre'
];

export const RETURN_REASONS: Record<string, string> = {
  wrong_size: 'Mauvaise taille',
  defect: 'Défaut produit',
  changed_mind: "Changement d'avis",
  damaged: 'Endommagé à la livraison',
  other: 'Autre motif',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  processing: 'En préparation',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export const ORDER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#FAEEDA', text: '#854F0B' },
  processing: { bg: '#E6F1FB', text: '#185FA5' },
  shipped:    { bg: '#E6F1FB', text: '#185FA5' },
  delivered:  { bg: '#EAF3DE', text: '#3B6D11' },
  cancelled:  { bg: '#FCEBEB', text: '#A32D2D' },
};
