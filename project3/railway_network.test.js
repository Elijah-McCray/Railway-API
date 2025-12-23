/**
 * Tests for railway_network.js.
 * We fully mock express and fs, load the server in isolation,
 * and call each route directly to drive coverage.
 */

const path = require("path");
const modPath = path.join(process.cwd(), "railway_network.js");
const flush = () => new Promise((r) => setImmediate(r));

const SAMPLE_NET = {
  networkName: "Test Net",
  routes: [
    {
      name: "Alpha",
      color: "Red",
      stops: [
        { stationName: "A", distanceToNext: 10 },
        { stationName: "B", distanceToNext: 20 },
        { stationName: "C", distanceToNext: null },
      ],
    },
    {
      name: "Beta",
      color: "Blue",
      stops: [
        { stationName: "B", distanceToNext: 15 },
        { stationName: "D", distanceToNext: null },
      ],
    },
  ],
};

const SINGLE_ROUTE_NET = {
  networkName: "Single Net",
  routes: [
    {
      name: "Solo",
      color: "Green",
      stops: [{ stationName: "Only", distanceToNext: null }],
    },
  ],
};

// Load the server with mocked express/fs and expose the registered routes.
function boot({ fsThrows = false, netData = SAMPLE_NET } = {}) {
  let api = {};

  jest.isolateModules(() => {
    jest.doMock(
      "express",
      () => {
        const mockRoutes = {};
        const mockApp = {
          get: jest.fn((p, h) => (mockRoutes[p] = h)),
          listen: jest.fn((p, cb) => cb && cb()),
        };
        const express = () => mockApp;
        express.__getRoutes = () => mockRoutes;
        express.__getApp = () => mockApp;
        return express;
      },
      { virtual: true }
    );

    jest.doMock(
      "fs",
      () => ({
        readFileSync: jest.fn(() => {
          if (fsThrows) throw new Error("bad json");
          return JSON.stringify(netData);
        }),
      }),
      { virtual: true }
    );

    require(modPath);

    const express = require("express");
    api.routes = express.__getRoutes();
    api.app = express.__getApp();
    api.fs = require("fs");
  });

  return api;
}

// Small mock response object used for all endpoints.
function makeRes() {
  const res = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload) => {
    res.body = payload;
    return res;
  });
  return res;
}

// Helper to call a registered route by its path.
async function callRoute(routes, routePath, { params = {}, query = {} } = {}) {
  const handler = routes[routePath];
  if (!handler) throw new Error(`Route not registered: ${routePath}`);

  const req = { params, query };
  const res = makeRes();
  await handler(req, res);
  return res;
}

describe("railway_network.js coverage", () => {
  let logSpy, errSpy;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  test("server registers all routes", async () => {
    const { routes, app } = boot();

    expect(typeof routes["/fileName/:fileName"]).toBe("function");
    expect(typeof routes["/getNetworkName"]).toBe("function");
    expect(typeof routes["/routes"]).toBe("function");
    expect(typeof routes["/routeNames"]).toBe("function");
    expect(typeof routes["/routeNamesToString"]).toBe("function");
    expect(typeof routes["/totalStations"]).toBe("function");
    expect(typeof routes["/findLongestRoute"]).toBe("function");
    expect(typeof routes["/quit"]).toBe("function");

    expect(app.listen).toHaveBeenCalled();
    await flush();
  });

  test("loaded network allows all endpoints to return valid data", async () => {
    const { routes } = boot();

    let r = await callRoute(routes, "/fileName/:fileName", {
      params: { fileName: "uk.json" },
    });
    expect(r.statusCode).toBe(200);

    r = await callRoute(routes, "/getNetworkName");
    expect(r.body).toBe("Test Net");

    r = await callRoute(routes, "/routes");
    expect(String(r.body)).toMatch(/There (is|are) \d+ route/);

    r = await callRoute(routes, "/routeNames");
    expect(r.body).toEqual(["Alpha", "Beta"]);

    r = await callRoute(routes, "/routeNamesToString");
    expect(r.body).toContain("Alpha");

    r = await callRoute(routes, "/totalStations");
    expect(String(r.body)).toMatch(/There are \d+ stations/);

    r = await callRoute(routes, "/findLongestRoute");
    expect(String(r.body)).toContain("Longest route is: ROUTE:");
  });

  test("file parse error returns 501", async () => {
    const { routes } = boot({ fsThrows: true });

    const r = await callRoute(routes, "/fileName/:fileName", {
      params: { fileName: "uk.json" },
    });

    expect(r.statusCode).toBe(501);
    expect(r.body).toEqual({ message: "Not able to parse the input file" });
  });

  test("all endpoints fail safely if no file has been loaded", async () => {
    const { routes } = boot();

    expect((await callRoute(routes, "/getNetworkName")).statusCode).toBe(500);
    expect((await callRoute(routes, "/routes")).statusCode).toBe(500);
    expect((await callRoute(routes, "/routeNames")).statusCode).toBe(500);
    expect((await callRoute(routes, "/routeNamesToString")).statusCode).toBe(500);
    expect((await callRoute(routes, "/totalStations")).statusCode).toBe(500);
    expect((await callRoute(routes, "/findLongestRoute")).statusCode).toBe(500);
  });

  test("proper singular grammar when only one route exists", async () => {
    const { routes } = boot({ netData: SINGLE_ROUTE_NET });

    await callRoute(routes, "/fileName/:fileName", {
      params: { fileName: "single.json" },
    });

    const r = await callRoute(routes, "/routes");
    expect(r.statusCode).toBe(200);
    expect(r.body).toContain("There is 1 route");
  });

  test("routeNamesToString fails without loading file", async () => {
    const { routes } = boot();
    const r = await callRoute(routes, "/routeNamesToString");
    expect(r.statusCode).toBe(500);
    expect(r.body).toEqual({ error: "Internal Server Error" });
  });

  test("single-route network returns correct string values", async () => {
    const { routes } = boot({ netData: SINGLE_ROUTE_NET });

    await callRoute(routes, "/fileName/:fileName", {
      params: { fileName: "single.json" },
    });

    let r = await callRoute(routes, "/routeNamesToString");
    expect(r.body).toBe("Solo");

    r = await callRoute(routes, "/totalStations");
    expect(r.body).toBe("There are 1 stations in this network");
  });

  test("findLongestRoute returns 500 without loaded file", async () => {
    const { routes } = boot();
    const r = await callRoute(routes, "/findLongestRoute");
    expect(r.statusCode).toBe(500);
    expect(r.body).toEqual({ error: "Internal Server Errror" });
  });

  test("/quit triggers exit and returns shutdown message", async () => {
    const { routes } = boot();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    const r = await callRoute(routes, "/quit");

    expect(r.statusCode).toBe(200);
    expect(r.body).toBe("Shutting down server");
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  test("/quit returns 500 if exit throws", async () => {
    const { routes } = boot();
    const exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => {
        throw new Error("exit failed");
      });

    const r = await callRoute(routes, "/quit");

    expect(r.statusCode).toBe(500);
    expect(r.body).toEqual({ error: "Internal Server Error" });

    exitSpy.mockRestore();
  });
});
