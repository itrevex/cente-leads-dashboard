import fs from 'node:fs';
import path from 'node:path';

import { afterAll } from 'vitest';

afterAll(() => {
  const outputFile = process.env.VITEST_NYC_FILE;
  const coverage = (globalThis as typeof globalThis & { __coverage__?: unknown }).__coverage__;

  if (!outputFile || !coverage || typeof coverage !== 'object') {
    return;
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(coverage), 'utf8');
});
