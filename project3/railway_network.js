/**
* @author Elijah McCray and Danny Foster
* @date September 26 2025
* CS 253 Project 1
* This is the server side of the network portion of the network. The client calls an endpoint,
* and each endpoint returns data to the client to be displayed.
*/

const fs = require("fs");
const express = require("express");

const app = express();
const port = 30545;

//Declare networkObject here so that it is global and can be used by other functions as needed.
let railwayObject;

/*
* GET request to create a file from the file name provided in the request
*/
//app.get("/fileName", async (request, response) => {
app.get("/fileName/:fileName", (request, response) => {
    try {
        //get the file name from the client
        const { fileName } = request.params;

        //get full file path
        let path = `../provided_data_sets/${fileName}`;

        //use the file name to get the file
        let file = fs.readFileSync(path, "utf-8");

        //use the file to make a JS object
        railwayObject = JSON.parse(file);

        //return the object back to the client
        response.json(railwayObject);
    }
    catch (error) {
        response.status(501).json({ message: "Not able to parse the input file" });
    }
});
/**
* GET request to find and returns the network name
*/
app.get("/getNetworkName", async (request, response) => {
    try {
        let networkName = railwayObject.networkName;
        response.json(networkName);
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* GET request to find and return the routes as an array.
*/
app.get("/routes", async (request, response) => {
    try {
        let numRoutes = railwayObject.routes
        let ending = `The type of routes is ${typeof(numRoutes)}`;
        //Different cases for correct grammar.
        if (numRoutes.length > 1) {
            response.json(`There are ${numRoutes.length} routes on this network \n${ending}`);
        }
        else {
            response.json(`There is ${numRoutes.length} route on this network \n${ending}`);
        }
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* GET request to find and return the route names as an array.
*/
app.get("/routeNames", async (request, response) => {
    try {
        //An array of names to send back
        let routeNames = [];
        let cnt = 0;

        //Populate the routeNames array
        for (names of railwayObject.routes) {
            routeNames[cnt] = railwayObject.routes[cnt].name;
            cnt++;
        }

        response.json(routeNames)
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* Finds and returns the route names as a string.
*/
app.get("/routeNamesToString", async (request, response) => {
    try{
        let routes = railwayObject.routes;
        let routeString = "";

        //Build the routeString string
        for (names in routes) {
            //This is to add a comma if we're not at the last stop
            if(names != railwayObject.routes.length - 1) {
                routeString += `${routes[names].name},\n`;
            }
            else {
                routeString += `${routes[names].name}`;
            }
        }

        response.json(routeString);
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* GET request to find and return the total number of stations without any duplicates.
*/
app.get("/totalStations", async (request, response) => {
    try{
        let routes = railwayObject.routes
        let totalStations = [];

        //iterate through the stations in routes
        for (stations in routes) {
            //iterate through the stops in each station
            for (stops in routes[stations].stops) {
                let currentStop = routes[stations].stops[stops].stationName;
                //if the current stop is not in the totalStations array, add it.
                if (!totalStations.includes(currentStop)) {
                    totalStations.push(currentStop);
                }
            }
        }

        //checks to see how many stations there are, and changes grammar accordingly.
        if (totalStations.length > 1) {
            response.json(`There are ${totalStations.length} stations in this network`);
        }
        else{
            response.json(`There are ${totalStations.length} stations in this network`);
        }
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* GET reqesut to find and return the route with the longest distance.
*/
app.get("/findLongestRoute", async (request, response) => {
    try{
        let routes = railwayObject.routes;
        let longestRoute = [];
        let longestDistance = 0;

        //iterate through the stations in routes
        for (stations in routes) {
            let currentStation = routes[stations];
            let tmpDistance = 0;

            //iterate through the stops in each station
            for (stops in currentStation.stops) {
                let currentStop = currentStation.stops[stops];
                //If the current stop has a next stop, add the distance to the
                //distance counter
                if (currentStop.distanceToNext != null){
                    tmpDistance = tmpDistance + currentStop.distanceToNext
                }
            }

            //If the current route we're lookig at is longer than the previous longest,
            //make the current station the new longest
            if (tmpDistance > longestDistance) {
                longestRoute = currentStation;
                longestDistance = tmpDistance;
            }
        }

        //setup info for the string to return
        let routeString = `Longest route is: ROUTE: ${longestRoute.name}\
(${longestRoute.color}) \nSTATIONS:`;
        let miles = 0;
        let cnt = 1;

        //Append data to routeString
        for (stop in longestRoute.stops) {
            routeString += `\n${cnt} ${longestRoute.stops[stop].stationName} ${miles} miles`;
            cnt++;
            if (longestRoute.stops[stop].distanceToNext != null) {
                miles += longestRoute.stops[stop].distanceToNext;
            }
        }

        //put final piece of routeString on, and send it to the client.
        routeString += `\nTotal Route Distance: ${miles} miles`;
        response.json(routeString);
    }
    catch (error) {
        response.status(500).json({ error: "Internal Server Errror" });
    }
});

/**
* Kills the server when requested by the client.
*/
app.get("/quit", async (request, response) => {
    try {
        response.json("Shutting down server");
        process.exit(0);
    }
    catch (error){
        response.status(500).json({ error: "Internal Server Error" });
    }
});

/**
* Listens for incoming requests from the client.
*/
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
});
