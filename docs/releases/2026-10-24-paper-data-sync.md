# October 24, 2026 manuscript synchronization

Update the existing Home rankings, Leaderboard tables and CSV exports, SIA results, and the two affected task pages. Preserve page layout, styling, navigation, sorting behavior, model identities and ranks. No backend, notification, account or billing changes.

## Numerical changes

Tables 2–4 contain 77 changed website values: 15 aggregate scores, 24 Standard metrics, 20 Cross-Embodiment metrics and 18 Cross-Environment metrics. All changes concern One-Shot ProcVLM-2B, VLAC-2B or VLAC-8B. Zero-Shot values and every model rank are unchanged.

| One-Shot model | Previous Overall | Updated Overall | Rank |
| --- | ---: | ---: | ---: |
| ProcVLM-2B | 57.93 | 58.15 | 2 |
| VLAC-8B | 52.64 | 52.62 | 5 |
| VLAC-2B | 49.55 | 49.56 | 7 |

Table 6 changes 15 SIA cells. Overall changes are 23.26 → 23.17 for Zero-Shot ProcVLM-2B, 10.09 → 10.03 for Zero-Shot RoboFAC-7B, and 21.19 → 20.61 for One-Shot ProcVLM-2B. FailSafe changes its three condition scores while retaining Overall 9.85. SIA does not enter the aggregate leaderboard.

Table 5 also changes fine-grained counterfactual win/tie rates; its changed Overall is already reflected in Table 3. These per-category results are not separately displayed on the current website, so no new table is introduced.

## Task and metric corrections

- **Arrange Family Tea Set:** require the teapot before its lid, without requiring the two placements to be adjacent. Update both the task instruction and the original/counterfactual instruction fields (PDF pages 40 and 50).
- **Organize Cosmetics Storage Box:** close the drawer after both stored items are inside; serum and cleansing oil placements may occur before or after closure. Update the task and corresponding original instruction (pages 44 and 50).
- **CSVC guide:** use four boundary pairs, allowing repeated pairs for very short subtasks (page 12). Remove the website's incorrect three-pair fallback. The October 19 LaTeX already specified four pairs; this is a website correction, not a newly introduced benchmark rule.
- Keep the existing grammatical correction “An unfolded garment” in the Fold Clothes scene description; no task semantics change.

## Source and verification

PDF: `10-24_RoboValue__A_Fine_Grained_Sim_and_Real_Benchmark_for_Unified_Evaluation_of_Robotic_Value_Models.pdf` (89 pages). SHA-256:

```text
6a6bd588e5425be81b3570bdfb334e7598cbe0100c222ec69ec5ff5347fa62dd
```

- Tables 2, 3, 4 and 6: all 605 cells agree between Poppler and independent MuPDF coordinate extraction; key source pages were also rendered and visually checked.
- Table 5: all 171 cells agree between the two engines.
- Appendix Tables 18–75: all 12,108 numerical values and 186 unmeasured markers agree between both engines. Recomputed equal-weight domain averages agree with all 498 applicable main-table metrics within the displayed rounding tolerance.
- All 95 capability/Overall values satisfy the Appendix F.3 aggregation rules within rounding tolerance. Preserve the paper's rounded values rather than replacing them with recalculated rounded inputs.
- Read and compare all 35 task cards and 27 counterfactual rows. The 105 task-condition images are byte-identical between the October 7 source and this PDF; do not replace assets for mere PDF placement changes.
- Dataset scope remains 15 simulation tasks, 20 real-world tasks, 3,500 training demonstrations and 2,792 test trajectories.

## Website acceptance

Production build and all six existing leaderboard-state tests pass. Browser acceptance verifies 808 rendered values, 675 ranking highlights and eight CSV exports across both populated tracks and all three conditions. Updated task instructions, the CSVC correction, FPL sorting, Full-Shot empty states, desktop/mobile layouts and dark mode pass, with no browser exceptions. No forms were submitted during this acceptance.

## Complete changed-value list

Values below compare the published October 19 result data against the October 24 PDF. “id”, “emb” and “env” mean Standard, Cross-Embodiment and Cross-Environment.

| Track | Model | View | Field | Before | After | PDF page |
| --- | --- | --- | --- | ---: | ---: | ---: |
| one | ProcVLM-2B | aggregate | understanding | 65.43 | 65.67 | 13 |
| one | ProcVLM-2B | aggregate | tracking | 84.56 | 84.47 | 13 |
| one | ProcVLM-2B | aggregate | diagnosis | 44.12 | 44.37 | 13 |
| one | ProcVLM-2B | aggregate | consistency | 37.59 | 38.10 | 13 |
| one | ProcVLM-2B | aggregate | overall | 57.93 | 58.15 | 13 |
| one | VLAC-8B | aggregate | understanding | 45.02 | 44.94 | 13 |
| one | VLAC-8B | aggregate | tracking | 78.10 | 78.07 | 13 |
| one | VLAC-8B | aggregate | diagnosis | 42.92 | 43.00 | 13 |
| one | VLAC-8B | aggregate | consistency | 44.52 | 44.45 | 13 |
| one | VLAC-8B | aggregate | overall | 52.64 | 52.62 | 13 |
| one | VLAC-2B | aggregate | understanding | 37.02 | 37.10 | 13 |
| one | VLAC-2B | aggregate | tracking | 73.29 | 73.23 | 13 |
| one | VLAC-2B | aggregate | diagnosis | 45.47 | 45.54 | 13 |
| one | VLAC-2B | aggregate | consistency | 42.41 | 42.36 | 13 |
| one | VLAC-2B | aggregate | overall | 49.55 | 49.56 | 13 |
| one | ProcVLM-2B | id | sa | 83.07 | 83.04 | 14 |
| one | ProcVLM-2B | id | tga_ct | 59.25 | 59.73 | 14 |
| one | ProcVLM-2B | id | tga_cf | 51.16 | 51.39 | 14 |
| one | ProcVLM-2B | id | cycle_voc | 91.24 | 91.23 | 14 |
| one | ProcVLM-2B | id | memory_voc | 23.96 | 23.95 | 14 |
| one | ProcVLM-2B | id | fpl | 32.23 | 32.33 | 14 |
| one | ProcVLM-2B | id | trr | 21.05 | 21.31 | 14 |
| one | ProcVLM-2B | id | vs | 18.08 | 18.12 | 14 |
| one | ProcVLM-2B | id | csvc | 19.90 | 21.90 | 14 |
| one | VLAC-2B | id | sa | 64.54 | 64.55 | 14 |
| one | VLAC-2B | id | voc | 67.57 | 67.38 | 14 |
| one | VLAC-2B | id | cycle_voc | 60.24 | 60.11 | 14 |
| one | VLAC-2B | id | memory_voc | 10.50 | 10.49 | 14 |
| one | VLAC-2B | id | fpl | 30.56 | 30.46 | 14 |
| one | VLAC-2B | id | vs | 22.34 | 22.27 | 14 |
| one | VLAC-2B | id | csvc | 29.55 | 29.38 | 14 |
| one | VLAC-8B | id | sa | 63.71 | 63.60 | 14 |
| one | VLAC-8B | id | tga_ct | 34.63 | 34.87 | 14 |
| one | VLAC-8B | id | voc | 74.54 | 74.28 | 14 |
| one | VLAC-8B | id | cycle_voc | 63.57 | 63.40 | 14 |
| one | VLAC-8B | id | fpl | 28.93 | 28.95 | 14 |
| one | VLAC-8B | id | trr | 15.35 | 15.61 | 14 |
| one | VLAC-8B | id | vs | 25.46 | 25.37 | 14 |
| one | VLAC-8B | id | csvc | 30.26 | 30.09 | 14 |
| one | ProcVLM-2B | emb | sa | 83.77 | 84.01 | 15 |
| one | ProcVLM-2B | env | sa | 72.27 | 72.45 | 15 |
| one | ProcVLM-2B | emb | tga_ct | 48.82 | 48.46 | 15 |
| one | ProcVLM-2B | env | tga_ct | 50.03 | 50.38 | 15 |
| one | ProcVLM-2B | emb | tga_cf | 44.65 | 45.36 | 15 |
| one | ProcVLM-2B | env | tga_cf | 38.22 | 39.29 | 15 |
| one | ProcVLM-2B | emb | voc | 86.66 | 86.40 | 15 |
| one | ProcVLM-2B | env | voc | 78.36 | 77.84 | 15 |
| one | ProcVLM-2B | emb | cycle_voc | 86.35 | 86.08 | 15 |
| one | ProcVLM-2B | env | cycle_voc | 77.04 | 76.48 | 15 |
| one | ProcVLM-2B | emb | fpl | 32.99 | 32.31 | 15 |
| one | ProcVLM-2B | env | fpl | 33.76 | 33.32 | 15 |
| one | ProcVLM-2B | emb | vs | 12.49 | 12.43 | 15 |
| one | ProcVLM-2B | env | vs | 12.24 | 12.30 | 15 |
| one | VLAC-2B | emb | sa | 62.81 | 63.11 | 15 |
| one | VLAC-2B | env | sa | 60.10 | 60.40 | 15 |
| one | VLAC-2B | emb | voc | 66.37 | 66.77 | 15 |
| one | VLAC-2B | env | voc | 59.66 | 59.51 | 15 |
| one | VLAC-2B | emb | cycle_voc | 58.45 | 58.37 | 15 |
| one | VLAC-2B | env | cycle_voc | 56.61 | 56.49 | 15 |
| one | VLAC-2B | emb | fpl | 29.15 | 29.09 | 15 |
| one | VLAC-2B | env | fpl | 29.99 | 29.68 | 15 |
| one | VLAC-2B | emb | vs | 17.77 | 17.91 | 15 |
| one | VLAC-2B | env | vs | 17.70 | 17.66 | 15 |
| one | VLAC-8B | emb | sa | 70.22 | 69.15 | 15 |
| one | VLAC-8B | env | sa | 58.93 | 59.17 | 15 |
| one | VLAC-8B | emb | tga_ct | 28.22 | 28.21 | 15 |
| one | VLAC-8B | env | tga_ct | 34.43 | 34.78 | 15 |
| one | VLAC-8B | emb | tga_cf | 21.19 | 21.18 | 15 |
| one | VLAC-8B | emb | voc | 80.35 | 80.37 | 15 |
| one | VLAC-8B | env | voc | 64.94 | 64.91 | 15 |
| one | VLAC-8B | emb | cycle_voc | 70.12 | 69.80 | 15 |
| one | VLAC-8B | env | cycle_voc | 58.17 | 58.42 | 15 |
| one | VLAC-8B | emb | memory_voc | 41.96 | 41.95 | 15 |
| one | VLAC-8B | emb | fpl | 28.68 | 28.95 | 15 |
| one | VLAC-8B | env | fpl | 31.52 | 31.58 | 15 |
| one | VLAC-8B | emb | vs | 22.26 | 22.25 | 15 |
| one | VLAC-8B | env | vs | 22.44 | 22.46 | 15 |
| zero | ProcVLM-2B | id | sia | 23.75 | 23.71 | 17 |
| zero | ProcVLM-2B | emb | sia | 21.34 | 21.37 | 17 |
| zero | ProcVLM-2B | env | sia | 24.68 | 24.45 | 17 |
| zero | ProcVLM-2B | overall | sia | 23.26 | 23.17 | 17 |
| zero | RoboFAC-7B | id | sia | 9.97 | 9.93 | 17 |
| zero | RoboFAC-7B | emb | sia | 10.36 | 10.23 | 17 |
| zero | RoboFAC-7B | env | sia | 9.94 | 9.92 | 17 |
| zero | RoboFAC-7B | overall | sia | 10.09 | 10.03 | 17 |
| zero | FailSafe | id | sia | 10.01 | 10.04 | 17 |
| zero | FailSafe | emb | sia | 9.62 | 9.59 | 17 |
| zero | FailSafe | env | sia | 9.94 | 9.93 | 17 |
| one | ProcVLM-2B | id | sia | 24.66 | 24.22 | 17 |
| one | ProcVLM-2B | emb | sia | 19.74 | 19.55 | 17 |
| one | ProcVLM-2B | env | sia | 19.15 | 18.05 | 17 |
| one | ProcVLM-2B | overall | sia | 21.19 | 20.61 | 17 |
