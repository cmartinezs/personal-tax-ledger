import test from 'node:test';
import assert from 'node:assert/strict';
import { isMainModule, resolveDataPath } from '../../apps/local/src/platform/paths.mjs';
import { npmCommand } from '../../apps/local/src/platform/processes.mjs';

test('platform helpers normalizan file URLs, paths y comandos por sistema', () => {
  assert.equal(isMainModule(new URL('file:///tmp/app.mjs').href, '/tmp/app.mjs'), true);
  assert.equal(npmCommand('win32'), 'npm.cmd');
  assert.equal(npmCommand('linux'), 'npm');
  assert.match(resolveDataPath('data/db.sqlite', '/tmp/project'), /data[\\/]db\.sqlite$/);
});
