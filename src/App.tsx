import { usePopularMovies } from './modules/movies/hooks/usePopularMovies';

const App = () => {
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
      {/* Tillfällig lista som bara verifierar att dataflödet fungerar hela vägen.
          Den ersätts av en riktig sida i modules/movies/pages i routing-ticketen. */}
      <ul>
        {data.results.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
