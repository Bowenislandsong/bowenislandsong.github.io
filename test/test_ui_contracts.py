import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SECTIONS_DIR = ROOT / "sections"


def read(rel_path):
    return (ROOT / rel_path).read_text(encoding="utf-8")


def parse_router_routes():
    router = read("js/router.js")
    pattern = re.compile(r"(?:'([^']+)'|([A-Za-z-]+)):\s*'sections/([^']+)\.html'")
    pairs = []
    for quoted, bare, section in pattern.findall(router):
        route_name = quoted or bare
        pairs.append((route_name, section))
    return pairs


class ElementParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.buttons = []
        self.anchors = []
        self.tag_attrs = []

    def handle_starttag(self, tag, attrs):
        attr_map = dict(attrs)
        if "id" in attr_map:
            self.ids.add(attr_map["id"])
        if tag == "button":
            self.buttons.append(attr_map)
        if tag == "a":
            self.anchors.append(attr_map)
        self.tag_attrs.append((tag, attr_map))


def parse_html(rel_path):
    parser = ElementParser()
    parser.feed(read(rel_path))
    return parser


def route_anchor_targets():
    targets = {}
    for route_name, section in parse_router_routes():
        targets[route_name] = parse_html(f"sections/{section}.html").ids
    return targets


def strip_outer_code_fence(text):
    trimmed = text.replace("\r\n", "\n").strip().lstrip("\ufeff")
    trimmed = re.sub(
        r"^(?:```+\s*(?:yaml|yml|markdown|md)?|(?:yaml|yml|markdown|md)\s*```+)\s*\n?",
        "",
        trimmed,
        count=1,
        flags=re.IGNORECASE,
    )
    trimmed = re.sub(r"\n?```+\s*$", "", trimmed, count=1, flags=re.IGNORECASE)
    return trimmed.strip()


def parse_leading_metadata(source):
    lines = source.split("\n")
    if not lines:
        return None, source

    index = 0
    fence_style = False
    if lines[0].strip() == "---":
        fence_style = True
        index = 1
    elif not re.match(r"^[a-zA-Z0-9_-]+:\s*(.*)$", lines[0]):
        return None, source

    meta_lines = []
    current_key = ""
    block_scalar_mode = False
    saw_key = False
    body_start = index

    for index in range(index, len(lines)):
        line = lines[index]
        stripped = line.strip()
        match = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        continuation = current_key and (
            stripped == ""
            or line.startswith((" ", "\t"))
            or stripped.startswith("- ")
            or block_scalar_mode
        )

        if stripped == "---":
            body_start = index + 1
            break
        if match:
            saw_key = True
            current_key = match.group(1).strip()
            block_scalar_mode = bool(re.match(r"^[\"']?[|>][\"']?$", (match.group(2) or "").strip()))
            meta_lines.append(line)
            body_start = index + 1
            continue
        if continuation:
            meta_lines.append(line)
            body_start = index + 1
            continue
        if not fence_style and saw_key:
            body_start = index
        break

    if not saw_key:
        return None, source

    meta = {}
    for line in meta_lines:
        match = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if match and match.group(2).strip():
            meta[match.group(1).strip().lower()] = match.group(2).strip().strip("\"'")
    body = "\n".join(lines[body_start:]).strip()
    return meta, body


def derive_paper_display_from_text(source_text, fallback_name="paper summary"):
    source = strip_outer_code_fence(source_text).replace("\r\n", "\n").strip()
    lines = source.split("\n")
    title = ""
    meta, body = parse_leading_metadata(source)
    body_lines = body.split("\n") if body else lines

    if meta and meta.get("title"):
        title = meta["title"].strip()
    if not title:
        for line in body_lines:
            match = re.match(r"^\s*#\s+(.+?)\s*$", line)
            if match:
                title = match.group(1).strip()
                break

    if not title:
        loose_title = re.search(r"^\s*title\s*:\s*[\"']?(.*?)[\"']?\s*$", source, re.IGNORECASE | re.MULTILINE)
        if loose_title:
            title = loose_title.group(1).strip()

    if not title:
        title = fallback_name

    return title, body


def derive_paper_display(path):
    return derive_paper_display_from_text(path.read_text(encoding="utf-8"), path.stem.replace("_", " ").strip())


class UIContractTest(unittest.TestCase):
    def test_static_live_section_buttons_have_explicit_type(self):
        for rel_path in [
            "sections/personal.html",
            "sections/research.html",
            "sections/engineering.html",
            "sections/resources.html",
            "sections/interview-prep.html",
            "sections/open-source.html",
            "sections/quantum.html",
            "sections/paper-discovery.html",
        ]:
            parser = parse_html(rel_path)
            missing = [button for button in parser.buttons if button.get("type") != "button"]
            self.assertEqual(missing, [], f"{rel_path} has button(s) without type='button'")

    def test_hash_links_target_live_routes_and_real_anchors(self):
        valid_routes = {name for name, _ in parse_router_routes()}
        targets = route_anchor_targets()
        html_files = ["index.html"] + [str(path.relative_to(ROOT)) for path in sorted(SECTIONS_DIR.glob("*.html"))]

        broken = []
        for rel_path in html_files:
            parser = parse_html(rel_path)
            for anchor in parser.anchors:
                href = anchor.get("href", "")
                if not href.startswith("#/"):
                    continue
                page_and_anchor = href[2:]
                page, _, hash_anchor = page_and_anchor.partition("#")
                if page not in valid_routes:
                    broken.append((rel_path, href, "unknown route"))
                    continue
                if hash_anchor and hash_anchor not in targets[page]:
                    broken.append((rel_path, href, "missing anchor"))

        self.assertEqual(broken, [], f"Broken hash links: {broken}")

    def test_live_toggle_and_copy_targets_exist(self):
        for rel_path in [
            "sections/personal.html",
            "sections/research.html",
            "sections/engineering.html",
        ]:
            html = read(rel_path)
            parser = parse_html(rel_path)
            selectors = re.findall(r'data-(?:toggle|copy)="(#([^"]+))"', html)
            missing_targets = [selector for selector, target_id in selectors if target_id not in parser.ids]
            self.assertEqual(missing_targets, [], f"Broken selectors in {rel_path}: {missing_targets}")

    def test_open_source_details_contract(self):
        parser = parse_html("sections/open-source.html")
        open_source_html = read("sections/open-source.html")
        required_ids = {
            "open-source-agenticlocal",
            "open-source-local-latex",
            "open-source-blue-moon",
            "open-source-ser",
            "open-source-cot-rec",
            "open-source-rcds",
            "open-source-shapley",
            "open-source-olm",
            "open-source-flake",
        }
        self.assertTrue(required_ids.issubset(parser.ids), f"Missing open-source detail ids: {sorted(required_ids - parser.ids)}")
        self.assertIn('data-toggle-group="open-source-projects"', open_source_html)
        self.assertIn('data-toggle-group="open-source-upstream"', open_source_html)

    def test_papers_component_contracts_cover_views_and_graph(self):
        parser = parse_html("sections/paper-discovery.html")
        discovery_html = read("sections/paper-discovery.html")
        papers_js = read("js/papers.js")

        expected_views = {"cards", "graph", "topic", "timeline"}
        actual_views = {button["data-papers-view"] for button in parser.buttons if "data-papers-view" in button}
        self.assertEqual(actual_views, expected_views)

        required_ids = {
            "papers-count",
            "topic-filter-bar",
            "papers-browser",
            "papers-graph-view",
            "papers-topic-view",
            "papers-timeline-view",
            "papers-graph-canvas",
            "graph-tooltip",
            "graph-legend",
            "graph-detail",
        }
        self.assertTrue(required_ids.issubset(parser.ids), f"Missing discovery ids: {sorted(required_ids - parser.ids)}")

        self.assertIn("window.papersSetView = function", papers_js)
        self.assertIn("renderGraph();", papers_js)
        self.assertIn("renderTopicView();", papers_js)
        self.assertIn("renderTimeline();", papers_js)
        self.assertIn("window.addEventListener('resize', scheduleGraphRender);", papers_js)
        self.assertIn("getContext('2d')", papers_js)
        self.assertIn("requestAnimationFrame(tick)", papers_js)
        self.assertIn("data-graph-close", papers_js)

    def test_interview_prep_component_contracts_cover_filters(self):
        parser = parse_html("sections/interview-prep.html")
        interview_js = read("js/interview-prep.js")

        required_ids = {
            "interview-category-summary",
            "interview-approach-summary",
            "interview-search",
            "interview-sort",
            "interview-category-filters",
            "interview-approach-filters",
            "interview-result-stats",
            "interview-problem-grid",
        }
        self.assertTrue(required_ids.issubset(parser.ids), f"Missing interview prep ids: {sorted(required_ids - parser.ids)}")

        self.assertIn("window.setupInterviewPrep = function", interview_js)
        self.assertIn("data-filter-kind", interview_js)
        self.assertIn("Official LeetCode", interview_js)
        self.assertIn("Edge cases and Big O", interview_js)
        self.assertNotIn("onclick=", read("sections/interview-prep.html"))

    def test_each_indexed_paper_has_a_renderable_title_and_body(self):
        indexed = json.loads(read("papers/index.json"))
        failures = []
        for entry in indexed:
            path = ROOT / entry["path"]
            title, body = derive_paper_display(path)
            if not title or title == "Untitled" or not body.strip():
                failures.append(entry["path"])
        self.assertEqual(failures, [], f"Papers missing renderable title/body: {failures}")

    def test_malformed_fenced_frontmatter_samples_still_yield_titles(self):
        samples = [
            """```yaml
---
title: "Unclosed Fence Title"
authors: "A. Author"
---
## Summary
Body text
""",
            """```yaml
---
title: 'Frontmatter Fence With Body'
authors: 'B. Author'
---
```

## Summary
Body text
""",
            """```yaml
title: "Loose Fenced Metadata Title"
authors: "C. Author"
---

## Summary
Body text
```""",
        ]
        for sample in samples:
            title, body = derive_paper_display_from_text(sample, "fallback title")
            self.assertNotEqual(title, "fallback title")
            self.assertTrue(body.strip())

    def test_route_hooks_cover_live_pages(self):
        hooks = read("js/section-hooks.js")
        for route_name, _ in parse_router_routes():
            if "-" in route_name:
                self.assertIn(f"'{route_name}'(", hooks)
            elif route_name == "paper-discovery":
                self.assertIn("'paper-discovery'()", hooks)
            else:
                self.assertRegex(hooks, rf"\b{re.escape(route_name)}\([^)]*\)\s*\{{")

    def test_live_markup_avoids_inline_click_handlers(self):
        for rel_path in [
            "index.html",
            "sections/personal.html",
            "sections/research.html",
            "sections/engineering.html",
            "sections/open-source.html",
            "sections/resources.html",
            "sections/quantum.html",
            "sections/interview-prep.html",
            "sections/paper-discovery.html",
        ]:
            self.assertNotIn("onclick=", read(rel_path), f"{rel_path} should not use inline click handlers")

    def test_index_navigation_exposes_live_tabs(self):
        index_html = read("index.html")
        tabs = set(re.findall(r'data-page="([^"]+)"', index_html))
        self.assertEqual(
            tabs,
            {
                "personal",
                "research",
                "engineering",
                "resources",
                "interview-prep",
                "open-source",
                "paper-discovery",
                "quantum",
            },
        )

    def test_router_handles_same_hash_route_clicks(self):
        router_js = read("js/router.js")
        self.assertIn("function setupRouteDelegation()", router_js)
        self.assertIn("a[href^=\"#/\"]", router_js)
        self.assertIn("handleRoute(href);", router_js)
        self.assertIn("handleRoute(href);\n    }, true);", router_js)
        self.assertIn("window.addEventListener('popstate'", router_js)

    def test_each_resource_route_can_highlight_its_own_nav_item(self):
        router_js = read("js/router.js")
        self.assertNotIn("const resourcePages =", router_js)
        self.assertIn("btn.getAttribute('data-page') === page", router_js)

    def test_navigation_and_page_labels_are_specific(self):
        files = [
            "index.html",
            "sections/personal.html",
            "sections/research.html",
            "sections/engineering.html",
            "sections/resources.html",
            "sections/open-source.html",
        ]
        banned_phrases = [
            "At a glance",
            "Also useful",
            "Best fit",
            "Current focus",
            "Default view",
            "Engineering lanes",
            "Fast paths for hiring readers",
            "Quick links",
            "Representative papers",
            "Research depth with engineering proof",
            "Selected Evidence",
            "The short version",
            "Why it helps",
        ]
        violations = []
        for rel_path in files:
            text = read(rel_path).lower()
            for phrase in banned_phrases:
                if phrase.lower() in text:
                    violations.append((rel_path, phrase))
        self.assertEqual(violations, [], f"Vague live labels remain: {violations}")

    def test_active_page_subnav_is_inline_and_always_visible(self):
        index_html = read("index.html")
        router_js = read("js/router.js")

        self.assertNotIn('id="subnav-toggle"', index_html)
        self.assertNotIn('id="subnav-toggle-label"', index_html)
        # The subnav for the active page is rendered inline below the top nav.
        # It does not pop up on hover and does not float over content; the
        # router toggles a `.hidden` class so only the active page's subnav shows.
        self.assertNotIn(".site-shell:hover .subnav-shell:not(.hidden)", index_html)
        self.assertNotIn(".site-shell:focus-within .subnav-shell:not(.hidden)", index_html)
        self.assertNotIn("position: absolute", index_html.split(".subnav-shell {", 1)[1].split("}", 1)[0])
        # Pages with multiple meaningful in-page destinations expose a subnav.
        for page in ["personal", "research", "engineering", "interview-prep", "open-source"]:
            self.assertIn(f'data-subnav-for="{page}"', index_html)
        # The resources index links outward rather than maintaining in-page navigation.
        for page in ["resources"]:
            self.assertNotIn(f'data-subnav-for="{page}"', index_html)
        self.assertNotIn('data-subnav-for="grf-tutorial"', index_html)
        self.assertNotIn('href="#/grf-tutorial"', index_html)

        for removed in [
            "SUBNAV_COLLAPSE_KEY",
            "toggleSubnavCollapsedForPage",
            "subnavToggleBtn",
            "aria-expanded",
        ]:
            self.assertNotIn(removed, router_js)

    def test_nav_styles_include_phone_tablet_and_desktop_workflow_hints(self):
        index_html = read("index.html")
        for token in [
            "@media (max-width: 768px)",
            "@media (max-width: 1024px)",
            "@media (min-width: 769px) and (max-width: 1200px)",
            "scroll-snap-type: x proximity;",
            "flex-wrap: nowrap !important;",
        ]:
            self.assertIn(token, index_html)

    def test_quantum_controls_cover_toggle_search_jumps_and_paging(self):
        parser = parse_html("sections/quantum.html")
        quantum_html = read("sections/quantum.html")
        quantum_js = read("js/quantum.js")
        lessons = json.loads(read("lessons/index.json"))

        required_ids = {
            "understanding-toggle",
            "understanding-body",
            "lesson-search",
            "lesson-list",
            "lesson-content",
            "lesson-prev",
            "lesson-next",
            "chapter-count",
        }
        self.assertTrue(required_ids.issubset(parser.ids), f"Missing quantum ids: {sorted(required_ids - parser.ids)}")

        available_anchors = set()
        for lesson in lessons:
            match = re.search(r"chapter(\d+)\.md$", lesson["path"])
            if match:
                available_anchors.add(f"chapter{match.group(1)}")

        jump_targets = {attrs["data-quantum-jump"] for tag, attrs in parser.tag_attrs if "data-quantum-jump" in attrs}
        self.assertTrue(jump_targets.issubset(available_anchors), f"Broken quantum jump targets: {sorted(jump_targets - available_anchors)}")

        self.assertIn("lessonSearch.addEventListener('input', applyFilter);", quantum_js)
        self.assertIn("history.replaceState(null, '', canonical);", quantum_js)
        self.assertIn("lesson-prev", quantum_html)
        self.assertIn("lesson-next", quantum_html)
        self.assertIn("#/quantum#", quantum_js)

    def test_ci_workflows_use_curated_fetch_and_full_test_suite(self):
        fetch_workflow = read(".github/workflows/fetch-and-update.yml")
        lesson_workflow = read(".github/workflows/daily_gemini_lesson.yml")
        ci_workflow = read(".github/workflows/ci.yml")
        security_workflow = read(".github/workflows/security-scan.yml")

        self.assertIn(".github/scripts/fetch_paper.py", fetch_workflow)
        self.assertIn("python3 -m unittest discover -s test -q", fetch_workflow)
        self.assertIn("workflow_dispatch:", fetch_workflow)
        self.assertNotIn("schedule:", fetch_workflow)
        self.assertIn("python3 -m unittest discover -s test -q", lesson_workflow)
        self.assertIn("workflow_dispatch:", lesson_workflow)
        self.assertNotIn("schedule:", lesson_workflow)
        self.assertIn("pull_request:", ci_workflow)
        self.assertIn("unit-tests:", ci_workflow)
        self.assertIn("ui-contracts:", ci_workflow)
        self.assertIn("static-site-smoke:", ci_workflow)
        self.assertIn("workflow_dispatch:", security_workflow)

    def test_readme_matches_current_site_and_test_workflow(self):
        readme = read("README.md")
        for expected in [
            "#/personal",
            "#/research",
            "#/quantum",
            "#/paper-discovery",
            "python3 -m http.server 8000",
            "python3 -m unittest discover -s test -q",
            "classes/",
            "archived",
        ]:
            self.assertIn(expected, readme)


if __name__ == "__main__":
    unittest.main()
