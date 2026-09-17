# Arkitektur

Det här dokumentet förklarar hur koden är organiserad och **varför**. Reglerna i [CLAUDE.md](../CLAUDE.md) säger vad som gäller; det här säger vad de är till för.

Kortversionen: datan går åt ett håll, och varje lager vet så lite som möjligt om de andra.

```
page → hook → service → axiosClient → TMDB
```

---

## 1. Mappstrukturen

```
src/
  modules/<feature>/     allt som hör till en funktion i appen
    components/          komponenter som bara används i den här modulen
    hooks/               TanStack Query-hookar
    pages/               vyer som routern pekar på
    services/            API-anrop, returnerar typad data
    types/               modeller för API-svaren
  shared/
    api/axiosClient.ts   konfigurerad Axios-instans
    components/          komponenter som används av flera moduler
    forms/               formulärkomponenter
  styles/                colors.tsx och theme.tsx
  templates/             sidlayouter
```

### Regeln som håller ihop det

**En modul äger sin egen kod tills någon annan behöver den.** `MovieCard` ligger i `modules/movies/components/` eftersom bara filmmodulen använder den. Skulle en TV-modul behöva samma kort flyttas den till `shared/components/` — inte kopieras.

Poängen är att kunna ta bort en hel funktion genom att radera en mapp. Ligger filmkoden utspridd i `components/`, `hooks/` och `services/` efter *filtyp* i stället för efter *funktion*, måste du leta i fem mappar för att hitta allt som rör filmer.

### Varför inte en mapp per filtyp?

Det vanliga nybörjarupplägget är `src/components/`, `src/hooks/`, `src/services/`. Det fungerar upp till ungefär tjugo filer. Sedan innehåller `components/` fyrtio komponenter från åtta olika delar av appen, och du kan inte se vilka som hör ihop.

Feature-indelningen kostar en mappnivå extra och ger i gengäld att relaterad kod ligger bredvid varandra.

---

## 2. Atomic Design — och vad "delvis" betyder

Apptechs kodregler säger:

> Vi följer **delvis** Atomic design pattern för att bryta ner komponenter och göra dem återanvändbara. Ibland är det dock bättre att göra en "egen" komponent än att försöka göra allt dynamiskt.

Ordet *delvis* bär mer än det ser ut att göra. Det här avsnittet förklarar vad modellen är, vad som faktiskt tillämpas här, och vad som medvetet utelämnas.

### Modellen

Atomic Design (Brad Frost) delar gränssnittet i fem nivåer efter **storlek och sammansättning**:

| Nivå | Vad det är | Exempel |
|---|---|---|
| **Atom** | minsta byggsten, går inte att dela upp | knapp, textfält, etikett |
| **Molekyl** | några atomer som tillsammans gör en sak | sökfält = etikett + input + knapp |
| **Organism** | större, självständig del av gränssnittet | sidhuvud, ett rutnät av kort |
| **Template** | sidans layout utan riktigt innehåll | "rubrik överst, innehåll i mitten" |
| **Page** | en template fylld med riktig data | Populära filmer |

### Vad som finns som mappar här

Bara de **två översta nivåerna** har egna mappar: `templates/` och `pages/`. Atomer, molekyler och organismer har det inte.

Det är inte slarv. **MUI är projektets atombibliotek.** Du bygger inte `Button`, `Card`, `Typography` eller `Chip` — de kommer färdiga, och temat i `styles/` ger dem projektets utseende. Att välja ett UI-ramverk *är* att köpa de tre understa nivåerna färdiga.

Kvar att bygga själv är det som är specifikt för just den här appen.

### Var koden landar i modellen

| Nivå | I det här projektet |
|---|---|
| Atom | MUI:s egna komponenter — `Card`, `Typography`, `Chip`, `CircularProgress` |
| Molekyl / organism | [`MovieCard`](../src/modules/movies/components/movieCard.tsx) — sätter ihop bild, titel, årtal och betyg till en enhet |
| Organism | rutnätet av kort, ligger i dag direkt i `MovieListPage` |
| Template | `templates/pageTemplate.tsx` — **mappen finns men är tom** |
| Page | [`MovieListPage`](../src/modules/movies/pages/movieListPage.tsx), [`MovieDetailsPage`](../src/modules/movies/pages/movieDetailsPage.tsx) |

### Det första "delvis": inga atom-mappar

Strukturen grupperar efter **funktion** (`modules/movies/`), inte efter storleksnivå. Det finns ingen `atoms/`-mapp att leta i.

De två modellerna svarar nämligen på olika frågor, och krockar därför inte:

* **Atomic Design:** *hur stor ska den här komponenten vara, och vad ska den innehålla?*
* **Modulindelningen:** *i vilken mapp ska filen ligga?*

Du använder Atomic Design när du bestämmer om något ska brytas ut, och modulindelningen när du bestämmer var det hamnar.

### Det andra "delvis": allt ska inte göras generiskt

Detta är den mening i Apptechs dokument som är lättast att missa, och den som sparar mest tid.

`MovieCard` tar emot en `Movie`. Inte `{ title, imageUrl, subtitle, badge }`.

Den är alltså avsiktligt **om filmer**, inte ett generiskt kort. En generisk kortkomponent hade behövt fem props där varje prop bara används av ett anropsställe, plus villkor för de fall där någon prop saknas. Den blir svårare att läsa än de två komponenter den ersätter.

Regeln som följer av det: **gör det generiskt vid tredje upprepningen, inte vid den första.** Två liknande komponenter är billigare än en abstraktion som är fel.

### Där templaten börjar behövas

`templates/` är tom i dag, men upprepningen har redan börjat. Båda sidorna inleds likadant:

```tsx
<Container sx={{ py: 4 }}>
```

Vid en tredje sida bryts det ut till ett `pageTemplate.tsx` — sidans ram på ett ställe, innehållet som `children`. Det är DRY-regeln tillämpad på layout, och det är precis vad `templates/`-mappen är avsedd för.

### En not om Feature-Sliced Design

`modules/<feature>/`-upplägget liknar **Feature-Sliced Design (FSD)**, en annan namngiven metodik med en fast lagerstack (`app` → `pages` → `widgets` → `features` → `entities` → `shared`) och regeln att import bara får gå nedåt.

Likheten är verklig — båda grupperar efter funktion — men **FSD är inte den modell Apptech refererar till**, och det här projektet har varken lagerstacken eller den kontrollerade importriktningen.

Kalla därför strukturen **feature-baserad** eller **modulbaserad**. Säger du "FSD" förväntar sig den som kan FSD att hitta lagren, och blir förvirrad.

---

## 3. Dataflödet steg för steg

Följ en enda förfrågan — *hämta populära filmer* — hela vägen ner och tillbaka.

```
MovieListPage            "jag behöver populära filmer"
      |   usePopularMovies()
      v
usePopularMovies         cache-nyckel och cachepolicy
      |   useQuery({ queryKey, queryFn })
      v
TanStack Query           finns svaret redan? annars kör queryFn
      |   getPopularMovies(page)
      v
movieService             vilken endpoint, vilka parametrar, vilken typ
      |   axiosClient.get('/movie/popular', { params: { page } })
      v
axiosClient              baseURL och Authorization-header
      |   HTTPS
      v
TMDB
```

### Ner

**1. Sidan frågar efter data.** [`movieListPage.tsx`](../src/modules/movies/pages/movieListPage.tsx) anropar hooken. Den vet inte att TMDB finns.

```tsx
const { data, isPending, isError, error } = usePopularMovies();
```

**2. Hooken översätter frågan till en cache-fråga.** [`usePopularMovies.ts`](../src/modules/movies/hooks/usePopularMovies.ts) lägger till det enda den ansvarar för: en nyckel som beskriver anropet.

```ts
export const usePopularMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => getPopularMovies(page),
  });
```

**3. TanStack Query kollar cachen.** Finns ett färskt svar under nyckeln returneras det direkt och inget nätverksanrop sker. Annars körs `queryFn`.

**4. Servicen bestämmer *vad* som ska hämtas.** [`movieService.ts`](../src/modules/movies/services/movieService.ts) kan endpointen, parametrarna och svarets form — men inget om React.

```ts
export const getPopularMovies = async (page = 1): Promise<MovieListResponse> => {
  const { data } = await axiosClient.get<MovieListResponse>('/movie/popular', { params: { page } });
  return data;
};
```

**5. axiosClient lägger på det som är gemensamt för alla anrop.** [`axiosClient.ts`](../src/shared/api/axiosClient.ts) sätter `baseURL` och `Authorization`-headern. Därför står det `/movie/popular` i servicen och inte hela adressen, och därför finns API-nyckeln på ett enda ställe i kodbasen.

### Tillbaka upp

**6. Axios tolkar JSON-svaret** och servicen returnerar `data` — typad som `MovieListResponse`, inte `any`.

**7. Query sparar svaret** under nyckeln `['movies', 'popular', 1]` och markerar det som färskt i fem minuter (`staleTime` i [`main.tsx`](../src/main.tsx)).

**8. Hooken returnerar tillståndet** till sidan: `data`, `isPending`, `isError`.

**9. Sidan renderar.** Först vakterna, sedan rutnätet:

```tsx
if (isPending) return <CircularProgress />;
if (isError) return <Alert severity="error">{error.message}</Alert>;
```

Ordningen är inte kosmetisk. Efter de två vakterna vet TypeScript att `data` är definierad, så `data.results` kompilerar utan `?.` eller `!`. Kastar du om dem får du byggfel.

**10. Varje film blir ett kort.** `MovieCard` får en `Movie` som prop och anropar `buildPosterUrl` för bildadressen. Den vet inte att datan kom från ett nätverksanrop — för den hade den lika gärna kunnat vara påhittad.

### Vad varje steg tillförde

| Steg | Tillför |
|---|---|
| Sidan | vet *att* den behöver data |
| Hooken | cache-nyckel och cachepolicy |
| Query | cachning, laddnings- och feltillstånd |
| Servicen | endpoint, parametrar, typ |
| axiosClient | adress och autentisering |

Ta bort ett steg och dess ansvar måste läggas någon annanstans. Det är hela motiveringen till kedjan.

---

## 4. Ansvarsfördelning

Den bärande frågan för varje fil är: **vad får den här filen känna till?**

| Lager | Känner till | Känner *inte* till |
|---|---|---|
| **Service** | HTTP, TMDB:s endpoints, svarsformat | React, cache, hur datan visas |
| **Hook** | React, TanStack Query, servicen | Axios, URL:er, JSX |
| **Page** | hooken, sidans layout, vilka komponenter som ingår | HTTP, cachedetaljer |
| **Component** | sina props och temat | var datan kom ifrån |

### Page kontra component

Det här är den skillnad som oftast suddas ut.

En **page** är en vy som routern pekar på. Den får hämta data, den äger sidans layout, och den finns i exakt en instans åt gången. [`movieListPage.tsx`](../src/modules/movies/pages/movieListPage.tsx) anropar hooken, hanterar laddning och fel, och bestämmer att filmerna ska ligga i ett rutnät.

En **component** tar emot allt den behöver via props. Den hämtar ingenting och finns i många instanser samtidigt. [`movieCard.tsx`](../src/modules/movies/components/movieCard.tsx) får en `Movie` och renderar den.

Testet: **kan komponenten renderas med påhittad data?** Kan den det är den en component. Behöver den ett nätverk för att visa något alls är den en page — eller så har den fått för mycket ansvar.

---

## 5. Varför just så — konsekvenserna

Regler utan konsekvenser är godtyckliga. Här är vad indelningen faktiskt ger.

**Servicen importerar inte React.** Följd: `getPopularMovies` går att anropa från ett test, ett skript eller en server utan att rendera något. Hade `useQuery` legat inne i servicen vore den låst till en React-komponent.

**`MovieCard` hämtar inte sin egen data.** Följd: samma kort kan användas för sökträffar, "liknande filmer" och favoriter utan en rad ändring. Hade den anropat `usePopularMovies` internt hade den bara kunnat visa populära filmer — och tjugo kort på en sida hade betytt tjugo anrop.

**All HTTP går genom `axiosClient`.** Följd: dagen du behöver logga alla anrop, lägga till en retry eller byta autentisering ändrar du en fil. Anropar komponenter `axios` direkt får du leta upp varenda anropsställe.

**Typerna ligger i modulen, inte hos anroparen.** Följd: `MovieListResponse` beskriver TMDB:s svar en gång, och både service, hook och sida syftar på samma definition. Ändrar TMDB sitt svar får du ett byggfel på ett ställe.

---

## 6. TanStack Query i det här projektet

All serverdata går genom Query. Vi hämtar aldrig med `useEffect` + `useState`.

**Varför inte `useEffect`?** Därför att du då själv får skriva laddningstillstånd, feltillstånd, avbrytande vid omontering, dubbelhämtning i StrictMode, cachning och omhämtning. Query gör allt det, och gör det likadant varje gång.

### `queryKey` — cachens adress

```ts
queryKey: ['movies', 'popular', page]
```

Nyckeln beskriver anropet **och alla parametrar som påverkar svaret**. Utesluts `page` skulle sida 2 skriva över sida 1 i cachen, och båda visa samma filmer. Nyckeln är också det du använder för att invalidera cachen senare.

### `staleTime` — hur länge data räknas som färsk

Satt till fem minuter för hela appen i [`main.tsx`](../src/main.tsx). Under den tiden återanvänds cachen när en komponent monteras om, i stället för att gå om till TMDB.

**Cachen ligger i minnet.** En riktig omladdning av sidan (F5) river den — det krävs persistering till `localStorage` för att överleva det, vilket vi medvetet inte gjort.

### `enabled` — köra eller inte

[`useMovieDetails`](../src/modules/movies/hooks/useMovieDetails.ts) tar ett id som kan saknas, eftersom `useParams` returnerar `string | undefined`:

```ts
enabled: Boolean(id),
```

En hook får aldrig ligga bakom en `if` — React kräver samma antal hookanrop varje rendering. `enabled` är lösningen: hooken anropas alltid, men anropet görs inte.

Kontrollen inne i `queryFn` finns för TypeScripts skull. `enabled` är ett körningsvillkor som typsystemet inte ser, så utan den kontrollen krävs en `as`-konvertering.

### `QueryClient` skapas utanför komponentträdet

Cachen bor i den instansen. Skapas den inne i en komponent slängs hela cachen vid varje omrendering.

---

## 7. TypeScript-reglerna som biter

Tre inställningar i [`tsconfig.app.json`](../tsconfig.app.json) gör att vanliga mönster inte kompilerar. De är påslagna med flit.

### `verbatimModuleSyntax`

Typer måste importeras med `import type`:

```ts
import type { Movie } from '../types/movie'; // rätt
import { Movie } from '../types/movie';      // byggfel
```

**Varför:** kompilatorn ska kunna ta bort typimporter utan att gissa. En `import` utan `type` blir kvar i det byggda paketet och kan dra in en hel fil i onödan.

### `erasableSyntaxOnly`

`enum`, `namespace` och parameter-properties är förbjudna. Använd union eller `as const`:

```ts
export const POSTER_SIZES = ['w185', 'w342', 'w500', 'original'] as const;
export type PosterSize = (typeof POSTER_SIZES)[number];
```

**Varför:** ett `enum` genererar körbar JavaScript-kod. Resten av TypeScript försvinner vid kompilering — enum:ar gör det inte, och blir därför ett undantag att hålla reda på. `as const` ger samma typsäkerhet utan kod i bygget.

### `noUnusedLocals` / `noUnusedParameters`

En oanvänd variabel eller parameter stoppar bygget.

**Varför:** oanvänd kod är nästan alltid rester av något halvfärdigt. Som varning ignoreras den; som byggfel städas den bort.

Dessutom: `any` är förbjudet (`noImplicitAny`). Saknas en typ för ett TMDB-svar skrivs den i modulens `types/`-mapp utifrån API-dokumentationen.

---

## 8. MUI-temat

Kedjan är: **[`colors.tsx`](../src/styles/colors.tsx) → [`theme.tsx`](../src/styles/theme.tsx) → `sx`-propen.**

`colors.tsx` är enda stället i kodbasen där en hex-kod får stå skriven. `theme.tsx` mappar färgerna till MUI:s palett. Komponenterna slår upp dem med namn:

```tsx
sx={{ bgcolor: 'action.hover', color: 'text.secondary' }}
```

**Varför inte hårdkoda `#171C24` i komponenten?** För att färgen då finns på två ställen. Ändrar du bakgrunden i `colors.tsx` följer alla komponenter med automatiskt — utom den som har egen hex-kod, och den kommer du inte att hitta förrän någon ser den.

Kontrastvärdena i `colors.tsx` är valda för att nå WCAG AA. En komponent som väljer egen färg kringgår den kontrollen.

---

## 9. Routing

[`App.tsx`](../src/App.tsx) innehåller bara routing. Varje sida hämtar sin egen data.

```tsx
<Route path="/" element={<MovieListPage />} />
<Route path="/movie/:id" element={<MovieDetailsPage />} />
```

### Varför `BrowserRouter` och inte `createBrowserRouter`

React Router v7 har två sätt att sätta upp routing. `createBrowserRouter` ger *loaders*, som hämtar data innan sidan renderas.

Vi använder det inte, eftersom TanStack Query redan är projektets datalager. Två system som båda hämtar data betyder två cachar, två laddningstillstånd och två ställen att felsöka. Routern sköter adressen, Query sköter datan.

### Navigering sker med länkar, inte klickhanterare

`MovieCard` använder `CardActionArea component={RouterLink}`, vilket ger ett riktigt `<a href="/movie/969681">` i DOM:en.

En `onClick` på ett `<div>` hade sett likadan ut på skärmen men inte gått att nå med Tab, inte gått att öppna i ny flik och inte lästs upp som en länk av en skärmläsare.

### Direktlänkar kräver SPA-fallback vid deploy

`yarn dev` skickar alla adresser till `index.html`, så `/movie/123` fungerar direkt i adressfältet. En riktig webbserver måste konfigureras att göra samma sak, annars ger direktlänkar och omladdningar 404. Det är inte ett kodfel utan en serverinställning — aktuellt först vid deploy.

---

## 10. TMDB:s datafällor

TMDB markerar saknad data på **tre olika sätt** beroende på fält. Det här är den vanligaste källan till buggar i projektet, och siffrorna nedan är uppmätta mot API:et, inte hämtade ur dokumentationen.

| Saknas som | Fält | Uppmätt |
|---|---|---|
| `null` | `poster_path`, `backdrop_path`, `imdb_id` | poster saknades i 36 av 76 minst populära filmer |
| **tom sträng** | `overview`, `release_date`, `tagline`, `homepage` | `release_date` tom i 15 av 30, `tagline` i 18 av 30 |
| **0** | `runtime`, `budget`, `revenue` | `runtime` var 0 i 9 av 30 |

### Vad det betyder i koden

**En null-koll räcker inte.** `movie.release_date !== null` är `true` för en tom sträng. Kontrollera sanningsvärdet i stället:

```ts
const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : null;
```

**`new Date('')` ger `Invalid Date`** och renderar texten "NaN". Därför `slice(0, 4)` för årtal.

**0 betyder okänt, inte noll.** En film med `runtime: 0` är inte noll minuter lång — speltiden är okänd. `vote_average: 0` är inte betyget noll utan "inga röster". Därför döljs betyget helt när `vote_count` är 0; annars ser saknad data ut som ett uselt omdöme.

En bieffekt av att kontrollera sanningsvärde: koden tål även att fältet saknas helt. `/discover/movie` utelämnar ibland `release_date` och `vote_count`, alltså `undefined` snarare än tom sträng — vakterna täcker det utan ändring.

---

## 11. Vad som medvetet inte är gjort

Ett dokument som bara beskriver det som finns får det att se ut som att inget saknas.

**Koddelning.** Hela appen ligger i ett paket, och bygget varnar sedan detaljsidan tillkom (över 500 kB). Fixen är `React.lazy` per route. Görs när fler sidor tillkommer.

**Paginering.** `page` finns hela vägen genom service och hook, men inget anropar med annat än 1. Grunden ligger — det saknas bara ett gränssnitt.

**Persisterad cache.** Cachen ligger i minnet och försvinner vid omladdning. Att överleva F5 kräver `@tanstack/react-query-persist-client` och en storage-persister, alltså två nya paket.

**Delade komponenter.** `shared/components/` och `shared/forms/` är tomma. Först när en andra modul behöver något flyttas det dit — inte i förebyggande syfte.

**Tester.** Inga finns. Servicelagret är skrivet för att gå att testa utan React, men ingen testuppsättning är på plats.
