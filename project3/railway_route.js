/**
* @author Elijah McCray and Danny Foster
* @date September 28 2025
* CS 253 Project 1
* This is the railway half of the route system. It is takes a file name from the server, and
* can turn that file name into an actual file loaded into memory. From there, the server
* can use data from the file to return specific information about the route to the server.
*/

const fs = require("fs");
const express = require("express");
const app = express();
const port = 30547;

let railwayObject;

/**
* This endpoint takes the file name as request parameter, and loads the file associated with it
* from the provided_data_sets directory
* @param fileName - The name of the file to load into memeory, .json file extension required.
* @return railwayObject - the file loaded into memory, representing the railway network.
*/
app.get("/fileName/:fileName", async (request, response) => {
    try {
        //get the file name from the client
        const { fileName } = request.params;

        //get full file path
        let path = `../provided_data_sets/${fileName}`;

        //use the file path to get the file
        let file = fs.readFileSync(path, "utf-8");

        //use the file to make a JS object
        railwayObject = JSON.parse(file);

        //return the object back to the client
        response.json(railwayObject);
    }
    catch (error) {
        response.status(500).json({ message: "Not able to parse the input file" });
    }
});

/**
* This endpoint takes the route name, and retrieves an object that has the same name as it.
* @param routeName - A string representing the route you want to return to the client as an object.
* @return selectedRoute - the route requested from the client, as a JSON object
*/
app.get("/getRoute/:routeName", async (request, response) => {
    try {
        const { routeName } = request.params;
        let selectedRoute;
        let routes = railwayObject.routes;

        for (lines in routes) {
            if (routes[lines].name === routeName) {
                selectedRoute = routes[lines];
            }
        }
        response.json(selectedRoute);
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* This endpoint takes a string representation of a route, turns that string back into an object,
* and creates a string that represents each stop to send back to the client
* @param route - A string representation of the route object you want to summarize.
* @return routeString - A string representing information about the route in a user readable way.
*/
app.get("/routeToString/:route", async (request, response) => {
    try {
        let { route } = request.params;
        //Overwrite route to be a more useful JSON object
        route = JSON.parse(route);
        let routeString = `ROUTE: ${route.name} (${route.color}) \nSTATIONS:`;
        let lineCnt = 1;
        let mileCnt = 0;

        for(stops in route.stops) {
            //Append new data from each stop to the string
            routeString += `\n${lineCnt} ${route.stops[stops].stationName} ${mileCnt} miles`;
            lineCnt++
            if(route.stops[stops].distanceToNext != null) {
                mileCnt += route.stops[stops].distanceToNext;
            }
        }
        routeString += `\nTotal Route Distance: ${mileCnt}`;
        response.json(routeString);
    }
    catch (error) {
        console.error(error);

        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* This endpoint takes a string representation of a route, converts it into a JSON object, and
* finds the total distance of the route.
* @param route - A string representation of a route you want to find the distance of.
* @return A string containing a user readable distance
*/
app.get("/routeDistance/:route", async (request, response) => {
    try {
        let { route } = request.params;
        //turn route into a useful JSON object
        route = JSON.parse(route);
        let mileCnt = 0;

        for (stations in route.stops){
            if (route.stops[stations].distanceToNext != null){
                mileCnt += route.stops[stations].distanceToNext;
            }
        }
        response.json(`Distance of Line as calculated: ${mileCnt}`);
    }
    catch (error) {
        console.error(error);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* This endpoint takes a route as a parameter, and starting and ending points as a query.
* From there, the endpoint do some work to determine if the two points are along the route
* or not.
* @param route - the route you want to see if your starting and ending point are on.
* @param start - the first point you are checking for.
* @param end - the second point you are checking for.
* @return a string either containing information about the route, or a string saying that
* the starting and ending points are not on the same line.
*/
app.get("/getDistanceBetweenStops/:route", async (request, response) => {
    try{
        let { route } = request.params;
        let start = request.query.start;
        let end = request.query.end;

        //turn route into a useful JSON Object
        route = JSON.parse(route);

        //Ideally, this information, the for loop, and most of the last if/else statement at the
        //bottom would be in another function, but when I try to call another function, promises,
        //or lack there of would crash the program. My thought is that since promises aren't
        //mentioned anywhere within the project requirements, is that promises are outside
        //the scope of this project.
        let totalMiles = [0];
        let miles = 0;
        let cnt = 0;
        let firstStop;
        let secondStop;

        //populates the totalMiles array with the total amount of miles traveled at each stop
        //from the beginning. Also figure out which stop comes first, and which comes second.
        for (stop in route.stops) {
            let station = route.stops[stop];

            //Populate the totalMiles array
            if (station.distanceToNext != null) {
                totalMiles.push(miles + station.distanceToNext);
                miles += station.distanceToNext;
            }

            //find out which stop comes first
            if (station.stationName === start && cnt === 0) {
                firstStop = station;
                cnt++;
            }
            if (station.stationName === end && cnt === 0) {
                firstStop = station;
                cnt++;
            }

            //find out which stop comes second
            if (station.stationName === start && firstStop != station) {
                secondStop = station;
            }
            if (station.stationName === end && firstStop != station) {
                secondStop = station;
            }
        }

        //if both stops are found on this line, return the pertinent information
        if (firstStop != null && secondStop != null) {
            let numStops = secondStop.stop - firstStop.stop;
            let miles = totalMiles[secondStop.stop - 1] - totalMiles[firstStop.stop - 1];
            response.json(`${route.name}: ${start} to ${end} ${numStops} stops and \
${miles} miles`);
            //for some reason, if this isn't here, else will sometimes activate and crash the
            //program.
            return;
        }
        else {
            response.json(`No direct route found from ${start} to ${end}`);
        }
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* This endpoint will determine if the two points specified are along any route in the entire
* railway network.
* @param start - the first point you want to check for.
* @param end - the second point you want to check for.
* @return - A string with data about the route, or a string saying that there is no route with
* the two points on it.
*/
app.get("/findRoute", async (request, response) => {
    try {
        //You can't surround these guys with brackets
        let start = request.query.start;
        let end = request.query.end;
        let routes = railwayObject.routes;
        let selectedRoute;

        //if any line contains both the starting and ending stop, set that line to selectedRotue.
        for (lines in routes){
            let lineStops = routes[lines].stops;
            let selectedStart;
            let selectedEnd;
            //console.log(stops);
            for (stops in lineStops) {
                //if the first stop is on the line, set selectedStart to it
                if (lineStops[stops].stationName === start) {
                    selectedStart = lineStops[stops];
                }
                //if the ending stop is on the line, set selectedEnd to it
                if (lineStops[stops].stationName === end) {
                    selectedEnd = lineStops[stops];
                }
                //set selectedRoute if the two stops have been found on the same line.
                if (selectedStart != null && selectedEnd != null) {
                    selectedRoute = routes[lines]
                }
            }
        }

        //If there is not a direct route between the start and end point, say so.
        if (selectedRoute == null) {
            response.json(`No direct route found between ${start} and ${end}`);
            return;
        }

        //This chunk of code calculates the distance between the two stops
        //Ideally, I would do this in another function, but I can't seem to make
        //that happen without crashing the whole program because of promises.
        //I would normally try to figure that out, but that seems like it may be outside of the
        //scope of this project.
        let totalMiles = [0]
        let miles = 0;
        let firstStop;
        let secondStop;
        let cnt = 0;
        //Populate the totalMiles array, and find which stop comes first
        for (stops in selectedRoute.stops) {
            let station = selectedRoute.stops[stops]

            //Populate the totalMiles array
            if (station.distanceToNext != null) {
                totalMiles.push(miles + station.distanceToNext);
                miles += station.distanceToNext;
            }

            //Find if the start or end is the first station
            if (station.stationName === start && cnt === 0) {
                firstStop = station;
                cnt++;
            }
            if (station.stationName === end && cnt === 0) {
                firstStop = station;
                cnt++;
            }

            //Find if the start or end is the second station
            if (station.stationName === start && cnt === 1) {
                secondStop = station;
            }
            if (station.stationName === end && cnt === 1) {
                secondStop = station;
            }
        }

        //Do math using totalMiles, firstStop, and secondStop
        miles = totalMiles[secondStop.stop - 1] - totalMiles[firstStop.stop - 1];
        let numStops = secondStop.stop - firstStop.stop;

        response.json(`${selectedRoute.name}: ${start} to ${end} ${numStops} stops \
and ${miles} miles`);
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* This endpoint shuts the server down when called from the server, so the user doesn't have to.
*/
app.get("/quit", async (request, response) => {
    try {
        response.json("Shutting down server");
        process.exit(0);
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* Listens for incoming requests from the client.
*/
//app.listen(port, () => {
  //  console.log(`Server is listening on port ${port}`);
//});

module.exports = app