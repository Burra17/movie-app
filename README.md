# Movie App

En React-app som listar filmer från [TMDB](https://www.themoviedb.org/).
Byggd under LIA hos Apptech för att träna React, TypeScript, Axios, servicelager, TanStack Query och Material UI.

Projektet är ett **inlärningsprojekt**. Koden är skriven för att förstås, inte för att bli klar fort — därför är den kommenterad på svenska och arkitekturen dokumenterad i `docs/`.

## Krav

| | |
|---|---|
| Node | 20.20.2 — står i `.nvmrc`, kör `nvm use` |
| Pakethanterare | **yarn** (1.x) |

### Kör aldrig `npm install` här

Det skapar en `package-lock.json` bredvid `yarn.lock`. Två lockfiler betyder två olika sanningar om vilka versioner som gäller, och nästa person som klonar kan få andra paket än du har. Det har redan hänt en gång i det här projektet.

Har det ändå blivit gjort: ta bort `package-lock.json`, kör `yarn install` och committa inte lockfilen.

## Kom igång

```bash
yarn install
```

### Miljövariabler

Skapa `.env.local` i projektroten:

```
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_API_KEY=<din API Read Access Token>
```

Fyra saker att veta om dem:

* **Nyckeln är TMDB:s *API Read Access Token***, inte den kortare "API Key". Den hämtas på TMDB under Settings → API och är en lång sträng som börjar på `eyJ`.
* **Variablerna läses på exakt ett ställe:** [`src/shared/api/axiosClient.ts`](src/shared/api/axiosClient.ts). Där plockas de ur `import.meta.env` och används för att sätta `baseURL` och headern `Authorization: Bearer <token>`. Ingen annan fil i projektet rör miljövariabler — vill du veta var anslutningen till TMDB sker är det den filen.
* **Prefixet `VITE_` är obligatoriskt.** Vite exponerar bara variabler med det prefixet för webbläsarkoden. En variabel utan prefix blir `undefined` i klienten, utan felmeddelande.
* **`.env.local` committas aldrig.** Den matchas av `*.local` i `.gitignore`. En nyckel skrivs heller aldrig direkt i en `.ts`-fil.

### Starta

```bash
yarn dev
```

Appen ligger på http://localhost:5173.

## Kommandon

| Kommando | Gör |
|---|---|
| `yarn dev` | Dev-server med hot reload |
| `yarn build` | `tsc -b` följt av `vite build` |
| `yarn lint` | ESLint över hela projektet |
| `yarn preview` | Serverar den byggda `dist/` lokalt |

**`yarn build` är projektets kvalitetsgrind.** Den kör TypeScript-kompilatorn *före* Vite, och tsconfig är inställd så att vanliga slarvfel blir byggfel i stället för varningar — en oanvänd variabel stoppar bygget. Kör den före varje PR. Att `yarn dev` startar utan att klaga betyder inte att koden kompilerar.

## Mappstruktur

```
src/
  modules/movies/        allt som hör till filmer
    components/          MovieCard
    hooks/               usePopularMovies, useMovieDetails
    pages/               MovieListPage, MovieDetailsPage
    services/            movieService — anropen mot TMDB
    types/               Movie, MovieDetails
  shared/api/            axiosClient — all HTTP går genom den
  styles/                colors.tsx och theme.tsx för MUI-temat
```

Datan går åt ett håll: **page → hook → service → axiosClient → TMDB**.

Hela resonemanget bakom indelningen finns i [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md).

## Dokumentation

| Dokument | Läs det när du |
|---|---|
| [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md) | vill förstå hur lagren hänger ihop och varför |
| [docs/RECEPT.md](docs/RECEPT.md) | ska lägga till ett nytt anrop, en ny sida eller en ny komponent |
| [CLAUDE.md](CLAUDE.md) | vill se kodreglerna i kort form |

## Om något ser omöjligt ut

Kompilatorn är skiljedomare. Går `yarn build` igenom är koden på disk korrekt, oavsett vad editorn eller dev-servern påstår.

Två fällor som kostat tid i det här projektet, båda med symptom som pekar åt fel håll:

* **Dev-servern kan servera en gammal, tom version av en nyskapad fil.** Symptomet är en vit sida och `does not provide an export named ...` i webbläsarkonsolen, trots att exporten finns i filen. Starta om `yarn dev`.
* **VS Code kompilerar editorns buffert, inte disken.** Visar en flik filen som tom fast den har innehåll på disk, är det bufferten som är fel. Kör `File: Revert File` från kommandopaletten — spara inte. Ett `Ctrl+S` skriver då över den riktiga filen med ingenting.

## Git-arbetsflöde

`main` är skyddad — allt går via Pull Request.

1. `git checkout main && git pull`
2. `git checkout -b feature/<ticketnummer>`
3. Commits på svenska, alla inom samma ticket
4. PR med `Closes #<ticketnummer>` i beskrivningen, så stängs ticketen vid merge
5. Merga och dra ticketen till Done

En PR håller sig till en ticket. Dyker något annat upp på vägen blir det en ny ticket, inte en extra fil i den här PR:en.
