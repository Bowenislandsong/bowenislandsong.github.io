import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / ".github" / "scripts" / "fetch_paper.py"


def load_module():
    spec = importlib.util.spec_from_file_location("fetch_paper", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


FETCH_PAPER = load_module()


class GeminiFetchWorkflowTest(unittest.TestCase):
    def test_sanitize_markdown_strips_yaml_fences_and_injects_track(self):
        raw = """```yaml
---
title: "Test Paper"
authors: "A. Researcher"
journal: "Journal of Testing"
year: 2025
volume: 1
issue: 2
pages: 3-4
doi: "10.1234/example"
keywords: "federated learning"
abstract: "Example abstract."
---
## Summary
Hello
## Key Contributions and Insights
- One
## Why This Fits Bowen's Research and Engineering Lens
Helpful
## Why this is State-of-the-Art
Strong
## Weaknesses or Limitations and How to Improve
Needs work
"""
        sanitized = FETCH_PAPER.sanitize_markdown(raw, "Federated / Privacy-Preserving ML")
        self.assertTrue(sanitized.startswith("---"))
        self.assertNotIn("```", sanitized)
        self.assertIn('curation_track: "Federated / Privacy-Preserving ML"', sanitized)

    def test_extract_frontmatter_field_handles_single_and_double_quotes(self):
        raw = """---
title: 'Single Quoted Title'
doi: "10.1234/example"
---
## Summary
Body
"""
        self.assertEqual(FETCH_PAPER.extract_frontmatter_field(raw, "title"), "Single Quoted Title")
        self.assertEqual(FETCH_PAPER.extract_frontmatter_field(raw, "doi"), "10.1234/example")

    def test_track_selection_prefers_underrepresented_lanes(self):
        counts = {track["id"]: 4 for track in FETCH_PAPER.TRACKS}
        counts["platform-ranking-ml"] = 0
        counts["cloud-systems-ai"] = 0
        selected = FETCH_PAPER.select_target_track(counts, rotation_seed=1)
        self.assertIn(selected["id"], {"platform-ranking-ml", "cloud-systems-ai"})

    def test_prompt_reflects_portfolio_diversity_and_required_sections(self):
        target_track = FETCH_PAPER.TRACKS[-1]
        prompt = FETCH_PAPER.build_prompt(target_track, ["Existing Paper"], ["10.5555/existing"])
        for expected in [
            "Diversify the collection beyond the current over-concentration",
            "health AI",
            "ranking systems at eBay",
            "cloud-native platform engineering at Red Hat",
            target_track["label"],
            "## Why This Fits Bowen's Research and Engineering Lens",
        ]:
            self.assertIn(expected, prompt)

    def test_validate_markdown_accepts_required_frontmatter_and_sections(self):
        markdown = """---
title: "Track-Aligned Paper"
authors: "A. Author"
journal: "Systems Journal"
year: 2025
volume: 7
issue: 1
pages: 10-20
doi: "10.1234/track"
keywords: "ranking, cloud"
abstract: "Summary"
curation_track: "Platform / Ranking ML"
---
## Summary
Summary text.
## Key Contributions and Insights
- Insight
## Why This Fits Bowen's Research and Engineering Lens
Lens text.
## Why this is State-of-the-Art
Strong.
## Weaknesses or Limitations and How to Improve
Limitations.
"""
        FETCH_PAPER.validate_markdown(markdown)


if __name__ == "__main__":
    unittest.main()
