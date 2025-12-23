// client_bestJourneys.test.js
// Tests for client_bestJourneys.js to drive coverage of all logic branches
// (displayJourneys, resolveDataFile, getBestJourneys, main).

const path = require("path");

// Mock fs and axios; we use virtual axios so no real dependency is needed.
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

jest.mock(
  "axios",
  () => ({
    get: jest.fn(),
  }),
  { virtual: true }
);

const fs = require("fs");
const axios = require("axios");

// Reload module helper
const loadModule = () =>
  require(path.join(__dirname, "client_bestJourneys.js"));

describe("client_bestJourneys.js", () => {
  let mod;

  beforeEach(() => {
    jest.clearAllMocks();
    mod = loadModule();
  });

  describe("displayJourneys", () => {
    test("handles notFoundMessage branch", () => {
      const out = mod.displayJourneys([], true);
      expect(out).toContain(
        "One or more station cannot be found on this network"
      );
      expect(out).toContain("Journeys found: 0");
      expect(out.startsWith("\n")).toBe(true); // leading blank line
    });

    test("prints multiple journeys with numbers and reports", () => {
      const journeys = [
        { report: "Journey 1 report" },
        { report: "Journey 2 report" },
      ];
      const out = mod.displayJourneys(journeys, false);

      expect(out).toContain("Journeys found: 2");
      expect(out).toContain("1:");
      expect(out).toContain("2:");
      expect(out).toContain("Journey 1 report");
      expect(out).toContain("Journey 2 report");
      // Should not end with extra blank lines (trimEnd used)
      expect(out.endsWith("\n")).toBe(false);
    });
  });

  describe("resolveDataFile", () => {
    test("returns absolute path directly when exists", () => {
      fs.existsSync.mockReturnValueOnce(true);
      const abs = path.resolve("/tmp/data.json");
      const result = mod.resolveDataFile(abs);

      expect(result).toBe(abs);
      expect(fs.existsSync).toHaveBeenCalledWith(abs);
    });

    test("bare filename: picks first existing candidate", () => {
      const fileArg = "dataset.json";

      // First candidate: cwd/dataset.json -> no
      // Second: ../provided_data_sets/dataset.json -> yes
      // Rest not called
      fs.existsSync
        .mockReturnValueOnce(false) // cwd
        .mockReturnValueOnce(true); // ../provided_data_sets

      const result = mod.resolveDataFile(fileArg);

      // Should resolve to an absolute path ending in dataset.json
      expect(path.basename(result)).toBe("dataset.json");
      expect(result).toContain("provided_data_sets");
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
    });

    test("non-bare path: tries the candidate list", () => {
      const fileArg = "some/subdir/dataset.json";

      // fileArg -> false
      // cwd/fileArg -> true
      fs.existsSync
        .mockReturnValueOnce(false) // fileArg
        .mockReturnValueOnce(true); // cwd/fileArg

      const result = mod.resolveDataFile(fileArg);
      expect(path.basename(result)).toBe("dataset.json");
      expect(result).toContain("some");
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
    });

    test("fallback: no path exists, returns cwd-relative path", () => {
      const fileArg = "missing.json";
      fs.existsSync.mockReturnValue(false);

      const result = mod.resolveDataFile(fileArg);
      expect(path.isAbsolute(result)).toBe(true);
      expect(result.endsWith(path.join(process.cwd(), fileArg))).toBe(true);
    });
  });

  describe("getBestJourneys", () => {
    test("success path: logs formatted journeys", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      fs.existsSync.mockReturnValue(true); // so resolveDataFile returns the first candidate
      axios.get.mockResolvedValue({
        data: {
          notFound: false,
          journeys: [{ report: "Test Journey Report" }],
        },
      });

      await mod.getBestJourneys("data.json", "Origin", "Dest", 3);

      expect(axios.get).toHaveBeenCalledTimes(1);
      const [url, opts] = axios.get.mock.calls[0];
      expect(url).toBe("http://localhost:3005/getBestJourneys");
      expect(opts.params).toMatchObject({
        dataFile: expect.any(String),
        origin: "Origin",
        dest: "Dest",
        maxResults: 3,
      });

      expect(logSpy).toHaveBeenCalled();
      const printed = logSpy.mock.calls[0][0];
      expect(printed).toContain("Journeys found: 1");
      expect(printed).toContain("Test Journey Report");

      logSpy.mockRestore();
    });

    test("error path: logs Client error", async () => {
      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      fs.existsSync.mockReturnValue(true);

      axios.get.mockRejectedValue(new Error("network down"));

      await mod.getBestJourneys("data.json", "Origin", "Dest", 3);

      expect(errSpy).toHaveBeenCalled();
      const msg = errSpy.mock.calls[0][0];
      expect(String(msg)).toContain("Client error:");

      errSpy.mockRestore();
    });
  });

  describe("main", () => {
    test("calls through to getBestJourneys logic and issues axios request", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      fs.existsSync.mockReturnValue(true);
      axios.get.mockResolvedValue({
        data: {
          notFound: false,
          journeys: [],
        },
      });

      await mod.main("file.json", "A", "B", 5);

      // We don't spy on mod.getBestJourneys, because main closes over the inner function.
      // Instead, we verify the effect: axios was called with the right params.
      expect(axios.get).toHaveBeenCalledTimes(1);
      const [url, opts] = axios.get.mock.calls[0];
      expect(url).toBe("http://localhost:3005/getBestJourneys");
      expect(opts.params).toMatchObject({
        dataFile: expect.any(String),
        origin: "A",
        dest: "B",
        maxResults: 5,
      });

      logSpy.mockRestore();
    });
  });

  // New tests to exercise the CLI entrypoint block (require.main === module)
  // and the args.length !== 4 branch.
  describe("CLI entrypoint (require.main === module)", () => {
    test("prints usage and exits when arg count is wrong", () => {
      const originalArgv = process.argv;
      const originalMain = require.main;

      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

      // Simulate running from command line with too few args (args.length !== 4)
      process.argv = ["node", "client_bestJourneys.js", "only", "three"];
      require.main = { filename: path.join(__dirname, "client_bestJourneys.js") };

      jest.resetModules();
      require(path.join(__dirname, "client_bestJourneys.js"));

      expect(errSpy).toHaveBeenCalled();
      const msg = errSpy.mock.calls[0][0];
      expect(String(msg)).toContain(
        "Usage: node client_getBestJourneys.js <data set> <origin> <destination>"
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      // restore globals
      process.argv = originalArgv;
      require.main = originalMain;
      errSpy.mockRestore();
      exitSpy.mockRestore();
    });

    test("with 4 args calls through without exiting", () => {
      const originalArgv = process.argv;
      const originalMain = require.main;

      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

      fs.existsSync.mockReturnValue(true);
      axios.get.mockResolvedValue({
        data: {
          notFound: false,
          journeys: [],
        },
      });

      // 4 args after slice(2): data.json Origin Dest 3
      process.argv = [
        "node",
        "client_bestJourneys.js",
        "data.json",
        "Origin",
        "Dest",
        "3",
      ];
      require.main = { filename: path.join(__dirname, "client_bestJourneys.js") };

      jest.resetModules();
      require(path.join(__dirname, "client_bestJourneys.js"));

      // CLI path should have triggered a request but not exited with error
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(exitSpy).not.toHaveBeenCalled();

      process.argv = originalArgv;
      require.main = originalMain;
      logSpy.mockRestore();
      errSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });
});
