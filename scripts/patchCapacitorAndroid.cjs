const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '..', 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle');
const appFilePath = path.join(__dirname, '..', 'android', 'app', 'capacitor.build.gradle');

let patchedCount = 0;

for (const targetPath of [filePath, appFilePath]) {
  if (!fs.existsSync(targetPath)) {
    console.warn(`Capacitor Android build file not found at ${targetPath}; skipping patch.`);
    continue;
  }

  const before = fs.readFileSync(targetPath, 'utf8');
  const after = before.replaceAll('JavaVersion.VERSION_21', 'JavaVersion.VERSION_17');

  if (after !== before) {
    fs.writeFileSync(targetPath, after, 'utf8');
    patchedCount += 1;
  }
}

if (patchedCount > 0) {
  console.log(`Patched ${patchedCount} Capacitor Android build file(s) to target Java 17.`);
} else {
  console.log('No Capacitor Android Java version patch needed.');
}
