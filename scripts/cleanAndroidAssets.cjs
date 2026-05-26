const fs = require('node:fs');
const path = require('node:path');

const assetsDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public');

if (!fs.existsSync(assetsDir)) {
  console.warn(`Android assets directory not found at ${assetsDir}; skipping cleanup.`);
  process.exit(0);
}

let removedCount = 0;
const serviceWorkerFiles = new Set(['registerSW.js', 'sw.js', 'sw.js.map']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (
      entry.name.endsWith('.gz') ||
      entry.name.endsWith('.br') ||
      entry.name.startsWith('workbox-') ||
      serviceWorkerFiles.has(entry.name)
    ) {
      fs.unlinkSync(fullPath);
      removedCount += 1;
    }
  }
}

walk(assetsDir);

const indexPath = path.join(assetsDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const before = fs.readFileSync(indexPath, 'utf8');
  const after = before
    .replace(/<script id="vite-plugin-pwa:register-sw" src="\/registerSW\.js"><\/script>/g, '')
    .replace(/<link rel="manifest" href="\/manifest\.webmanifest">/g, '');

  if (after !== before) {
    fs.writeFileSync(indexPath, after, 'utf8');
  }
}

console.log(`Removed ${removedCount} compressed/cache Android asset(s).`);
