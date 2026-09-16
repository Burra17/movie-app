/**
 * Modeller för TMDB:s filmsvar.
 *
 * Fältnamnen följer API:ets snake_case exakt. Alternativet vore att mappa om
 * varje svar till camelCase, men då måste varje nytt endpoint få en egen
 * mappningsfunktion — snake_case här är den billigare kompromissen.
 */

/** En film så som den returneras i en listning, t.ex. /movie/popular eller /search/movie. */
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  original_language: string;

  // Bildsökvägarna saknas för mindre kända filmer. Verifierat mot API:et:
  // bland de minst populära filmerna var poster_path null i 36 av 76 träffar.
  // Sökvägen är bara ett fragment (t.ex. '/abc123.jpg') — bygg full adress
  // med buildPosterUrl() i movieService.
  poster_path: string | null;
  backdrop_path: string | null;

  // OBS: dessa två är tom sträng när data saknas, inte null. En null-koll
  // släpper alltså igenom dem — kontrollera sanningsvärdet i stället:
  // if (movie.release_date) { ... }
  release_date: string;
  overview: string;

  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
}

/**
 * Sidindelat svar från TMDB:s listnings-endpoints. Samma form oavsett om det är
 * populära, kommande eller en sökning — därför en gemensam typ.
 */
export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
