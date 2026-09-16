import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.tsx';
import { theme } from './styles/theme';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ThemeProvider gör temat tillgängligt för alla komponenter längre ner i trädet. */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline nollställer webbläsarens standardstilar (t.ex. marginalen på
          body) och målar bakgrunden med palette.background.default. Den måste
          ligga innanför ThemeProvider för att komma åt temats färger. */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
