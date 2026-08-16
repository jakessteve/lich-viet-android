import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('bundled Swiss asset provenance', () => {
  it('ships license, notice, provenance, and matching SHA-256 checksums', () => {
    const directory = resolve('public/ephe');
    for (const document of ['LICENSE.txt', 'NOTICE.md', 'PROVENANCE.md', 'CHECKSUMS.sha256']) {
      expect(readFileSync(resolve(directory, document), 'utf8').length).toBeGreaterThan(40);
    }
    const checksums = readFileSync(resolve(directory, 'CHECKSUMS.sha256'), 'utf8');
    for (const filename of ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1']) {
      const digest = createHash('sha256')
        .update(readFileSync(resolve(directory, filename)))
        .digest('hex');
      expect(checksums).toContain(`${digest}  ${filename}`);
    }
  });
});
