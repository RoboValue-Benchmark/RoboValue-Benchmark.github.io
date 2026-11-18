# RoboValue public website

Official public website for RoboValue. This repository is separate from the anonymous review website.

## Evaluation application backend

See [the backend design and operations guide](docs/evaluation-backend/README.md) for the saved-receipt contract, private data schema, independent notification worker, five-minute mail windows, admission limits, failure handling, security boundaries, verification, and reuse. The guide records the accepted CloudBase v4.1 behavior; it does not contain credentials or live applicant data.

## Marked versions

### 2026-10-11 19:44 (Asia/Shanghai) · xjy · Floating background gallery

**Tag:** `v2026.10.11-1944-xjy-floating-gallery-background`

Refine the Home task-image wall into a floating gallery on a light neutral surface. Photo cards have crisp rounded boundaries, thin side depth, and downward shadows that fade toward both ends. Wider spacing and shorter edge fades keep the gallery clear while connecting it smoothly to the page content.

Real-world and simulation rows within each group share a steady speed: Standard A 26, Cross-Embodiment 15, Cross-Environment 36, and Standard B 20 CSS pixels per second. See [the background gallery notes](docs/releases/2026-10-11-floating-gallery-background.md) for the design and motion settings.

### 2026-10-11 17:18 (Asia/Shanghai) · xjy · Overview and task-image background

**Tag:** `v2026.10.11-1718-xjy-overview-and-background`

Replace the Home overview with the supplied October 11 figure, rendered as SVG with the existing zoom viewer. Rebuild the animated paper-information background from 105 manuscript task images: real-world rows precede simulation rows, and both use an 8:5 display crop.

This version also includes the pending Home author fixes: the English apostrophe in Shu'ang Yu and Chuankang Li's GitHub profile link, together with the incoming Chang Ge profile link. See [the version notes](docs/releases/2026-10-11-overview-and-background.md) for image sources, crop settings, row selection, validation, and the incoming commits.

The earlier `v2026.10.11-1601-xjy-pre-background-wall` tag remains an optional fallback for the background experiment.

### 2026-10-11 08:10 (Asia/Shanghai) · xjy · Website refresh

**Tag:** `v2026.10.11-0810-xjy-website-refresh`

This version records the website refresh across the paper-information island, execution background, Home, Leaderboard, Eval, Community, formatting, and dark mode.

1. **Paper information and background:** use a translucent blue–purple gradient island for the paper information; update alternating simulation and real-world execution frames, with disjoint Standard A/B task sets; adjust resource-button labels, icon spacing, and alignment.
2. **Home:** arrange Dataset → Benchmark → Leaderboard, with the manuscript's four capability dimensions and corresponding diagnostic tests.
3. **Leaderboard:** separate Overall Ranking from condition results, give the two areas independent track controls, reserve Full-Shot with no results, integrate SIA into detailed Understanding results, and simplify notes and entry links.
4. **Eval:** add the application form with required-field validation, multiple contact details retained when switching tabs, WeChat selected by default, public community access, private local-server storage, and a Get Started link after successful submission.
5. **Community:** remove the documentation sidebar, add Discord alongside WeChat, and synchronize the Home community area and footer.
6. **Formatting and dark mode:** unify capitalization, arrows, and link styles; adjust type sizes, centering, shadows, and resource-icon alignment; fix dark panels, ranking frames, overview corners, and model-logo contrast.

See [the version notes](docs/releases/2026-10-11-website-refresh.md) for the complete changes, source and merge record, background-frame counts, validation, and remaining deployment work. The earlier `v2026.10.11-0736-xjy-website-refresh`, `v2026.10.11-xjy-benchmark-eval-dark-mode`, and pre-island/soft-island checkpoints remain available as history.

**Sources for this version:** Document content, navigation, task pages, and documentation styles adopt `liushb9`'s `fb210d8`. Home, Leaderboard, Eval, Community, shared styles, assets, results, and the local receiver retain `354bb36`, associated with GitHub account `xiaojy36` (Git signature `Level-0-Xiaojy`). The shared `src/main.jsx` preserves the public-page entries from the local version and the documentation routes from the remote version. These changes were combined in merge commit `4008c60`.

This follow-up commit records the confirmed sources and version tag. Website code and the current local Document are unchanged. The public Eval receiver still requires separate HTTPS deployment.

### 2026-10-10 · xjy · Home resources and Eval navigation

**Tag:** `v2026.10.10-xjy-home-resources-and-eval`

Alternate simulation and real-world task frames in the opening background. Simplify the project links to Report, Document, Code, Dataset, Leaderboard, and Community, centered in one row on wide screens and wrapping on smaller screens. Remove the Resources/Explore labels and Paper button; leave Report and Dataset disabled until their links are available.

Replace Data and Code in the shared navigation with Eval. Add `/eval/` with only its title. Shorten the dataset introduction and remove the explanatory paragraphs below both task galleries.

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

- `/`: paper and resource information over an animated manuscript task-image background; an overview-video placeholder; introduction and SVG overview figure; News; simulation and real-world task galleries; the four benchmark capability dimensions; unified rankings with a Setting column; community access; and a copyable BibTeX citation.
- `/doc/`: documentation, evaluation and integration guidance, and all simulation and real-world task pages.
- `/eval/`: evaluation application form with public WeChat and Discord access. Production builds use CloudBase submissions and a saved server receipt. Local development retains the temporary frontend-only success preview; applications in that mode are not sent or saved. The contact fallback remains configurable.
- `/community/`: public WeChat group invitation and Discord access, without the documentation sidebar.
- `/data/`: standalone dataset page, currently showing Coming soon.
- `/leaderboard/`: one Overall Ranking table and one Results table combine all evaluation settings, identified by the Setting column. Default order is descending published Overall; Results retains Standard, Cross-Embodiment and Cross-Environment controls. Sorting and CSV are independent for the two tables. SIA-only FailSafe remains in Results without an invented Overall. No Full-Shot results are reported.

## Results and sources

Leaderboard results follow the November 19, 2026 LaTeX snapshot: 24 configurations (17 Zero-Shot and 7 One-Shot) and 9 SIA configurations. Added Zero-Shot models are Flora, GPT-6.1 Sol, Gemini 4 Argon, Claude Opus 5.5 and DeepSeek-V4.1-Flash. Model names and scores are copied from the manuscript, without inferring different service versions. Data files record source paths, SHA-256 hashes and the snapshot date. Private manuscripts and audit inputs stay outside the public repository.

`public/data/results.json` contains the exact displayed capability/Overall scores and raw Standard, Cross-Embodiment and Cross-Environment results. `src/data/subtask-results.json` contains separately reported SIA values. Existing task assets and specifications retain their prior verified snapshot.

The current scoring rules use fixed-reference calibration, equal condition weights, and Overall = 0.30 Understanding + 0.20 Monitoring + 0.30 Reasoning + 0.20 Consistency. Negative scores are retained. SIA and Cycle-VOC do not add further contributions. VROC contributes to Monitoring, but its raw per-condition results are not tabulated in the current LaTeX manuscript: do not substitute Cycle-VOC or reverse-engineer VROC from rounded capability scores. The website preserves the exact published Monitoring score. RoboReward’s excluded VS and CSVC contribute zero after calibration, without treating those exclusions as measured raw zeros.

Reproduce or check the current snapshot with:

```bash
python3 scripts/sync_paper_results.py /path/to/RoboValue_paper --version 2026-11-19
python3 scripts/sync_paper_results.py /path/to/RoboValue_paper --version 2026-11-19 --check
```

The parser rejects incomplete model coverage, duplicates and unexpected cells, and checks all capability/Overall formulas recoverable from the displayed tables within rounding tolerance. Historical PDF tools and release notes remain available for older snapshots.

The dedicated leaderboard ranks configurations across settings by published Overall, preserving competition ties and the unified rank under manual metric sorting. Results follows that order by default; configurations without Overall follow scored rows. Best/second-best marks compare all settings together. FPL defaults to ascending; TOPReward’s VOC and Memory-VOC now participate in highlights according to the current manuscript. CSV exports preserve the displayed order, Setting, condition and unified rank where applicable. Old per-setting URLs migrate to the unified table state. Home uses the same unified Overall ranking and shared colored Setting badges as the dedicated leaderboard. November News entries announce Flora and the four general-purpose multimodal foundation models.

## Local development

```bash
npm ci
npm run dev -- --port 8877
```

Eval currently defaults to **frontend-only success preview mode** (`VITE_EVAL_SUBMISSION_MODE` unset or `preview`). Normal form validation runs first; valid submissions display the original **Application Submitted!** page and Evaluation Workflow link. This mode sends no application request, creates no server receipt, saves no application, and triggers no notification. Displaying the success page does not confirm backend delivery. Form values remain only in page memory and are cleared on reload.

Set `VITE_EVAL_SUBMISSION_MODE=unavailable` to preview an inline unavailable status while retaining the form and its input. The community QR codes remain beside the form. Unknown mode values also show the unavailable status.

The API submission logic is retained. When the receiver is ready, explicitly set `VITE_EVAL_SUBMISSION_MODE=api` and, for production, `VITE_EVAL_API_URL` to the verified HTTPS endpoint. These are build-time settings: rebuild and redeploy after changing them. API mode shows success only after a valid receipt; failed requests retain the form and show an inline status and community-contact hint. Retrying unchanged details retains the idempotency key.

For local API-mode development, start the frontend with:

```bash
VITE_EVAL_SUBMISSION_MODE=api npm run dev
```

Also run the receiver in a separate terminal:

```bash
npm run eval:server
```

In API mode, the local development server forwards `/api/evaluation-applications` to the receiver on `127.0.0.1:8878`. Each application is saved as a private JSON file in `../robovalue-eval-submissions/submissions/`, outside this repository. The adjacent `../robovalue-eval-submissions/README.md` documents the fields, storage, and operating instructions. The page shows **Application Submitted** only after the server confirms that the record was saved. This does not send automatic messages to applicants.

Run the receiver checks with `npm run test:eval` (isolated temporary storage), and the frontend retry checks with `node --test src/eval-request.test.mjs`. GitHub Pages hosts the frontend; current production submissions use the CloudBase native HTTPS function interface described below. `VITE_EVAL_API_URL` specifies that endpoint when API mode is enabled; it must not point to a visitor's `localhost`.

## Build and deployment

```bash
npm run build
```

The build generates real HTML entry files with page-specific titles, Open Graph titles, and canonical URLs so direct links and refreshes work on GitHub Pages. The GitHub Actions workflow deploys `dist/` when changes are pushed to `main`.

Production builds read `eval-public-config.json`, which must contain exactly `keyType: "publish_key"`, `env: "robovalue-eval-d6gvbrl7g1fa30d73"`, and `publishableKey` set to this environment's verified **Publishable Key**. This file is intentionally public: it is committed with the website and its values are included in visitors' JavaScript. Never put an administrative API Key, Tencent Cloud credentials, SMTP authorization code, or IP-hashing secret in it. The release process must verify the key's actual CloudBase type; the local build validates its declared type and format.

Vite's standard production `define` configuration fixes the submission mode to `cloudbase`. A missing or malformed public configuration stops `npm run build`; it cannot silently produce the frontend-only preview. No GitHub Actions variable or additional authorization scope is required. The existing deployment workflow is unchanged. `.env` loading is disabled. Local `npm run dev` retains the preview behavior described above unless a mode is explicitly provided in the process environment.

CloudBase mode sends a native HTTPS request to `https://robovalue-eval-d6gvbrl7g1fa30d73.api.tcloudbasegateway.com/v1/functions/robovalue-submit`; no custom domain or embedded replacement form is used. The backend must be enabled, `robovalue-benchmark.github.io` must be an enabled safety origin, and the verified access policy must permit only the public submit endpoint while keeping the database and notification worker private. The existing success page appears only after a matching saved receipt. Public configuration changes require a new build and deployment.

Code links point to the official repository at `https://github.com/RoboValue-Benchmark/RoboValue`. The homepage Report button opens `https://arxiv.org/pdf/2610.26663`; the Dataset button links to the published Hugging Face training data. The shared navigation is Home, Document, Leaderboard, Eval, and Community; the existing `/data/` placeholder remains accessible by its URL.
