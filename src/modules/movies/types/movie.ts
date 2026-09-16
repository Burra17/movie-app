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

/** Genre som den ser ut i detaljsvaret: ett objekt, inte bara ett id. */
export interface Genre {
  id: number;
  name: string;
}

/**
 * Svaret från /movie/{id}.
 *
 * Egen typ i stället för en utökning av Movie: detaljsvaret har `genres` med
 * hela objekt och saknar `genre_ids` helt, så ett arv hade lovat ett fält som
 * inte finns i svaret.
 *
 * Nullbarheten nedan är kontrollerad mot API:et med 30 filmer — 15 populära och
 * 15 med lägst popularitet, eftersom fält som alltid är ifyllda för en storfilm
 * ofta är tomma längre ner i listan.
 */
export interface MovieDetails {
  id: number;
  title: string;
  original_title: string;
  original_language: string;

  poster_path: string | null;
  backdrop_path: string | null;

  // Tom sträng när data saknas, inte null: overview i 9 av 30, release_date i
  // 15 av 30, tagline och homepage i 18 av 30.
  overview: string;
  release_date: string;
  tagline: string;
  homepage: string;

  // 0 betyder okänt, inte noll: runtime i 9 av 30, budget i 22, revenue i 23.
  // Kontrollera sanningsvärdet innan värdet visas. runtime är typad som nullbar
  // eftersom TMDB:s dokumentation tillåter null — det dök inte upp i stickprovet,
  // men en sanningskoll täcker båda fallen.
  runtime: number | null;
  budget: number;
  revenue: number;

  genres: Genre[];
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  status: string;

  // Null i 11 av 30.
  imdb_id: string | null;
}
