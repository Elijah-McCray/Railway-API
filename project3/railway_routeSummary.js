/**
* @author Elijah McCray and Danny Foster
* @date September 26 2025
* CS 253 Project 1
* This is the server for railway_routeSummary.js. It loads a dataset and provides
* endpoints to display route summaries and to sort them by name or length.
*/

const fs = require("fs");
const express = require("express");

const app = express();
const port = 30546;

// Global railway object
let railwayObject;

/**
* Load dataset from file
*/
app.get("/fileName", async (request, response) => {
    try {
        //get the file name from the client
        const {fileName} = request.query;

        //get full file path
        let path = `../provided_data_sets/${fileName}`;

        //use the file name to get the file
        let file = fs.readFileSync(path, "utf-8");

        //use the file to make a JS object
        railwayObject = JSON.parse(file);

        //return the object back to the client
        response.json(railwayObject);
} catch (error) {
  console.error(`error fetching file name: ${error.message}`);
  // Tell the client it was a parse error so it can exit cleanly.
  return response.status(400).json({ error: 'parse_error' });
}

});

/**
* Build a summary string for each route
*/
function buildRouteSummary() {
    if (!railwayObject || !railwayObject.routes) return "No routes loaded";

    const lines = [];
    // Header (nice to have for readability)
    lines.push("Routes Summary");
    lines.push("==============");

    for (let i = 0; i < railwayObject.routes.length; i++) {
        const route = railwayObject.routes[i];
        const name = route.name || "";
        const color = route.color || "";
        const stops = Array.isArray(route.stops) ? route.stops : [];

        if (stops.length === 0) continue;

        const first = (stops[0] && stops[0].stationName) ? stops[0].stationName : "";
        const last  = (stops[stops.length - 1] && stops[stops.length - 1].stationName)
                      ? stops[stops.length - 1].stationName : "";

        // compute total distance
        let distance = 0;
        for (let j = 0; j < stops.length; j++) {
            const d = stops[j].distanceToNext;
            if (typeof d === "number" && !Number.isNaN(d)){
                distance += d;
            }
        }
        lines.push(`${name} (${color}): ${first} -> ${last}, ${distance} miles`);
    }

    return lines.join("\n"); 
}

/**
* GET /routeSummary
*/
app.get("/routeSummary", async (request, response) => {
    try {
        if (!railwayObject || !railwayObject.routes) {
            return response.type("text").send("No routes loaded\n");
        }
        const text = buildRouteSummary();
        response.type("text").send(text + "\n");
    } catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* GET /sortRoutesByName?asc=true|false
*/
app.get("/sortRoutesByName", async (request, response) => {
    try {
        if (!railwayObject || !Array.isArray(railwayObject.routes)) {
            return response.status(400).json({ error: "No routes loaded" });
        }
        const asc = request.query.asc === "true";
        railwayObject.routes.sort(function (a, b) {
            const an = (a && a.name) ? String(a.name) : "";
            const bn = (b && b.name) ? String(b.name) : "";
            if (an < bn) return asc ? -1 : 1;
            if (an > bn) return asc ? 1 : -1;
            return 0;
        });
        response.json("OK");
    } catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* GET /sortRoutesByLength
*/
app.get("/sortRoutesByLength", async (request, response) => { 
    try {
        if (!railwayObject || !Array.isArray(railwayObject.routes)) {
            return response.status(400).json({ error: "No routes loaded" });
        }

        // respect ?asc=true|false ; default to true
        const asc = request.query.asc === "false" ? false : true;

        function totalDistance(route) {
            if (!route || !Array.isArray(route.stops)) return 0;
            let dist = 0;
            for (let i = 0; i < route.stops.length; i++) {
                const d = route.stops[i].distanceToNext;
                if (typeof d === "number" && !Number.isNaN(d)){
                    dist += d;
                }

            }
            return dist;
        }

        railwayObject.routes.sort(function(a, b) {
            const da = totalDistance(a);
            const db = totalDistance(b);
            return asc ? (da - db) : (db - da);
        });

        response.json("OK");
    } catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* 
*/
app.get("/addDistance", async (request, response) => { 
    try {
        if (!railwayObject || !Array.isArray(railwayObject.routes)) {
            return response.status(400).json({ error: "No routes loaded" });
        }

        for (let i = 0; i < railwayObject.routes.length; i++) {
            const route = railwayObject.routes[i];
            let dist = 0;
            if (Array.isArray(route.stops)) {
                for (let j = 0; j < route.stops.length; j++) {
                    const d = route.stops[j].distanceToNext;
                    if (typeof d === "number" && !Number.isNaN(d)) dist += d;
                }
            }
            route.totalDistance = dist;
        }

        response.json("OK");
    } catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* Quit server
*/
app.get("/quit", async (request, response) => {
    try {
        response.json("Shutting down server");
        process.exit(0);
    } catch (error) {
        console.error(`error fetching file name: ${error.message}`);
    }
});

/**
* Listen
*/
app.listen(port, () => { // Shows what port the server is listening on 
    console.log(`RouteSummary server listening on port ${port}`);
});
