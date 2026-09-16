import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { buildPosterUrl } from '../services/movieService';
import type { Movie } from '../types/movie';

// TMDB:s postrar är 2:3. Förhållandet låses även på platshållaren, annars blir
// korten olika höga beroende på om filmen har affisch och rutnätet hoppar när
// bilderna laddas in.
const POSTER_ASPECT_RATIO = '2 / 3';

type MovieCardProps = {
  movie: Movie;
};

/**
 * Kort som visar en film med affisch, titel, årtal och betyg.
 *
 * Rent presenterande: all data kommer in via props och inget hämtas här. Det gör
 * att kortet går att återanvända för sökträffar och liknande listor senare.
 */
export const MovieCard = ({ movie }: MovieCardProps) => {
  const posterUrl = buildPosterUrl(movie.poster_path);

  // release_date är tom sträng när datumet saknas, inte null — en null-koll hade
  // släppt igenom den. slice() i stället för new Date(), som ger Invalid Date
  // på tom sträng.
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {posterUrl ? (
        <CardMedia
          component="img"
          src={posterUrl}
          // Alt-texten beskriver vad bilden föreställer, inte bara titeln, så att
          // en skärmläsare skiljer affischen från en rubrik med samma ord.
          alt={`Filmaffisch för ${movie.title}`}
          sx={{ aspectRatio: POSTER_ASPECT_RATIO, objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            aspectRatio: POSTER_ASPECT_RATIO,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            textAlign: 'center',
            // action.hover är temats egen genomskinliga overlay — den följer med
            // om bakgrundsfärgen ändras i colors.tsx.
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">Ingen affisch</Typography>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          {movie.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {releaseYear ?? 'Okänt år'}
          </Typography>

          {/* Betyget döljs för filmer utan röster. vote_average är 0 då, och en
              nolla läses som ett uselt betyg i stället för som saknad data. */}
          {movie.vote_count > 0 && (
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 600 }}>
              {movie.vote_average.toFixed(1)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
