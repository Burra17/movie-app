import axios from 'axios';

// Här hämtar vi våra miljövariabler i Vite
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Vissa TMDB-endpoints kräver Bearer token, andra API-nyckel i parametrar. 
    // Vi lägger till API-nyckeln som en Authorization-header för säkerhets skull om TMDB kräver det (Read Access Token).
    Authorization: `Bearer ${API_KEY}`,
  },
});

export default axiosClient;