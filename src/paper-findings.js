// Shared examples from Tables 2–3. Values always come from results.json.
export function paperFindings(rows, track) {
  const find = (name, preview = false) => rows.find(row => row.name === name && row.preview === preview && row.setting === track);
  const examples = track === 'zero' ? [
    { row: find('RynnValue-4B'), title: 'Fine-grained instructions remain difficult', left: 'tga_ct', right: 'tga_cf', capability: 'understanding', text: 'Discriminating different tasks is easier than resolving a changed object, action, placement, or constraint.' },
    { row: find('TOPReward'), title: 'Forward progress can hide reversal errors', left: 'voc', right: 'cycle_voc', capability: 'tracking', text: 'Strong forward correlation can coexist with poor responses when the recorded progress reverses.' },
    { row: find('RoboMeter-4B'), title: 'Execution history needs its own test', left: 'voc', right: 'memory_voc', capability: 'tracking', text: 'Tracking fluent execution does not establish reliable progress judgments when similar visual states recur.' },
  ] : [
    { row: find('Robo-Dopamine-8B', true), title: 'Outcome accuracy does not establish grounding', left: 'sa', right: 'tga_cf', capability: 'understanding', text: 'Strong outcome discrimination can coexist with weak sensitivity to fine-grained instruction changes.' },
    { row: find('ProcVLM-2B'), title: 'A demonstration does not resolve execution memory', left: 'voc', right: 'memory_voc', capability: 'tracking', text: 'Task adaptation improves fluent progress tracking, while recurring states still pose a challenge.' },
    { row: find('Robo-Dopamine-8B', true), title: 'Recovery assessment remains challenging', left: 'cycle_voc', right: 'trr', capability: 'diagnosis', text: 'Reliable direction tracking does not imply that every failure and recovery stage is assessed correctly.' },
  ];
  return examples.filter(example => example.row);
}
