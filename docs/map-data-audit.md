# Heritage Map data audit

Snapshot of the live database (project `geugkzfhhespvaxcvuey`), taken 2026-11-24 with read-only `SELECT` queries (`supabase db query --remote --read-only`). Nothing was changed.

> Update 2026-11-24: 8 of these Taal sites (2 unpinned, 6 on the shared point) were later given approved street-level `approximate` coordinates; see `docs/proposed-coordinates.csv` (confidence `street`). Now: 97 pinned, 8 without coordinates, 45 on the shared point, 49 distinct locations.

## Summary

- Sites: **105**, all `published` + `public`.
- With coordinates: **95**, at **45** distinct locations.
- Without coordinates: **10** (all in Taal).
- Coordinates shared by more than one site: **1** location(s), holding **51** sites.

Why the map looked wrong: the header counted 95 pinned sites, but 51 of them were drawn on the same point (the Taal town centre, `13.8808, 120.9225`), so they looked like one pin. The map now draws one marker per location with a count badge ("51") that fans out into the individual pins on click, and lists the 10 unpinned sites as "No pin yet".

## Per municipality

| Municipality | Total | With coords | Without coords | Distinct pin locations |
|---|---:|---:|---:|---:|
| Balayan | 7 | 7 | 0 | 7 |
| Calaca | 6 | 6 | 0 | 6 |
| Calatagan | 5 | 5 | 0 | 5 |
| Lemery | 3 | 3 | 0 | 3 |
| Lian | 3 | 3 | 0 | 3 |
| Nasugbu | 4 | 4 | 0 | 4 |
| Taal | 74 | 64 | 10 | 14 |
| Tuy | 3 | 3 | 0 | 3 |
| **All** | **105** | **95** | **10** | **45** |

## Sites sharing identical coordinates

These look like a placeholder (town-centre) coordinate, not the real location. They have **not** been changed. Each needs its real location from the MTO (GIS page, open the site, **Click Map to Pin**). Proposed street-level positions for some of them are in `docs/proposed-coordinates.csv`.

### 13.880800, 120.922500: 51 sites (Taal)

| # | Site | Barangay | Address | geo_accuracy |
|---:|---|---|---|---|
| 1 | Abelardo and Milagros Amponin | Poblacion 12 | — | — |
| 2 | Abelardo Atienza Jr. House | Balisong | — | — |
| 3 | Agido Mendoza | Poblacion 3 | Barangay Zone 3 Taal, Batangas | — |
| 4 | Aguido & Antonia Medina Cabrera | Poblacion 1 | — | — |
| 5 | Amerfino Punzalan | Balisong | — | — |
| 6 | Aproniano Noche | Poblacion 12 | — | — |
| 7 | Aquilino Mangubal | Poblacion 12 | — | — |
| 8 | Baldomero Morales | Poblacion 1 | : C. Ilagan St., Poblacion 1 Taal Batangas | — |
| 9 | Baldoz Family | Tatlong Maria | — | — |
| 10 | Belinda Maullon | Poblacion 4 | — | — |
| 11 | Bernales & Calanog House | Poblacion 7 | — | — |
| 12 | Candida Atienza Noche | Poblacion 6 | — | — |
| 13 | Carmino Ylagan at Ambrocia Noble Ylagan | Poblacion 2 | Marella and Del Castillo St., Pobalcion 2 Taal Batangas | — |
| 14 | Caryl De Sagun | Mahabang Ludlod | — | — |
| 15 | Celerino Orlina | — | Bonifacio St., Taal Batangas | — |
| 16 | Clemencia Banaag House | Poblacion 1 | M.H. Del Pilar St., Poblacion 1 Taal Batangas | — |
| 17 | Constasia Semana | Balisong | — | — |
| 18 | Consuela Quijano And  Juaquin Atienza | Poblacion 3 | — | — |
| 19 | Dado Ona’s House | Balisong | — | — |
| 20 | Dimetrio Atienza | Bihis | — | — |
| 21 | Editha Atanacio | Seiran | — | — |
| 22 | Ernesto Alvarez | Poblacion 1 | 03 R. Noble St., Taal Poblacion 4208 Batangas | — |
| 23 | Estelita Eder Arcibal | Poblacion 3 | — | — |
| 24 | Eugenio Monica | Poblacion 4 | — | — |
| 25 | Flavianolota at Juana Cabrera | Poblacion 2 | M.H. Del Pilar St., Poblacion 2 Taal Batangas | — |
| 26 | Francisco Atienza | Poblacion 12 | — | — |
| 27 | Gloria Puyo | Poblacion 7 | — | — |
| 28 | Iluminado Villalobos Sr. | Poblacion 4 | — | — |
| 29 | Isabel Hernandez | Seiran | — | — |
| 30 | Joselina Dela Vega | Poblacion 4 | — | — |
| 31 | Juan Esteban & Violeta Villostas Loyola | Poblacion 7 | — | — |
| 32 | Lita Manguera | Tatlong Maria | — | — |
| 33 | Lorie De Leon | Poblacion 7 | — | — |
| 34 | Lourdes Montenegro Abacin | Poblacion 2 | C. Marella St., Poblacion 2 Taal Batangas | — |
| 35 | Lourdes Tadigue | Poblacion 7 | — | — |
| 36 | Mario Panganiban | Poblacion 1 | — | — |
| 37 | Martin Solis Ancestral House | Poblacion 2 | C. Marella St., Poblacion 2 Taal Batangas | — |
| 38 | Maximo Cabrera | Poblacion 12 | — | — |
| 39 | Melicia Santos | Seiran | — | — |
| 40 | Mercedes Cosico | Poblacion 1 | M.H. Del Pilar St., Poblacion 1 Taal Batangas | — |
| 41 | Nilo Bautista | Poblacion 2 | C. Marella St., Poblacion 2 Taal Batangas | — |
| 42 | Norma Zalameda | Tatlong Maria | — | — |
| 43 | Okada Salazar Barrion House | Poblacion 13 | — | — |
| 44 | Paula Cabrera | Poblacion 7 | — | — |
| 45 | Ramon Caraos | Poblacion 6 | — | — |
| 46 | Rivera’s House | Balisong | — | — |
| 47 | Simeon Huelgas | Bihis | — | — |
| 48 | Soledad M. Cabera, Remedios Medina at Gliceria Medina | Poblacion 11 | — | — |
| 49 | Susan Cuasay At Pamilya | Poblacion 5 | — | — |
| 50 | Vicente Delas Alas | Poblacion 13 | — | — |
| 51 | Zeniada Martinez Atienza | Poblacion 4 | — | — |

## Sites without coordinates

Shown in the tourist sidebar as "No pin yet" (searchable, opens in the detail panel), not drawn on the map. Listed for MTO staff under **Needs coordinates** on the MTO GIS page.

| # | Site | Municipality | Barangay | Address |
|---:|---|---|---|---|
| 1 | Benito Reyes | Taal | Poblacion 4 | — |
| 2 | Benito Reyes and Rosalinda Reyes | Taal | Poblacion 2 | C.H. Del Castillo St., Poblacion 2 Taal Batangas |
| 3 | Derosalio Montenegro Ilagan And Nicasia Ilagan | Taal | Poblacion 12 | — |
| 4 | Emilia Estacio | Taal | Poblacion 11 | — |
| 5 | Emmanuel Noble | Taal | Poblacion 7 | — |
| 6 | Jose Punzalan Noche and Natividad Sison Noche | Taal | Poblacion 1 | 03 R. Noble St., Taal Poblacion 4208 Batangas |
| 7 | Legarda House | Taal | Poblacion 12 | — |
| 8 | Librada Austria & Ano Ruben Austria | Taal | Poblacion 12 | — |
| 9 | Merlita Inocencio | Taal | Tatlong Maria | — |
| 10 | Ramon Estacio House | Taal | Poblacion 11 | — |

## Other data notes

- `geo_accuracy` uses mixed values: null (90), `""` (1), `High` (4), `exact` (5), `approximate` (5). The MTO form offers `Exact` / `Approximate` / `Unverified`. The map shows "Approximate location" only for `approximate`.
- Only 1 municipality has an uploaded boundary in `municipal_boundaries` (not Taal). The Part D boundary check used the OpenStreetMap boundary of Taal (relation 10329925).
