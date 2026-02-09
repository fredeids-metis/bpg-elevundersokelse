# BPG Elevundersokelsen

Standalone React-app (Vite) som viser resultater fra Utdanningsdirektoratets Elevundersokelse for Bergen Private Gymnas. Hostet på GitHub Pages.

## MetisVerse-modul

Denne appen er en **prototype/referanseimplementasjon**. Frontend er ikke gjenbrukbar, men **API-integrasjonen i `src/api.js` er malen** for en fremtidig Elevundersokelse-modul i MetisVerse.

Ved portering til MetisVerse: gjenbruk API-logikken, dropp React-frontenden.

## UDIR Statistikkbanken API

Base-URL: `https://api.statistikkbanken.udir.no/api/rest/v2/Eksport`

### Tabeller (Elevundersokelsen VGS)

| Tabell-ID | Innhold |
|-----------|---------|
| 152 | Indikatorer (Trivsel, Mestring, Laeringskultur, Motivasjon, Stotte fra laererne, Vurdering for laering) |
| 153 | Temaer (detaljerte sporsmal gruppert etter tema) |
| 154 | Mobbing (andel mobbet, ulike kategorier) |
| 155 | Deltakelse (svarprosent per trinn) |

### Filter-syntaks

Filtre sendes som query-parameter `filter=` med underscore-separerte nøkkelverdi-par:

```
filter=TidID(202301_202201)_Organisasjonsnummer(988602671)
```

#### Tilgjengelige filtre

| Filter | Beskrivelse | Eksempler |
|--------|-------------|-----------|
| `TidID(...)` | Skoleår-IDer (YYYYMM-format, MM=01 for hosten) | `202301` = 2023-24, `202201` = 2022-23 |
| `Organisasjonsnummer(...)` | Skolens orgnr | BPG: `988602671`, Metis VGS: `924680636` |
| `EnhetNivaa(1)` | Nasjonalt nivå (brukes istedenfor orgnr) | `1` = nasjonalt |
| `Nasjonaltkode(I)` | Hele landet (brukes med EnhetNivaa) | `I` = hele Norge |
| `EierformID(...)` | Eierform | `-10` = alle eierformer |
| `KjoennID(...)` | Kjønn | `-10` = alle kjønn |

#### Hente data for en spesifikk skole
```
GET /{tableId}/data?filter=TidID({yearIds})_Organisasjonsnummer({orgNr})&format=0&sideNummer=1&antallRader=10000
```

#### Hente nasjonalt gjennomsnitt
```
GET /{tableId}/data?filter=TidID({yearIds})_EnhetNivaa(1)_Nasjonaltkode(I)_EierformID(-10)_KjoennID(-10)&format=0&sideNummer=1&antallRader=10000
```

#### Hente tilgjengelige år
```
GET /152/filterStatus?filterId=TidID&filter=TidID(*)
```
Returnerer `{ TidID: [202301, 202201, ...] }`

### Responsformat

Responsen er JSON med `data`-array. Hvert objekt har felter som varierer per tabell:

**Tabell 152/153 (Indikatorer/Temaer):**
- `Skoleaarnavn` ("2023-24"), `TidID` (202301)
- `Spoersmaalgruppe` (indikator/tema-navn)
- `Spoersmaalnavn` ("Alle sporsmal" = aggregert)
- `Trinnnavn` ("Videregaende trinn 1" etc.)
- `Kjoenn` ("Alle kjonn", "Gutt", "Jente")
- `Score` (1.0-5.0, norsk tallformat med komma)
- `Standardavvik`, `AntallBesvart`

**Tabell 153 (Temaer) ekstra:**
- `Temanavn`, `SvaralternativNavn` ("Alle svar" = aggregert)
- `AndelBesvart`

**Tabell 154 (Mobbing):**
- `AndelMobbet` (prosent), `AntallBesvart`

**Tabell 155 (Deltakelse):**
- `AndelDeltatt` (prosent)

### Viktige gotchas

- Tall bruker **norsk format** (komma som desimalskilletegn): `"3,8"` -> `3.8`
- Filtrer på `Spoersmaalnavn === 'Alle sporsmal'` og `Kjoenn === 'Alle kjonn'` for aggregerte verdier
- `Trinnnavn` inneholder "trinn 1", "trinn 2", "trinn 3" (ikke "Vg1" etc.)
- Nasjonale data krever `EnhetNivaa(1)` + `Nasjonaltkode(I)` istedenfor `Organisasjonsnummer`
- `format=0` gir JSON, andre verdier gir CSV/Excel
- Maks `antallRader=10000` per request

## Filstruktur

```
src/
  api.js              # <-- UDIR API-integrasjon (gjenbrukbar for MetisVerse)
  hooks/useElevdata.js # React hook: datahenting + filtrering
  components/          # React-komponenter (IKKE gjenbrukbar)
```
