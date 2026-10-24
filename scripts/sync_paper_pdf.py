"""Sync the verified October 24 PDF snapshot; fail closed on layout changes.

Requires Poppler pdftotext and PyMuPDF (manual maintenance tools only).
Usage: python scripts/sync_paper_pdf.py paper.pdf --version 2026-10-24 [--check]
The PDF and temporary extraction files are never copied into the public site.
"""
import argparse
import copy
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
METRICS = ('sa', 'tga_ct', 'tga_cf', 'voc', 'cycle_voc', 'memory_voc', 'fpl', 'trr', 'vs', 'csvc')
OOD = tuple(k for k in METRICS if k not in ('trr', 'csvc'))
CAPABILITIES = ('understanding', 'tracking', 'diagnosis', 'consistency', 'overall')
MODEL = re.compile(r'^\s*(LIV|ProcVLM-2B|RoboFAC-7B|RoboMeter-4B|RoboReward-[48]B|RynnValue-[48]B|TOPReward-(?:8|32)B|VLAC-[28]B|Robo-Dopamine-[348]B)([†‡∗§]*)\s+(.+?)\s*$')
NUMBER = re.compile(r'(?<![A-Za-z\d])[-−]?\d+\.\d+|(?<!\S)-(?!\S)')
ALIASES = {'sort-blocks-in-order': 'sort-colored-blocks-into-boxes', 'transfer-blocks-using-plate': 'transfer-colored-blocks-using-bowl'}
key = lambda row: (row['name'], row['preview'], row['setting'])


def rows(page, count):
    result, track = [], None
    for line in page.splitlines():
        if 'Zero-Shot Evaluation' in line:
            track = 'zero'
        if 'One-Shot Evaluation' in line:
            track = 'one'
        match = MODEL.match(line)
        if not match or not re.match(r'[-−]?\d+\.\d+', match[3]):
            continue
        assert track, 'A result row has no evaluation track.'
        values = [None if n == '-' else float(n.replace('−', '-')) for n in NUMBER.findall(match[3])]
        if count == 16 and match[1].startswith('RoboReward-'):
            # The single dash in the OOD VS cell means missing in both shifts.
            assert len(values) == 15 and values[-1] is None
            values.append(None)
        assert len(values) == count, f'Unrecognized result row: {match[1]}'
        result.append({'name': match[1], 'preview': '†' in match[2], 'setting': track, 'values': values})
    assert len(result) == 19 and len({key(row) for row in result}) == 19, 'Result coverage changed; review the PDF before updating.'
    assert sum(row['setting'] == 'zero' for row in result) == 12
    return result


def clean(text):
    text = re.sub(r'\b(\w+)-\n(\w+)', lambda m: m[1] + ('-' if m[1].lower() in {'cross', 'right', 'left', 'task', 'red', 'yellow', 'green', 'blue', 'voc'} else '') + m[2], text)
    return re.sub(r'\s+', ' ', text).strip().replace('→', ' → ').replace('  ', ' ')


def slug(text):
    raw = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    return ALIASES.get(raw, raw)


def verify_aggregates(data):
    for row in data['rows']:
        c, a = row['conditions'], row['aggregate']
        weighted = lambda k: .5 * c['id'][k] + .25 * c['emb'][k] + .25 * c['env'][k]
        normalized = lambda x: (x + 100) / 2
        expected = {
            'understanding': .5 * weighted('sa') + .25 * weighted('tga_ct') + .25 * weighted('tga_cf'),
            'tracking': .25 * normalized(weighted('voc')) + .25 * normalized(weighted('memory_voc'))
                + .5 * normalized(sum(2 * c[s]['cycle_voc'] - c[s]['voc'] for s in ('id', 'emb', 'env')) / 3),
            'diagnosis': .5 * (100 - weighted('fpl')) + .5 * c['id']['trr'],
            'consistency': 0 if c['id']['vs'] is None else .5 * weighted('vs') + .5 * normalized(c['id']['csvc']),
        }
        expected['overall'] = sum(expected.values()) / 4
        # The PDF uses unrounded metric values; do not replace its displayed
        # scores with values recomputed from already-rounded table cells.
        assert all(abs(expected[k] - a[k]) < .011 for k in expected), f'Aggregate mismatch: {key(row)}'
    for track in ('zero', 'one'):
        ranked = sorted((r for r in data['rows'] if r['setting'] == track), key=lambda r: r['aggregate']['rank'])
        scores = [r['aggregate']['overall'] for r in ranked]
        assert scores == sorted(scores, reverse=True), 'Ranks disagree with Overall.'


def extract_tasks(doc, data, source, version):
    tasks = copy.deepcopy(data)
    by_key = {(t['domain'], t['slug']): t for t in tasks['tasks']}
    seen = set()
    for domain, indices in [('simulation', range(28, 36)), ('real-world', range(39, 49))]:
        for i in indices:
            blocks = [dict(rect=doc[i].rect.__class__(b[:4]), text=b[4]) for b in doc[i].get_text('blocks') if b[6] == 0]
            titles = [b for b in blocks if abs(b['rect'].x0 - 80.1) < .5 and b['rect'].y0 < 500
                      and (domain, slug(clean(b['text']))) in by_key]
            for position, block in enumerate(titles):
                title = clean(block['text'])
                identity = (domain, slug(title))
                assert identity not in seen
                seen.add(identity)
                stop = titles[position + 1]['rect'].y0 if position + 1 < len(titles) else 780
                card = [b for b in blocks if block['rect'].y1 < b['rect'].y0 < stop]
                description = clean('\n'.join(b['text'] for b in card if b['text'].startswith(('Instruction.', 'Scene:', 'Procedure:', 'Order and variations:'))))
                parsed = re.fullmatch(r'Instruction\. (.*?) Scene: (.*?) Procedure: (.*?)(?: Order and variations: (.*))?', description)
                assert parsed, f'Unrecognized task layout: {title}'
                sub = [b for b in card if b['text'].startswith('Subtasks')]
                assert len(sub) == 1
                subtasks = re.findall(r'\bS(\d+) (.*?)(?=\bS\d+ |$)', clean(sub[0]['text']))
                assert subtasks and [int(n) for n, _ in subtasks] == list(range(1, len(subtasks) + 1))
                task = by_key[identity]
                # Keep existing trim choices; trailing PDF spaces are not data.
                old_subtasks = [{**s, 'text': s['text'].strip()} for s in task['subtasks']]
                new_subtasks = [dict(id='S' + n, text=text.strip()) for n, text in subtasks]
                task.update(title=title, instruction=parsed[1], scene=parsed[2], procedure=parsed[3], order=parsed[4],
                            source=dict(appendix='C.2' if domain == 'simulation' else 'D.2', page=i + 1))
                if new_subtasks != old_subtasks:
                    task['subtasks'] = new_subtasks
                # Preserve the website's existing grammatical correction; this
                # does not change objects, task constraints, or numerical data.
                if title == 'Fold Clothes':
                    task['scene'] = task['scene'].replace('An unfolded clothes lies', 'An unfolded garment lies')
    assert len(seen) == 35 and len(by_key) == 35
    for domain, index in [('simulation', 36), ('real-world', 49)]:
        page = doc[index]
        left = page.get_text(clip=doc[index].rect.__class__(70, 0, 269, 780)).splitlines()
        starts = [(j, slug(line)) for j, line in enumerate(left) if (domain, slug(line)) in by_key]
        right = clean(page.get_text(clip=doc[index].rect.__class__(272, 0, 526, 780)))
        changes = re.findall(r'Objects: (.*?) Actions: (.*?) Placement: (.*?) Constraints: (.*?)(?= Objects: |$)', right)
        assert len(starts) == len(changes) == (13 if domain == 'simulation' else 14)
        for position, ((j, name), values) in enumerate(zip(starts, changes)):
            end = starts[position + 1][0] if position + 1 < len(starts) else len(left)
            assert all(' → ' in value for value in values)
            by_key[(domain, name)]['counterfactual'] = dict(original=clean('\n'.join(left[j + 1:end])),
                changes=dict(zip(['Objects', 'Actions', 'Placement', 'Constraints'], values)), page=index + 1)
    tasks.update(sourceVersion=version, sourcePageCount=len(doc),
                 catalogSource={'format': 'PDF task cards and counterfactual tables', 'taskCardPages': [29, 30, 31, 32, 33, 34, 35, 36, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49], 'counterfactualPages': [37, 50]},
                 sourceFiles=[{**source, 'pages': [29, 30, 31, 32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]}])
    return tasks


def extract(paper, version):
    import pymupdf
    assert version == '2026-10-24', 'This parser targets the verified October 24 layout; review other snapshots first.'
    doc = pymupdf.open(paper)
    assert len(doc) == 89, 'PDF page count changed; review page ranges.'
    result = subprocess.run(['pdftotext', '-layout', str(paper), '-'], check=True, capture_output=True)
    pages = result.stdout.decode('utf-8').split('\f')
    assert len(pages) in (89, 90)
    source = {'path': paper.name, 'sha256': hashlib.sha256(paper.read_bytes()).hexdigest()}
    data = json.loads((ROOT / 'public/data/results.json').read_text())
    lookup = {key(row): row for row in data['rows']}
    ranking, main, shifted = rows(pages[12], 5), rows(pages[13], 10), rows(pages[14], 16)
    assert set(lookup) == {key(r) for r in ranking} == {key(r) for r in main} == {key(r) for r in shifted}
    ranks = dict(zero=0, one=0)
    for row in ranking:
        ranks[row['setting']] += 1
        lookup[key(row)]['aggregate'] = {'rank': ranks[row['setting']], **dict(zip(CAPABILITIES, row['values']))}
    for row in main:
        lookup[key(row)]['conditions']['id'] = dict(zip(METRICS, row['values']))
    for row in shifted:
        for i, metric in enumerate(OOD):
            for j, condition in enumerate(('emb', 'env')):
                lookup[key(row)]['conditions'][condition][metric] = row['values'][2 * i + j]
    data.update(source='RoboValue manuscript PDF: Tables 2, 3 and 4', sourceVersion=version, sourceFiles=[{**source, 'pages': [13, 14, 15]}])
    verify_aggregates(data)
    sia = json.loads((ROOT / 'src/data/subtask-results.json').read_text())
    track, seen = None, set()
    for line in pages[16].splitlines():
        if 'Zero-Shot Evaluation' in line:
            track = 'zero'
        if 'One-Shot Evaluation' in line:
            track = 'one'
        match = re.match(r'^\s*(ProcVLM-2B|RoboFAC-7B|FailSafe)(?:\s*\(Lin et al\., 2025\))?\s+(.+?)\s*$', line)
        if not match or not re.match(r'\d+\.\d+', match[2]):
            continue
        values = [float(n) for n in re.findall(r'\d+\.\d+', match[2])]
        assert len(values) == 4 and (match[1], track) not in seen
        seen.add((match[1], track))
        targets = [r for r in sia['rows'] if r['name'] == match[1] and r['setting'] == track]
        assert len(targets) == 1
        targets[0].update(conditions=dict(zip(('id', 'emb', 'env'), values[:3])), overall=values[3])
    assert len(seen) == 4
    sia.update(sourceVersion=version, sourceFiles=[{**source, 'pages': [17]}])
    return {'public/data/results.json': data, 'src/data/subtask-results.json': sia,
            'src/data/tasks.json': extract_tasks(doc, json.loads((ROOT / 'src/data/tasks.json').read_text()), source, version)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('paper', type=Path)
    parser.add_argument('--version', required=True)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    extracted = extract(args.paper.resolve(), args.version)
    for filename, data in extracted.items():
        target = ROOT / filename
        if args.check:
            assert json.loads(target.read_text()) == data, f'{filename} differs from the PDF.'
        else:
            target.write_text(json.dumps(data, ensure_ascii=filename != 'src/data/tasks.json', indent=2) + '\n')
    print(('Verified' if args.check else 'Updated') + ' 19 result configurations, 4 SIA configurations, 35 task cards and 27 counterfactual rows against the October 24 PDF.')
