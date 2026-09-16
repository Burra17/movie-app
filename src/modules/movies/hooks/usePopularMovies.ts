import { useQuery } from '@tanstack/react-query';
import { getPopularMovies } from '../services/movieService';

/**
 * Hämtar populära filmer för angiven sida.
 *
 * Hooken kopplar bara ihop React Query med servicen. All HTTP-logik ligger kvar
 * i movieService, så att servicen går att testa och återanvända utan React.
 */
export const usePopularMovies = (page = 1) =>
  useQuery({
    // Sidan är med i nyckeln eftersom den påverkar svaret. Utan den skulle
    // sida 2 skriva över sida 1 i cachen och båda visa samma filmer.
    queryKey: ['movies', 'popular', page],
    queryFn: () => getPopularMovies(page),
  });
