// tests/railway_bestJourneys.test.js
//
// High-coverage tests for railway_bestJourneys.js without modifying its source.
// We mock fs so the Network constructor always loads a controlled dataset,
// then start the real server and hit it through HTTP to exercise all branches.

const http = require("http");
const path = require("path");

jest.setTimeout(15000);

// Dataset designed to trigger all distance fallback branches.
let sampleData = {
  routes: [
    {
      name: "Red",
      stops: [
        { stationID: 1, stationName: "A", distanceToNext: 5 },
        { stationID: 2, stationName: "B", distanceToNext: 7 },
        { stationID: 3, stationName: "Xfer", distanceToPrev: 7 },
      ],
    },
    {
      name: "Blue",
      stops: [
        { stationID: 3, stationName: "Xfer", distanceToNext: 4 },
        { stationID: 4, stationName: "D", distanceToPrev: 4 },
      ],
    },
    {
      name: "ZeroLine",
      stops: [
        { stationID: 10, stationName: "Zero1" },
        { stationID: 11, stationName: "Zero2" },
      ],
    },
  ],
};

function httpGet(routePath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3005,
        path: routePath,
        method: "GET",
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

describe("railway_bestJourneys web service", () => {
  let logSpy, errSpy;

  beforeAll(() => {
    jest.isolateModules(() => {
      logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      jest.doMock("fs", () => ({
        readFileSync: jest.fn(() => JSON.stringify(sampleData)),
      }));

      require(path.join(process.cwd(), "railway_bestJourneys.js"));
    });
  });

  afterAll(() => {
    logSpy && logSpy.mockRestore();
    errSpy && errSpy.mockRestore();
  });

  test("A → D request exercises Network + computeBestJourneys", async () => {
    const res = await httpGet(
      "/getBestJourneys?dataFile=any.json&origin=A&dest=D&maxResults=5"
    );

    expect(res.status).toBe(200);
    const json = JSON.parse(res.body);

    expect(Array.isArray(json.journeys)).toBe(true);
    expect(json.journeys.length).toBeGreaterThan(0);

    const report = json.journeys[0].report;
    expect(report).toContain("Journey Summary");
    expect(report).toContain("Total distance:");
    expect(report).toContain("Changes:");
    expect(report).toContain("Passing though:");
  });

  test("ZeroLine path exercises 0-distance branch", async () => {
    const res = await httpGet(
      "/getBestJourneys?dataFile=any.json&origin=Zero1&dest=Zero2&maxResults=1"
    );

    expect(res.status).toBe(200);
    const json = JSON.parse(res.body);

    expect(Array.isArray(json.journeys)).toBe(true);
  });

  test("unknown station triggers notFound path", async () => {
    const res = await httpGet(
      "/getBestJourneys?dataFile=any.json&origin=Unknown&dest=D&maxResults=3"
    );

    expect(res.status).toBe(200);
    const json = JSON.parse(res.body);

    expect(json.journeys.length).toBe(0);
    expect(json.notFound).toBe(true);
  });
});
