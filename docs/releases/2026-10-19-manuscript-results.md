# October 19, 2026 manuscript results update

Synchronize Home and Leaderboard with the current manuscript tables. The update changes 55 displayed numerical entries: Standard FPL for all 19 configurations, Diagnosis for 18, and Overall for 18. Model identities, track membership, ranks, all other detailed metrics, shifted-condition results and SIA remain unchanged.

The FPL guide now includes both Error Continuation and Effective Recovery trajectories, matching Section 4 of the manuscript. Its localization formula, lower-is-better direction and no-decline penalty are retained.

## Source and change record

Comparison baseline: commit `5ce24c1` (the previously published October 17 manuscript snapshot). Current source tables were updated on October 19 around 14:31 (Asia/Shanghai). Scores are taken directly from manuscript tables, preserving their rounding.

| Track | Model | Standard FPL: before → after | Diagnosis: before → after | Overall: before → after | Rank |
| --- | --- | --- | --- | --- | --- |
| Zero-Shot | RoboMeter-4B | 29.80 → 29.76 | 46.78 (unchanged) | 60.05 (unchanged) | 1 |
| Zero-Shot | RynnValue-4B | 39.95 → 41.29 | 40.63 → 40.29 | 57.70 → 57.62 | 2 |
| Zero-Shot | RynnValue-8B | 39.79 → 40.85 | 42.66 → 42.39 | 56.25 → 56.19 | 3 |
| Zero-Shot | TOPReward-32B | 34.12 → 34.31 | 41.35 → 41.30 | 48.04 → 48.03 | 4 |
| Zero-Shot | TOPReward-8B | 30.73 → 30.79 | 39.66 → 39.64 | 47.11 → 47.10 | 5 |
| Zero-Shot | ProcVLM-2B | 36.14 → 35.93 | 42.57 → 42.63 | 44.75 → 44.76 | 6 |
| Zero-Shot | RoboFAC-7B | 34.64 → 35.66 | 48.40 → 48.15 | 43.98 → 43.92 | 7 |
| Zero-Shot | LIV | 31.39 → 31.19 | 46.16 → 46.21 | 39.00 → 39.01 | 8 |
| Zero-Shot | VLAC-8B | 45.48 → 45.80 | 30.14 → 30.06 | 33.73 → 33.71 | 9 |
| Zero-Shot | RoboReward-8B | 31.30 → 31.90 | 34.32 → 34.17 | 32.92 → 32.89 | 10 |
| Zero-Shot | RoboReward-4B | 32.17 → 32.61 | 34.83 → 34.72 | 32.71 → 32.68 | 11 |
| Zero-Shot | VLAC-2B | 47.46 → 47.68 | 31.38 → 31.33 | 29.96 → 29.95 | 12 |
| One-Shot | Robo-Dopamine 2.0-8B (Preview) | 29.30 → 28.40 | 54.57 → 54.80 | 58.27 → 58.33 | 1 |
| One-Shot | ProcVLM-2B | 33.94 → 32.23 | 43.70 → 44.12 | 57.82 → 57.93 | 2 |
| One-Shot | Robo-Dopamine 2.0-4B (Preview) | 27.34 → 26.19 | 52.32 → 52.61 | 57.52 → 57.59 | 3 |
| One-Shot | Robo-Dopamine-8B | 32.86 → 31.71 | 52.22 → 52.51 | 53.51 → 53.58 | 4 |
| One-Shot | VLAC-8B | 28.63 → 28.93 | 42.99 → 42.92 | 52.66 → 52.64 | 5 |
| One-Shot | Robo-Dopamine-3B | 34.32 → 33.70 | 49.39 → 49.54 | 50.97 → 51.01 | 6 |
| One-Shot | VLAC-2B | 29.59 → 30.56 | 45.71 → 45.47 | 49.61 → 49.55 | 7 |

RoboMeter-4B has an updated Standard FPL, while its displayed Diagnosis and Overall remain 46.78 and 60.05. All Zero-Shot and One-Shot ranks remain unchanged.

## Sources

- `RoboValue_paper/sec/5_1RoboValueLeaderboard.tex`: `tab:robovalue_leaderboard` (19 configurations).
- `RoboValue_paper/sec/5_Experiment.tex`: `tab:robovalue_main`, `tab:robovalue_ood` (19 configurations each), and `tab:sia_results` (4 configurations).
- `RoboValue_paper/image/tables/id.tex`: `tab:id_fpl` (13 simulation tasks).
- `RoboValue_paper/image/tables/real_world/id.tex`: `tab:real_id_fpl` (14 real-world tasks).
- `RoboValue_paper/sec/4_RoboValueBenchmark.tex`: FPL trajectory cohort and definition.
- `RoboValue_paper/iclr2027_supplementary.tex`: Leaderboard Scoring.

The 19 updated Standard FPL values were independently checked against the equal-weight mean of simulation and real-world per-task averages, within displayed-score rounding. Source SHA-256 hashes for the published result tables are recorded in `public/data/results.json`.

## Validation

- All model rows in the source tables are accounted for; no model was added or removed. The sync script now fails if a named source row is unrecognized.
- The complete numerical diff contains only the 55 entries listed above; both shifted conditions and the SIA table match the preceding publication.
- Browser checks cover every Home/Leaderboard aggregate cell, all three detailed-condition views, FPL ordering and best/second-best marks, CSV values, and the FPL guide.
- Production build and manuscript-to-JSON checks pass.
