"""Sync task titles and gallery images from the paper's active LaTeX task cards.

Usage: python scripts/sync_paper_task_assets.py /path/to/RoboValue_paper
Requires Pillow. Existing task URLs, specifications, and videos are retained.
"""

import argparse
import hashlib
import io
import json
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CARD_FILES = {
    "simulation": "RoboValue_Sim_Overleaf/RoboValue_Sim_Compact_content.tex",
    "real-world": "RoboValue_Real_Overleaf4/RoboValue_Real_Compact_content.tex",
}
EXPECTED_COUNTS = {"simulation": 15, "real-world": 20}
ALIASES = {
    "sort-blocks-in-order": "sort-colored-blocks-into-boxes",
    "transfer-blocks-using-plate": "transfer-colored-blocks-using-bowl",
}
CONDITIONS = ("id", "emb", "env")


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def uncomment(text):
    return re.sub(r"(?<!\\)%[^\n]*", "", text)


def sync(paper_root, audit_path=None):
    paper_root = paper_root.resolve()
    supplemental = uncomment((paper_root / "iclr2027_supplementary.tex").read_text())
    target = ROOT / "src/data/tasks.json"
    payload = json.loads(target.read_text())
    by_key = {(task["domain"], task["slug"]): task for task in payload["tasks"]}
    planned, records, seen = [], [], set()
    for domain, relative in CARD_FILES.items():
        content_path = paper_root / relative
        wrapper = relative.replace("_content.tex", "_include.tex")
        assert f"\\input{{{wrapper.removesuffix('.tex')}}}" in supplemental, wrapper
        wrapper_text = uncomment((paper_root / wrapper).read_text())
        assert content_path.name in wrapper_text and "{figures}" in wrapper_text, wrapper
        style = relative.replace("_content.tex", "_iclr.sty")
        style_text = uncomment((paper_root / style).read_text())
        for condition in CONDITIONS:
            assert f"{{#2_{condition}}}" in style_text, (domain, condition)
        assert "/#1.jpg}" in style_text, style
        cards = re.findall(
            r"\\\w*TaskCard\s*\{([^{}]+)\}\s*\{([^{}]+)\}",
            uncomment(content_path.read_text()),
        )
        assert len(cards) == EXPECTED_COUNTS[domain], (domain, len(cards))
        for title, image_key in cards:
            title, image_key = title.strip(), image_key.strip()
            name = slug(title)
            key = (domain, ALIASES.get(name, name))
            assert key in by_key and key not in seen, (title, key)
            seen.add(key)
            task = by_key[key]
            record = {"taskId": task["id"], "title": title, "cardFile": relative, "images": {}}
            for condition in CONDITIONS:
                source = content_path.parent / "figures" / f"{image_key}_{condition}.jpg"
                # Two paper keys differ from the actual filenames only in capitalization.
                if not source.is_file():
                    source = source.with_name(source.name.lower())
                destination = ROOT / "public" / task["images"][condition].lstrip("/")
                with Image.open(source) as original:
                    # Rebuild from pixels so source metadata is not copied to the website.
                    pixels = Image.frombytes("RGB", original.size, original.convert("RGB").tobytes())
                    assert pixels.width * 3 == pixels.height * 4, (source, pixels.size)
                    output = io.BytesIO()
                    pixels.save(output, "WEBP", quality=95, method=6)
                encoded = output.getvalue()
                planned.append((destination, encoded))
                record["images"][condition] = {
                    "source": source.relative_to(paper_root).as_posix(),
                    "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                    "url": task["images"][condition],
                    "size": list(pixels.size),
                    "webpSha256": hashlib.sha256(encoded).hexdigest(),
                }
            if task["title"] != title:
                record["previousTitle"] = task["title"]
            task["title"] = title
            records.append(record)
    assert seen == set(by_key), "Paper and website task sets differ."
    assert len(planned) == 105
    # Validate the complete mapping and all images before writing any repository files.
    for destination, encoded in planned:
        assert destination.is_file(), destination
    for destination, encoded in planned:
        destination.write_bytes(encoded)
    payload["catalogSource"] = {"format": "LaTeX task cards", "files": CARD_FILES}
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    if audit_path:
        audit_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    changed_titles = [record for record in records if "previousTitle" in record]
    print(f"Verified 35 task names; updated {len(changed_titles)} titles and 105 paper images.")
    for record in changed_titles:
        print(f"{record['previousTitle']} -> {record['title']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paper_root", type=Path)
    parser.add_argument("--audit", type=Path, help="Optional detailed source manifest, kept outside public/.")
    args = parser.parse_args()
    sync(args.paper_root, args.audit)
