import fs from "node:fs";
import path from "node:path";

import { buildPhase2FixtureBundle } from "../src/fixtures.js";

function stringifyFixtureBundle() {
  return `${JSON.stringify(buildPhase2FixtureBundle(), null, 2)}\n`;
}

const [, , command, filePath] = process.argv;

if (command === "--check") {
  if (!filePath) {
    throw new Error("Expected a file path after --check");
  }

  const expected = stringifyFixtureBundle();
  const current = fs.readFileSync(filePath, "utf8");

  if (current !== expected) {
    throw new Error(`Fixture file is out of date: ${filePath}`);
  }

  process.stdout.write(`Fixtures match ${filePath}\n`);
  process.exit(0);
}

const outputPath =
  filePath ??
  path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../fixtures/phase2-bootstrap.json"
  );

fs.writeFileSync(outputPath, stringifyFixtureBundle(), "utf8");
process.stdout.write(`Wrote ${outputPath}\n`);
