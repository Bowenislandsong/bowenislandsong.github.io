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
        expected = {"personal", "research", "quantum", "paper-discovery"}
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

    def test_personal_anchor_contract(self):
        personal_html = read("sections/personal.html")
        ids = set(re.findall(r'id="([^"]+)"', personal_html))
        expected = {
            "overview",
            "fit",
            "experience",
            "contact",
        }
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
            "talks",
        }
        self.assertTrue(expected.issubset(ids), f"Missing research anchors: {sorted(expected - ids)}")

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
        for route in ["#/personal", "#/research", "#/quantum", "#/paper-discovery"]:
            self.assertIn(route, sitemap)


if __name__ == "__main__":
    unittest.main()
