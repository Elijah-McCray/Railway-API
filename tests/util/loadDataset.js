const path = require("path");
const fs = require("fs");

function resolveDataset(name) {
  const candidates = [
    path.join(process.cwd(), "provided_data_sets", `${name}.json`),
    path.join(__dirname, "..", "provided_data_sets", `${name}.json`),
    path.join(process.cwd(), "project3", `${name}.json`),
    path.join(__dirname, "..", "project3", `${name}.json`),
    path.join(process.cwd(), `${name}.json`),
    path.join(__dirname, `${name}.json`)
  ];

  const hit = candidates.find(p => fs.existsSync(p));
  if (!hit) {
    throw new Error(
      `Dataset ${name}.json not found in:\n${candidates.join("\n")}`
    );
  }
  return require(hit);
}

module.exports = { resolveDataset };
