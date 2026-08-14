import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface PatchModule {
  PATCHED_SIGNATURES: string[];
  patchBundleContent(source: string): string;
  validatePatchedBundle(source: string): string[];
}

const require = createRequire(import.meta.url);
const patcher = require('../../../scripts/patchSwisseph.cjs') as PatchModule;

describe('@swisseph/browser bundle patch guard', () => {
  const bundlePath = resolve('node_modules/@swisseph/browser/dist/swisseph-browser.js');

  it('validates every required signature in the installed bundle', () => {
    const bundle = readFileSync(bundlePath, 'utf8');
    expect(patcher.PATCHED_SIGNATURES.length).toBeGreaterThan(15);
    expect(patcher.validatePatchedBundle(bundle)).toEqual([]);
    expect(patcher.patchBundleContent(bundle)).toBe(bundle);
  });

  it('rejects a bundle marked as patched when any signature is missing', () => {
    const bundle = readFileSync(bundlePath, 'utf8');
    const missingSignature = 'flags: retflag';
    const partial = bundle.replace(missingSignature, 'flags: /* removed */ retflag');

    expect(patcher.validatePatchedBundle(partial)).toContain(missingSignature);
    expect(() => patcher.patchBundleContent(partial)).toThrow(/partially patched/i);
  });
});
