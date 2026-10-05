"""Extract the task cards and figures from the supplied manuscript snapshot.

Run locally with PyMuPDF and Pillow. The manuscript itself is never copied into
public/. Page ranges deliberately target this snapshot; assertions reject a
changed layout instead of silently attaching the wrong images or text.
"""
import argparse
import hashlib
import io
import json
import re
from pathlib import Path

import pymupdf as fitz
from PIL import Image


def clean(text):
    # Repair PDF line wrapping, preserving hyphens in compound words.
    text = re.sub(r'\b(\w+)-\n(\w+)', lambda m: m[1] + ('-' if m[1].lower() in {'cross', 'right', 'left', 'task', 'red', 'yellow', 'green', 'blue', 'voc'} else '') + m[2], text)
    return re.sub(r'\s+', ' ', text).strip().replace('→', ' → ').replace('  ', ' ')


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def text_blocks(page):
    return [dict(rect=fitz.Rect(b[:4]), text=b[4]) for b in page.get_text('blocks') if b[6] == 0]


def save_image(doc, image, destination):
    raw = doc.extract_image(image['xref'])['image']
    with Image.open(io.BytesIO(raw)) as im:
        # Fresh pixel image: do not propagate EXIF, XMP, author, or source paths.
        out = Image.frombytes('RGB', im.size, im.convert('RGB').tobytes())
        out.save(destination, 'WEBP', quality=92, method=6)


def extract(paper, figure, root, audit):
    doc = fitz.open(paper)
    assert len(doc) == 86, 'Unexpected manuscript snapshot; review page ranges.'
    asset_root = root / 'public/assets/tasks'
    asset_root.mkdir(parents=True, exist_ok=True)
    tasks = []
    provenance = []
    for domain, page_numbers in [('simulation', range(24, 30)), ('real-world', range(34, 41))]:
        for page_index in page_numbers:
            page = doc[page_index]
            blocks = text_blocks(page)
            for index, block in enumerate(blocks):
                if not block['text'].startswith('Instruction:'):
                    continue
                title_block = next(b for b in reversed(blocks[:index]) if abs(b['rect'].x0 - 78.1) < 1 and ':' not in b['text'])
                title = clean(title_block['text'])
                description = blocks[index + 1]
                subtask_block = blocks[index + 2]
                assert description['text'].startswith('Description: Scene:'), title
                assert subtask_block['text'].startswith('Subtasks:'), title
                instruction = clean(block['text']).removeprefix('Instruction: ')
                desc = clean(description['text']).removeprefix('Description: Scene: ')
                scene, procedure = desc.split(' Procedure: ', 1)
                if ' Order and variations: ' in procedure:
                    procedure, order = procedure.split(' Order and variations: ', 1)
                else:
                    order = None
                raw_subtasks = clean(subtask_block['text']).removeprefix('Subtasks: ')
                subtasks = re.findall(r'\bS(\d+) (.*?)(?=\bS\d+ |$)', raw_subtasks)
                assert [int(n) for n, _ in subtasks] == list(range(1, len(subtasks) + 1)), title
                assert len(subtasks) > 0, title
                name = slug(title)
                task_dir = asset_root / domain / name
                task_dir.mkdir(parents=True, exist_ok=True)
                images = sorted([im for im in page.get_image_info(xrefs=True) if title_block['rect'].y1 < im['bbox'][1] and im['bbox'][3] < block['rect'].y0 and im['width'] >= 600], key=lambda im: im['bbox'][0])
                assert len(images) == 3, (title, len(images))
                urls = {}
                for condition, im in zip(['id', 'emb', 'env'], images):
                    path = task_dir / (condition + '.webp')
                    save_image(doc, im, path)
                    urls[condition] = '/' + path.relative_to(root / 'public').as_posix()
                task = dict(id=domain + '/' + name, domain=domain, slug=name, title=title,
                            instruction=instruction, scene=scene, procedure=procedure,
                            order=order, subtasks=[dict(id='S' + n, text=t) for n, t in subtasks],
                            images=urls, sequence=[], counterfactual=None,
                            source=dict(appendix='C.1' if domain == 'simulation' else 'D.1', page=page_index + 1))
                tasks.append(task)
                provenance.append(dict(task=task['id'], page=page_index + 1,
                                       title=list(title_block['rect']), instruction=list(block['rect']),
                                       description=list(description['rect']), subtasks=list(subtask_block['rect']),
                                       images=[dict(xref=im['xref'], bbox=im['bbox']) for im in images]))
    assert len(tasks) == 35
    assert sum(t['domain'] == 'simulation' for t in tasks) == 15
    assert len({t['id'] for t in tasks}) == 35

    # Each counterfactual table supplies semantic deltas, not full prompts.
    for domain, page_numbers in [('simulation', [30, 31]), ('real-world', [41, 42])]:
        domain_tasks = {slug(t['title']): t for t in tasks if t['domain'] == domain}
        for i in page_numbers:
            page = doc[i]
            tables = page.find_tables().tables
            assert len(tables) == 2
            columns = tables[0].rows[-1].cells
            assert len(columns) == 6
            xs = sorted({x for c in columns if c for x in [c[0], c[2]]})
            assert len(xs) == 7
            for row in tables[1].rows:
                cells = [c for c in row.cells if c]
                y0, y1 = min(c[1] for c in cells), max(c[3] for c in cells)
                values = [clean(page.get_text(clip=fitz.Rect(x0, y0, x1, y1))) for x0, x1 in zip(xs, xs[1:])]
                task = domain_tasks[slug(values[0])]
                assert task['counterfactual'] is None
                assert all('→' in v for v in values[2:]), values
                task['counterfactual'] = dict(original=values[1], changes=dict(zip(['Objects', 'Actions', 'Placement', 'Constraints'], values[2:])), page=i + 1)
        assert sum(t['counterfactual'] is not None for t in domain_tasks.values()) == (13 if domain == 'simulation' else 14)

    # Render visible sequence frames. These PDF figures reuse clipped form objects;
    # get_image_info() also returns hidden/off-page frames and is unsafe here.
    for domain, page_numbers in [('simulation', [32, 33]), ('real-world', [43, 44])]:
        domain_tasks = {slug(t['title']): t for t in tasks if t['domain'] == domain}
        for i in page_numbers:
            page = doc[i]
            labels = [b for b in text_blocks(page) if 80 < b['rect'].x0 < 100 and b['rect'].x1 < 144 and slug(clean(b['text'])) in domain_tasks]
            assert len(labels) == ({32: 8, 33: 7, 43: 10, 44: 10}[i])
            for label in labels:
                task = domain_tasks[slug(clean(label['text']))]
                assert not task['sequence'], task['title']
                cy = (label['rect'].y0 + label['rect'].y1) / 2
                half_height = 19.5 if domain == 'simulation' else 16.6
                boxes = []
                for j, x in enumerate([145.4, 197.9, 250.1, 302.4, 354.9, 407.2, 459.6], 1):
                    clip = fitz.Rect(x - 0.3, cy - half_height, x + 50, cy + half_height)
                    pix = page.get_pixmap(matrix=fitz.Matrix(5, 5), clip=clip, alpha=False)
                    path = asset_root / task['domain'] / task['slug'] / f'step-{j}.webp'
                    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(path, 'WEBP', quality=95, method=6)
                    task['sequence'].append('/' + path.relative_to(root / 'public').as_posix())
                    boxes.append(list(clip))
                task['sequencePage'] = i + 1
                next(p for p in provenance if p['task'] == task['id'])['sequence'] = dict(page=i + 1, clips=boxes)
    assert all(len(t['sequence']) == 7 for t in tasks)

    overview = fitz.open(figure)
    assert len(overview) == 1
    p = overview[0]
    for domain, rect in [('simulation', fitz.Rect(0, 0, p.rect.width, 461)), ('real-world', fitz.Rect(0, 461, p.rect.width, p.rect.height))]:
        pix = p.get_pixmap(matrix=fitz.Matrix(2, 2), clip=rect, alpha=False)
        Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(asset_root / (domain + '-overview.webp'), 'WEBP', quality=95, method=6)

    payload = dict(tasks=tasks)
    (root / 'src/data').mkdir(parents=True, exist_ok=True)
    (root / 'src/data/tasks.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    if audit:
        audit.parent.mkdir(parents=True, exist_ok=True)
        audit.write_text(json.dumps(dict(paper_sha256=hashlib.sha256(paper.read_bytes()).hexdigest(), cards=provenance), indent=2) + '\n')
    print(f'Extracted {len(tasks)} tasks, 105 condition images, 245 sequence frames, 27 counterfactual rows.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--paper', required=True, type=Path)
    parser.add_argument('--overview', required=True, type=Path)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--audit', type=Path, help='Optional private extraction provenance JSON; keep outside public/.')
    args = parser.parse_args()
    extract(args.paper, args.overview, args.root, args.audit)
