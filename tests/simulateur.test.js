// Tests de bout en bout du simulateur (jsdom). Lancer : npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'site', 'simulateur-viager-occupe.html'), 'utf8');
const wait = ms => new Promise(r => setTimeout(r, ms));
const load = () => new JSDOM(HTML, { runScripts: 'dangerously', pretendToBeVisual: true }).window;
function set(w, id, v) {
  const e = w.document.getElementById(id);
  e.value = String(v);
  e.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (e.tagName === 'SELECT') e.dispatchEvent(new w.Event('change', { bubbles: true }));
}
const txt = (w, id) => w.document.getElementById(id)?.textContent ?? '';
const num = s => Number(s.replace(/[^\d,.-]/g, '').replace(',', '.'));
const results = w => w.document.getElementById('results');
// Cas de référence : simulateur notarial (couple F76 + H80, 400 000 €, loyer 1 104 €/mois, bouquet 60 000 €)
async function notaire(mod = () => {}) {
  const w = load();
  set(w, 'value', 400000); set(w, 'rent', 1104); set(w, 'heads', '2');
  set(w, 'sex1', 'F'); set(w, 'age1', 76); set(w, 'sex2', 'M'); set(w, 'age2', 80); set(w, 'bouquet', 60000);
  mod(w); await wait(450);
  return w;
}

test('la page se charge et affiche une simulation par défaut', () => {
  const w = load();
  assert.match(txt(w, 'liveBouquet'), /€/);
  assert.match(txt(w, 'liveRente'), /mois/);
});

test('cas notaire : rente dans la fourchette attendue (hypothèses V7)', async () => {
  const w = await notaire();
  const rente = num(txt(w, 'liveRente'));
  assert.ok(rente > 1050 && rente < 1160, 'rente = ' + rente);   // V7 : ~1 105 €/mois
  assert.match(results(w).textContent, /15,[5-9] ans/);             // durée ~15,7 ans
});

test('le panneau expert est masqué au public', () => {
  assert.equal(load().document.querySelector('details').hidden, true);
});

test('champ hors borne : message avec libellé lisible', async () => {
  const w = await notaire(w => set(w, 'age1', 49));
  assert.match(results(w).textContent, /Âge de la 1re personne/);
  assert.doesNotMatch(results(w).textContent, /age1/);
});

test('bouquet supérieur à la valeur occupée : erreur explicite', async () => {
  const w = await notaire(w => set(w, 'bouquet', 390000));
  assert.match(results(w).textContent, /dépasse la valeur occupée/);
});

test('DUH supérieur à la valeur du bien : erreur explicite', async () => {
  const w = await notaire(w => set(w, 'rent', 9000));
  assert.match(results(w).textContent, /dépasse la valeur du bien/);
});

test('bouquet à 0 : la rente augmente', async () => {
  const w0 = await notaire(); const w1 = await notaire(w => set(w, 'bouquet', 0));
  assert.ok(num(txt(w1, 'liveRente')) > num(txt(w0, 'liveRente')));
});

test('réversion à 0 % : la rente augmente', async () => {
  const w0 = await notaire(); const w1 = await notaire(w => set(w, 'reversion', 0));
  assert.ok(num(txt(w1, 'liveRente')) > num(txt(w0, 'liveRente')));
});

test('curseur : fixer la rente recalcule le bouquet', async () => {
  const w = await notaire();
  const r = w.document.getElementById('renteLive');
  r.value = '1000'; r.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(num(txt(w, 'liveRente')), 1000);
  const b = num(txt(w, 'liveBouquet'));
  assert.ok(b > 60000 && b < 100000, 'bouquet = ' + b);
});

test('alerte de cohérence pour un âge ≥ 90 ans', async () => {
  const w = await notaire(w => { set(w, 'heads', '1'); set(w, 'age1', 95); });
  assert.ok(results(w).querySelector('[role=alert]'));
});

test("la page reste noindex tant qu'elle n'est pas validée", () => {
  assert.match(HTML, /<meta name="robots" content="noindex,nofollow">/);
});
