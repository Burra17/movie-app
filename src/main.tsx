import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { theme } from './styles/theme';
import './index.css';

/**
 * QueryClient håller cachen och skapas därför utanför komponentträdet.
 * Skapades den inne i en komponent skulle cachen slängas vid varje omrendering.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Datan räknas som färsk i fem minuter. Under den tiden återanvänds cachen
      // när en komponent monteras om, i stället för att gå om till TMDB.
      staleTime: 1000 * 60 * 5,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* QueryClientProvider ger alla hookar längre ner i trädet tillgång till cachen. */}
    <QueryClientProvider client={queryClient}>
      {/* ThemeProvider gör temat tillgängligt för alla komponenter längre ner i trädet. */}
      <ThemeProvider theme={theme}>
        {/* CssBaseline nollställer webbläsarens standardstilar (t.ex. marginalen på
            body) och målar bakgrunden med palette.background.default. Den måste
            ligga innanför ThemeProvider för att komma åt temats färger. */}
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
