import { spawnNode, spawnCommand, npmCommand, terminateProcess } from '../apps/local/src/platform/processes.mjs';

const children = [
  spawnNode(['--watch', 'apps/local/src/main.mjs'], { stdio: 'inherit' }),
  spawnCommand(npmCommand(), ['--workspace', 'web', 'run', 'dev'], { stdio: 'inherit' })
];

const stop = () => {
  for (const child of children) terminateProcess(child);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children) child.on('exit', code => {
  if (code && code !== 0) process.exitCode = code;
});
