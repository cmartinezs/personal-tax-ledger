import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog } from 'electron';
import { createLocalApp } from '../local/src/create-local-app.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
let localApp;
let mainWindow;
let closing = false;

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

async function startDesktop() {
  const dataDirectory = join(app.getPath('userData'), 'data');
  mkdirSync(dataDirectory, { recursive: true });
  process.env.DB_PATH = join(dataDirectory, 'personal-tax-ledger.sqlite');

  localApp = createLocalApp({
    port: 0,
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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
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

    app.whenReady().then(startDesktop).catch(async error => {
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
