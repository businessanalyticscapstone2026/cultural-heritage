# Paper reconciliation: manuscript vs live system

Live counts from the production database, 2026-11-24, after the approved coordinate update (8 rows). Documented counts are from the paper, Table 4.1. The paper was not edited.

## Live counts vs documented inventory

| Municipality | Encoded (total) | Published + public | With coordinates | Without coordinates | Distinct pin locations | Documented (Table 4.1) | Coverage |
|---|---:|---:|---:|---:|---:|---:|---|
| Balayan | 7 | 7 | 7 | 0 | 7 | 8 | 87.5% |
| Calaca (paper: Calaca City) | 6 | 6 | 6 | 0 | 6 | 3 | 100% (documented count needs review: encoded > documented) |
| Calatagan | 5 | 5 | 5 | 0 | 5 | 4 | 100% (documented count needs review: encoded > documented) |
| Lemery | 3 | 3 | 3 | 0 | 3 | 4 | 75.0% |
| Lian | 3 | 3 | 3 | 0 | 3 | 4 | 75.0% |
| Nasugbu | 4 | 4 | 4 | 0 | 4 | 6 | 66.7% |
| Taal | 74 | 74 | 66 | 8 | 18 | 147 | 50.3% |
| Tuy | 3 | 3 | 3 | 0 | 3 | 4 | 75.0% |
| **Total** | **105** | **105** | **97** | **8** | **49** | **180** | **58.3%** |

Paper-ready sentence: *Of the 180 heritage sites documented in the inventory (Table 4.1), 105 (58.3%) are encoded in the system. All 105 are published. 97 have map coordinates and 8 do not; the 97 pinned sites occupy 49 distinct map locations, because 45 Taal sites still share a placeholder town-centre coordinate.*

*Of the 97, 8 Taal sites carry `geo_accuracy = 'approximate'` street-level positions (applied 2026-11-24 from `supabase/proposed/apply-proposed-coordinates.sql`; backup in `supabase/proposed/coordinates-backup.csv`).*

Live figures change as MTO staff add sites. The admin dashboard and the tourist map's Statistics panel ("Inventory Coverage") show the current values from the database, so re-check them before the final manuscript.

## Where the manuscript conflicts with the live data

| # | Manuscript | Live system | Note |
|---:|---|---|---|
| 1 | 101 sites encoded | 105 | 4 more sites were encoded after the manuscript figure was taken. |
| 2 | 80 sites published | 105 published (0 draft, 0 archived) | All encoded sites are published and public now. |
| 3 | 19 sites with coordinates | 97 with coordinates (49 distinct locations) | 45 of the 97 still share one placeholder point in Taal. |
| 4 | 180 documented sites | Not stored anywhere before this change | Now stored as `municipalities.documented_site_count` and shown as "Encoded X of 180 documented". |
| 5 | Calaca City: 3 documented | Calaca: 6 encoded | Encoded exceeds documented. Either Table 4.1 is out of date or some encoded Calaca sites are not part of the documented inventory. |
| 6 | Calatagan: 4 documented | Calatagan: 5 encoded | Same as row 5. |
| 7 | Table 4.4, Lemery row "89 / 2,225%" | Lemery: 3 encoded of 4 documented (75%) | The row values look shifted from another row or column; a percentage above 100% cannot be an encoding rate. Re-check the alignment of every Table 4.4 row against this table. |
| 8 | Municipality named "Calaca City" | Database name "Calaca" | Naming only; the seed matched on "Calaca". |

Only the Table 4.4 example given in the task (Lemery) was checked; the rest of Table 4.4 was not available to compare row by row.
