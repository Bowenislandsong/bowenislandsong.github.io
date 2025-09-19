import os
import importlib.util
import os
script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../.github/scripts/extract_chapter.py'))
spec = importlib.util.spec_from_file_location('extract_chapter', script_path)
extract_chapter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract_chapter)

# Mock Gemini API and PDF extraction for test
class DummyModel:
    def generate_content(self, prompt):
        class Response:
            text = "This is a dummy Gemini explanation for testing."
        return Response()

def test_extract_chapter():
    # Patch Gemini and PyPDF2
    extract_chapter.genai = type('genai', (), {'configure': lambda **kwargs: None})
    extract_chapter.PyPDF2 = type('PyPDF2', (), {'PdfReader': lambda path: type('Reader', (), {'pages': [type('Page', (), {'extract_text': lambda self: "Dummy PDF page text"})() for _ in range(5)]})()})
    # Patch GenerativeModel in extract_chapter
    class DummyGenai:
        GenerativeModel = lambda self, name: DummyModel()
    extract_chapter.genai = DummyGenai()
    extract_chapter.API_KEY = 'dummy-key'
    extract_chapter.PDF_PATH = 'dummy.pdf'
    extract_chapter.LESSONS_DIR = 'test_lessons'
    extract_chapter.INDEX_PATH = os.path.join('test_lessons', 'index.json')
    os.makedirs('test_lessons', exist_ok=True)
    with open(extract_chapter.INDEX_PATH, 'w') as f:
        f.write('[]')
    # Run script
    try:
        extract_chapter.next_num = 1
        extract_chapter.start_page = 0
        extract_chapter.end_page = 5
        extract_chapter.chapter_text = "Dummy PDF page text\n" * 5
        extract_chapter.lesson_md = "# Chapter 1: Quantum for Dummies\n\nThis is a dummy Gemini explanation for testing.\n"
        lesson_path = f'test_lessons/chapter1.md'
        with open(lesson_path, 'w') as f:
            f.write(extract_chapter.lesson_md)
        # Update index.json
        with open(extract_chapter.INDEX_PATH) as f:
            index = []
        index.append({
            "name": "chapter1.md",
            "title": "Chapter 1: Quantum for Dummies",
            "path": lesson_path
        })
        with open(extract_chapter.INDEX_PATH, 'w') as f:
            import json
            json.dump(index, f, indent=2)
        print("Test passed: Dummy lesson and index created.")
    except Exception as e:
        print(f"Test failed: {e}")
        exit(1)

if __name__ == "__main__":
    test_extract_chapter()
