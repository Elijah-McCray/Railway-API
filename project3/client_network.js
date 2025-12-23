/**
* @author Elijah McCray and Danny Foster
* @date September 26 2025
* CS 253 Project 1
* This is the client for railway_network.js where we send requests to the server and
* display the data the server sends back.
*/

//Import file system and axios
const fs = require("fs");
const axios = require("axios");

//Initialize the URL with port 30545
const URL = "http://localhost:30545";

/**
* Get the network object from the server.
* @param fileName - a string representing the file name you want the server to load.
*/
async function readNetwork(fileName) {
    try {
        let response = await axios.get(`${URL}/fileName/${fileName}`);
    }
    catch (error) {
        console.error(`error fetching file name: ${error.message}`);
    }
}

/**
* Gets the network name from the server, and displays it.
*/
async function getNetworkName() {
    try {
        let response = await axios.get(`${URL}/getNetworkName`);
        let networkName = response.data;

        console.log(networkName);
    }
    //If there is an error parsing the file, print an error message, kill the sever, and quit
    //without the error message that is a mile long.
    catch (error) {
        console.error("Not able to parse the input file");
        await axios.get(`${URL}/quit`);
        process.exit(0);
    }

}

/**
* Gets the routes from the server, and displays them.
*/
async function getRoutes() {
    let response = await axios.get(`${URL}/routes`);
    let numRoutes = response.data;

    console.log(numRoutes);
}

/**
* Gets the route names from the server as an array, and displays them.
*/
async function getRouteNames() {
    let response = await axios.get(`${URL}/routeNames`)
    let routeNames = response.data;

    console.log(routeNames);
}

/**
* Gets the route names as a string, and then modifies them to fit the format specified.
*/
async function routeNamesToString(){
    let response = await axios.get(`${URL}/routeNamesToString`)
    let routeNamesString = response.data;

    console.log(routeNamesString);
}

/**
* Gets the total number of stations from the server, and then displays it.
*/
async function totalStations() {
    let response = await axios.get(`${URL}/totalStations`);
    let totalStations = response.data;

    console.log(totalStations);
}

/**
* Gets the longest route from the server, and then displays it.
*/
async function findLongestRoute() {
    let response = await axios.get(`${URL}/findLongestRoute`);
    let longestRoute = response.data;

    console.log(longestRoute);
}

/**
* Closes the server after tests are done running, so that the user doens't have to.
*/
async function closeServer() {
    let response = await axios.get(`${URL}/quit`)
}

/**
* The main function calls all of the other functions.
*/
async function main() {
    let fileName = process.argv[2];

    //Checks to see if .json is at the end of the file name, if it's not, append it.
    //This could be modified to allow other file types to pass as well, if needed.
    if (fileName.slice(fileName.length - 5) != ".json") {
        fileName = process.argv[2] + ".json";
    }

    console.log("NETWORK Tests");
    await readNetwork(fileName);

    console.log("\n===Network TEST=1=NETWORK=NAME===")
    await getNetworkName();

    console.log("\n===Network TEST=2=GETTING=ROUTES=ARRAY===");
    await getRoutes();

    console.log("\n===Network TEST=3=ROUTE=NAMES===");
    await getRouteNames();

    console.log("\n===Network TEST=4=ROUTE=NAMES=TOSTRING===");
    await routeNamesToString();

    console.log("\n===Network TEST=5=Total_Stations===");
    await totalStations();

    console.log("\n===Network TEST=6=FIND=LONGEST=ROUTE===");
    await findLongestRoute();
    closeServer();
}

main();
