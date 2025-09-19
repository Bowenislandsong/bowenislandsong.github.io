import os
import glob
import json
import PyPDF2
import google.generativeai as genai
import matplotlib.pyplot as plt
from datetime import date

PDF_PATH = 'lessons/introduction-to-classical-and-quantum-computing.pdf'
LESSONS_DIR = 'lessons'
INDEX_PATH = os.path.join(LESSONS_DIR, 'index.json')
API_KEY = os.getenv('GEMINI_API_KEY')

# Find next chapter number
existing = sorted(glob.glob(f'{LESSONS_DIR}/chapter*.md'))
next_num = len(existing) + 1

# Extract chapter text from PDF
reader = PyPDF2.PdfReader(PDF_PATH)
# For demo: extract 5 pages per chapter
start_page = (next_num - 1) * 5
end_page = min(start_page + 5, len(reader.pages))
chapter_text = ''
for i in range(start_page, end_page):
    chapter_text += reader.pages[i].extract_text() + '\n'

if not chapter_text.strip():
    print('No more chapters to extract.')
    exit(0)

# Gemini API: explain for dummies, suggest a graph
if not API_KEY:
    raise RuntimeError('GEMINI_API_KEY not set')
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')
prompt = f"""
Explain the following quantum computing textbook chapter for absolute beginners. Use simple words, analogies, and examples. Suggest a graph or diagram to help understanding, and describe it in words.\n\n{chapter_text}
"""
response = model.generate_content(prompt)
lesson_md = f"# Chapter {next_num}: Quantum for Dummies\n\n{response.text}\n"

# Save lesson
lesson_path = f'{LESSONS_DIR}/chapter{next_num}.md'
with open(lesson_path, 'w') as f:
    f.write(lesson_md)

# (Optional) Generate a placeholder graph image
plt.figure(figsize=(6,4))
plt.title(f"Chapter {next_num} - Example Graph")
plt.plot([0,1,2],[0,1,0], marker='o')
plt.xlabel('Example X')
plt.ylabel('Example Y')
img_path = f'{LESSONS_DIR}/chapter{next_num}_graph.png'
plt.savefig(img_path)
plt.close()

# Update index.json

# Handle empty or missing index.json gracefully
if not os.path.exists(INDEX_PATH) or os.stat(INDEX_PATH).st_size == 0:
    index = []
else:
    with open(INDEX_PATH) as f:
        try:
            index = json.load(f)
        except json.JSONDecodeError:
            index = []

# Save original PDF section as .txt for side-by-side view
original_dir = os.path.join(LESSONS_DIR, 'original')
os.makedirs(original_dir, exist_ok=True)
original_txt_path = os.path.join(original_dir, f'chapter{next_num}.txt')
with open(original_txt_path, 'w') as f:
    f.write(chapter_text)

index.append({
    "name": f"chapter{next_num}.md",
    "title": f"Chapter {next_num}: Quantum for Dummies",
    "path": lesson_path,
    "original": original_txt_path
})
with open(INDEX_PATH, 'w') as f:
    json.dump(index, f, indent=2)

print(f"Added lesson: {lesson_path}")
