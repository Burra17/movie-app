# CLAUDE.md

Övningsprojekt A — en React-app som listar filmer och TV-serier från TMDB.
Byggs under LIA hos Apptech för att träna React, TypeScript, Axios, servicelager och MUI.

## Pedagogiskt läge

Det här repot är ett inlärningsprojekt. Målet är att koden ska förstås, inte att den ska bli klar fort.

- Förklara **varför** före **hur**. Motivera arkitekturvalet innan du visar koden.
- Bygg en avgränsad sak i taget och lämna över. Leverera inte fem filer när ticketen handlar om en.
- Skriv kod som går att skriva själv nästa gång. Inga smarta one-liners, inga nya bibliotek utan att fråga först.
- Svara på svenska.
- Finns flera rimliga vägar: ge en rekommendation med ett kort skäl, inte en katalog över alternativ.

## Kommandon

Pakethanteraren är **yarn**. Ett `npm install` här skapar en `package-lock.json` som krockar med `yarn.lock` — det har redan hänt en gång i projektet.

`yarn build` kör `tsc -b` före Vite-bygget och är den riktiga kvalitetsgrinden: TypeScript-reglerna nedan ger byggfel, inte varningar. Kör den innan varje PR.

## Arkitektur

```
src/
  modules/<feature>/     feature-specifik kod, t.ex. movies
    components/          komponenter som bara används i den här modulen
    hooks/               TanStack Query-hookar, t.ex. useMovies
    pages/               vyer som routern pekar på
    services/            API-anrop mot TMDB, returnerar typad data
    types/               modeller för TMDB-svaren
  shared/
    api/axiosClient.ts   konfigurerad Axios-instans — all HTTP går genom den
    components/          komponenter som används av flera moduler
    forms/               formulärkomponenter (React Hook Form)
  styles/                colors.tsx och theme.tsx för MUI-temat
  templates/             sidlayouter, t.ex. pageTemplate.tsx
```

Dataflödet går åt ett håll: `page → hook → service → axiosClient → TMDB`.

- Komponenter anropar aldrig `axios` direkt, alltid via en service.
- Services innehåller ingen React — bara funktioner som returnerar typad data.
- Behöver en andra modul en komponent flyttas den till `shared/components/`.

## Namngivning

- Filer: camelCase — `movieCard.tsx`, `useMovies.ts`, `movieService.ts`
- Komponenter, typer och interface: PascalCase — `MovieCard`, `Movie`
- Funktioner och variabler: camelCase — `const fetchPopularMovies = async () => {}`
- Komponenter skrivs som arrow functions med namngiven export: `export const MovieCard = () => {}`
- `App.tsx` och `main.tsx` är Vites egna filer och behåller sina namn.

## TypeScript-regler som biter

Tre inställningar i `tsconfig.app.json` gör att vanliga mönster inte kompilerar.

**`verbatimModuleSyntax`** — typer måste importeras med `import type`:

```ts
import type { Movie } from '../types/movie'; // rätt
import { Movie } from '../types/movie';      // byggfel
```

**`erasableSyntaxOnly`** — `enum`, `namespace` och parameter-properties är förbjudna. Använd union eller `as const`:

```ts
// istället för: enum MediaType { Movie = 'movie', Tv = 'tv' }
export const MEDIA_TYPES = ['movie', 'tv'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
```

**`noUnusedLocals` / `noUnusedParameters`** — en oanvänd variabel eller parameter stoppar bygget. Städa bort testkod före commit.

`any` är förbjudet (`noImplicitAny`). Saknas en typ för ett TMDB-svar: skriv den i modulens `types/`-mapp utifrån API-dokumentationen.

## Kodstil

- **KISS** — kod som en kollega förstår vid första genomläsningen.
- **DRY** — upprepas något på ett tredje ställe, bryt ut det.
- **Svenska kommentarer.** Varje funktion får en rad om vad den gör, varje workaround en rad om varför den finns. Kommentaren förklarar avsikten, den upprepar inte kodraden.
- Prettier (`.prettierrc`) sköter formateringen: enkla citattecken, semikolon, 150 tecken per rad. Formatera on save. Formatering diskuteras aldrig i en PR.

## Datahämtning

TanStack Query hanterar all serverdata. Hämta aldrig med `useEffect` + `useState`.

Servicen ligger i modulens `services/` och är typad:

```ts
// Hämtar populära filmer från TMDB för angiven sida.
export const getPopularMovies = async (page = 1): Promise<MovieListResponse> => {
  const { data } = await axiosClient.get<MovieListResponse>('/movie/popular', { params: { page } });
  return data;
};
```

Hooken ligger i modulens `hooks/` och kopplar bara ihop query och service. `queryKey` beskriver anropet och alla dess parametrar: `['movies', 'popular', page]`.

## Design och MUI

- MUI:s komponenter före egen HTML och CSS. Skapa inga nya `.css`-filer.
- Färger i `src/styles/colors.tsx`, temat i `src/styles/theme.tsx`. Hårdkoda aldrig en hex-kod i en komponent.
- Styling sker via `sx`-propen eller `styled()`.
- Tillgänglighet (WCAG): alt-texter på bilder, riktiga `<button>`-element för klick, kontrast som kommer från temat.

## Miljövariabler

- `.env.local` (git-ignorerad via `*.local`) håller `VITE_TMDB_BASE_URL` och `VITE_TMDB_API_KEY`.
- Nyckeln är TMDB:s *API Read Access Token* och skickas som `Bearer` i `axiosClient`.
- Vite exponerar bara variabler som börjar med `VITE_` för webbläsarkoden.
- En nyckel skrivs aldrig i en `.ts`-fil och `.env.local` följer aldrig med en commit.

## Git-arbetsflöde

`main` är skyddad — allt går via Pull Request.

1. `git checkout main && git pull`
2. `git checkout -b feature/<ticketnummer>`
3. Commits på svenska, alla inom samma ticket
4. PR med `Closes #<ticketnummer>` i beskrivningen så att ticketen stängs vid merge
5. Merga och dra ticketen till Done

En PR håller sig till en ticket. Dyker något annat upp på vägen blir det en ny ticket, inte en extra fil i den här PR:en.

## Dokumentation

| Fil | Innehåll |
|---|---|
| `README.md` | vad projektet är, hur man startar det, kommandon, git-flöde |
| `docs/ARKITEKTUR.md` | lagren, dataflödet, ansvarsfördelning och motiven bakom dem |
| `docs/RECEPT.md` | steg för steg för återkommande uppgifter |

**Dokumentationen uppdateras i samma PR som ändringen**, inte efteråt. Ett dokument som beskriver en arkitektur projektet vuxit ifrån är sämre än inget dokument, eftersom det läses som sanning.

Kontrollera efter varje feature om något av följande gäller:

- Nytt lager, ny mapp eller ändrat dataflöde → `ARKITEKTUR.md` avsnitt 1 och 3
- Nytt bibliotek eller nytt mönster → `ARKITEKTUR.md`, relevant avsnitt
- Något under "Vad som medvetet inte är gjort" är nu gjort → ta bort den punkten
- Ändrad uppstart, bygg eller konfiguration → `README.md`
- Ny datafälla i TMDB:s svar → `ARKITEKTUR.md` avsnitt 10

En ny komponent eller ett nytt endpoint som följer befintliga mönster behöver ingen uppdatering — mönstret är redan beskrivet.
