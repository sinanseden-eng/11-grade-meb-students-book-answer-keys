import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../dist/data/', import.meta.url);
const read = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
const manifest = await read('manifest.json');
assert.equal(manifest.schemaVersion, 1, 'Unsupported content schema');
assert.equal(manifest.title, '11th Grade MEB English', 'Use the requested book title');
assert(manifest.questionNote?.trim(), 'Explain the treatment of source questions');
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
    const image = await readFile(new URL(`../pages/page-${String(p.number).padStart(2,'0')}.webp`, root));
    assert(image.length > 1000 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii',8,12) === 'WEBP', `Missing or invalid answer-key image for page ${p.number}`);
    assert(Number.isInteger(p.number) && p.number > previous, 'Student’s Book pages must be unique and ascending within each unit');
    previous = p.number;
    assert(p.title?.trim() && p.section?.trim(), `Page ${p.number} needs a title and section`);
    assert(Array.isArray(p.activities) && p.activities.length, `Page ${p.number} has no activities`);
    const labels = new Set();
    for (const a of p.activities) {
      assert(typeof a.label === 'string' && a.label.trim() && !labels.has(a.label), `Duplicate or empty activity label on page ${p.number}`);
      labels.add(a.label);
      assert(a.title?.trim() && kinds.has(a.kind), `Invalid activity on page ${p.number}`);
      assert(typeof a.prompt === 'string' && a.prompt.trim(), `Missing question prompt on page ${p.number}, exercise ${a.label}`);
      assert(Array.isArray(a.answers) && a.answers.length, `Empty answer on page ${p.number}`);
      if (a.questions !== undefined) {
        assert(Array.isArray(a.questions) && a.questions.length === a.answers.length, `Questions and answers must pair one-to-one on page ${p.number}, exercise ${a.label}`);
        assert(a.questions.every(q => typeof q === 'string' && q.trim()), `Blank question on page ${p.number}`);
      }
      assert(a.answers.every(t => typeof t === 'string' && t.trim() && !/students?[’']?\s*own answers?|\bTODO\b|\bTBD\b/i.test(t)), `Replace placeholders with answers on page ${p.number}`);
      if (a.note !== undefined) assert(typeof a.note === 'string' && a.note.trim(), 'Notes must not be empty');
      activities++; if (a.kind === 'sample') samples++;
    }
    pages++;
  }
}
console.log(`Validated ${ids.size} units, ${pages} pages, ${activities} activities (${samples} original model-response groups).`);
