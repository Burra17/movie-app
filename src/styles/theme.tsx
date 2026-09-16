import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

/**
 * Appens bastema. Varje komponent hämtar sina färger, avstånd och typsnitt
 * härifrån — via sx-propen, styled() eller useTheme() — så att en ändring här
 * slår igenom i hela appen.
 */
export const theme = createTheme({
  palette: {
    // 'dark' gör mer än att byta bakgrund: MUI räknar om skuggor, hover-lägen
    // och disabled-färger så att de fungerar mot en mörk yta.
    mode: 'dark',
    primary: {
      main: colors.primaryMain,
      light: colors.primaryLight,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondaryMain,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
    },
    background: {
      default: colors.backgroundDefault,
      paper: colors.backgroundPaper,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    error: { main: colors.error },
    success: { main: colors.success },
    divider: colors.divider,
  },

  // Rundade hörn på kort, knappar och dialoger. MUI multiplicerar värdet på
  // vissa komponenter, så 8 ger 8px på en knapp och mer på ett kort.
  shape: {
    borderRadius: 8,
  },

  typography: {
    // Systemtypsnitt istället för ett webbtypsnitt: inget extra nätverksanrop
    // och ingen textflimring medan sidan laddar.
    fontFamily: "system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    // Filmtitlar under postrar blir långa och behöver tätare radavstånd.
    subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        // MUI versalerar knapptext som standard. Filmtitlar och knappar blir
        // lättare att läsa med vanlig skiftläge.
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});
