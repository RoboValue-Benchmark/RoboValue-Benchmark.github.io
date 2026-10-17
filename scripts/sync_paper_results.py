"""Sync the published leaderboard and condition results from manuscript LaTeX.

Usage: python scripts/sync_paper_results.py /path/to/RoboValue_paper --version YYYY-MM-DD
Use --check to compare the published JSON with the source without writing it.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILES = ('sec/5_1RoboValueLeaderboard.tex', 'sec/5_Experiment.tex')
METRICS = ('sa', 'tga_ct', 'tga_cf', 'voc', 'cycle_voc', 'memory_voc', 'fpl', 'trr', 'vs', 'csvc')
OOD_METRICS = tuple(key for key in METRICS if key not in ('trr', 'csvc'))
CAPABILITIES = ('understanding', 'tracking', 'diagnosis', 'consistency', 'overall')
MODEL_ROW = re.compile(
    r'^\s*(?P<name>LIV|ProcVLM-2B|RoboFAC-7B|RoboMeter-4B|RoboReward-[48]B|'
    r'RynnValue-[48]B|TOPReward-(?:8|32)B|VLAC-[28]B|Robo-Dopamine-[348]B)'
    r'\s*(?P<marker>\$\^\{(?:\\dagger|\\ddagger|\*)\}\$)?\s*&(?P<cells>.*?)\\\\',
    re.MULTILINE | re.DOTALL,
)


def source_table(text, label):
    tables = re.findall(r'\\begin\{table\}.*?\\end\{table\}', text, re.DOTALL)
    matches = [table for table in tables if f'\\label{{{label}}}' in table]
    assert len(matches) == 1, f'Expected one source table with label {label}, found {len(matches)}'
    return matches[0]


def read_rows(table):
    rows = []
    for match in MODEL_ROW.finditer(table):
        preceding = table[:match.start()]
        zero = preceding.rfind('Zero-Shot Evaluation')
        one = preceding.rfind('One-Shot Evaluation')
        assert max(zero, one) >= 0, f'Missing evaluation track for {match["name"]}'
        cells = re.sub(r'\$\^\{[^}]+\}\$', '', match['cells'])
        cells = re.sub(r'\\RV(?:best|second)\{([^{}]*)\}', r'\1', cells)
        rows.append({
            'name': match['name'],
            'preview': match['marker'] == r'$^{\dagger}$',
            'setting': 'zero' if zero > one else 'one',
            'cells': [cell.strip() for cell in cells.split('&')],
        })
    assert rows, 'No model rows found in the source table'
    return rows


def row_key(row):
    return row['name'], row['preview'], row['setting']


def number(cell):
    if cell == '-':
        return None
    assert re.fullmatch(r'-?\d+(?:\.\d+)?', cell), f'Unexpected score cell: {cell!r}'
    return float(cell)


def extract(paper, version):
    sources = {file: (paper / file).read_bytes() for file in SOURCE_FILES}
    texts = {file: re.sub(r'(?<!\\)%[^\n]*', '', data.decode()) for file, data in sources.items()}
    main = read_rows(source_table(texts[SOURCE_FILES[1]], 'tab:robovalue_main'))
    ood = read_rows(source_table(texts[SOURCE_FILES[1]], 'tab:robovalue_ood'))
    ranking = read_rows(source_table(texts[SOURCE_FILES[0]], 'tab:robovalue_leaderboard'))
    keys = {row_key(row) for row in main}
    assert len(keys) == len(main), 'Duplicate model configurations in the main table'
    for name, rows in (('OOD', ood), ('leaderboard', ranking)):
        assert len(rows) == len(main) and {row_key(row) for row in rows} == keys, f'{name} model configurations differ'
    assert [row_key(row) for row in main] == [row_key(row) for row in ood], 'Main and OOD row orders differ'

    aggregates, ranks = {}, {'zero': 0, 'one': 0}
    for row in ranking:
        assert len(row['cells']) == len(CAPABILITIES), row
        values = list(map(number, row['cells']))
        assert all(value is not None for value in values), row
        ranks[row['setting']] += 1
        aggregates[row_key(row)] = {'rank': ranks[row['setting']], **dict(zip(CAPABILITIES, values))}
    for track in ranks:
        scores = [row['overall'] for key, row in aggregates.items() if key[2] == track]
        assert scores == sorted(scores, reverse=True), f'{track} leaderboard is not ranked by Overall'

    rows = []
    for order, (standard, shifted) in enumerate(zip(main, ood)):
        assert len(standard['cells']) == len(METRICS), standard
        assert len(shifted['cells']) == len(OOD_METRICS), shifted
        conditions = {'id': dict(zip(METRICS, map(number, standard['cells']))), 'emb': {}, 'env': {}}
        for key, cell in zip(OOD_METRICS, shifted['cells']):
            pair = re.fullmatch(r'\\oodpair\{([^{}]+)\}\{([^{}]+)\}', cell)
            assert pair or cell == '-', f'Unexpected OOD cell: {cell!r}'
            for index, condition in enumerate(('emb', 'env'), 1):
                conditions[condition][key] = number(pair[index]) if pair else None
        name, preview, setting = row_key(standard)
        rows.append({
            'name': name, 'preview': preview, 'setting': setting,
            'id': f"{name.lower()}{'-preview' if preview else ''}-{setting}",
            'order': order, 'conditions': conditions, 'aggregate': aggregates[row_key(standard)],
        })
    return {
        'source': 'RoboValue manuscript LaTeX tables: RoboValue Leaderboard, Main Results and Generalization Results',
        'sourceVersion': version,
        'sourceFiles': [{'path': f'RoboValue_paper/{file}', 'sha256': hashlib.sha256(data).hexdigest()} for file, data in sources.items()],
        'scale': 100,
        'modelFamilies': len({re.sub(r'-\d+B$', '', row['name']) for row in rows}),
        'modelVariants': len({(row['name'], row['preview']) for row in rows}),
        'rows': rows,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('paper', type=Path)
    parser.add_argument('--version', required=True, help='Source snapshot date in YYYY-MM-DD format.')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = extract(args.paper, args.version)
    target = ROOT / 'public/data/results.json'
    if args.check:
        assert json.loads(target.read_text()) == data, 'Published data differ from the source tables.'
        print(f'Verified {len(data["rows"])} configurations, overall ranks and all three conditions against manuscript LaTeX.')
    else:
        target.write_text(json.dumps(data, indent=2) + '\n')
        print(f'Wrote {len(data["rows"])} configurations to {target}.')
