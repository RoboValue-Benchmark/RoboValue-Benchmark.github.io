import test from 'node:test';
import assert from 'node:assert/strict';
import { unifiedRanking, sortedRows, resultsCSV, scoreHighlights } from './leaderboard-utils.js';
const rows = [
 { id:'a-zero',name:'A',setting:'zero',order:0,aggregate:{rank:1,overall:20},conditions:{id:{fpl:15}} },
 { id:'a-one',name:'A',setting:'one',order:1,aggregate:{rank:1,overall:40},conditions:{id:{fpl:25}} },
 { id:'b-full',name:'B',setting:'full',order:2,aggregate:{rank:1,overall:40},conditions:{id:{fpl:5}} },
 { id:'c-zero',name:'C',setting:'zero',order:3,aggregate:{rank:2,overall:-3},conditions:{id:{fpl:32}} },
 { id:'sia',name:'SIA only',setting:'zero',order:4,conditions:{id:{sia:9}} },
];
const view = {query:'',condition:'aggregate',sort:null};
test('unified ranks compare scores across settings, preserve negatives and competition ties, and do not mutate source',()=>{
 const original=structuredClone(rows), merged=unifiedRanking(rows);
 assert.deepEqual(sortedRows(merged,view).map(r=>r.id),['a-one','b-full','a-zero','c-zero','sia']);
 assert.deepEqual(merged.map(r=>r.aggregate?.rank),[3,1,1,4,undefined]);
 assert.deepEqual(rows,original);
});
test('domain changes retain Overall order, explicit FPL sorting puts missing values last',()=>{
 const merged=unifiedRanking(rows);
 for(const condition of ['id','emb','env']) assert.deepEqual(sortedRows(merged,{...view,condition}).map(r=>r.id),['a-one','b-full','a-zero','c-zero','sia']);
 assert.deepEqual(sortedRows(merged,{...view,condition:'id',sort:{key:'fpl',asc:true}}).map(r=>r.id),['b-full','a-zero','a-one','c-zero','sia']);
});
test('CSV exports the unified rank and setting for each configuration',()=>{
 const exported=resultsCSV(sortedRows(unifiedRanking(rows.slice(0,4)),view),view,['overall']);
 assert.match(exported,/"Model","Setting","Condition","Rank","Overall"/);
 assert.match(exported,/"A","One-Shot","Leaderboard","1","40"/);
 assert.match(exported,/"B","Full-Shot","Leaderboard","1","40"/);
 assert.match(exported,/"C","Zero-Shot","Leaderboard","4","-3"/);
});
test('best/second best highlights use combined settings and lower FPL is better',()=>{
 assert.deepEqual(scoreHighlights(rows,'id',['fpl']).fpl,{best:5,second:15});
 assert.deepEqual(scoreHighlights(rows,'aggregate',['overall']).overall,{best:40,second:20});
});

test('current manuscript highlights include TOPReward VOC and retain RoboReward exclusions',()=>{
 const rows = [{name:'TOPReward-32B',conditions:{id:{voc:95,memory_voc:90}}},{name:'Other',conditions:{id:{voc:80,memory_voc:70}}}];
 assert.deepEqual(scoreHighlights(rows,'id',['voc']).voc,{best:95,second:80});
});
