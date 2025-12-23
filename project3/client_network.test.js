/**
 * Coverage-focused tests for project3/client_network.js
 * - Keeps success and getNetworkName error tests
 * - Adds two more: ".json arg" branch and readNetwork() error branch
 * - No changes to project3/client_network.js
 */

const path = require("path");

// Virtual axios so Jest won't resolve a real module
jest.mock("axios", () => ({ get: jest.fn() }), { virtual: true });

// Updated to load client_network.js from the same folder as this test file
const modPath = path.join(__dirname, "client_network.js");
const flush = () => new Promise((r) => setImmediate(r));

describe("client_network.js coverage", () => {
  const OLD_ARGV = process.argv;
  let exitSpy, logSpy, errSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.argv = ["node", "client_network.js", "uk"]; // default; individual tests override if needed
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = OLD_ARGV;
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  test("happy path: script runs and calls endpoints then /quit", async () => {
    const axios = jest.requireMock("axios");
    axios.get.mockResolvedValue({ data: null });

    require(modPath);
    await flush();

    const urls = axios.get.mock.calls.map((c) => c[0]);
    const hitFile = urls.some((u) => /\/fileName\/uk(\.json)?$/.test(u));
    expect(hitFile).toBe(true);
    expect(urls.some((u) => u.endsWith("/getNetworkName"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/routes"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/routeNames"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/routeNamesToString"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/totalStations"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/findLongestRoute"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/quit"))).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  test("error path: getNetworkName fails ? logs, /quit called, process.exit(0)", async () => {
    const axios = jest.requireMock("axios");

    // 1) /fileName/... resolves
    axios.get
      .mockImplementationOnce(async (url) => {
        if (!/\/fileName\/uk(\.json)?$/.test(url)) throw new Error("unexpected first call");
        return { data: null };
      })
      // 2) /getNetworkName rejects to trigger the catch
      .mockImplementationOnce(async (url) => {
        if (!url.endsWith("/getNetworkName")) throw new Error("expected getNetworkName as second call");
        const err = new Error("boom");
        err.code = "EFAIL";
        throw err;
      })
      // Later calls resolve (if any)
      .mockResolvedValue({ data: null });

    require(modPath);
    await flush();

    expect(errSpy).toHaveBeenCalled(); // friendly parse error
    const hitQuit = axios.get.mock.calls.some((c) => String(c[0]).endsWith("/quit"));
    expect(hitQuit).toBe(true);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  // NEW: cover the other branch of ".json" check (arg already includes .json)
  test("argument already ends with .json ? no suffix added", async () => {
    const axios = jest.requireMock("axios");
    axios.get.mockResolvedValue({ data: null });

    process.argv = ["node", "client_network.js", "uk.json"];
    require(modPath);
    await flush();

    const urls = axios.get.mock.calls.map((c) => c[0]);
    // Must be exactly uk.json (not duplicated)
    expect(urls.some((u) => /\/fileName\/uk\.json$/.test(u))).toBe(true);
    expect(urls.some((u) => u.endsWith("/quit"))).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  // NEW: hit readNetwork() catch branch by failing the first /fileName call
  test("readNetwork fail: /fileName rejects ? logs error but continues", async () => {
    const axios = jest.requireMock("axios");

    // 1) Fail /fileName to trigger readNetwork catch
    axios.get
      .mockImplementationOnce(async (url) => {
        if (!/\/fileName\/uk(\.json)?$/.test(url)) throw new Error("unexpected first call");
        throw new Error("cannot read file");
      })
      // Subsequent calls succeed so the script keeps going
      .mockResolvedValue({ data: null });

    require(modPath);
    await flush();

    expect(errSpy).toHaveBeenCalled(); // readNetwork catch
    // Still proceeds to other endpoints and quits
    const urls = axios.get.mock.calls.map((c) => c[0]);
    expect(urls.some((u) => u.endsWith("/getNetworkName"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/quit"))).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled(); // readNetwork catch doesn't exit
  });
});
