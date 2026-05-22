# Bowen Song Portfolio Site

Static GitHub Pages portfolio for Bowen Song, built as a hash-routed single-page site with focused sections for research, engineering, open-source projects, resources, interview prep, and structured reading tracks.

Live site: [bowenislandsong.github.io](https://bowenislandsong.github.io)

## What This Repo Is

- A public portfolio and research site that runs on GitHub Pages without a server backend.
- A small front-end app where `index.html` is the shell and `#/page#anchor` routes load section partials from `sections/`.
- A content-heavy repo with handwritten and generated data for papers, lessons, project pages, and archived course material.
- A repo that still keeps `classes/` around for archival integrity, even though that material is archived and intentionally hidden from the live navigation.

## Live Route Map

| Route | Purpose |
| --- | --- |
| `#/personal` | Fast overview for recruiters and first-time visitors |
| `#/research` | Publications, research agenda, projects, teaching, and talks |
| `#/engineering` | Engineering-focused portfolio page |
| `#/resources` | Resource index for interview prep, paper exploration, and quantum notes |
| `#/interview-prep` | Coding interview drill board with categories, approaches, filters, and examples |
| `#/open-source` | Open-source project stories and upstream contributions |
| `#/quantum` | Quantum learning track and lesson flow |
| `#/paper-discovery` | Paper browser with cards, graph, topic view, and timeline |

Example deep links:

- `#/personal#fit`
- `#/research#publications`
- `#/engineering#systems`
- `#/interview-prep#problem-browser`
- `#/open-source#featured-projects`
- `#/quantum#chapter1`
- `#/paper-discovery#papers-graph-view`

## Architecture

- `index.html` provides the shared shell, navigation, subnavs, and script loading.
- `js/router.js` resolves `#/page#anchor`, swaps in the correct partial from `sections/`, and preserves smooth in-page anchors.
- `js/section-hooks.js` boots page-specific behavior after a section is loaded.
- `sections/` contains markup-only partials for each live experience.
- Page logic lives in specialized scripts such as `js/quantum.js`, `js/papers.js`, and `js/interview-prep.js`.
- JSON and Markdown content under `papers/`, `lessons/`, and `classes/` feed the live UI and integrity tests.

## Repository Layout

```text
.
├── index.html
├── sections/
│   ├── personal.html
│   ├── research.html
│   ├── engineering.html
│   ├── resources.html
│   ├── interview-prep.html
│   ├── open-source.html
│   ├── quantum.html
│   └── paper-discovery.html
├── js/
│   ├── router.js
│   ├── section-hooks.js
│   ├── quantum.js
│   ├── papers.js
│   ├── interview-prep.js
│   └── interview-prep-data.js
├── lessons/
├── papers/
├── classes/                         # archived source materials
├── test/
└── .github/scripts/
```

## Local Development

### Preview the Site

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

### Run the Test Suite

```bash
python3 -m unittest discover -s test -q
```

The tests cover:

- route-to-section consistency
- live hash links and anchor contracts
- page-level UI contracts for buttons, filters, jumps, and rendered content
- open-source route coverage, papers, lessons, and archived `classes/` manifest integrity
- README accuracy for the documented local workflow

Some automation-related checks are optional and skip unless their external dependencies or credentials are present.

## Content Workflows

### Papers

- Source summaries live in `papers/*.md`.
- The checked-in manifest lives in `papers/index.json`.
- The Paper Discovery experience is rendered by `js/papers.js`.
- Manual fetching is handled by `.github/scripts/fetch_paper.py` through the `Fetch Paper and Update Indexes` workflow or the local command below.
- Recent workflow improvements sanitize fenced YAML output before saving and rotate fetches across portfolio-aligned tracks.

### Quantum Lessons

- Source lessons live in `lessons/*.md`.
- The lesson manifest lives in `lessons/index.json`.
- The reading flow is rendered by `js/quantum.js`.
- New Gemini lesson generation is kept as a manual workflow because the scheduled Gemini jobs were exhausting quota.

### Open Source

- The project home lives in `sections/open-source.html`.
- It groups maintained research repos, a published package, and upstream platform contributions.
- Add new public repos here when they should be discoverable from the top-level navigation.

### Archived Material

- `classes/` remains in the repo for archival completeness and integrity tests.
- `classes/index.json` is still maintained.
- The archive is deliberately archived and hidden from the live navigation.

## Maintenance Commands

If files are added or removed under `papers/` or `classes/`, regenerate the manifests:

```bash
python3 .github/scripts/generate_indexes.py
```

To run the paper fetch manually:

```bash
python3 .github/scripts/fetch_paper.py
```

## Notes

- Section partials stay markup-only by design; behavior is attached after routing.
- `#/personal` stays intentionally concise, while `#/research` and `#/engineering` go deeper.
- `#/interview-prep` is organized both by problem family and by solution approach.
- `#/paper-discovery` is framed as a reading map rather than a generic publication dump.
- The archived material is preserved for reference, not treated as a live product surface.
