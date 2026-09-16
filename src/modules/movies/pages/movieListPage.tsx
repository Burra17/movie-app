import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { MovieCard } from '../components/movieCard';
import { usePopularMovies } from '../hooks/usePopularMovies';

/** Sida som listar populära filmer som ett rutnät av kort. */
export const MovieListPage = () => {
  const { data, isPending, isError, error } = usePopularMovies();

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        {/* Snurran är enda innehållet på sidan under laddning, så den behöver en
            egen etikett — annars läser skärmläsaren upp en tom sida. */}
        <CircularProgress aria-label="Laddar filmer" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Kunde inte hämta filmer: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom>
        Populära filmer
      </Typography>

      {/* spacing räknas i temats avståndsenheter: 2 blir 16px mellan korten. */}
      <Grid container spacing={2}>
        {data.results.map((movie) => (
          // MUI 9 har tagit bort item-propen. Bredden anges i stället med size per
          // brytpunkt: ett kort i bredd på mobil, två på surfplatta, fyra på desktop.
          <Grid key={movie.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
