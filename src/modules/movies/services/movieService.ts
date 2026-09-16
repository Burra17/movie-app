import axiosClient from '../../../shared/api/axiosClient';
import type { MovieListResponse } from '../types/movie';

/**
 * Basadress för TMDB:s bilder. Bilderna ligger på en helt annan domän än API:et,
 * så axiosClient.baseURL går inte att återanvända här.
 */
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/** Posterstorlekar TMDB erbjuder. w500 räcker för kort i en lista. */
export const POSTER_SIZES = ['w185', 'w342', 'w500', 'original'] as const;

export type PosterSize = (typeof POSTER_SIZES)[number];

/**
 * Bygger full bildadress för en filmposter.
 * Returnerar null när filmen saknar poster, så att anropande komponent kan
 * visa en platshållare i stället för en trasig bild.
 */
export const buildPosterUrl = (posterPath: string | null, size: PosterSize = 'w500'): string | null =>
  posterPath ? `${IMAGE_BASE_URL}/${size}${posterPath}` : null;

/** Hämtar populära filmer från TMDB för angiven sida. */
export const getPopularMovies = async (page = 1): Promise<MovieListResponse> => {
  const { data } = await axiosClient.get<MovieListResponse>('/movie/popular', { params: { page } });
  return data;
};
