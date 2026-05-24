const fs = require('node:fs');
const path = require('node:path');

const assetsDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public');

if (!fs.existsSync(assetsDir)) {
  console.warn(`Android assets directory not found at ${assetsDir}; skipping cleanup.`);
  process.exit(0);
}

let removedCount = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.name.endsWith('.gz') || entry.name.endsWith('.br')) {
      fs.unlinkSync(fullPath);
      removedCount += 1;
    }
  }
}

walk(assetsDir);

console.log(`Removed ${removedCount} compressed Android asset(s).`);
