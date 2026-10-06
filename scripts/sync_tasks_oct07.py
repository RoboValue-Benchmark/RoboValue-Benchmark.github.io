"""Sync task cards and execution images from the October 7 manuscript.

Existing task URLs are retained. No manuscript PDF is copied to public/.
Usage: python scripts/sync_tasks_oct07.py /path/to/paper.pdf
"""
import argparse
import io
import json
import re
from pathlib import Path
import pymupdf as fitz
from PIL import Image
from extract_tasks import clean, slug, text_blocks

ROOT = Path(__file__).resolve().parents[1]
ALIASES = {
    'sort-blocks-in-order': 'sort-colored-blocks-into-boxes',
    'transfer-blocks-using-plate': 'transfer-colored-blocks-using-bowl',
}

def save_image(doc, image, destination):
    with Image.open(io.BytesIO(doc.extract_image(image['xref'])['image'])) as im:
        pixels = Image.frombytes('RGB', im.size, im.convert('RGB').tobytes())
        pixels.save(destination, 'WEBP', quality=92, method=4)


def sync(paper):
    doc = fitz.open(paper)
    assert len(doc) == 90, 'Review page ranges for a different snapshot.'
    target = ROOT / 'src/data/tasks.json'
    payload = json.loads(target.read_text())
    tasks = payload['tasks']
    by_key = {(t['domain'], t['slug']): t for t in tasks}
    seen = set()
    for domain, indices in [('simulation', range(28, 36)), ('real-world', range(39, 49))]:
        for i in indices:
            page = doc[i]
            blocks = text_blocks(page)
            titles = [b for b in blocks if abs(b['rect'].x0 - 80.1) < .5 and b['rect'].y0 < 500 and '\n' == b['text'][-1:] and (domain, ALIASES.get(slug(clean(b['text'])), slug(clean(b['text'])))) in by_key]
            for pos, title_block in enumerate(titles):
                title = clean(title_block['text'])
                key = (domain, ALIASES.get(slug(title), slug(title)))
                assert key not in seen
                seen.add(key)
                task = by_key[key]
                stop = titles[pos + 1]['rect'].y0 if pos + 1 < len(titles) else 780
                card = [b for b in blocks if title_block['rect'].y1 < b['rect'].y0 < stop]
                # PDF may merge instruction and description into one text block.
                desc = clean('\n'.join(b['text'] for b in card if b['text'].startswith(('Instruction.', 'Scene:'))))
                m = re.fullmatch(r'Instruction\. (.*?) Scene: (.*?) Procedure: (.*?)(?: Order and variations: (.*))?', desc)
                assert m, (title, desc)
                sub = [b for b in card if b['text'].startswith('Subtasks')]
                assert len(sub) == 1, title
                subtasks = re.findall(r'\bS(\d+) (.*?)(?=\bS\d+ |$)', clean(sub[0]['text']))
                assert [int(n) for n, _ in subtasks] == list(range(1, len(subtasks) + 1)) and subtasks, title
                task.update(title=title, instruction=m[1], scene=m[2], procedure=m[3], order=m[4], subtasks=[dict(id='S'+n, text=t) for n,t in subtasks], source=dict(appendix='C.2' if domain == 'simulation' else 'D.2', page=i+1), counterfactual=None)
                if title == 'Fold Clothes':
                    task['scene'] = task['scene'].replace('An unfolded clothes lies', 'An unfolded garment lies')
                instruction_block = next(b for b in card if b['text'].startswith('Instruction.'))
                images = sorted([im for im in page.get_image_info(xrefs=True) if im['width'] >= 600 and title_block['rect'].y1 < im['bbox'][1] and im['bbox'][3] < instruction_block['rect'].y0], key=lambda im: im['bbox'][0])
                assert len(images) == 3, (title, len(images))
                for condition, im in zip(['id','emb','env'],images):
                    save_image(doc, im, ROOT / 'public' / task['images'][condition].lstrip('/'))
    assert len(seen) == 35, len(seen)
    for domain, i in [('simulation',36), ('real-world',49)]:
        page = doc[i]
        bottom = 640 if domain == 'simulation' else 780
        left = page.get_text(clip=fitz.Rect(70, 0, 269, bottom)).splitlines()
        starts = [(j, ALIASES.get(slug(line), slug(line))) for j,line in enumerate(left) if (domain,ALIASES.get(slug(line),slug(line))) in by_key]
        right = clean(page.get_text(clip=fitz.Rect(272, 0, 526, bottom)))
        changes = re.findall(r'Objects: (.*?) Actions: (.*?) Placement: (.*?) Constraints: (.*?)(?= Objects: |$)', right)
        expected = 13 if domain == 'simulation' else 14
        assert len(starts) == len(changes) == expected, (domain, len(starts),len(changes))
        for pos, ((j,name),values) in enumerate(zip(starts,changes)):
            end = starts[pos+1][0] if pos+1 < len(starts) else len(left)
            task = by_key[(domain,name)]
            assert all(' → ' in v for v in values), task['title']
            task['counterfactual']=dict(original=clean('\n'.join(left[j+1:end])),changes=dict(zip(['Objects','Actions','Placement','Constraints'],values)),page=i+1)
    seq_seen=set()
    for domain,indices in [('simulation',[37]), ('real-world',[50,51])]:
        for i in indices:
            page=doc[i]
            labels=[b for b in text_blocks(page) if 90 < b['rect'].x0 < 130 and b['rect'].x1 < 175 and (domain,ALIASES.get(slug(clean(b['text'])),slug(clean(b['text'])))) in by_key]
            assert len(labels)==(15 if domain=='simulation' else 10)
            for b in labels:
                name=slug(clean(b['text']));key=(domain,ALIASES.get(name,name));task=by_key[key]
                assert key not in seq_seen
                seq_seen.add(key)
                cy=(b['rect'].y0+b['rect'].y1)/2
                images=sorted([im for im in page.get_image_info(xrefs=True) if im['width']==230 and abs((im['bbox'][1]+im['bbox'][3])/2-cy)<2],key=lambda im:im['bbox'][0])
                assert len(images)==7,(task['title'],len(images))
                for url,im in zip(task['sequence'],images):save_image(doc,im,ROOT/'public'/url.lstrip('/'))
                task['sequencePage']=i+1
    assert len(seq_seen)==35
    payload['sourceVersion']='2026-10-07'
    payload['sourcePageCount']=len(doc)
    target.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    # Render the full visible overview figure, excluding authors and caption.
    pix=doc[0].get_pixmap(matrix=fitz.Matrix(3,3),clip=fitz.Rect(70,364,525,695),alpha=False)
    Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(ROOT/'public/assets/overview-public.png')
    print('Synced 35 task cards, 105 condition images, 245 execution frames, 27 counterfactual rows and overview.')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('paper',type=Path);a=p.parse_args();sync(a.paper)
