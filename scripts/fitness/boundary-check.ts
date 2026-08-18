import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  imported: string;
  reason: string;
}

function scanDir(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanDir(fullPath, fileList);
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function checkBoundaries(): Violation[] {
  const violations: Violation[] = [];
  const rootDir = process.cwd();

  // 1. Check packages/contracts
  const contractsFiles = scanDir(path.join(rootDir, 'packages/contracts/src'));
  for (const file of contractsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const importLines = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
    for (const imp of importLines) {
      if (
        imp.includes('@/components') ||
        imp.includes('@/styles') ||
        imp.includes('@lich-viet/core') ||
        imp.includes('@lich-viet/app-backend') ||
        imp.includes('@omce')
      ) {
        violations.push({
          file: path.relative(rootDir, file),
          imported: imp,
          reason: 'Contracts package must not import from UI, Core, Backend layers or legacy @omce scope',
        });
      }
    }
  }

  // 2. Check packages/core/src/lunar-engine, astrology-rules, prayer-catalog
  const coreFiles = scanDir(path.join(rootDir, 'packages/core/src/lunar-engine'))
    .concat(scanDir(path.join(rootDir, 'packages/core/src/astrology-rules')))
    .concat(scanDir(path.join(rootDir, 'packages/core/src/prayer-catalog')));

  for (const file of coreFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const importLines = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
    for (const imp of importLines) {
      if (
        imp.includes('@/components') ||
        imp.includes('@/styles') ||
        imp.includes('@lich-viet/app-backend') ||
        imp.includes('@omce')
      ) {
        violations.push({
          file: path.relative(rootDir, file),
          imported: imp,
          reason: 'Core domain package must not import from UI, Backend layers or legacy @omce scope',
        });
      }
    }
  }

  return violations;
}

const violations = checkBoundaries();
if (violations.length > 0) {
  console.error(`❌ Fitness Boundary Violations Detected (${violations.length}):`);
  for (const v of violations) {
    console.error(` - [${v.file}] ${v.imported} -> ${v.reason}`);
  }
  process.exit(1);
} else {
  console.log('✅ All Architectural Fitness Boundary checks passed cleanly with zero violations.');
}
