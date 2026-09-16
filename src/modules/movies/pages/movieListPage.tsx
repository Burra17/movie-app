import { usePopularMovies } from '../hooks/usePopularMovies';

/** Sida som listar populära filmer. */
export const MovieListPage = () => {
  const { data, isPending, isError, error } = usePopularMovies();

  if (isPending) {
    return <p>Laddar filmer…</p>;
  }

  if (isError) {
    return <p>Kunde inte hämta filmer: {error.message}</p>;
  }

  return (
    <div>
      <h1>Movie App</h1>
      {/* Tillfällig lista, flyttad hit från App.tsx. Ersätts av ett rutnät av MovieCard i ticket #18. */}
      <ul>
        {data.results.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
};
