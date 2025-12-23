/**
 * @author Ty McConnaughey and Elijah McCray
 * @date October 31, 2025
 * CS 253 Project 2 — Best Journeys Client
 *
 * This program is a command-line tool that connects to the `/getBestJourneys`
 * web service to request and display the best train journeys between two stations.
 * It takes a dataset file, an origin, a destination, and a maximum number of results
 * as command-line arguments, sends them to the server, and prints the formatted
 * output exactly as shown in the official example results for grading.
 *
 * The client automatically handles relative and absolute file paths and ensures
 * that journey data is displayed cleanly and consistently for any dataset.
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * Builds and returns formatted journey output text.
 * Handles both successful searches and "station not found" cases.
 * @param {Array} journeysFound - List of journey objects returned by the server.
 * @param {boolean} notFoundMessage - True if one or more stations could not be found.
 * @returns {string} A formatted, ready-to-print string of all journeys.
 */
function displayJourneys(journeysFound, notFoundMessage) {
  const lines = [];

  // Print a blank line before output block for readability
  lines.push("");

  // Handle the case where one or both stations are not found
  if (notFoundMessage) {
    lines.push("One or more station cannot be found on this network");
    lines.push("");
    lines.push("Journeys found: 0");
    return lines.join("\n");
  }

  // Print total number of journeys found
  lines.push(`Journeys found: ${journeysFound.length}`);

  // Loop through all returned journeys and print them one by one
  for (let i = 0; i < journeysFound.length; i++) {
    const journeyFoundNum = journeysFound[i];
    lines.push(`${i + 1}:`);
    lines.push(journeyFoundNum.report);
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

/**
 * Resolves the location of a dataset file.
 * Accepts both absolute paths and simple filenames, checking common folders
 * such as the working directory, `data/`, and `provided_data_sets/`.
 * @param {string} fileArg - File name or path provided by the user.
 * @returns {string} The resolved absolute path to the dataset file.
 */
function resolveDataFile(fileArg) {
  // If absolute and exists, return as-is
  if (path.isAbsolute(fileArg) && fs.existsSync(fileArg)) return fileArg;

  const isBareName = !fileArg.includes("/") && !fileArg.includes("\\");
  const candidates = [];

  // Try common dataset locations if only a name was given
  if (isBareName) {
    candidates.push(
      path.join(process.cwd(), fileArg), // current working directory
      path.join(process.cwd(), "..", "provided_data_sets", fileArg), // provided_data_sets/
      path.join(process.cwd(), "data", fileArg), // ./data/
      path.join(__dirname, fileArg) // same folder as client
    );
  } else {
    candidates.push(
      fileArg,
      path.join(process.cwd(), fileArg),
      path.join(__dirname, fileArg)
    );
  }

  // Return the first existing path found
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return path.resolve(p);
    } catch {
      // ignore errors from fs.existsSync
    }
  }

  // If nothing was found, assume it’s relative to where the program was run
  return path.resolve(process.cwd(), fileArg);
}

/**
 * Connects to the server’s `/getBestJourneys` endpoint and displays the results.
 * @param {string} dataFileArg - Path to the dataset file.
 * @param {string} origin - Starting station name.
 * @param {string} dest - Destination station name.
 * @param {number} maxResults - Maximum number of results to show.
 */
async function getBestJourneys(dataFileArg, origin, dest, maxResults) {
  const url = "http://localhost:3005/getBestJourneys";
  const dataFile = resolveDataFile(dataFileArg);

  try {
    // Make the GET request to the Express server
    const response = await axios.get(url, {
      params: { dataFile, origin, dest, maxResults },
    });

    // Extract the results and display them
    const notFound = !!response.data?.notFound;
    const journeys = Array.isArray(response.data?.journeys)
      ? response.data.journeys
      : [];

    console.log(displayJourneys(journeys, notFound));
  } catch (err) {
    console.error("Client error:", err.message);
  }
}

/**
 * Handles argument parsing and calls getBestJourneys() with user inputs.
 * @param {string} dataSet - The dataset file to use.
 * @param {string} origin - Starting station.
 * @param {string} dest - Destination station.
 * @param {number} maxResults - Number of results to return.
 */
async function main(dataSet, origin, dest, maxResults) {
  await getBestJourneys(dataSet, origin, dest, maxResults);
}

// Export functions for testing
module.exports = {
  displayJourneys,
  resolveDataFile,
  getBestJourneys,
  main,
};

/**
 * When this file is run directly from the command line, this section handles input.
 * It reads arguments, validates the count, and runs the main() function.
 * If the file is imported by another script, this code won’t execute.
 */

/* istanbul ignore next */
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);

    if (args.length !== 4) {
      console.error(
        "Error! Usage: node client_getBestJourneys.js <data set> <origin> <destination> \n<max results>"
      );
      process.exit(1);
    }

    const [dataSet, origin, dest, maxResults] = args;
    await main(dataSet, origin, dest, maxResults);
  })();
}
