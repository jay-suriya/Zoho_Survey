---
name: survey-reports-docs
description: Check the Zoho Survey Reports help documentation before implementing or changing anything about survey reporting — CSAT, NPS, average rating, scoring, filters, trend/cross-tab reports, dashboards, exports, scheduling. Use whenever a metric's definition, formula, scale, or report layout is in question, so the mock matches the real product instead of an assumption.
---

# Zoho Survey Reports — check the docs first

Source of truth: **https://help.zoho.com/portal/en/kb/survey/reports**

The mock's reporting is only worth building if it matches the real product. Before
adding or changing a metric, a report layout, or a threshold, read the relevant
article and quote it back.

## How to use this skill

1. **Fetch the index** — `https://help.zoho.com/portal/en/kb/survey/reports` — and find the
   article that covers the question. Follow its link rather than guessing a slug; only two
   URLs are confirmed stable:
   - CSAT — `.../reports/csat-score/articles/csat-score`
   - Summary of Responses — `.../reports/summary-of-responses/articles/summary-of-responses`
2. **Fetch the article(s)** and pull out the exact formula, scale, bands and field names.
3. **Compare against the mock** before changing anything (see "Where the mock implements this").
4. **Report back with the quote and the URL.** If the doc is silent on something, say so
   explicitly rather than filling the gap silently — several things below are undocumented.

Articles in this section: Summary of Responses · Individual Responses · Custom Report ·
Trend Report · Cross-tab Report · CSAT Score · Response Notes · Share Report · Filters ·
Schedule Report · Delete Responses · Export Report · Print · Analysis · Dashboard.

Question types and Scoring live outside this section:
`.../survey-builder/question-types/...` and `.../survey-builder/advanced-options/scoring/...`.

## Already verified — don't re-derive these

Confirmed against the docs **and** against screenshots of the product's own report screens:

| Metric | Formula | Scale |
|---|---|---|
| **CSAT** | positives ÷ answered × 100 | 0–100 |
| **NPS** | (promoters − detractors) ÷ n × 100 | −100..+100 |
| **Average rating** | mean on each question's own "out of"; overall is response-weighted, normalised to /10 | per question |

- Both overalls are **response-weighted, never an average of the per-question figures**
  (4 ÷ 22 = 18.18, not 18.34).
- CSAT is produced by six question types: NPS, Rating Scale (Likert), Star Rating,
  Matrix Rating Scale, Matrix Star Rating, Image Star Rating.
- Positive bands: 3-point → 3 · 5-point → 4–5 · 10-point → 6–10 · NPS → 9–10.
- NPS bands: detractors 0–6, passives 7–8, promoters 9–10.
- **Average Ratings covers a different question set than CSAT** — it excludes NPS-type
  questions and includes rating questions CSAT does not. It is not a restatement of CSAT.
- **Scoring** is optional author-assigned points, used for quizzes *and* weighting. It is
  not sentiment and must never feed a positive/negative classification.
- Official summary metrics: survey visits, total responses, completed responses,
  partial responses.

## Known gaps — the docs do not say

Flag these as assumptions whenever they come up; do not present them as product behaviour:

- **How Average Rating is calculated** is never defined in the docs (derived from screenshots).
- **Only the *positive* band is documented.** The neutral/negative split below it is our own,
  declared per question in `SD_Q`.
- Whether the reported NPS is the −100..+100 index is confirmed only by screenshot, not by docs.

## Where the mock implements this

`mock-reference.html`:

- `SD_Q` — question catalogue: type, `outOf`, csat-eligible, rated, and the neg/neu/pos bands
- `sdQStats` / `sdMetrics` — per-question and rolled-up CSAT, NPS, average rating
- `sdUnitVerdict` / `SD_BANDS` — Positive/Neutral/Negative for a response, process or survey
- `sdNpsGauge`, and the three Survey Reports cards (`sd-chart-csat`, `sd-chart-nps`, `sd-chart-rate`)
- Dashboard: `cvProc`, `cvUsers`, `cvCsat`/`cvNps`/`cvRate`
- Records: `svOverallSignal`, `svAvgFrom`

## After a change

Any change to metric behaviour is an edit to `mock-reference.html`: commit it, add a Mock Edit
Log entry in `.claude/CLAUDE.md` in the same commit, and push — per the working agreement.
Cite the doc URL in the log entry.
