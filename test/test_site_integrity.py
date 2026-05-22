import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SECTIONS_DIR = ROOT / "sections"


def read(rel_path):
    return (ROOT / rel_path).read_text(encoding="utf-8")


def sort_entries(entries):
    return sorted(entries, key=lambda item: (item["path"].lower(), item["name"].lower()))


def parse_router_routes():
    router = read("js/router.js")
    pattern = re.compile(r"(?:'([^']+)'|([A-Za-z-]+)):\s*'sections/([^']+)\.html'")
    pairs = []
    for quoted, bare, section in pattern.findall(router):
        route_name = quoted or bare
        pairs.append((route_name, section))
    return pairs


class SiteIntegrityTest(unittest.TestCase):
    def test_supported_routes_match_sections(self):
        expected = {
            "personal",
            "research",
            "engineering",
            "resources",
            "interview-prep",
            "open-source",
            "quantum",
            "paper-discovery",
        }
        routes = parse_router_routes()
        self.assertEqual({name for name, _ in routes}, expected)
        for name, section in routes:
            self.assertEqual(name, section)
            self.assertTrue((SECTIONS_DIR / f"{section}.html").exists())

    def test_classes_are_archived_from_live_navigation(self):
        index_html = read("index.html")
        router = read("js/router.js")
        self.assertNotIn('href="#/classes"', index_html)
        self.assertNotIn("classes: 'sections/classes.html'", router)
        self.assertFalse((SECTIONS_DIR / "classes.html").exists())
        self.assertFalse((ROOT / "js/classes.js").exists())

    def test_section_partials_are_markup_only(self):
        for section_path in SECTIONS_DIR.glob("*.html"):
            text = section_path.read_text(encoding="utf-8")
            self.assertNotIn("<script", text.lower(), f"{section_path.name} should be markup-only")

    def test_index_local_assets_exist(self):
        index_html = read("index.html")
        refs = re.findall(r'(?:src|href)="([^"]+)"', index_html)
        local_refs = []
        for ref in refs:
            if ref.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
                continue
            path = ref.split("#", 1)[0].split("?", 1)[0]
            if not path:
                continue
            target = ROOT / path.lstrip("/")
            local_refs.append((ref, target))

        missing = [ref for ref, target in local_refs if not target.exists()]
        self.assertEqual(missing, [], f"Missing local refs in index.html: {missing}")

    def test_index_seo_mentions_interview_prep(self):
        index_html = read("index.html").lower()
        self.assertIn("coding interview prep", index_html)
        self.assertIn("leetcode", index_html)
        self.assertIn("google interview prep", index_html)

    def test_personal_anchor_contract(self):
        personal_html = read("sections/personal.html")
        ids = set(re.findall(r'id="([^"]+)"', personal_html))
        expected = {"overview"}
        self.assertTrue(expected.issubset(ids), f"Missing personal anchors: {sorted(expected - ids)}")

    def test_research_anchor_contract(self):
        research_html = read("sections/research.html")
        ids = set(re.findall(r'id="([^"]+)"', research_html))
        expected = {
            "research-overview",
            "publications",
            "projects",
            "agenda",
            "teaching",
        }
        self.assertTrue(expected.issubset(ids), f"Missing research anchors: {sorted(expected - ids)}")

    def test_engineering_anchor_contract(self):
        engineering_html = read("sections/engineering.html")
        ids = set(re.findall(r'id="([^"]+)"', engineering_html))
        expected = {
            "engineering-overview",
            "engineering-experience",
        }
        self.assertTrue(expected.issubset(ids), f"Missing engineering anchors: {sorted(expected - ids)}")

    def test_open_source_anchor_contract(self):
        open_source_html = read("sections/open-source.html")
        ids = set(re.findall(r'id="([^"]+)"', open_source_html))
        expected = {
            "open-source-overview",
            "featured-projects",
            "upstream",
        }
        self.assertTrue(expected.issubset(ids), f"Missing open-source anchors: {sorted(expected - ids)}")

    def test_resources_anchor_contract(self):
        resources_html = read("sections/resources.html")
        ids = set(re.findall(r'id="([^"]+)"', resources_html))
        expected = {
            "resources-overview",
        }
        self.assertTrue(expected.issubset(ids), f"Missing resources anchors: {sorted(expected - ids)}")

    def test_interview_prep_anchor_contract(self):
        interview_html = read("sections/interview-prep.html")
        ids = set(re.findall(r'id="([^"]+)"', interview_html))
        expected = {
            "prep-overview",
            "python-toolkit",
            "category-map",
            "approach-map",
            "problem-browser",
            "study-playbook",
        }
        self.assertTrue(expected.issubset(ids), f"Missing interview prep anchors: {sorted(expected - ids)}")

    def test_open_source_links_core_project_repos(self):
        open_source_html = read("sections/open-source.html")
        for href in [
            "https://bowen-ai.github.io/AgenticLocal/",
            "https://github.com/Bowen-AI/AgenticLocal",
            "https://bluemoonbeige.vercel.app",
            "https://github.com/Bowen-AI/Blue-Moon",
            "https://bowen-ai.github.io/Local-Latex/",
            "https://github.com/Bowen-AI/Local-Latex",
            "https://marketplace.visualstudio.com/items?itemName=BowenAI.latex-one-click",
            "https://open-vsx.org/extension/BowenAI/latex-one-click",
            "https://github.com/Bowenislandsong/SER",
            "https://github.com/Bowenislandsong/CoT-Rec",
            "https://github.com/String-Reconciliation-Ditributed-System/RCDS_GO",
            "https://github.com/Bowenislandsong/shapley-value",
            "https://pypi.org/project/shapley-value/",
            "https://github.com/operator-framework/operator-lifecycle-manager",
            "https://github.com/operator-framework/flake-analyzer",
        ]:
            self.assertIn(href, open_source_html)

    def test_classes_manifest_matches_repo(self):
        actual = []
        for path in sorted((ROOT / "classes").rglob("*")):
            suffix = path.suffix.lower()
            if suffix not in {".pdf", ".md", ".asm"}:
                continue
            file_type = "pdf" if suffix == ".pdf" else "markdown" if suffix == ".md" else "asm"
            actual.append(
                {
                    "name": path.name,
                    "path": path.relative_to(ROOT).as_posix(),
                    "type": file_type,
                }
            )

        indexed = json.loads(read("classes/index.json"))
        self.assertEqual(sort_entries(indexed), sort_entries(actual))

    def test_papers_manifest_matches_repo(self):
        actual = [
            {
                "name": path.name,
                "path": path.relative_to(ROOT).as_posix(),
            }
            for path in sorted((ROOT / "papers").glob("*.md"))
        ]
        indexed = json.loads(read("papers/index.json"))
        self.assertEqual(sort_entries(indexed), sort_entries(actual))

    def test_quantum_deeplink_contract(self):
        quantum_js = read("js/quantum.js")
        self.assertIn("#/quantum#", quantum_js)
        self.assertNotIn("window.location.hash = `chapter", quantum_js)

    def test_sitemap_includes_live_routes(self):
        sitemap = read("sitemap.xml")
        for route in [
            "#/personal",
            "#/research",
            "#/engineering",
            "#/resources",
            "#/interview-prep",
            "#/open-source",
            "#/quantum",
            "#/paper-discovery",
        ]:
            self.assertIn(route, sitemap)
        self.assertNotIn("#/resume", sitemap)
        self.assertNotIn("#/grf-tutorial", sitemap)


if __name__ == "__main__":
    unittest.main()
