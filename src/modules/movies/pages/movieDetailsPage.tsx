import { useParams } from 'react-router-dom';

/**
 * Platshållare för detaljsidan. Visar bara vilket id routen plockade ur adressen.
 * Typ, service och hook för detaljdatan kommer i ticket #19.
 */
export const MovieDetailsPage = () => {
  // id är string | undefined — routern kan inte garantera att parametern finns,
  // eftersom samma komponent går att rendera från en route utan :id.
  const { id } = useParams();

  return <p>Detaljsida för film med id {id}</p>;
};
