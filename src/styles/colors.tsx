/**
 * Projektets råa färgvärden. Det här är enda stället i kodbasen där en hex-kod
 * får stå skriven — allt annat hämtar färgerna via temat i theme.tsx.
 */
export const colors = {
  // Bakgrunder. Helsvart ger hård kontrast mot vit text, därför en mörk blågrå
  // botten och ett ljusare lager för kort och paneler som ska lyfta från sidan.
  backgroundDefault: '#0E1116',
  backgroundPaper: '#171C24',

  // Accentfärg för knappar, aktiva länkar och fokusmarkeringar. Nyansen är vald
  // så att vit text på färgen når WCAG AA (4.7:1) — en ljusare röd hade sett
  // piggare ut men fallit under gränsen.
  primaryMain: '#D33A40',
  primaryLight: '#E8676C',
  primaryDark: '#9E2A2E',

  // Sekundär accent för betyg och etiketter. Ska synas utan att konkurrera med
  // den primära färgen. MUI väljer automatiskt mörk text ovanpå den här.
  secondaryMain: '#F5B53F',
  secondaryLight: '#FFC96B',
  secondaryDark: '#C08A22',

  // Text. Ren vit (#FFFFFF) flimrar mot mörk bakgrund, därför en bruten vit.
  // Den sekundära nyansen används för metadata som årtal och speltid.
  textPrimary: '#ECEDEE',
  textSecondary: '#9BA1A6',

  // Statusfärger och avgränsare.
  error: '#FF6369',
  success: '#46A758',
  divider: 'rgba(255, 255, 255, 0.12)',
} as const;
