// tests/railway_bestJourneys.test.js
const { resolveDataset } = require("./util/resolveDataset");

describe("bestJourneys datasets only (avoid importing server)", () => {
  test("uk dataset present", () => {
    const uk = resolveDataset("uk");
    expect(uk && typeof uk).toBe("object");
  });

  test("simpleton dataset present", () => {
    const sim = resolveDataset("simpleton");
    expect(sim && typeof sim).toBe("object");
  });
});
