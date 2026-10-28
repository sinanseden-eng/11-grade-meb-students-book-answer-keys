import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../dist/data/', import.meta.url);
const read = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
const manifest = await read('manifest.json');
assert.equal(manifest.schemaVersion, 1, 'Unsupported content schema');
assert(Array.isArray(manifest.units) && manifest.units.length, 'The collection must list units');
const ids = new Set(), kinds = new Set(['key', 'sample', 'practice']);
let pages = 0, activities = 0, samples = 0;
for (const entry of manifest.units) {
  assert(Number.isInteger(entry.id) && entry.id > 0 && !ids.has(entry.id), 'Unit IDs must be unique positive integers');
  ids.add(entry.id);
  assert.equal(entry.status, 'available', 'Only available units should be listed; future units are not fabricated');
  assert(/^unit-\d+\.json$/.test(entry.file), 'Use a unit-NN.json content filename');
  const u = await read(entry.file);
  for (const field of ['id', 'title', 'subtitle', 'color', 'icon', 'range', 'description', 'skills']) assert.deepEqual(u[field], entry[field], `Manifest and unit ${entry.id} disagree on ${field}`);
  assert(['purple', 'teal'].includes(u.color), 'Use a supported unit color');
  assert(u.pages.length > 0, 'Unit must include pages');
  let previous = 0;
  for (const p of u.pages) {
    assert(Number.isInteger(p.number) && p.number > previous, 'Student’s Book pages must be unique and ascending within each unit');
    previous = p.number;
    assert(p.title?.trim() && p.section?.trim(), `Page ${p.number} needs a title and section`);
    assert(Array.isArray(p.activities) && p.activities.length, `Page ${p.number} has no activities`);
    const labels = new Set();
    for (const a of p.activities) {
      assert(typeof a.label === 'string' && a.label.trim() && !labels.has(a.label), `Duplicate or empty activity label on page ${p.number}`);
      labels.add(a.label);
      assert(a.title?.trim() && kinds.has(a.kind), `Invalid activity on page ${p.number}`);
      assert(Array.isArray(a.answers) && a.answers.length, `Empty answer on page ${p.number}`);
      assert(a.answers.every(t => typeof t === 'string' && t.trim() && !/students?[’']?\s*own answers?|\bTODO\b|\bTBD\b/i.test(t)), `Replace placeholders with answers on page ${p.number}`);
      if (a.note !== undefined) assert(typeof a.note === 'string' && a.note.trim(), 'Notes must not be empty');
      activities++; if (a.kind === 'sample') samples++;
    }
    pages++;
  }
}
console.log(`Validated ${ids.size} units, ${pages} pages, ${activities} activities (${samples} original model-response groups).`);
