import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile('apps/local/web/src/app/ApplicabilityProfileSection.tsx', 'utf8');
const gate = await readFile('apps/local/web/src/app/AnnualWorkspaceGate.tsx', 'utf8');
const client = await readFile('apps/local/web/src/app/applicability-profile-client.ts', 'utf8');

test('AW-004: editor expone exactamente Sí / No / Aún no sé', () => {
  assert.match(source, /label: 'Sí'/);
  assert.match(source, /label: 'No'/);
  assert.match(source, /label: 'Aún no sé'/);
  assert.match(source, /role="radiogroup"/);
});

test('AW-004: copy distingue perfil de hechos y no introduce montos', () => {
  assert.match(source, /Esto no registra montos ni confirma que hayan ocurrido/);
  assert.doesNotMatch(source, /type="number"/);
});

test('AW-004: NEEDS_REVIEW conserva perfil y solicita revisar datos existentes', () => {
  assert.match(source, /NEEDS_REVIEW/);
  assert.match(source, /El perfil no se modifica automáticamente y los datos existentes no se eliminan/);
  assert.match(source, /Revisa los datos en:/);
});

test('AW-004: perfil está montado en el contexto anual y se recarga al cambiar commercialYear', () => {
  assert.match(gate, /ApplicabilityProfileSection commercialYear=\{catalog\.activeCommercialYear\}/);
  assert.match(source, /\[commercialYear\]/);
});

test('AW-004: cliente usa endpoint anual explícito para leer y guardar answers', () => {
  assert.match(client, /\/api\/annual-workspace\/applicability-profile/);
  assert.match(client, /save: \(answers/);
  assert.match(client, /\{ answers \}/);
});
