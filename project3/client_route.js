/**
* @author Elijah McCray and Danny Foster
* @date September 28 2025
* CS 253 Project 1
* This is the client half of the route system. It takes at minimum a file name, and a route name
* to run the first two tests. Additionally, a start point and an end point can be supplied,
* and the program will tell you if they are on the route provided, or if they can be found
* on another line within the same network.
*/

const fs = require("fs");
const axios = require("axios");
const URL = "http://localhost:30547"

/**
* This function sends the file name to the serve, so the server can load the file into memory.
* @param fileName - a string representing the name of the file
*/
async function readNetwork(fileName){
    try {
        let response = await axios.get(`${URL}/fileName/${fileName}`);
    }
    catch (error) {
        console.error(`Not able to parse the input file: ${error.message}`);
    }
}

/**
* The function gets the specified route you asked for from the server, so that it can be used
* in future functions.
* @param routeName - A string representing the route you want to get as an object from the server.
* @return route - return the route found as a JSON object.
*/
async function getRoute(routeName) {
    try {
        let response = await axios.get(`${URL}/getRoute/${routeName}`);
        let route = response.data;

        console.log(`Found: ${route.name}`);

        return route;
    }
    catch (error) {
        console.error("Error finding the route: ", error.message);
    }
}

/**
* This function takes a route object in JSON format, turns it into a string representation,
* and sends that to the server in order to get summary of a specific route.
* @param route - A JSON representation of a route to send to the server
*/
async function routeToString(route) {
    try {
    //Turn route data into a string to send to the server
    let sendRoute = JSON.stringify(route);
    let response = await axios.get(`${URL}/routeToString/${sendRoute}`);
    let routeString = response.data;

    console.log(routeString);
    }
    catch (error) {
        console.error("Error getting routeToString: ", error.message);
    }
}

/**
* This function takes a route as a JSON object, converts it into a string, and sends that string
* to the server, which will return the total distance of the specified route.
* @param route - A JSON representastion of a route in which you want to find the total distance of.
*/
async function routeDistance(route) {
    try {
    //Turn route data into a string to send to server
    let sendRoute = JSON.stringify(route);
    let response = await axios.get(`${URL}/routeDistance/${sendRoute}`);
    let distance = response.data;

    console.log(distance);
    }
    catch (error) {
        console.error("Error getting routeDistance: " + error.message);
    }
}

/**
* This function will call the server to find out if two points are on the provided route.
* @param route - the route you are looking on.
* @param startStop - the first point you are checking for along your route.
* @param endStop - the second point you are checking for along your route.
*/
async function getDistanceBetweenStops(route, startStop, endStop) {
    try {
        let sendRoute = JSON.stringify(route);
        let response = await axios.get(`${URL}/getDistanceBetweenStops/${sendRoute}\
?start=${startStop}&end=${endStop}`);
        let routeData = response.data;

        console.log(routeData);
    }
    catch (error) {
        console.error("Error getting distance between stops: " + error.message);
    }
}

/**
* This function checks to see if the two specified points exist on the same line across the whole
* railway network.
* @param startStop - the first point you are checking for.
* @param endStop - the second point you are checking for.
*/
async function findRoute(startStop, endStop) {
    let response = await axios.get(`${URL}/findRoute?start=${startStop}&end=${endStop}`);
    let route = response.data;

    console.log(route);
}

/**
* This function sends a request to shutdown the server, so the user doesn't have to.
*/
async function shutDown() {
    let response = await axios.get(`${URL}/quit`);
}

/**
* This is the main function, it calls all other functions.
*/
//async function main() {
  //  let fileName = process.argv[2];
  //  let routeName = process.argv[3]
  //  let startStop = process.argv[4];
  // let endStop = process.argv[5];

    //checks to see if .json is at the end of the file name, if it's not, append it.
    //This could be modified to allow other ifle types to pass as well, if needed.
   // if (fileName.slice(fileName.length - 5) != ".json") {
    //    fileName = process.argv[2] + ".json";
    //}

   // console.log("ROUTE Tests");
   // await readNetwork(fileName);

   // console.log("\n===Route TEST=1=GET=ROUTE===");
   // let route = await getRoute(routeName);

   // console.log("\n===TEST=2=ROUTE=TO=STRING===");
   // await routeToString(route);

    //console.log("\n===Route TEST=3=ROUTE=DISTANCE===");
    //await routeDistance(route);

    //EXTRA CREDIT
    //Only proceed if startStop and endStop have been intialized
    //if (startStop != null && endStop != null) {
       // console.log("\n====(OPTIONAL) Route TEST=4=BONUS1=FIND=FROM=TO=ROUTE===");
       // await getDistanceBetweenStops(route, startStop, endStop);

       // console.log("\n====(OPTIONAL) Route TEST=5=BONUS1=FIND=FROM=TO===");
       // await findRoute(startStop, endStop);
   // }

   // shutDown();
//}

module.exports = {
    readNetwork,
    getRoute,
    routeToString,
    routeDistance,
    getDistanceBetweenStops,
    findRoute,
    shutDown,
}

//  main();
