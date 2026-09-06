import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import {
  applyPendingWorkspace,
  databasePathForWorkspace,
  loadBootstrapConfig,
  saveBootstrapConfig,
  scheduleWorkspaceChange
} from '../apps/desktop/bootstrap-config.mjs';

test('bootstrap defaults preserve legacy userData workspace', () => {
  const root = mkdtempSync(join(tmpdir(), 'ptl-bootstrap-'));
  try {
    const config = loadBootstrapConfig(root);
    assert.equal(config.firstRunCompleted, false);
    assert.equal(config.activeWorkspace.path, root);
    assert.equal(databasePathForWorkspace(config.activeWorkspace.path), join(root, 'data', 'personal-tax-ledger.sqlite'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('profile config persists atomically', () => {
  const root = mkdtempSync(join(tmpdir(), 'ptl-bootstrap-'));
  try {
    const config = saveBootstrapConfig(root, {
      ...loadBootstrapConfig(root),
      firstRunCompleted: true,
      profile: { ...loadBootstrapConfig(root).profile, displayName: 'Test User', taxId: '1-9' }
    });
    const reloaded = loadBootstrapConfig(root);
    assert.equal(config.firstRunCompleted, true);
    assert.equal(reloaded.profile.displayName, 'Test User');
    assert.equal(reloaded.profile.taxId, '1-9');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ADOPT_CURRENT copies the closed database before switching workspace', () => {
  const root = mkdtempSync(join(tmpdir(), 'ptl-bootstrap-'));
  const target = mkdtempSync(join(tmpdir(), 'ptl-workspace-'));
  try {
    const sourceDb = databasePathForWorkspace(root);
    mkdirSync(join(root, 'data'), { recursive: true });
    writeFileSync(sourceDb, 'legacy-database');

    let config = loadBootstrapConfig(root);
    config = scheduleWorkspaceChange(root, config, { name: 'Nuevo', path: target }, 'ADOPT_CURRENT');
    assert.ok(config.pendingWorkspace);

    config = applyPendingWorkspace(root, config);
    assert.equal(config.pendingWorkspace, null);
    assert.equal(config.activeWorkspace.path, target);
    assert.equal(readFileSync(databasePathForWorkspace(target), 'utf8'), 'legacy-database');
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
});

test('OPEN_EXISTING rejects a folder without a PTL database', () => {
  const root = mkdtempSync(join(tmpdir(), 'ptl-bootstrap-'));
  const target = mkdtempSync(join(tmpdir(), 'ptl-workspace-'));
  try {
    let config = loadBootstrapConfig(root);
    config = scheduleWorkspaceChange(root, config, { name: 'Vacío', path: target }, 'OPEN_EXISTING');
    assert.throws(() => applyPendingWorkspace(root, config), /no contiene una base/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(target, { recursive: true, force: true });
  }
});
