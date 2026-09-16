import { useQuery } from '@tanstack/react-query';
import { getMovieDetails } from '../services/movieService';

/**
 * Hämtar detaljerna för en film.
 *
 * id kommer från useParams och är därför string | undefined. enabled stänger av
 * anropet när det saknas, så att hooken går att anropa ovillkorligt — hookar får
 * inte ligga bakom en if-sats.
 */
export const useMovieDetails = (id: string | undefined) =>
  useQuery({
    queryKey: ['movies', 'details', id],
    queryFn: () => {
      // enabled hindrar att det här körs utan id, men TypeScript kan inte se det
      // sambandet. En kontroll här ger smalare typ utan en as-konvertering.
      if (!id) {
        throw new Error('Kan inte hämta film utan id.');
      }
      return getMovieDetails(id);
    },
    enabled: Boolean(id),
  });
