import hashlib
import json
import os
import re
from datetime import date
from pathlib import Path
from urllib import error, request


ROOT = Path(__file__).resolve().parents[2]
PAPERS_DIR = ROOT / "papers"
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
API_KEY = os.getenv("GEMINI_API_KEY")

TRACKS = [
    {
        "id": "health-biomechanics",
        "label": "Health AI & Biomechanics",
        "guidance": "Wearable sensing, gait analysis, clinical biomechanics, digital health, rehabilitation, and interpretable models for human movement.",
        "keywords": ["gait", "biomechan", "rehabilitation", "walking", "running", "wearable", "clinical"],
    },
    {
        "id": "personalized-adaptive-ml",
        "label": "Personalized / Adaptive ML",
        "guidance": "Few-shot learning, subject adaptation, personalization, transfer learning, and online adaptation for user-specific models.",
        "keywords": ["personalized", "personali", "subject-specific", "subject adaptive", "few-shot", "meta-learning", "adaptive"],
    },
    {
        "id": "federated-privacy",
        "label": "Federated / Privacy-Preserving ML",
        "guidance": "Federated learning, private adaptation, client-side learning, secure aggregation, distributed personalization, and on-device intelligence.",
        "keywords": ["federated", "privacy", "on-device", "secure aggregation", "distributed learning", "client"],
    },
    {
        "id": "multimodal-embodied-ai",
        "label": "Multi-Sensor / Embodied AI",
        "guidance": "Sensor fusion, multimodal perception, robotics-adjacent learning, kinematics, vision + wearables, and embodied inference.",
        "keywords": ["sensor fusion", "multi-sensor", "multimodal", "vision", "pressure", "emg", "kinematic", "robotics"],
    },
    {
        "id": "efficient-interpretable-ml",
        "label": "Efficient / Interpretable ML Systems",
        "guidance": "Real-time inference, lightweight models, interpretability, physically informed learning, edge deployment, and efficient architectures.",
        "keywords": ["efficient", "real-time", "lightweight", "interpretable", "physics-informed", "physical prior", "edge"],
    },
    {
        "id": "generalization-robustness",
        "label": "Generalization / Robustness",
        "guidance": "Domain adaptation, domain generalization, contrastive learning, self-supervision, cross-subject robustness, and shift-resistant learning.",
        "keywords": ["domain adapt", "domain generaliz", "generalization", "cross-subject", "subject-independent", "contrastive", "robust"],
    },
    {
        "id": "platform-ranking-ml",
        "label": "Platform / Ranking ML",
        "guidance": "Ranking, recommendation, marketplace learning, large-scale applied ML, experimentation, and online optimization for platforms.",
        "keywords": ["ranking", "recommend", "marketplace", "ads", "retrieval", "online learning", "ctr"],
    },
    {
        "id": "cloud-systems-ai",
        "label": "Distributed / Cloud Systems for AI",
        "guidance": "Kubernetes, OpenShift, MLOps, resource federation, scalable AI infrastructure, cloud-native systems, and production ML platforms.",
        "keywords": ["kubernetes", "openshift", "cloud", "distributed systems", "resource federation", "mlops", "platform reliability"],
    },
]

REQUIRED_FIELDS = [
    "title",
    "authors",
    "journal",
    "year",
    "volume",
    "issue",
    "pages",
    "doi",
    "keywords",
    "abstract",
    "curation_track",
]

REQUIRED_SECTIONS = [
    "Summary",
    "Key Contributions and Insights",
    "Why This Fits Bowen's Research and Engineering Lens",
    "Why this is State-of-the-Art",
    "Weaknesses or Limitations and How to Improve",
]


def strip_outer_fences(text):
    source = (text or "").replace("\r\n", "\n").strip().lstrip("\ufeff")
    source = re.sub(
        r"^(?:```+\s*(?:yaml|yml|markdown|md)?|(?:yaml|yml|markdown|md)\s*```+)\s*\n?",
        "",
        source,
        count=1,
        flags=re.IGNORECASE,
    )
    source = re.sub(r"\n?```+\s*$", "", source, count=1, flags=re.IGNORECASE)
    return source.strip()


def extract_frontmatter_field(markdown, key):
    source = strip_outer_fences(markdown)
    match = re.search(rf"^\s*{re.escape(key)}\s*:\s*(.+?)\s*$", source, re.IGNORECASE | re.MULTILINE)
    if not match:
        return ""
    value = match.group(1).strip()
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1].strip()
    return value.strip()


def ensure_frontmatter_field(markdown, key, value):
    if re.search(rf"^\s*{re.escape(key)}\s*:", markdown, re.IGNORECASE | re.MULTILINE):
        return markdown
    if not markdown.startswith("---"):
        return markdown

    lines = markdown.split("\n")
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            lines.insert(index, f'{key}: "{value}"')
            return "\n".join(lines)
    return markdown


def sanitize_markdown(markdown, track_label):
    text = strip_outer_fences(markdown)
    if not text.startswith("---"):
        heading_match = re.search(r"^##\s+", text, re.MULTILINE)
        if heading_match:
            frontmatter_candidate = text[: heading_match.start()].strip()
            body = text[heading_match.start() :].strip()
            if re.search(r"^\s*title\s*:", frontmatter_candidate, re.IGNORECASE | re.MULTILINE):
                text = f"---\n{frontmatter_candidate}\n---\n\n{body}".strip()

    text = ensure_frontmatter_field(text, "curation_track", track_label)
    return text.rstrip() + "\n"


def extract_existing_papers():
    papers = []
    for path in sorted(PAPERS_DIR.glob("*.md")):
        source = path.read_text(encoding="utf-8")
        papers.append(
            {
                "path": path,
                "title": extract_frontmatter_field(source, "title"),
                "doi": extract_frontmatter_field(source, "doi"),
                "track": extract_frontmatter_field(source, "curation_track"),
                "text": strip_outer_fences(source).lower(),
            }
        )
    return papers


def infer_track_counts(existing_papers):
    counts = {track["id"]: 0 for track in TRACKS}
    for paper in existing_papers:
        matched_any = False
        track_hint = (paper.get("track") or "").lower()
        text = paper["text"]
        for track in TRACKS:
            if track_hint and track["label"].lower() in track_hint:
                counts[track["id"]] += 1
                matched_any = True
                continue
            if any(keyword in text for keyword in track["keywords"]):
                counts[track["id"]] += 1
                matched_any = True
        if not matched_any and "ground reaction force" in text:
            counts["health-biomechanics"] += 1
    return counts


def select_target_track(track_counts, rotation_seed):
    min_count = min(track_counts.values())
    candidates = [track for track in TRACKS if track_counts[track["id"]] == min_count]
    return candidates[rotation_seed % len(candidates)]


def build_prompt(target_track, existing_titles, existing_dois):
    title_list = "; ".join(existing_titles) if existing_titles else "none yet"
    doi_list = "; ".join(existing_dois) if existing_dois else "none yet"
    profile = (
        "Bowen Song is an AI scientist and systems-minded engineer whose work spans "
        "health AI, wearable biomechanics, interpretable and efficient ML, federated and personalized learning, "
        "multi-sensor inference, ranking systems at eBay, and cloud-native platform engineering at Red Hat."
    )
    return (
        f"You are curating the Paper Discovery section for Bowen Song. {profile}\n\n"
        f"Target discovery track for this run: {target_track['label']}.\n"
        f"Track guidance: {target_track['guidance']}\n\n"
        "Important curation goals:\n"
        "1. Diversify the collection beyond the current over-concentration in GRF-from-IMU papers.\n"
        "2. Pick one paper published in 2022 or later that strongly fits the target discovery track.\n"
        "3. Prefer papers that bridge multiple parts of Bowen's profile, such as health AI + efficient inference, "
        "federated learning + personalization, embodied sensing + robustness, or systems + applied ML.\n"
        "4. If the target track is platform/ranking/cloud, do not drift back to another GRF estimation paper.\n"
        "5. Do not repeat or closely paraphrase existing papers already in the collection.\n\n"
        f"Existing titles to avoid: {title_list}\n"
        f"Existing DOIs to avoid: {doi_list}\n\n"
        "Return ONLY raw markdown. Do not wrap the answer in ``` fences.\n"
        "The output must start with YAML frontmatter delimited by --- and must include these fields exactly:\n"
        "title, authors, journal, year, volume, issue, pages, doi, keywords, abstract, curation_track.\n"
        f'Set curation_track to "{target_track["label"]}".\n\n'
        "After the frontmatter, include these markdown sections in this exact order:\n"
        "## Summary\n"
        "## Key Contributions and Insights\n"
        "## Why This Fits Bowen's Research and Engineering Lens\n"
        "## Why this is State-of-the-Art\n"
        "## Weaknesses or Limitations and How to Improve\n\n"
        "Do not add conversational text before or after the markdown file."
    )


def validate_markdown(markdown):
    missing_fields = [field for field in REQUIRED_FIELDS if not extract_frontmatter_field(markdown, field)]
    if missing_fields:
        raise RuntimeError(f"Missing frontmatter fields: {', '.join(missing_fields)}")

    missing_sections = [section for section in REQUIRED_SECTIONS if f"## {section}" not in markdown]
    if missing_sections:
        raise RuntimeError(f"Missing sections: {', '.join(missing_sections)}")


def call_gemini(prompt):
    if not API_KEY:
        raise RuntimeError("GEMINI_API_KEY not set in environment.")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.5},
    }
    req = request.Request(
        GEMINI_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-goog-api-key": API_KEY,
        },
        method="POST",
    )

    try:
        with request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini request failed with {exc.code}: {body}") from exc

    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as exc:
        raise RuntimeError(f"Could not parse Gemini response: {data}") from exc


def sanitize_identifier(value):
    cleaned = (value or "").strip().lower()
    cleaned = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", cleaned)
    cleaned = cleaned.replace("/", "-").replace(".", "-")
    cleaned = re.sub(r"[^a-z0-9-]+", "-", cleaned).strip("-")
    return cleaned


def save_generated_paper(markdown, existing_titles, existing_dois):
    title = extract_frontmatter_field(markdown, "title")
    doi = extract_frontmatter_field(markdown, "doi")

    if title.lower() in existing_titles:
        raise RuntimeError(f"Gemini returned a duplicate title: {title}")
    if doi and doi.lower() in existing_dois:
        raise RuntimeError(f"Gemini returned a duplicate DOI: {doi}")

    if doi:
        slug = sanitize_identifier(doi)
    else:
        slug = f"no-doi-{hashlib.sha1(markdown.encode('utf-8')).hexdigest()[:8]}"

    filename = PAPERS_DIR / f"gemini_{date.today().isoformat()}_{slug}.md"
    filename.write_text(markdown, encoding="utf-8")
    return filename


def main():
    existing_papers = extract_existing_papers()
    existing_titles = [paper["title"] for paper in existing_papers if paper["title"]]
    existing_dois = [paper["doi"].lower() for paper in existing_papers if paper["doi"]]

    track_counts = infer_track_counts(existing_papers)
    target_track = select_target_track(track_counts, len(existing_papers))
    prompt = build_prompt(target_track, existing_titles, existing_dois)
    generated = call_gemini(prompt)
    sanitized = sanitize_markdown(generated, target_track["label"])
    validate_markdown(sanitized)
    path = save_generated_paper(sanitized, {title.lower() for title in existing_titles}, set(existing_dois))
    print(f"Saved curated paper to {path.relative_to(ROOT)}")
    print(f"Target track: {target_track['label']}")


if __name__ == "__main__":
    main()
