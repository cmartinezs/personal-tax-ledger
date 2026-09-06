import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { createLocalApp } from '../local/src/create-local-app.mjs';
import {
  applyPendingWorkspace,
  databasePathForWorkspace,
  loadBootstrapConfig,
  saveBootstrapConfig,
  scheduleWorkspaceChange,
  workspaceStatus
} from './bootstrap-config.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const desktopDir = dirname(fileURLToPath(import.meta.url));
let localApp;
let mainWindow;
let splashWindow;
let splashShownAt = 0;
let closing = false;
let launchKind = 'NORMAL';
let startupConfig;

function runSquirrelUpdate(args) {
  const updateExe = resolve(dirname(process.execPath), '..', 'Update.exe');
  const child = spawn(updateExe, args, {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
}

function handleSquirrelEvent() {
  if (process.platform !== 'win32') return false;

  const event = process.argv[1];
  if (!event?.startsWith('--squirrel-')) return false;

  const exeName = basename(process.execPath);
  switch (event) {
    case '--squirrel-install':
    case '--squirrel-updated':
      runSquirrelUpdate(['--createShortcut', exeName]);
      break;
    case '--squirrel-uninstall':
      runSquirrelUpdate(['--removeShortcut', exeName]);
      break;
    case '--squirrel-obsolete':
      break;
    default:
      return false;
  }

  setTimeout(() => app.quit(), 1000);
  return true;
}

function currentUserDataPath() {
  return app.getPath('userData');
}

function readCurrentBootstrap() {
  return loadBootstrapConfig(currentUserDataPath());
}

function bootstrapPayload(config = readCurrentBootstrap()) {
  return {
    ...config,
    appVersion: app.getVersion(),
    launchKind,
    activeWorkspaceStatus: workspaceStatus(config.activeWorkspace.path)
  };
}

async function stopLocalRuntime() {
  if (!localApp || closing) return;
  closing = true;
  try {
    await localApp.stop();
  } finally {
    localApp = undefined;
    closing = false;
  }
}

function installBootstrapIpc() {
  ipcMain.handle('ptl:bootstrap:get', () => bootstrapPayload());

  ipcMain.handle('ptl:bootstrap:choose-workspace', async () => {
    const result = await dialog.showOpenDialog(mainWindow || undefined, {
      title: 'Seleccionar workspace de Personal Tax Ledger',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return workspaceStatus(result.filePaths[0]);
  });

  ipcMain.handle('ptl:bootstrap:inspect-workspace', (_event, path) => {
    if (typeof path !== 'string' || !path.trim()) return null;
    return workspaceStatus(path);
  });

  ipcMain.handle('ptl:bootstrap:update', (_event, payload = {}) => {
    const userDataPath = currentUserDataPath();
    let config = readCurrentBootstrap();
    const nextProfile = payload.profile && typeof payload.profile === 'object'
      ? { ...config.profile, ...payload.profile }
      : config.profile;

    config = saveBootstrapConfig(userDataPath, {
      ...config,
      profile: nextProfile,
      firstRunCompleted: payload.firstRunCompleted ?? config.firstRunCompleted,
      lastSeenVersion: payload.lastSeenVersion ?? config.lastSeenVersion
    });

    let restartRequired = false;
    if (payload.workspace?.path) {
      const mode = ['OPEN_EXISTING', 'ADOPT_CURRENT', 'CREATE_NEW'].includes(payload.workspaceMode)
        ? payload.workspaceMode
        : 'OPEN_EXISTING';
      const requestedPath = resolve(payload.workspace.path);
      restartRequired = requestedPath !== config.activeWorkspace.path;
      config = scheduleWorkspaceChange(userDataPath, config, payload.workspace, mode);
    }

    return { ...bootstrapPayload(config), restartRequired };
  });

  ipcMain.handle('ptl:bootstrap:restart', async () => {
    await stopLocalRuntime();
    app.relaunch();
    app.exit(0);
  });
}

function buildSplashHtml(kind) {
  const subtitle = kind === 'FIRST_RUN'
    ? 'Preparando tu espacio personal por primera vez…'
    : kind === 'UPDATED'
      ? `Preparando Personal Tax Ledger ${app.getVersion()}…`
      : 'Abriendo tu workspace tributario…';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{height:100%;margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;background:#142126;color:#eaf4f2}
    body{display:flex;align-items:center;justify-content:center}
    .box{width:430px;text-align:center;padding:38px}
    .mark{width:72px;height:72px;margin:0 auto 20px;border-radius:20px;background:#35c7a7;color:#08251f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:25px;letter-spacing:-1px;box-shadow:0 12px 30px rgba(53,199,167,.18)}
    h1{font-size:23px;margin:0 0 9px}.sub{color:#aac0bb;font-size:14px;line-height:1.5}.bar{height:3px;background:#2d474c;margin-top:28px;overflow:hidden;border-radius:3px}.bar:after{content:'';display:block;width:42%;height:100%;background:#35c7a7;animation:load 1.2s infinite ease-in-out}@keyframes load{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}
  </style></head><body><div class="box"><div class="mark">PTL</div><h1>Personal Tax Ledger</h1><div class="sub">${subtitle}</div><div class="bar"></div></div></body></html>`;
}

async function createSplash(kind) {
  splashWindow = new BrowserWindow({
    width: 520,
    height: 330,
    frame: false,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    center: true,
    backgroundColor: '#142126',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  splashWindow.on('closed', () => {
    splashWindow = undefined;
    splashShownAt = 0;
  });
  await splashWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(buildSplashHtml(kind))}`);
  if (!splashWindow || splashWindow.isDestroyed()) return;
  splashWindow.show();
  splashShownAt = Date.now();
}

async function waitForMinimumSplash() {
  if (!splashShownAt) return;
  const minimumMs = launchKind === 'NORMAL' ? 250 : 900;
  const remaining = minimumMs - (Date.now() - splashShownAt);
  if (remaining > 0) await new Promise(resolveWait => setTimeout(resolveWait, remaining));
}

async function prepareBootstrap() {
  const userDataPath = currentUserDataPath();
  let config = loadBootstrapConfig(userDataPath);
  if (config.pendingWorkspace) config = applyPendingWorkspace(userDataPath, config);
  launchKind = !config.firstRunCompleted
    ? 'FIRST_RUN'
    : config.lastSeenVersion && config.lastSeenVersion !== app.getVersion()
      ? 'UPDATED'
      : 'NORMAL';
  startupConfig = config;
  return config;
}

async function startDesktop() {
  const config = await prepareBootstrap();
  await createSplash(launchKind);

  const dbPath = databasePathForWorkspace(config.activeWorkspace.path);
  mkdirSync(dirname(dbPath), { recursive: true });
  process.env.DB_PATH = dbPath;

  localApp = createLocalApp({
    port: 0,
    host: '127.0.0.1',
    webDist: resolve(repoRoot, 'apps/local/web/dist')
  });
  const server = await localApp.start();
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No fue posible resolver el puerto local de Personal Tax Ledger.');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#f3f6f8',
    webPreferences: {
      preload: join(desktopDir, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', async () => {
    await waitForMinimumSplash();
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.show();
    splashWindow?.close();
    if (startupConfig?.firstRunCompleted) {
      saveBootstrapConfig(currentUserDataPath(), {
        ...readCurrentBootstrap(),
        lastSeenVersion: app.getVersion()
      });
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
  await mainWindow.loadURL(`http://127.0.0.1:${address.port}`);
}

if (!handleSquirrelEvent()) {
  if (!app.requestSingleInstanceLock()) {
    app.quit();
  } else {
    app.on('second-instance', () => {
      if (!mainWindow) return;
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    app.whenReady().then(() => {
      installBootstrapIpc();
      return startDesktop();
    }).catch(async error => {
      splashWindow?.close();
      await stopLocalRuntime().catch(() => {});
      dialog.showErrorBox('Personal Tax Ledger', error instanceof Error ? error.message : String(error));
      app.quit();
    });

    app.on('before-quit', event => {
      if (!localApp || closing) return;
      event.preventDefault();
      stopLocalRuntime().finally(() => app.quit());
    });

    app.on('window-all-closed', () => app.quit());
  }
}
