#!/usr/bin/env python3
"""Build compact resume PDFs from resume/index.json without external deps."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LETTER_WIDTH = 612.0
LETTER_HEIGHT = 792.0
MARGIN_X = 42.0
TOP_MARGIN = 46.0
BOTTOM_MARGIN = 40.0
CONTENT_WIDTH = LETTER_WIDTH - (2 * MARGIN_X)
CONTENT_RIGHT = LETTER_WIDTH - MARGIN_X

FONT_REGULAR = "F1"
FONT_BOLD = "F2"
FONT_ITALIC = "F3"

SECTION_TITLES = {
    "experience": "Experience",
    "projects": "Projects",
    "publications": "Publications",
    "education": "Education",
    "skills": "Skills",
}


def ascii_clean(text: str) -> str:
    replacements = {
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2022": "-",
        "\u00a0": " ",
        "\u03a6": "Phi",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"\s+", " ", text).strip()
    return text.encode("latin-1", "ignore").decode("latin-1")


def pdf_escape(text: str) -> str:
    return ascii_clean(text).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def measure_text(text: str, font_size: float, bold: bool = False) -> float:
    width = 0.0
    for char in ascii_clean(text):
        if char == " ":
            factor = 0.28
        elif char in "il.,:;!'`|[]()":
            factor = 0.24
        elif char in "fjrtI":
            factor = 0.33
        elif char in "mwMW@#%&":
            factor = 0.9
        elif char.isupper():
            factor = 0.62
        else:
            factor = 0.52
        if bold:
            factor += 0.03
        width += font_size * factor
    return width


def wrap_text(text: str, max_width: float, font_size: float, bold: bool = False) -> list[str]:
    cleaned = ascii_clean(text)
    if not cleaned:
        return []
    words = cleaned.split(" ")
    lines = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if measure_text(candidate, font_size, bold=bold) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def filter_visible(items: list[dict], audience: str) -> list[dict]:
    return [item for item in items if not item.get("audiences") or audience in item.get("audiences", [])]


def pick_by_ids(items: list[dict], ids: list[str]) -> list[dict]:
    lookup = {item["id"]: item for item in items}
    return [lookup[item_id] for item_id in ids if item_id in lookup]


class PdfCanvas:
    def __init__(self) -> None:
        self.pages: list[str] = []
        self.commands: list[str] = []

    def begin_page(self) -> None:
        if self.commands:
            self.pages.append("\n".join(self.commands))
        self.commands = []

    def text(self, x: float, y: float, text: str, *, font: str = FONT_REGULAR, size: float = 10.0, color=(0, 0, 0)) -> None:
        r, g, b = color
        self.commands.append(
            f"{r:.3f} {g:.3f} {b:.3f} rg BT /{font} {size:.2f} Tf 1 0 0 1 {x:.2f} {y:.2f} Tm ({pdf_escape(text)}) Tj ET"
        )

    def rule(self, x1: float, y1: float, x2: float, y2: float, *, color=(0.74, 0.78, 0.83), width: float = 0.8) -> None:
        r, g, b = color
        self.commands.append(
            f"{width:.2f} w {r:.3f} {g:.3f} {b:.3f} RG {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S"
        )

    def fill_rect(self, x: float, y: float, width: float, height: float, *, fill=(0.95, 0.97, 0.98)) -> None:
        r, g, b = fill
        self.commands.append(
            f"{r:.3f} {g:.3f} {b:.3f} rg {x:.2f} {y:.2f} {width:.2f} {height:.2f} re f"
        )

    def finish(self) -> None:
        if self.commands:
            self.pages.append("\n".join(self.commands))
            self.commands = []

    def to_pdf(self) -> bytes:
        self.finish()

        objects: list[object | None] = []

        def add_object(value: object | None) -> int:
            objects.append(value)
            return len(objects)

        def set_object(obj_id: int, value: object) -> None:
            objects[obj_id - 1] = value

        font_regular = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        font_bold = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
        font_italic = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>")
        pages_id = add_object(None)

        page_ids = []
        for page_stream in self.pages:
            stream_bytes = page_stream.encode("latin-1")
            content_id = add_object(("stream", stream_bytes))
            page_id = add_object(
                (
                    "<< /Type /Page /Parent {pages} 0 R /MediaBox [0 0 {w:.0f} {h:.0f}] "
                    "/Resources << /Font << /F1 {f1} 0 R /F2 {f2} 0 R /F3 {f3} 0 R >> >> "
                    "/Contents {content} 0 R >>"
                ).format(
                    pages=pages_id,
                    w=LETTER_WIDTH,
                    h=LETTER_HEIGHT,
                    f1=font_regular,
                    f2=font_bold,
                    f3=font_italic,
                    content=content_id,
                )
            )
            page_ids.append(page_id)

        kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
        set_object(pages_id, f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

        out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offsets = []
        for index, obj in enumerate(objects, start=1):
            offsets.append(len(out))
            out.extend(f"{index} 0 obj\n".encode("latin-1"))
            if isinstance(obj, tuple) and obj[0] == "stream":
                stream_bytes = obj[1]
                out.extend(f"<< /Length {len(stream_bytes)} >>\nstream\n".encode("latin-1"))
                out.extend(stream_bytes)
                out.extend(b"\nendstream\n")
            else:
                out.extend(str(obj).encode("latin-1"))
                out.extend(b"\n")
            out.extend(b"endobj\n")

        xref_start = len(out)
        out.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
        out.extend(b"0000000000 65535 f \n")
        for offset in offsets:
            out.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
        out.extend(
            (
                "trailer\n"
                f"<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
                "startxref\n"
                f"{xref_start}\n"
                "%%EOF\n"
            ).encode("latin-1")
        )
        return bytes(out)


class ResumePdfRenderer:
    def __init__(self, data: dict, variant_key: str) -> None:
        self.data = data
        self.variant_key = variant_key
        self.variant = data["variants"][variant_key]
        self.profile = data["profile"]
        self.canvas = PdfCanvas()
        self.page_count = 0
        self.y = 0.0
        self.resume_title = ascii_clean(self.variant["title"])

    def start_page(self, continued: bool = False) -> None:
        if self.page_count and self.canvas.commands:
            self.add_page_footer(self.page_count)
        self.canvas.begin_page()
        self.page_count += 1
        self.canvas.fill_rect(0, 0, LETTER_WIDTH, LETTER_HEIGHT, fill=(1, 1, 1))
        self.y = LETTER_HEIGHT - TOP_MARGIN
        if continued:
            self.canvas.fill_rect(MARGIN_X - 6, self.y - 10, CONTENT_WIDTH + 12, 16, fill=(0.97, 0.98, 0.99))
            self.canvas.text(MARGIN_X, self.y, "Bowen Song", font=FONT_BOLD, size=10.2)
            self.canvas.text(MARGIN_X + 104, self.y, self.resume_title, size=8.7, color=(0.2, 0.24, 0.31))
            self.y -= 16
            self.canvas.rule(MARGIN_X, self.y, LETTER_WIDTH - MARGIN_X, self.y, color=(0.82, 0.85, 0.88), width=0.6)
            self.y -= 10

    def add_page_footer(self, page_number: int) -> None:
        footer_y = 22
        self.canvas.rule(MARGIN_X, footer_y + 8, LETTER_WIDTH - MARGIN_X, footer_y + 8, color=(0.86, 0.89, 0.91), width=0.6)
        label = f"Page {page_number}"
        label_width = measure_text(label, 7.4)
        self.canvas.text(CONTENT_RIGHT - label_width, footer_y - 1, label, size=7.4, color=(0.43, 0.47, 0.52))

    def ensure_space(self, amount: float) -> None:
        if self.y - amount < BOTTOM_MARGIN:
            self.start_page(continued=True)

    def write_lines(self, lines: list[str], *, x: float, font: str, size: float, color=(0, 0, 0), leading: float | None = None) -> None:
        line_gap = leading or (size * 1.28)
        for line in lines:
            self.canvas.text(x, self.y, line, font=font, size=size, color=color)
            self.y -= line_gap

    def render_header(self) -> None:
        name = ascii_clean(self.profile["name"])
        headline = ascii_clean(self.variant["headline"])
        summary_line = ascii_clean((self.variant.get("summary") or [""])[0])
        contact_items = [
            self.profile.get("email", ""),
            self.profile.get("homepage", "").replace("https://", "").replace("http://", ""),
            "linkedin.com/in/songbowen",
            "github.com/Bowenislandsong",
        ]
        contact = " | ".join(item for item in contact_items if item)
        header_top = self.y + 12
        header_height = 92
        header_bottom = header_top - header_height
        box_x = MARGIN_X - 8
        text_x = MARGIN_X + 12
        text_width = CONTENT_WIDTH - 16

        self.canvas.fill_rect(box_x, header_bottom, CONTENT_WIDTH + 16, header_height, fill=(0.97, 0.98, 0.99))
        self.canvas.fill_rect(box_x, header_bottom, 8, header_height, fill=(0.07, 0.43, 0.40))

        local_y = header_top - 24
        self.canvas.text(text_x, local_y, name, font=FONT_BOLD, size=22)
        local_y -= 18
        self.canvas.text(text_x, local_y, self.resume_title, font=FONT_BOLD, size=10.6, color=(0.06, 0.44, 0.41))
        local_y -= 15

        for line in wrap_text(headline, text_width, 9.6):
            self.canvas.text(text_x, local_y, line, font=FONT_ITALIC, size=9.6, color=(0.18, 0.22, 0.29))
            local_y -= 11.2

        for line in wrap_text(summary_line, text_width, 8.7):
            self.canvas.text(text_x, local_y, line, size=8.7, color=(0.29, 0.33, 0.38))
            local_y -= 10.2

        for line in wrap_text(ascii_clean(contact), text_width, 8.0):
            self.canvas.text(text_x, local_y, line, size=8.0, color=(0.36, 0.4, 0.46))
            local_y -= 9.6

        self.y = header_bottom - 14

    def render_section_heading(self, title: str) -> None:
        self.ensure_space(22)
        label = title.upper()
        label_width = measure_text(label, 9.0, bold=True) + 12
        self.canvas.fill_rect(MARGIN_X, self.y - 4, label_width, 14, fill=(0.92, 0.97, 0.96))
        self.canvas.text(MARGIN_X + 6, self.y, label, font=FONT_BOLD, size=9.0, color=(0.06, 0.44, 0.41))
        self.y -= 9
        self.canvas.rule(MARGIN_X, self.y, LETTER_WIDTH - MARGIN_X, self.y, color=(0.82, 0.85, 0.88), width=0.6)
        self.y -= 11

    def render_experience(self, entries: list[dict], bullet_limit: int) -> None:
        for item in entries:
            bullets = filter_visible(item.get("bullets", []), self.variant_key)[:bullet_limit]
            role_lines = wrap_text(item["role"], CONTENT_WIDTH, 10.0, bold=True)
            org_meta = f"{item['organization']} | {item['location']}"
            meta_lines = wrap_text(org_meta, CONTENT_WIDTH, 8.5)
            summary_lines = wrap_text(item.get("summary", ""), CONTENT_WIDTH, 8.8)
            bullet_lines = []
            for bullet in bullets:
                wrapped = wrap_text(bullet["text"], CONTENT_WIDTH - 14, 8.6)
                if wrapped:
                    bullet_lines.append(wrapped)

            estimated = (len(role_lines) * 12.0) + (len(meta_lines) * 10.8) + (len(summary_lines) * 10.8) + sum(len(lines) * 10.3 for lines in bullet_lines) + 14
            self.ensure_space(estimated)

            if len(role_lines) == 1:
                self.canvas.text(MARGIN_X, self.y, role_lines[0], font=FONT_BOLD, size=10.0, color=(0.06, 0.09, 0.14))
                date_width = measure_text(item["dates"], 8.3, bold=True)
                self.canvas.text(CONTENT_RIGHT - date_width, self.y, item["dates"], font=FONT_BOLD, size=8.3, color=(0.34, 0.40, 0.46))
                self.y -= 12
            else:
                self.write_lines(role_lines, x=MARGIN_X, font=FONT_BOLD, size=10.0, color=(0.06, 0.09, 0.14), leading=12.0)
                self.canvas.text(MARGIN_X, self.y, item["dates"], font=FONT_BOLD, size=8.3, color=(0.34, 0.40, 0.46))
                self.y -= 10

            self.write_lines(meta_lines, x=MARGIN_X, font=FONT_REGULAR, size=8.5, color=(0.39, 0.43, 0.49), leading=10.4)
            self.write_lines(summary_lines, x=MARGIN_X, font=FONT_REGULAR, size=8.8, color=(0.24, 0.27, 0.32), leading=10.6)
            for wrapped in bullet_lines:
                if wrapped:
                    self.canvas.text(MARGIN_X, self.y, "·", font=FONT_BOLD, size=9.0, color=(0.07, 0.43, 0.40))
                    self.write_lines(wrapped, x=MARGIN_X + 12, font=FONT_REGULAR, size=8.55, color=(0.13, 0.16, 0.21), leading=10.3)
            self.y -= 4

    def render_projects(self, entries: list[dict]) -> None:
        for item in entries:
            tag = item["tag"].upper()
            title_lines = wrap_text(item["name"], CONTENT_WIDTH, 9.6, bold=True)
            tag_width = measure_text(tag, 7.3, bold=True) + 10
            summary_lines = wrap_text(item.get("summary", ""), CONTENT_WIDTH, 8.7)
            estimate = 12 + (len(title_lines) * 11.4) + (len(summary_lines) * 10.4) + 8
            self.ensure_space(estimate)
            self.canvas.fill_rect(MARGIN_X, self.y - 4, tag_width, 12, fill=(0.95, 0.97, 0.99))
            self.canvas.text(MARGIN_X + 5, self.y, tag, font=FONT_BOLD, size=7.3, color=(0.34, 0.40, 0.46))
            self.y -= 13
            self.write_lines(title_lines, x=MARGIN_X, font=FONT_BOLD, size=9.6, color=(0.06, 0.09, 0.14), leading=11.3)
            self.write_lines(summary_lines, x=MARGIN_X, font=FONT_REGULAR, size=8.7, color=(0.24, 0.27, 0.32), leading=10.3)
            self.y -= 4

    def render_publications(self, entries: list[dict]) -> None:
        for item in entries:
            title_lines = wrap_text(item["title"], CONTENT_WIDTH, 9.2, bold=True)
            meta = f"{item['venue']} {item['year']} | {item['authors']}"
            meta_lines = wrap_text(meta, CONTENT_WIDTH, 8.1)
            signal = item.get("signal", {}).get(self.variant_key, "")
            signal_lines = wrap_text(signal, CONTENT_WIDTH, 8.5)
            estimate = (len(title_lines) * 11.2) + (len(meta_lines) * 10.0) + (len(signal_lines) * 10.4) + 8
            self.ensure_space(estimate)
            self.write_lines(title_lines, x=MARGIN_X, font=FONT_BOLD, size=9.2, color=(0.06, 0.09, 0.14), leading=11.0)
            self.write_lines(meta_lines, x=MARGIN_X, font=FONT_REGULAR, size=8.1, color=(0.39, 0.43, 0.49), leading=9.8)
            self.write_lines(signal_lines, x=MARGIN_X, font=FONT_REGULAR, size=8.5, color=(0.24, 0.27, 0.32), leading=10.3)
            self.y -= 4

    def render_education(self, entries: list[dict]) -> None:
        for item in entries:
            degree_lines = wrap_text(item["degree"], CONTENT_WIDTH, 9.2, bold=True)
            meta = f"{item['institution']} | {item['location']} | {item['dates']}"
            meta_lines = wrap_text(meta, CONTENT_WIDTH, 8.4)
            estimate = (len(degree_lines) * 11.0) + (len(meta_lines) * 10.2) + 6
            self.ensure_space(estimate)
            self.write_lines(degree_lines, x=MARGIN_X, font=FONT_BOLD, size=9.2, color=(0.06, 0.09, 0.14), leading=11.0)
            self.write_lines(meta_lines, x=MARGIN_X, font=FONT_REGULAR, size=8.4, color=(0.39, 0.43, 0.49), leading=10.1)
            self.y -= 4

    def render_skills(self, groups: list[dict]) -> None:
        for group in groups:
            items = filter_visible(group.get("items", []), self.variant_key)
            if not items:
                continue
            line = f"{group['label']}: " + "; ".join(item["text"] for item in items)
            wrapped = wrap_text(line, CONTENT_WIDTH, 8.6)
            estimate = (len(wrapped) * 10.5) + 6
            self.ensure_space(estimate)
            if not wrapped:
                continue
            first, rest = wrapped[0], wrapped[1:]
            self.write_lines([first], x=MARGIN_X, font=FONT_BOLD, size=8.8, color=(0.06, 0.09, 0.14), leading=10.4)
            if rest:
                self.write_lines(rest, x=MARGIN_X, font=FONT_REGULAR, size=8.6, color=(0.24, 0.27, 0.32), leading=10.4)
            self.y -= 4

    def render(self) -> tuple[bytes, int]:
        variant = self.variant
        experiences = pick_by_ids(
            self.data.get("experience", []),
            variant.get("printFeaturedExperienceIds") or variant.get("featuredExperienceIds", []),
        )
        projects = pick_by_ids(
            self.data.get("projects", []),
            variant.get("printFeaturedProjectIds") or variant.get("featuredProjectIds", []),
        )
        publications = pick_by_ids(
            self.data.get("publications", []),
            variant.get("printFeaturedPublicationIds") or variant.get("featuredPublicationIds", []),
        )
        skills = pick_by_ids(
            self.data.get("skills", []),
            variant.get("printFeaturedSkillGroupIds") or variant.get("featuredSkillGroupIds", []),
        )
        education = (self.data.get("education", []))[: variant.get("printEducationCount", len(self.data.get("education", [])))]
        bullet_limit = int(variant.get("printBulletLimit", 2))

        self.start_page()
        self.render_header()

        for section_name in variant.get("sectionOrder", []):
            title = SECTION_TITLES.get(section_name)
            if not title:
                continue
            if section_name == "experience" and experiences:
                self.render_section_heading(title)
                self.render_experience(experiences, bullet_limit)
            elif section_name == "projects" and projects:
                self.render_section_heading(title)
                self.render_projects(projects)
            elif section_name == "publications" and publications:
                self.render_section_heading(title)
                self.render_publications(publications)
            elif section_name == "education" and education:
                self.render_section_heading(title)
                self.render_education(education)
            elif section_name == "skills" and skills:
                self.render_section_heading(title)
                self.render_skills(skills)

        self.add_page_footer(self.page_count)
        return self.canvas.to_pdf(), self.page_count


def main() -> int:
    data = json.loads((ROOT / "resume/index.json").read_text(encoding="utf-8"))
    outputs = []
    for variant_key, variant in data.get("variants", {}).items():
        pdf_href = variant.get("pdfHref")
        if not pdf_href:
            continue
        renderer = ResumePdfRenderer(data, variant_key)
        pdf_bytes, pages = renderer.render()
        out_path = ROOT / pdf_href
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(pdf_bytes)
        outputs.append((variant_key, out_path.relative_to(ROOT).as_posix(), pages))

    for variant_key, rel_path, pages in outputs:
        print(f"{variant_key}: wrote {rel_path} ({pages} page{'s' if pages != 1 else ''})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
