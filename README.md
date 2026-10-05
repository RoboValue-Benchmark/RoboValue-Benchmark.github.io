# RoboValue public website

Official public website for RoboValue. This repository is separate from the anonymous review website.

## Pages

- `/`: public project homepage with authors, overview, capability descriptions and resource links.
- `/doc/`: documentation reused from the review website, including all simulation and real-world task pages.
- `/leaderboard/`: leaderboard with aggregate rankings and ID/OOD metric details extracted from Tables 1–3 of the October 5, 2026 public paper.

Existing documentation content has been preserved; migration does not imply a fresh factual review against the latest manuscript. Unfinished documentation pages remain available for later completion.

## Local development

```bash
npm ci
npm run dev -- --port 8876
```

## Build and deployment

```bash
npm run build
```

The build generates a real HTML entry for every page, so direct links and refreshes work on GitHub Pages. The GitHub Actions workflow deploys `dist/` when changes are pushed to `main`.

Paper, code, and dataset links remain placeholders until their public URLs are supplied.
