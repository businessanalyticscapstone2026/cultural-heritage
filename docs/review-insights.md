# Review insights (CHT-135 DSS integration)

Review data feeds the Decision Support System through **derive-on-read** server
aggregation, matching the existing DSS modules (recommendation monitoring, MTO
dashboard insights). Nothing is persisted and recommendation scoring is not
changed.

- Pure logic: `features/review-insights/utils/scoring.ts`, `utils/build-insights.ts`
- Config (all weights and thresholds): `features/review-insights/config.ts`
- Server aggregation and cache: `features/review-insights/services/index.ts`
  (`unstable_cache`, tag `CACHE_TAGS.reviewInsights`, TTL `CACHE_REVALIDATE_SECONDS` = 60 s;
  the tag is revalidated when a review is submitted, edited, deleted or reported)
- Shown in: MTO dashboard insights strip (`getAllDashboardDataAction`), scoped
  server-side to the MTO user's own municipality via `lib/mto-scope.ts`.

> **Status:** the ticket gives no formulas. Everything below is a default
> and needs product sign-off. Tune values in `config.ts` only.

## Inputs

Published reviews only, with no reviewer identity: overall `rating`, criteria
scores, tag keys, whether media is attached, comment length and `created_at`.
Legacy single-rating reviews have no criteria rows.

| Window | Default | Used by |
| --- | --- | --- |
| `satisfactionWindowDays` | 365 days | satisfaction index, global prior |
| `recentWindowDays` | 90 days | engagement score, alerts |

## Satisfaction index (0-100)

1. Per criterion *c*, `mean_c` = mean over the site's reviews of the criterion
   score. A legacy review (no criteria) contributes its overall `rating` to
   every criterion.
2. `siteMean` = Σ wᶜ · mean_c / Σ wᶜ, using `criterionWeights`
   (site condition 0.2, cultural value 0.2, others 0.15 each).
3. Bayesian shrinkage toward the global mean *G* (mean review stars across all
   published reviews in the window, any municipality; fallback 3.5):
   `shrunk = (n · siteMean + m · G) / (n + m)`, prior weight `m = 5`.
4. `index = (shrunk − 1) / 4 · 100`, rounded to one decimal. Null when n = 0.

Example: one 5-star review, G = 3 → (5 + 15) / 6 = 3.33 stars → 58.3.

## Engagement score (0-100)

Over reviews in the recent window (score 0 when there are none):

| Component | Definition | Weight |
| --- | --- | --- |
| volume | `min(1, ln(1+n) / ln(1+50))` | 0.40 |
| mediaShare | share of reviews with photos/video | 0.15 |
| tagShare | share of reviews with at least one tag | 0.10 |
| textShare | share with comment length of 40 characters or more | 0.15 |
| recency | `0.5 ^ (days since newest review / 30)` | 0.20 |

`score = 100 · Σ weight · component`.

## Alerts

There is a minimum-sample guard: no alert fires unless the site has 5 or more
reviews (`alerts.minSampleSize`) in the relevant window.

**Maintenance:** in the recent window, any of:
- the mean of `site_condition` or `safety` is ≤ 3.0. Only actual criterion
  ratings count (at least 5 of them), never the legacy fallback;
- 30% or more of recent reviews carry a maintenance tag (`poor_signage`,
  `needs_repair`, `dirty_restrooms`, `unsafe_area`. These are the tags marked
  `maintenance: true` in `features/reviews/constants.ts`).

**Promotion:** all of:
- satisfaction index ≥ 80 with at least 5 reviews in the satisfaction window;
- engagement score is among the lowest `ceil(peers × 0.2)` peers. The 0.2 is
  `UNDER_PROMOTION_PERCENTILE_THRESHOLD`, reused from recommendation monitoring.
  Peers are the published sites in the same municipality;
- at least 3 peer sites.

Each alert includes human-readable `reasons`. The dashboard shows a "Visitor
Satisfaction" card (review-weighted mean index), followed by up to 4 alerts,
maintenance first.

## Not done by default (needs a decision)

- **Persisting alerts** (acknowledge/dismiss/history). This needs a write path
  outside the user's RLS (a SECURITY DEFINER function or a service-role job).
- **Using satisfaction in tourist recommendations.** The single hook is
  `computePopularityScore` in `features/recommendation/services/index.ts`.
  Changing it alters tourist-facing rankings.
