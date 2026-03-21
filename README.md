# Bowen Song Portfolio Site

Static GitHub Pages site for Bowen Song with four live experiences:

- `#/personal` for the fast, recruiter-friendly overview
- `#/research` for publications, agenda, projects, teaching, and talks
- `#/paper-discovery` for the focused reading map, graph, topic view, and timeline
- `#/quantum` for the quantum lab / structured learning track

The `classes/` content is still in the repository, but it is archived and not surfaced in the live site navigation.

## Live Site

[bowenislandsong.github.io](https://bowenislandsong.github.io)

## Current Stack

- Static HTML partials in `sections/`
- Client-side hash routing in `js/router.js`
- Page boot hooks in `js/section-hooks.js`
- Dedicated page logic in `js/quantum.js` and `js/papers.js`
- Tailwind CDN for page styling
- GitHub Pages-compatible assets and JSON manifests

## Live Routes

- `#/personal`
- `#/research`
- `#/quantum`
- `#/paper-discovery`

Examples:

- `#/personal#fit`
- `#/research#publications`
- `#/quantum#chapter1`

## Project Layout

```text
.
├── index.html
├── sections/
│   ├── personal.html
│   ├── research.html
│   ├── quantum.html
│   ├── paper-discovery.html
│   └── classes.html              # archived, not live
├── js/
│   ├── router.js
│   ├── section-hooks.js
│   ├── quantum.js
│   ├── papers.js
│   └── classes.js                # archived, not live
├── lessons/
├── papers/
├── classes/                      # archived source materials
├── test/
└── .github/scripts/
```

## Local Preview

You do not need Conda just to view the site.

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Testing

Run the full local test suite:

```bash
python3 -m unittest discover -s test -q
```

The test suite now covers:

- route-to-section consistency
- live hash links and anchor contracts
- Personal and Research button/anchor contracts
- Paper Discovery view controls and graph-rendering contracts
- quantum search, jump, and paging controls
- manifest consistency for `papers/` and archived `classes/`
- README accuracy for the current workflow

Some automation-related tests are optional and skip unless their external dependencies or API credentials are present.

## Content Workflows

### Papers

- Source summaries live in `papers/*.md`
- Manifest is stored in `papers/index.json`
- Discovery UI is rendered by `js/papers.js`
- Automated fetching is handled by `.github/scripts/fetch_paper.py`
- New fetches rotate across portfolio-aligned tracks instead of staying locked to one narrow paper lane
- Gemini responses are sanitized before saving so fenced YAML output still becomes valid frontmatter

### Quantum Lessons

- Source lessons live in `lessons/*.md`
- Manifest is stored in `lessons/index.json`
- Reading flow is rendered by `js/quantum.js`

### Archived Classes

- Archived course files remain under `classes/`
- `classes/index.json` is still maintained for integrity checks
- The archive is intentionally hidden from the live site

## Regenerating Indexes

If files were added or removed from `papers/` or `classes/`, regenerate the checked-in manifests:

```bash
python3 .github/scripts/generate_indexes.py
```

To run the portfolio-driven paper fetch manually:

```bash
python3 .github/scripts/fetch_paper.py
```

## Notes

- Section partials are markup-only; page behavior is booted through shared hooks.
- Paper Discovery includes four views: cards, graph, by-topic, and timeline.
- `#/personal` is intentionally short; `#/research` is the deeper academic and technical view.
- `#/paper-discovery` is framed as a focused reading map rather than a broad survey.
