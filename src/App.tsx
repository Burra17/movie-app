import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MovieListPage } from './modules/movies/pages/movieListPage';
import { MovieDetailsPage } from './modules/movies/pages/movieDetailsPage';

/**
 * Appens rotkomponent. Innehåller bara routing — varje sida hämtar sin egen data,
 * så att App inte växer varje gång en ny vy tillkommer.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MovieListPage />} />
        <Route path='/movie/:id' element={<MovieDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
