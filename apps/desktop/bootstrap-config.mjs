import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const CONFIG_FILE = 'bootstrap.json';
const DATABASE_FILE = join('data', 'personal-tax-ledger.sqlite');

function defaultProfile() {
  return {
    displayName: '',
    taxId: '',
    taxResidenceCountry: 'CL',
    taxpayerMode: 'MIXED',
    preferredTaxYear: new Date().getFullYear(),
    defaultAfpName: '',
    defaultHealthSystem: '',
    defaultApvRegime: 'NONE',
    notes: ''
  };
}

export function createDefaultBootstrapConfig(userDataPath) {
  return {
    schemaVersion: 1,
    firstRunCompleted: false,
    lastSeenVersion: null,
    profile: defaultProfile(),
    activeWorkspace: {
      name: 'Principal',
      path: userDataPath
    },
    pendingWorkspace: null
  };
}

export function bootstrapConfigPath(userDataPath) {
  return join(userDataPath, CONFIG_FILE);
}

function normalizeProfile(value = {}) {
  return { ...defaultProfile(), ...value };
}

function normalizeWorkspace(value, userDataPath) {
  const path = typeof value?.path === 'string' && value.path.trim() ? resolve(value.path) : userDataPath;
  return {
    name: typeof value?.name === 'string' && value.name.trim() ? value.name.trim() : 'Principal',
    path
  };
}

function normalizeConfig(value, userDataPath) {
  const defaults = createDefaultBootstrapConfig(userDataPath);
  return {
    ...defaults,
    ...value,
    schemaVersion: 1,
    profile: normalizeProfile(value?.profile),
    activeWorkspace: normalizeWorkspace(value?.activeWorkspace, userDataPath),
    pendingWorkspace: value?.pendingWorkspace
      ? {
          ...value.pendingWorkspace,
          workspace: normalizeWorkspace(value.pendingWorkspace.workspace, userDataPath),
          mode: ['OPEN_EXISTING', 'ADOPT_CURRENT', 'CREATE_NEW'].includes(value.pendingWorkspace.mode)
            ? value.pendingWorkspace.mode
            : 'OPEN_EXISTING'
        }
      : null
  };
}

export function loadBootstrapConfig(userDataPath) {
  const path = bootstrapConfigPath(userDataPath);
  if (!existsSync(path)) return createDefaultBootstrapConfig(userDataPath);
  try {
    return normalizeConfig(JSON.parse(readFileSync(path, 'utf8')), userDataPath);
  } catch {
    return createDefaultBootstrapConfig(userDataPath);
  }
}

export function saveBootstrapConfig(userDataPath, config) {
  mkdirSync(userDataPath, { recursive: true });
  const path = bootstrapConfigPath(userDataPath);
  const temp = `${path}.tmp`;
  const normalized = normalizeConfig(config, userDataPath);
  writeFileSync(temp, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  renameSync(temp, path);
  return normalized;
}

export function databasePathForWorkspace(workspacePath) {
  return join(resolve(workspacePath), DATABASE_FILE);
}

export function workspaceStatus(workspacePath) {
  const path = resolve(workspacePath);
  const dbPath = databasePathForWorkspace(path);
  return {
    path,
    databasePath: dbPath,
    hasDatabase: existsSync(dbPath)
  };
}

export function scheduleWorkspaceChange(userDataPath, config, workspace, mode) {
  const normalized = normalizeConfig(config, userDataPath);
  const nextWorkspace = normalizeWorkspace(workspace, userDataPath);
  if (nextWorkspace.path === normalized.activeWorkspace.path) {
    return saveBootstrapConfig(userDataPath, {
      ...normalized,
      activeWorkspace: nextWorkspace,
      pendingWorkspace: null
    });
  }
  return saveBootstrapConfig(userDataPath, {
    ...normalized,
    pendingWorkspace: { workspace: nextWorkspace, mode }
  });
}

export function applyPendingWorkspace(userDataPath, config) {
  const normalized = normalizeConfig(config, userDataPath);
  const pending = normalized.pendingWorkspace;
  if (!pending) return normalized;

  const sourceDb = databasePathForWorkspace(normalized.activeWorkspace.path);
  const targetDb = databasePathForWorkspace(pending.workspace.path);
  mkdirSync(dirname(targetDb), { recursive: true });

  if (pending.mode === 'OPEN_EXISTING' && !existsSync(targetDb)) {
    throw new Error(`El workspace seleccionado no contiene una base de Personal Tax Ledger: ${pending.workspace.path}`);
  }
  if (pending.mode === 'CREATE_NEW' && existsSync(targetDb)) {
    throw new Error(`El workspace seleccionado ya contiene datos de Personal Tax Ledger: ${pending.workspace.path}`);
  }
  if (pending.mode === 'ADOPT_CURRENT') {
    if (existsSync(targetDb)) {
      throw new Error(`No se puede adoptar el workspace actual porque el destino ya contiene datos: ${pending.workspace.path}`);
    }
    if (existsSync(sourceDb)) copyFileSync(sourceDb, targetDb);
  }

  return saveBootstrapConfig(userDataPath, {
    ...normalized,
    activeWorkspace: pending.workspace,
    pendingWorkspace: null
  });
}
