import glob
import re
def get_explored_titles():
    titles = []
    for fname in glob.glob("papers/*.md"):
        try:
            with open(fname) as f:
                content = f.read()
                m = re.search(r'title:\s*"(.*?)"', content)
                if m:
                    titles.append(m.group(1))
        except Exception:
            continue
    return titles

explored_titles = get_explored_titles()
explored_str = "; ".join(explored_titles)
PROMPT = (
    "Previously explored papers: " + explored_str +
    ". Please do not repeat these. Find a new, recent paper related to Estimating Ground Reaction Forces from Inertial Sensors. Same topic, or in high relevance (e.g., Federated Learning, Personalization). Only select papers published in the last 3 years. "
    "Return ONLY a markdown file, with NO conversational text, NO explanations, and NO code block markers Just plan text for the readme file. "
    "The output must start with YAML frontmatter (delimited by ---) containing these fields: title, authors, journal, year, volume, issue, pages, doi, keywords, abstract. "
    "--- \n"
    "After the frontmatter, provide the following markdown sections in order:\n"
    "## Summary\n"
    "A concise summary of the paper.\n"
    "## Key Contributions and Insights\n"
    "Bullet points of the main contributions and insights.\n"
    "## Why this is State-of-the-Art\n"
    "Explain why this work is state-of-the-art.\n"
    "## Weaknesses or Limitations and How to Improve\n"
    "List weaknesses or limitations and suggest improvements.\n"
    "Do NOT include any conversational text, explanations, or code block markers. The output should start with '---' and end after the last section. No extra text."
)

import os
import requests
from datetime import date

os.makedirs("papers", exist_ok=True)


API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in environment.")

headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": API_KEY
}
body = {
    "contents": [
        {
            "parts": [
                {"text": PROMPT}
            ]
        }
    ]
}

response = requests.post(GEMINI_ENDPOINT, headers=headers, json=body)
response.raise_for_status()
data = response.json()



# Extract markdown from Gemini response
try:
  markdown = data['candidates'][0]['content']['parts'][0]['text']
except Exception as e:
  raise RuntimeError(f"Could not parse Gemini response: {e}\nFull response: {data}")

# Extract DOI for unique filename
doi_match = re.search(r'doi:\s*([\w./-]+)', markdown)
if doi_match:
  doi_id = doi_match.group(1).replace('/', '-').replace('.', '-')
else:
  # fallback: use date and hash
  import hashlib
  hash_id = hashlib.sha1(markdown.encode()).hexdigest()[:8]
  doi_id = f"no-doi-{hash_id}"

filename = f"papers/gemini_{date.today().isoformat()}_{doi_id}.md"
with open(filename, "w") as f:
  f.write(markdown.strip() + '\n')

print(f"Saved paper to {filename}")
