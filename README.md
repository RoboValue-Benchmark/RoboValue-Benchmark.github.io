# RoboValue public website

Official public website for RoboValue. This repository is separate from the anonymous review website.

## Pages

- `/`: public project homepage with interactive execution keyframes, the full author list, dataset statistics, four diagnostic capability examples, top-five rankings, manuscript findings, and a task gallery with ID/OOD views.
- `/doc/`: documentation reused from the review website, including all simulation and real-world task pages.
- `/community/`: WeChat group invitation (time-limited QR code).
- `/leaderboard/`: dedicated results page with independent zero-shot and one-shot ranks, ID/OOD metric details, comparisons of up to three models, metric explanations, scoring rules, and separately reported SIA results.

Homepage, dataset descriptions, protocol, task cards, and leaderboard are synchronized with the October 7, 2026 manuscript snapshot. Existing task URLs are retained when display names change. Unfinished documentation pages remain available for later completion.

The homepage and full leaderboard share their results loader and manuscript findings. Homepage rankings reproduce the top five rows of Table 1 for the selected track; finding cards read raw ID metric values from Tables 2–3. Links open the matching track, model comparison, or diagnostic view on the full leaderboard. Expected-trend diagrams are explicitly labeled as schematics. The task gallery uses existing task specifications and images, including the separate embodiment and environment shifts.

Leaderboard filters, sorting, and selected comparisons are stored in the URL and survive refreshes. Searching or sorting preserves each model's original overall rank. Best and second-best marks use all models in the selected track, with ties sharing the same mark. FPL sorts ascending by default; TOPReward's VOC and Memory-VOC are excluded from best/second-best marking, following the manuscript. CSV exports contain the displayed rows, the evaluation track, and overall ranks where applicable.

`public/data/results.json` retains the original values from Tables 1–3. `src/data/subtask-results.json` reproduces the four rows of the manuscript's Subtask Identification Results table. SIA does not contribute to the aggregate ranking, and VROC is explained without inferring unreported values from rounded table entries. Neither zero-shot nor one-shot uses the full training split; the Full-Data track remains planned.

## Local development

```bash
npm ci
npm run dev -- --port 8876
```

## Build and deployment

```bash
npm run build
```

The build generates a real HTML entry with a page-specific title, Open Graph title, and canonical URL for every page, so direct links and refreshes work on GitHub Pages. The GitHub Actions workflow deploys `dist/` when changes are pushed to `main`.

Paper, code, and dataset links remain placeholders until their public URLs are supplied.
