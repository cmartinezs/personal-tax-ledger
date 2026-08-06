import { spawn } from 'node:child_process';

export function npmCommand(platform = process.platform) {
  return platform === 'win32' ? 'npm.cmd' : 'npm';
}

export function spawnNode(args, options = {}) {
  return spawn(process.execPath, args, { windowsHide: true, ...options });
}

export function spawnCommand(command, args, options = {}) {
  return spawn(command, args, { windowsHide: true, ...options });
}

export function terminateProcess(child, signal = 'SIGTERM') {
  if (!child || child.exitCode !== null || child.signalCode) return;
  child.kill(signal);
}
