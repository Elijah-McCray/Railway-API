/**
* @author Elijah McCray and Danny Foster
* @date October 3 2025
* CS 253 Project 1
* CLIENT for railway_routeSummary.js
*
* Responsibilities of this client:
* --------------------------------
* 1. Tell the server which dataset (JSON file) to load.
* 2. Request the server’s "route summary" report in various formats.
* 3. Instruct the server to sort data (by name or length), then re-request summaries.
* 4. Parse the server’s plain-text summary lines into a very specific output format.
* 5. Handle error cases gracefully (like invalid JSON).
*
* Expected output format for each route:
*   <Route Name> - <First Station> to <Last Station> - <Distance> miles
*/

// Import Node.js modules
const fs = require("fs");      // included but not directly used here
const axios = require("axios");// used for all HTTP requests to the server

// Base URL of the server (must match port used in railway_routeSummary.js)
const URL = "http://localhost:30546";

/**
* Ask the server to load a JSON dataset by filename.
* - Sends GET request to /fileName?fileName=<fileName>
* - If parsing fails on the server, we handle the error here.
*/
async function readNetwork(fileName) {
    try {
        let reply = await axios.get(`${URL}/fileName?fileName=` + fileName);
        // If no error, dataset is loaded successfully on the server.
    } catch (error) {
        // Server couldn’t parse file → print required error message and exit.
        console.log("Not able to parse the input file.");
        try { await axios.get(`${URL}/quit`); } catch (e) {} // attempt graceful shutdown
        process.exit(0);
    }
}

/**
* ROUTE SUMMARY TEST 1
* --------------------
* Request a plain-text summary of all routes and print them in the required format.
*/
async function routeSummary() {
    console.log("\n===Route Summary TEST=1=ROUTE=SUMMARY===");

    // Get the summary text block from server
    let reply = await axios.get(`${URL}/routeSummary`, { responseType: "text" }); 
    let raw = String(reply.data || "").trimEnd();
    if (!raw) { console.log("No summary returned."); return; }

    // Break into lines, skipping empty ones
    const lines = raw.split("\n").filter(Boolean);

    // Print client-side header for clarity
    console.log("Routes Summary");
    console.log("==============");

    // Loop starts at i = 2 to skip the first two header lines
    for (let i = 2; i < lines.length; i++) {
        let line = lines[i]; // Example: "East Coast Main Line (Red): London -> Edinburgh, 500 miles"

        // Parse route name: take text before '(' then before ':' and trim spaces.
        let routeName = line.split("(")[0].split(":")[0].trim();

        // Parse station path: take the right side of the ":", then up to the comma,
        // replace "->" with "to", trim spaces.
        let stations  = line.split(":")[1].split(",")[0].replace("->", "to").trim();

        // Parse distance: from right side of ":", take after the comma and trim spaces.
        let distance  = line.split(":")[1].split(",")[1].trim();

        // Print in the required format.
        console.log(`${routeName} - ${stations} - ${distance}`);
    }
}

/**
* ROUTE SUMMARY TEST 2
* --------------------
* Sort routes by NAME (ascending) on the server, then request summary again.
*/
async function sortRoutesByName() {
    console.log("\n===Route Summary TEST=2=SORT=ROUTE=BY=NAME=(ASC)===");

    // Tell server to sort by name ascending
    await axios.get(`${URL}/sortRoutesByName?asc=true`);

    // Fetch the updated summary
    let reply = await axios.get(`${URL}/routeSummary`, { responseType: "text" });
    let raw = String(reply.data || "").trimEnd();
    const lines = raw.split("\n").filter(Boolean);

    console.log("Routes Summary");
    console.log("==============");

    // Loop starts at i = 2 to skip the first two header lines
    for (let i = 2; i < lines.length; i++) {
        let line = lines[i]; // Example: "East Coast Main Line (Red): London -> Edinburgh, 500 miles"

        // Parse route name: take text before '(' then before ':' and trim spaces.
        let routeName = line.split("(")[0].split(":")[0].trim();

        // Parse station path: take the right side of the ":", then up to the comma,
        // replace "->" with "to", trim spaces.
        let stations  = line.split(":")[1].split(",")[0].replace("->", "to").trim();

        // Parse distance: from right side of ":", take after the comma and trim spaces.
        let distance  = line.split(":")[1].split(",")[1].trim();

        // Print in the required format.
        console.log(`${routeName} - ${stations} - ${distance}`);
    }
}

/**
* ROUTE SUMMARY TEST 3
* --------------------
* Sort routes by NAME (descending) on the server, then request summary again.
*/
async function addDistances() {
    console.log("\n===Route Summary TEST=3=SORT=ROUTE=BY=NAME=(DESC)===");

    // Tell server to sort by name descending
    await axios.get(`${URL}/sortRoutesByName?asc=false`);

    // Fetch updated summary
    let reply = await axios.get(`${URL}/routeSummary`, { responseType: "text" });
    let raw = String(reply.data || "").trimEnd();
    const lines = raw.split("\n").filter(Boolean);

    console.log("Routes Summary");
    console.log("==============");

    // Loop starts at i = 2 to skip the first two header lines
    for (let i = 2; i < lines.length; i++) {
        let line = lines[i]; // Example: "East Coast Main Line (Red): London -> Edinburgh, 500 miles"

        // Parse route name: take text before '(' then before ':' and trim spaces.
        let routeName = line.split("(")[0].split(":")[0].trim();

        // Parse station path: take the right side of the ":", then up to the comma,
        // replace "->" with "to", trim spaces.
        let stations  = line.split(":")[1].split(",")[0].replace("->", "to").trim();

        // Parse distance: from right side of ":", take after the comma and trim spaces.
        let distance  = line.split(":")[1].split(",")[1].trim();

        // Print in the required format.
        console.log(`${routeName} - ${stations} - ${distance}`);
    }
}

/**
* ROUTE SUMMARY TESTS 4 & 5
* -------------------------
* Sort routes by LENGTH (ascending), print summary,
* then sort by LENGTH (descending) and print again.
*/
async function sortRoutesByLength() {
    console.log("\n===Route Summary TEST=4=SORT=ROUTE=BY=LENGTH=(ASC)===");

    // Tell server to sort routes by distance ascending
    await axios.get(`${URL}/sortRoutesByLength?asc=true`);

    // Fetch summary (now in ascending order)
    let asc = await axios.get(`${URL}/routeSummary`, { responseType: "text" });
    let rawAsc = String(asc.data || "").trimEnd();
    const linesAsc = rawAsc.split("\n").filter(Boolean);

    console.log("Routes Summary");
    console.log("==============");

    // Loop starts at i = 2 to skip the first two header lines
    for (let i = 2; i < linesAsc.length; i++) {
        let line = linesAsc[i]; // Example: "East Coast Main Line (Red): London -> Edinburgh, 500 miles"

        // Parse route name: take text before '(' then before ':' and trim spaces.
        let routeName = line.split("(")[0].split(":")[0].trim();

        // Parse station path: take the right side of the ":", then up to the comma,
        // replace "->" with "to", trim spaces.
        let stations  = line.split(":")[1].split(",")[0].replace("->", "to").trim();

        // Parse distance: from right side of ":", take after the comma and trim spaces.
        let distance  = line.split(":")[1].split(",")[1].trim();

        // Print in the required format.
        console.log(`${routeName} - ${stations} - ${distance}`);
    }

    console.log("\n===Route Summary TEST=5=SORT=ROUTE=BY=LENGTH=(DESC)===");

    // Tell server to sort routes by distance descending
    await axios.get(`${URL}/sortRoutesByLength?asc=false`);

    // Fetch summary (now in descending order)
    let desc = await axios.get(`${URL}/routeSummary`, { responseType: "text" });
    let rawDesc = String(desc.data || "").trimEnd();
    const linesDesc = rawDesc.split("\n").filter(Boolean);

    console.log("Routes Summary");
    console.log("==============");

    // Loop starts at i = 2 to skip the first two header lines
    for (let i = 2; i < linesDesc.length; i++) {
    	let line = linesDesc[i];

        // Parse route name: take text before '(' then before ':' and trim spaces.
        let routeName = line.split("(")[0].split(":")[0].trim();

        // Parse station path: take the right side of the ":", then up to the comma,
        // replace "->" with "to", trim spaces.
        let stations  = line.split(":")[1].split(",")[0].replace("->", "to").trim();

        // Parse distance: from right side of ":", take after the comma and trim spaces.
        let distance  = line.split(":")[1].split(",")[1].trim();

        // Print in the required format.
        console.log(`${routeName} - ${stations} - ${distance}`);
    }
}

/**
* This is the main function, it calls all other functions 
*/
//async function main() {
//    let fileName = process.argv[2];

    // Add ".json" if not there 
//    if (fileName.slice(fileName.length - 5) != ".json") {
 //       fileName = process.argv[2] + ".json";
 //   }
    

 //   await readNetwork(fileName);
 //   console.log("ROUTE SUMMARY Tests");

  //  await routeSummary();     
  //  await sortRoutesByName();  
  //  await addDistances();   
  //  await sortRoutesByLength(); 
//}

  //              main(); // calls main

module.exports = {
    readNetwork,
    sortRoutesByName,
    sortRoutesByLength,
    addDistances,  
    routeSummary,
}
