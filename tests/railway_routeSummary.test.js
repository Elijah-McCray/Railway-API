// tests/railway_routeSummary.test.js
const { resolveDataset } = require("./util/resolveDataset");

describe("routeSummary dataset access only", () => {
  test("uk dataset loads", () => {
    const uk = resolveDataset("uk");
    expect(uk && typeof uk).toBe("object");
  });

  test("notional dataset loads", () => {
    const n = resolveDataset("notional");
    expect(n && typeof n).toBe("object");
  });
});
