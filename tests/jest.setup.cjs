// project3/jest.setup.cjs
const path = require("path");

// Make tests that do require(path.join(process.cwd(), "whatever.js"))
// resolve to project3/*.js
process.chdir(path.join(__dirname));

