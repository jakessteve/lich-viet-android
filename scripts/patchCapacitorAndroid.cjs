const fs = require('fs');
const path = require('path');

const capBuildGradle = path.join(__dirname, '..', 'android', 'app', 'capacitor.build.gradle');

if (fs.existsSync(capBuildGradle)) {
  let content = fs.readFileSync(capBuildGradle, 'utf8');
  if (content.includes('JavaVersion.VERSION_21')) {
    content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
    fs.writeFileSync(capBuildGradle, content, 'utf8');
    console.log('Patched capacitor.build.gradle to use JavaVersion.VERSION_17');
  } else {
    console.log('capacitor.build.gradle already uses compatible Java version');
  }
} else {
  console.log('capacitor.build.gradle not found, skipping patch');
}
