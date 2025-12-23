// tests/util/resolveDataset.js
const path = require("path");
const fs = require("fs");

function resolveDataset(name) {
  const candidates = [
    // Running tests from project3/ (your case)
    path.join(process.cwd(), "..", "provided_data_sets", `${name}.json`),

    // Running tests from repo root
    path.join(process.cwd(), "provided_data_sets", `${name}.json`),

    // Fallbacks (harmless)
    path.join(__dirname, "..", "provided_data_sets", `${name}.json`),
    path.join(__dirname, `${name}.json`)
  ];

  const hit = candidates.find((p) => fs.existsSync(p));
  if (!hit) {
    throw new Error(
      `Dataset ${name}.json not found in:\n${candidates.join("\n")}`
    );
  }
  return require(hit);
}

module.exports = { resolveDataset };
