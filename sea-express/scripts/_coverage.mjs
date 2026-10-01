const mods = {
  Restaurants: ['../lib/garden-route/restaurants.ts', 'RESTAURANTS'],
  Businesses:  ['../lib/garden-route/businesses.ts', 'BUSINESSES'],
  Medical:     ['../lib/garden-route/medical.ts', 'MEDICAL'],
  Stays:       ['../lib/garden-route/accommodation.ts', 'ACCOMMODATION'],
  Markets:     ['../lib/garden-route/markets.ts', 'MARKETS'],
};
const towns = (await import('../lib/garden-route/towns.ts')).TOWNS;
const data = {};
for (const [label, [path, key]] of Object.entries(mods)) {
  try { const m = await import(path); data[label] = m[key] ?? []; }
  catch (e) { data[label] = []; console.error('skip', label, e.message.split('\n')[0]); }
}
const labels = Object.keys(data);
console.log('TOWN'.padEnd(18) + labels.map(l => l.slice(0,6).padStart(8)).join('') + '   TOTAL');
const empty = [];
for (const t of towns) {
  const counts = labels.map(l => data[l].filter(x => x.town === t.slug).length);
  const total = counts.reduce((a,b)=>a+b,0);
  if (total === 0) empty.push(t.label);
  console.log(t.label.padEnd(18) + counts.map(c => String(c).padStart(8)).join('') + String(total).padStart(8));
}
console.log('\nTowns with ZERO listings anywhere:', empty.length ? empty.join(', ') : 'none');
const thin = towns.filter(t => { const n = labels.reduce((a,l)=>a+data[l].filter(x=>x.town===t.slug).length,0); return n>0 && n<10; }).map(t=>t.label);
console.log('Towns with fewer than 10:', thin.join(', ') || 'none');
