# Recept

Steg-för-steg för de saker som återkommer. [ARKITEKTUR.md](ARKITEKTUR.md) förklarar *varför* lagren ser ut som de gör — det här är *hur* du lägger till något i dem.

---

## Lägga till ett nytt TMDB-anrop

Fyra steg, nerifrån och upp. Bygg och kontrollera efter varje steg hellre än att skriva alla fyra filerna först.

Exempel: `/movie/top_rated`.

### 1. Typen — `types/movie.ts`

Läs TMDB:s dokumentation och skriv svarets form. Har du redan en typ som passar återanvänder du den; `/movie/top_rated` returnerar samma form som `/movie/popular`, alltså `MovieListResponse`.

Är svaret en ny form: skriv en ny `interface`. Ärv inte från en befintlig typ bara för att fälten liknar varandra — `MovieDetails` är en egen typ just därför att detaljsvaret saknar `genre_ids` helt.

**Kontrollera nullbarheten mot API:et, inte mot dokumentationen.** TMDB markerar saknad data som `null`, tom sträng *eller* `0` beroende på fält. Hämta tio till trettio filmer, inklusive några med låg popularitet, och se efter. Skriv resultatet som en kommentar vid fältet — det är den informationen nästa person behöver.

### 2. Servicen — `services/movieService.ts`

```ts
/** Hämtar högst betygsatta filmer från TMDB för angiven sida. */
export const getTopRatedMovies = async (page = 1): Promise<MovieListResponse> => {
  const { data } = await axiosClient.get<MovieListResponse>('/movie/top_rated', { params: { page } });
  return data;
};
```

Regler: ingen React här, ingen `axios` direkt (alltid `axiosClient`), alltid en returtyp, aldrig hela adressen — `baseURL` sitter i klienten.

### 3. Hooken — `hooks/useTopRatedMovies.ts`

```ts
export const useTopRatedMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'topRated', page],
    queryFn: () => getTopRatedMovies(page),
  });
```

En fil per hook. Hooken kopplar bara ihop `useQuery` med servicen — ingen logik, ingen bearbetning av svaret.

**`queryKey` måste innehålla varje parameter som påverkar svaret.** Glöms `page` skriver sida 2 över sida 1 i cachen.

### 4. Vyn

Anropa hooken i en page, hantera `isPending` och `isError` före `data`, och skicka datan vidare till komponenter som props.

---

## Lägga till en ny sida

1. Skapa `pages/<namn>Page.tsx` med namngiven export.
2. Registrera routen i [`App.tsx`](../src/App.tsx):

```tsx
<Route path="/topplista" element={<TopRatedPage />} />
```

3. Har sidan en parameter (`/movie/:id`) kommer den ur `useParams` som `string | undefined`. Hooken måste tåla det — se `enabled` i [`useMovieDetails`](../src/modules/movies/hooks/useMovieDetails.ts).

Sidan får hämta data. Den ska inte innehålla presentationsdetaljer som lika gärna kunde bo i en komponent.

---

## Lägga till en komponent

Ny komponent som bara en modul använder: `modules/<feature>/components/`.

Krav:

* Namngiven export, arrow function, camelCase-filnamn.
* Tar emot allt via props. Hämtar ingenting.
* Färger via temat, aldrig hex. Styling via `sx`.
* Bilder har `alt`. Klickbart som navigerar är en `Link`, inte en `onClick` på en `div`.

### När komponenten ska flyttas till `shared/`

När en **andra modul** behöver den. Inte tidigare, och inte i förebyggande syfte.

Flytta den då — kopiera inte. Två kopior driver isär och du upptäcker det när bara den ena är fixad.

---

## Lägga till en ny modul

Exempel: TV-serier.

```
src/modules/tv/
  components/
  hooks/
  pages/
  services/
  types/
```

Egen service, egna typer, egen `queryKey`-prefix (`['tv', ...]`). Behöver TV-modulen något som filmmodulen redan har — som `MovieCard` — flyttas det till `shared/components/` och döps om till något modul-neutralt.

---

## Checklista före PR

```bash
yarn lint
yarn build
```

* `yarn build` är grinden, inte `yarn dev`. Dev-servern startar även med typfel.
* Städa bort testkod — en oanvänd variabel stoppar bygget (`noUnusedLocals`).
* Kommentarer på svenska: en rad per funktion om vad den gör, en rad per workaround om varför den finns.
* Inga nya `.css`-filer, inga hex-koder utanför `colors.tsx`.
* Nya bibliotek stäms av först.
* **Uppdatera dokumentationen** om ändringen rör arkitekturen — se nedan.
* En PR = en ticket. Dyker något annat upp blir det en ny ticket.
* PR-beskrivningen innehåller `Closes #<ticketnummer>`.

---

## När dokumentationen ska uppdateras

Alla ändringar kräver inte en dokumentationsuppdatering. De här gör det:

| Du har... | Uppdatera |
|---|---|
| lagt till ett lager, en mapp eller ändrat dataflödet | [ARKITEKTUR.md](ARKITEKTUR.md) avsnitt 1 och 3 |
| infört ett nytt bibliotek eller mönster | ARKITEKTUR.md, relevant avsnitt |
| gjort något av punkterna under "Vad som medvetet inte är gjort" | ta bort den punkten ur listan |
| ändrat hur projektet startas, byggs eller konfigureras | [README.md](../README.md) |
| hittat en ny datafälla i TMDB:s svar | ARKITEKTUR.md avsnitt 10 |

En ny komponent eller ett nytt endpoint som följer befintliga mönster behöver ingen uppdatering — mönstret är redan beskrivet.
