import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppxManifest, msixConfig } from './msix-config.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(repoRoot, 'out', 'Personal Tax Ledger-win32-x64');
const outDir = join(repoRoot, 'out', 'msix');
const stagingDir = join(outDir, 'staging');
const assetsDir = join(stagingDir, 'Assets');
const metadataPath = join(outDir, 'msix-build.json');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function solidPng(width, height, rgba = [53, 199, 167, 255]) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(1 + width * 4);
  row[0] = 0;
  for (let x = 0; x < width; x += 1) {
    const offset = 1 + x * 4;
    row[offset] = rgba[0];
    row[offset + 1] = rgba[1];
    row[offset + 2] = rgba[2];
    row[offset + 3] = rgba[3];
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function writeAsset(name, width, height) {
  writeFileSync(join(assetsDir, name), solidPng(width, height));
}

if (!existsSync(join(sourceDir, 'PersonalTaxLedger.exe'))) {
  throw new Error(`No existe el paquete desktop Windows esperado en ${sourceDir}. Ejecuta npm run desktop:package:win primero.`);
}

const config = msixConfig();
rmSync(outDir, { recursive: true, force: true });
mkdirSync(stagingDir, { recursive: true });
cpSync(sourceDir, stagingDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

writeAsset('StoreLogo.png', 50, 50);
writeAsset('Square44x44Logo.png', 44, 44);
writeAsset('Square150x150Logo.png', 150, 150);
writeAsset('Wide310x150Logo.png', 310, 150);
writeFileSync(join(stagingDir, 'AppxManifest.xml'), createAppxManifest(config), 'utf8');

const manifest = readFileSync(join(stagingDir, 'AppxManifest.xml'));
const metadata = {
  formatVersion: 1,
  mode: config.mode,
  identityName: config.identityName,
  publisher: config.publisher,
  publisherDisplayName: config.publisherDisplayName,
  version: config.version,
  architecture: config.architecture,
  sourceDirectory: sourceDir,
  stagingDirectory: stagingDir,
  expectedPackageName: `PersonalTaxLedger-${config.version}-x64.msix`,
  manifestSha256: createHash('sha256').update(manifest).digest('hex'),
  createdAt: new Date().toISOString()
};
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

console.log('MSIX staging prepared:');
console.log(`- mode: ${metadata.mode}`);
console.log(`- identity: ${metadata.identityName}`);
console.log(`- publisher: ${metadata.publisher}`);
console.log(`- version: ${metadata.version}`);
console.log(`- staging: ${metadata.stagingDirectory}`);
console.log(`- metadata: ${metadataPath}`);
console.log('Next: package staging with MakeAppx.exe on a Windows SDK host.');
