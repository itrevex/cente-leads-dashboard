import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { setupServer } from 'msw/node';

import { getHandlerSet } from '../../src/mocks/handlers/index.js';

function parseArgs(argv) {
  const parsed = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, value] = arg.slice(2).split('=');
    parsed[key] = value ?? 'true';
  }
  return parsed;
}

function ensureCoverageDir() {
  const outputDir = path.resolve(process.cwd(), '.nyc_output');
  fs.mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

function writeCoverageFile(name) {
  const coverage = globalThis.__coverage__;
  if (!coverage || typeof coverage !== 'object') {
    return;
  }

  const outputDir = ensureCoverageDir();
  const filePath = path.join(outputDir, `${name}-server.json`);
  fs.writeFileSync(filePath, JSON.stringify(coverage));
}

const args = parseArgs(process.argv.slice(2));
const handlerSet = args.handlers;
const port = args.port;

if (!handlerSet || !port) {
  throw new Error('Expected --handlers=<name> and --port=<port>.');
}

process.env.PORT = port;
process.env.HOST = '127.0.0.1';

const server = setupServer(...getHandlerSet(handlerSet));
server.listen({ onUnhandledRequest: 'error' });

let shutdown = false;

function stop(signal) {
  if (shutdown) {
    return;
  }
  shutdown = true;
  writeCoverageFile(handlerSet);
  server.close();
  process.exit(signal === 'SIGINT' ? 130 : 0);
}

process.on('SIGTERM', () => stop('SIGTERM'));
process.on('SIGINT', () => stop('SIGINT'));
process.on('beforeExit', () => writeCoverageFile(handlerSet));

await import('../../dist/server/entry.mjs');
