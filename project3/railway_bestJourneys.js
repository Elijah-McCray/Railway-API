/**
 * @author Ty McConnaughey and Elijah McCray
 * @date October 31, 2025
 * CS 253 Project 2 — Railway Best Journeys 
 *
 * This program runs a small web service that finds the best train journeys
 * between two stations based on data from a JSON file of routes and stops.
 * It builds a network of stations and connections, searches every possible
 * path from the starting station to the destination, and ranks the results
 * by the fewest route changes first and the shortest total distance second.
 *
 * The Express server provides one endpoint, `/getBestJourneys`. It takes
 * a dataset file, origin, destination, and max results as inputs, runs the
 * search, and returns neatly formatted journey summaries in JSON form.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3005;

/**
 * Represents a single station (graph node) and all its connected links.
 * Each station object stores its name, ID, and a list of Link objects that
 * describe which other stations it connects to.
 * @param {number} stationID - Unique numeric ID for the station.
 * @param {string} stationName - The readable name of the station.
 */
function Station(stationID, stationName) {
  this.stationID = stationID;
  this.stationName = stationName;
  this.links = [];

  /**
   * Adds a connection from this station to another.
   * This essentially adds an edge to the graph.
   * @param {Link} link - A Link object pointing to another station.
   */
  this.addLink = function (link) {
    this.links.push(link);
  };
}

/**
 * Represents a connection (edge) between two stations.
 * Each link knows which route it belongs to, what station it connects to,
 * and the distance to that station.
 * @param {string} routeName - The name of the route (line name).
 * @param {Station} station - The destination station this link points to.
 * @param {number} distance - The distance between the two stations.
 */
function Link(routeName, station, distance) {
  this.routeName = routeName;
  this.station = station;
  this.distance = distance;
  this.linkName = station.stationName;
}

/**
 * Builds the entire railway network from a JSON dataset.
 * Internally, this creates Station and Link objects for every route and
 * ensures that connections are bidirectional (both directions are linked).
 * @param {string} dataFilePath - The path to the JSON dataset file.
 */
function Network(dataFilePath) {
  const raw = fs.readFileSync(dataFilePath, "utf8");
  const data = JSON.parse(raw);
  this.stations = [];

  /** Finds a station by name, returning null if it doesn’t exist. */
  this.findStation = (name) =>
    this.stations.find((s) => s.stationName === name) || null;

  /** Either retrieves an existing station or creates a new one if missing. */
  this.getOrCreateStation = (id, name) => {
    let station = this.findStation(name);
    if (!station) {
      station = new Station(id, name);
      this.stations.push(station);
    }
    return station;
  };

  // Loop through every route and connect all adjacent stations.
  // Each station along the route gets links to its neighbors.
  for (const route of data.routes) {
    const routeName = route.name;
    const stops = route.stops;

    for (let i = 0; i < stops.length; i++) {
      const curStop = stops[i];
      const curStation = this.getOrCreateStation(
        curStop.stationID,
        curStop.stationName
      );

      // Forward link (current station → next station)
      if (i + 1 < stops.length) {
        const nextStop = stops[i + 1];
        const nextStation = this.getOrCreateStation(
          nextStop.stationID,
          nextStop.stationName
        );
        const d1 = nextStop.distanceToPrev ?? curStop.distanceToNext ?? 0;
        curStation.addLink(new Link(routeName, nextStation, d1));
      }

      // Backward link (current station → previous station)
      if (i > 0) {
        const prevStop = stops[i - 1];
        const prevStation = this.getOrCreateStation(
          prevStop.stationID,
          prevStop.stationName
        );
        const d2 = curStop.distanceToPrev ?? prevStop.distanceToNext ?? 0;
        curStation.addLink(new Link(routeName, prevStation, d2));
      }
    }
  }

  /** Retrieves a station object by name. */
  this.getStationByName = (name) => this.findStation(name);
}

/**
 * Represents a traveler’s journey along connected stations.
 * Tracks total distance, route changes, and visited stations.
 * Used as a temporary container while recursively exploring paths.
 */
function Journey() {
  this.stations = [];
  this.distance = 0;
  this.text = "";
  this.success = false;
  this.changes = 0;
  this.currentRoute = null;

  /** Creates a deep copy of this journey so recursive branches don’t overlap. */
  this.copy = function () {
    const journey = new Journey();
    journey.stations = [...this.stations];
    journey.distance = this.distance;
    journey.text = this.text;
    journey.success = this.success;
    journey.changes = this.changes;
    journey.currentRoute = this.currentRoute;
    return journey;
  };

  /** Adds distance between stations to the total. */
  this.incDistance = function (amt) {
    if (typeof amt === "number" && amt > 0) this.distance += amt;
  };

  /**
   * Returns a human-readable journey summary, showing
   * the starting route, transfer points, total distance,
   * and a wrapped list of stations the traveler passes through.
   * @returns {string} A formatted text report of the journey.
   */
  this.report = function () {
    const lines = [];
    lines.push("Journey Summary");
    lines.push("==============");
    lines.push(this.text.trim());
    lines.push(`Total distance: ${this.distance}`);
    lines.push(`Changes: ${this.changes}`);

    // Format the station list so that long lines wrap neatly.
    const wrapWidth = 80;
    const allStations = `Passing though: ${this.stations.join(", ")}`;
    const parts = allStations.split(", ");
    let current = "";
    const wrapped = [];

    for (const part of parts) {
      if ((current + part).length + 2 > wrapWidth) {
        wrapped.push(current.trimEnd() + ",");
        current = part;
      } else {
        current += (current ? ", " : "") + part;
      }
    }
    wrapped.push(current);
    lines.push(wrapped.join("\n"));

    return lines.join("\n");
  };
}

/**
 * Recursively explores the network to find all possible journeys
 * from an origin to a destination. It avoids cycles by skipping
 * stations that have already been visited in the current path.
 * @param {Network} network - The full station graph.
 * @param {Station} origin - The current station being explored.
 * @param {Station} destination - The destination station.
 * @param {Journey} curJourney - The current partial journey path.
 * @param {Journey[]} journeysFound - A collection of completed journeys.
 */
function getJourneys(network, origin, destination, curJourney, journeysFound) {
  curJourney.stations.push(origin.stationName);

  // If we’ve reached the destination, finalize the journey text.
  if (origin.stationName === destination.stationName) {
    if (!curJourney.text.startsWith("Embark")) {
      curJourney.text = `Embark at ${curJourney.stations[0]} on ${curJourney.currentRoute || ""}`;
    }
    curJourney.text += `\nArrive at ${destination.stationName}`;
    curJourney.success = true;
    journeysFound.push(curJourney.copy());
    return;
  }

  // Explore all connected stations (depth-first search).
  for (const link of origin.links) {
    const next = link.station;

    // Prevent infinite loops by skipping already visited stations.
    if (curJourney.stations.includes(next.stationName)) continue;

    const journey2 = curJourney.copy();
    journey2.incDistance(link.distance);

    // If we’re starting, set our initial route.
    if (!journey2.currentRoute) {
      journey2.currentRoute = link.routeName;
      journey2.text = `Embark at ${origin.stationName} on ${link.routeName}`;
    }
    // If we switched lines, record the route change.
    else if (journey2.currentRoute !== link.routeName) {
      journey2.changes += 1;
      journey2.text += `\nAt ${origin.stationName} change to ${link.routeName}`;
      journey2.currentRoute = link.routeName;
    }

    getJourneys(network, next, destination, journey2, journeysFound);
  }
}

/**
 * Finds the best journeys by running a full graph traversal, then
 * ranking all discovered paths by the number of route changes first,
 * and total travel distance second. Returns up to the maxResults limit.
 * @param {Network} network - The built station graph.
 * @param {string} originName - Name of the starting station.
 * @param {string} destName - Name of the destination station.
 * @param {number} maxResults - Maximum number of journeys to return.
 * @returns {Object} Object containing `notFound` flag and `journeys` array.
 */
function computeBestJourneys(network, originName, destName, maxResults) {
  const origin = network.getStationByName(originName);
  const dest = network.getStationByName(destName);
  if (!origin || !dest) return { notFound: true, journeys: [] };

  const found = [];
  getJourneys(network, origin, dest, new Journey(), found);

  found.sort((a, b) => a.changes - b.changes || a.distance - b.distance);
  return {
    notFound: false,
    journeys: found.slice(0, Math.max(1, parseInt(maxResults, 10) || 1)),
  };
}

/**
 * Express endpoint handler for /getBestJourneys.
 * Loads the dataset, validates stations, runs the search, and
 * returns a list of formatted journeys in JSON format.
 */
app.get("/getBestJourneys", (req, res) => {
  try {
    const { dataFile, origin, dest, maxResults } = req.query;

    // Determine absolute file path (handle both relative and absolute inputs)
    const filePath = path.isAbsolute(dataFile)
      ? dataFile
      : path.join(__dirname, dataFile);

    // Build the network graph from the provided JSON dataset
    const network = new Network(filePath);

    // Verify both stations exist before searching
    const originStation = network.getStationByName(origin);
    const destStation = network.getStationByName(dest);
    if (!originStation || !destStation) {
      return res.status(200).send({
        journeys: [],
        notFound: true,
      });
    }

    // Compute journeys and prepare formatted JSON output
    const result = computeBestJourneys(network, origin, dest, maxResults);
    const formattedJourneys = result.journeys.map((journey) => ({
      report: journey.report(),
    }));

    return res.status(200).send({
      journeys: formattedJourneys,
    });
  } catch (e) {
    console.error("SERVER ERROR:", e.message);
  }
});

/**
 * Starts the Express server. Once running, the service listens on
 * localhost:3005 and waits for requests from the client program.
 */
app.listen(PORT, () => {
  console.log(`bestJourneys service listening on port ${PORT}`);
});
