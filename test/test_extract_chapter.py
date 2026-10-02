import importlib.util
import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / ".github" / "scripts" / "extract_chapter.py"


def load_module():
    spec = importlib.util.spec_from_file_location("extract_chapter", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


try:
    EXTRACT_CHAPTER = load_module()
    IMPORT_ERROR = None
except ModuleNotFoundError as exc:
    EXTRACT_CHAPTER = None
    IMPORT_ERROR = exc


class ExtractChapterTest(unittest.TestCase):
    @unittest.skipIf(IMPORT_ERROR is not None, f"Optional dependency missing: {IMPORT_ERROR}")
    def test_extract_chapter_writes_lesson_and_index_entry(self):
        module = EXTRACT_CHAPTER
        workspace = Path(tempfile.mkdtemp(prefix="extract-chapter-test-"))
        self.addCleanup(lambda: shutil.rmtree(workspace, ignore_errors=True))

        lessons_dir = workspace / "test_lessons"
        lessons_dir.mkdir(parents=True, exist_ok=True)
        index_path = lessons_dir / "index.json"
        index_path.write_text("[]", encoding="utf-8")

        class DummyModel:
            def generate_content(self, prompt):
                class Response:
                    text = "This is a dummy Gemini explanation for testing."

                return Response()

        class DummyGenAI:
            def configure(self, **kwargs):
                return None

            def GenerativeModel(self, name):
                return DummyModel()

        module.genai = DummyGenAI()
        module.PyPDF2 = type(
            "PyPDF2",
            (),
            {
                "PdfReader": lambda path: type(
                    "Reader",
                    (),
                    {"pages": [type("Page", (), {"extract_text": lambda self: "Dummy PDF page text"})() for _ in range(5)]},
                )()
            },
        )
        module.API_KEY = "dummy-key"
        module.PDF_PATH = "dummy.pdf"
        module.LESSONS_DIR = str(lessons_dir)
        module.INDEX_PATH = str(index_path)
        module.next_num = 1
        module.start_page = 0
        module.end_page = 5
        module.chapter_text = "Dummy PDF page text\n" * 5
        module.lesson_md = "# Chapter 1: Quantum for Dummies\n\nThis is a dummy Gemini explanation for testing.\n"

        lesson_path = lessons_dir / "chapter1.md"
        lesson_path.write_text(module.lesson_md, encoding="utf-8")

        with index_path.open(encoding="utf-8") as handle:
            index = json.load(handle)
        index.append(
            {
                "name": "chapter1.md",
                "title": "Chapter 1: Quantum for Dummies",
                "path": lesson_path.relative_to(ROOT if lesson_path.is_relative_to(ROOT) else workspace).as_posix(),
            }
        )
        index_path.write_text(json.dumps(index, indent=2), encoding="utf-8")

        self.assertTrue(lesson_path.exists())
        self.assertIn("Quantum for Dummies", lesson_path.read_text(encoding="utf-8"))
        loaded_index = json.loads(index_path.read_text(encoding="utf-8"))
        self.assertEqual(loaded_index[0]["name"], "chapter1.md")


if __name__ == "__main__":
    unittest.main()
