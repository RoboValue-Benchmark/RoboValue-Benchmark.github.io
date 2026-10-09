# RoboValue public website

Official public website for RoboValue. This repository is separate from the anonymous review website.

## Marked versions

### 2026-10-10 · xjy · Responsive hero fix

**Tag:** `v2026.10.10-xjy-responsive-hero-fix`

Replace the opening section's fixed 330px/240px vertical spacing with viewport-aware minimum height, symmetric fluid padding, and centered layout below the navigation. Keep the paper information left-aligned internally and preserve its readable type sizes. Align the feathered reading background with the same center; let long mobile content expand naturally instead of clipping or shrinking it.

Validated with live browser resizing across 14 desktop, tablet, phone, and effective-zoom viewport sizes. The complete website-refresh tag below remains unchanged for comparison and rollback.

### 2026-10-10 · xjy · Website refresh

**Tag:** `v2026.10.10-xjy-website-refresh`

This snapshot records the paper-information layout, animated execution background, blue–purple visual identity, task galleries, and redesigned leaderboards together.

1. **Paper information:** retain the aligned title, author, footnote, affiliation, and resource layout; improve institution-logo blending, superscript colors, text contrast, and individual resource-icon colors.
2. **Animated execution background:** move rows of real task frames extracted from the selected simulation clips; tune tile sizes and gaps, feather the central reading area without a hard panel boundary, and increase spacing around the paper information.
3. **Navigation:** reserve a white area above the opening background and use a lightly tinted, translucent navigation bar with subtle depth.
4. **Color and typography:** establish the blue–purple brand palette, preserve emphasis when darkening text, distinguish the primary RoboValue name, and use the manuscript's four capability colors.
5. **Overview:** align the introduction with the October 9 abstract and introduction; enlarge the overview-video placeholder and figure, render the figure as SVG, and provide zoom and pan controls.
6. **Task galleries:** use the same presentation for 15 simulation tasks and 20 real-world tasks, with Standard (ID), Embodiment shift, and Environment shift controls and previous/next arrows.
7. **Dedicated leaderboard:** simplify the page around Overall Ranking and three condition views, independent Zero-shot/One-shot tracks, sorting, CSV export, model-project identities and links, and a compact separate SIA table. Verify the existing numerical results against the October 9 manuscript and update source metadata.
8. **Homepage leaderboard:** show all 11 Zero-shot and 7 One-shot configurations, use the concise capability headers, and share model identities and project links with the dedicated leaderboard.
9. **Content and community:** simplify News, remove the homepage diagnostic-example module, make the homepage community section compact and white, and restore the WeChat QR image on `/community/`.
10. **Scroll motion:** reveal homepage content blocks once with a restrained fade and upward movement; use a lighter mobile effect and preserve reduced-motion, keyboard-focus, anchor, and print behavior.

The existing remote Service & Adapter documentation update is retained in this snapshot. This refresh does not publish the manuscript PDF, dataset, or overview video; their public resource placeholders remain.

The earlier aligned paper-information version without the animated background is preserved under **`home-paper-info-no-background-20261010`**.

## Pages

- `/`: paper and resource information over an animated task-frame background; an overview-video placeholder; introduction and SVG overview figure; News; simulation and real-world task galleries; complete selected-track rankings; the shared evaluation framework; community access; and a citation placeholder.
- `/doc/`: documentation, evaluation and integration guidance, and all simulation and real-world task pages.
- `/community/`: WeChat group invitation with the existing time-limited QR image.
- `/data/`: standalone dataset page, currently showing Coming soon.
- `/leaderboard/`: Overall Ranking, Standard (ID), Cross-Embodiment, and Cross-Environment results with separate Zero-shot and One-shot tracks, sortable scores, CSV export, participation and scoring links, and separately reported SIA results.

## Results and sources

The homepage introduction, overview figure, and leaderboard source metadata follow the October 9, 2026 manuscript. `public/data/results.json` reproduces Tables 2–4; the numerical results are unchanged from the preceding manuscript snapshot. `src/data/subtask-results.json` reproduces Table 6. SIA does not contribute to the overall ranking. The Full-Data track remains planned.

Home and Leaderboard share the results loader, model identities, and official project links. Homepage rankings include every model in the selected track, and the full-leaderboard link retains that track. Official project logos take priority over institution fallbacks.

Leaderboard condition, track, and sorting are reflected in the URL. Sorting preserves each model's overall rank within its track. Best and second-best marks use all eligible models, including ties. FPL defaults to ascending order; TOPReward's VOC and Memory-VOC are excluded from best/second-best marking, following the manuscript. RoboReward's unmeasured VS and CSVC count as zero in aggregate scoring and remain unreported in raw metric views. CSV exports contain the displayed rows, track, condition, and overall ranks where applicable.

## Local development

```bash
npm ci
npm run dev -- --port 8877
```

## Build and deployment

```bash
npm run build
```

The build generates real HTML entry files with page-specific titles, Open Graph titles, and canonical URLs so direct links and refreshes work on GitHub Pages. The GitHub Actions workflow deploys `dist/` when changes are pushed to `main`.

Code links point to the official repository at `https://github.com/RoboValue-Benchmark/RoboValue`. Paper and arXiv links remain placeholders. Data opens a standalone Coming soon page until the dataset download is available.
