import fs from 'node:fs/promises';
import path from 'node:path';

import { test as base, expect } from '@playwright/test';

const COVERAGE_STORAGE_KEY = '__pw_coverage_acc__';

function sanitize(value: string) {
  return value
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export const test = base.extend({});

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    type CounterMap = Record<string, number>;
    type BranchMap = Record<string, number[]>;
    type CoverageFile = { s?: CounterMap; f?: CounterMap; b?: BranchMap; [key: string]: unknown };
    type CoverageMap = Record<string, CoverageFile>;

    function mergeCounterMaps(target: CounterMap = {}, source: CounterMap = {}) {
      for (const key of Object.keys(source)) {
        target[key] = (target[key] ?? 0) + (source[key] ?? 0);
      }
      return target;
    }

    function mergeBranchMaps(target: BranchMap = {}, source: BranchMap = {}) {
      for (const key of Object.keys(source)) {
        const targetBranch = target[key] ?? [];
        const sourceBranch = source[key] ?? [];
        target[key] = sourceBranch.map(
          (count: number, index: number) => (targetBranch[index] ?? 0) + count,
        );
      }
      return target;
    }

    function mergeCoverage(target: CoverageMap = {}, source: CoverageMap = {}) {
      for (const file of Object.keys(source)) {
        const targetFile = target[file] ?? {};
        const sourceFile = source[file] ?? {};
        target[file] = {
          ...targetFile,
          ...sourceFile,
          s: mergeCounterMaps(targetFile.s ?? {}, sourceFile.s ?? {}),
          f: mergeCounterMaps(targetFile.f ?? {}, sourceFile.f ?? {}),
          b: mergeBranchMaps(targetFile.b ?? {}, sourceFile.b ?? {}),
        };
      }
      return target;
    }

    function flushCoverage() {
      try {
        const current = (window as Window & { __coverage__?: CoverageMap }).__coverage__;
        if (!current) {
          return;
        }
        const existingRaw = localStorage.getItem(storageKey);
        const existing = existingRaw ? (JSON.parse(existingRaw) as CoverageMap) : {};
        localStorage.setItem(storageKey, JSON.stringify(mergeCoverage(existing, current)));
      } catch {
        // Ignore coverage flush errors so tests are unaffected.
      }
    }

    window.addEventListener('beforeunload', flushCoverage);
    window.addEventListener('pagehide', flushCoverage);
  }, COVERAGE_STORAGE_KEY);
});

test.afterEach(async ({ page }, testInfo) => {
  const coverage = await page
    .evaluate((storageKey) => {
      type CounterMap = Record<string, number>;
      type BranchMap = Record<string, number[]>;
      type CoverageFile = {
        s?: CounterMap;
        f?: CounterMap;
        b?: BranchMap;
        [key: string]: unknown;
      };
      type CoverageMap = Record<string, CoverageFile>;

      function mergeCounterMaps(target: CounterMap = {}, source: CounterMap = {}) {
        for (const key of Object.keys(source)) {
          target[key] = (target[key] ?? 0) + (source[key] ?? 0);
        }
        return target;
      }

      function mergeBranchMaps(target: BranchMap = {}, source: BranchMap = {}) {
        for (const key of Object.keys(source)) {
          const targetBranch = target[key] ?? [];
          const sourceBranch = source[key] ?? [];
          target[key] = sourceBranch.map(
            (count: number, index: number) => (targetBranch[index] ?? 0) + count,
          );
        }
        return target;
      }

      function mergeCoverage(target: CoverageMap = {}, source: CoverageMap = {}) {
        for (const file of Object.keys(source)) {
          const targetFile = target[file] ?? {};
          const sourceFile = source[file] ?? {};
          target[file] = {
            ...targetFile,
            ...sourceFile,
            s: mergeCounterMaps(targetFile.s ?? {}, sourceFile.s ?? {}),
            f: mergeCounterMaps(targetFile.f ?? {}, sourceFile.f ?? {}),
            b: mergeBranchMaps(targetFile.b ?? {}, sourceFile.b ?? {}),
          };
        }
        return target;
      }

      const persistedRaw = localStorage.getItem(storageKey);
      const persisted = persistedRaw ? (JSON.parse(persistedRaw) as CoverageMap) : {};
      const current = (window as Window & { __coverage__?: CoverageMap }).__coverage__ ?? {};
      const merged = mergeCoverage(persisted, current);
      localStorage.removeItem(storageKey);
      return Object.keys(merged).length > 0 ? merged : null;
    }, COVERAGE_STORAGE_KEY)
    .catch(() => null);

  if (!coverage) {
    return;
  }

  const outputDir = path.resolve(process.cwd(), '.nyc_output');
  await fs.mkdir(outputDir, { recursive: true });
  const name = sanitize(testInfo.titlePath.join('-'));
  await fs.writeFile(
    path.join(outputDir, `${name}-browser.json`),
    JSON.stringify(coverage),
    'utf8',
  );
});

export { expect };
