import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { buildPosterUrl } from '../services/movieService';

/**
 * Gör om speltid i minuter till läsbar text.
 * Returnerar null när speltiden är okänd — TMDB skickar 0 då, inte null.
 */
const formatRuntime = (minutes: number | null): string | null => {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return hours > 0 ? `${hours} h ${rest} min` : `${rest} min`;
};

/** Sida som visar detaljerna för en enskild film. */
export const MovieDetailsPage = () => {
  const { id } = useParams();

  // Hooken anropas ovillkorligt och stänger av sig själv internt när id saknas.
  const { data, isPending, isError, error } = useMovieDetails(id);

  if (!id) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Adressen saknar film-id.</Alert>
      </Container>
    );
  }

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Laddar film" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Kunde inte hämta filmen: {error.message}</Alert>
      </Container>
    );
  }

  const posterUrl = buildPosterUrl(data.poster_path, 'w342');
  const releaseYear = data.release_date ? data.release_date.slice(0, 4) : null;
  const runtime = formatRuntime(data.runtime);

  return (
    <Container sx={{ py: 4 }}>
      <Button component={RouterLink} to="/" sx={{ mb: 3 }}>
        ← Tillbaka till listan
      </Button>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          {posterUrl ? (
            <Box
              component="img"
              src={posterUrl}
              alt={`Filmaffisch för ${data.title}`}
              sx={{ width: '100%', borderRadius: 1, display: 'block' }}
            />
          ) : (
            <Box
              sx={{
                aspectRatio: '2 / 3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">Ingen affisch</Typography>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 7, md: 8 }}>
          <Typography variant="h2" gutterBottom>
            {data.title}
          </Typography>

          {/* tagline är tom sträng när den saknas, i 18 av 30 undersökta filmer. */}
          {data.tagline && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              {data.tagline}
            </Typography>
          )}

          {/* Metadata som saknas utelämnas helt i stället för att visas tom. */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
            {releaseYear && <Typography variant="body2" color="text.secondary">{releaseYear}</Typography>}
            {runtime && <Typography variant="body2" color="text.secondary">{runtime}</Typography>}
            {data.vote_count > 0 && (
              <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                {data.vote_average.toFixed(1)} ({data.vote_count} röster)
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {data.genres.map((genre) => (
              <Chip key={genre.id} label={genre.name} size="small" />
            ))}
          </Box>

          <Typography variant="body1">{data.overview || 'Ingen beskrivning finns för den här filmen.'}</Typography>
        </Grid>
      </Grid>
    </Container>
  );
};
