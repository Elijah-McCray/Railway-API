jest.mock("axios", () => ({ get: jest.fn() }), { virtual: true });
const axios = require("axios")
const summaryFunctions = require('./client_routeSummary.js');
const fs = require('fs');
const path = require('path');
const { error } = require("console");
const { deserialize } = require("v8");


describe('Testing that functions exist', () => {
    const OLD_ARGV = process.argv;
    let exitSpy, logSpy, errSpy;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.argv = ["node", "client_routeSummary.js", "uk.json"]; // default; individual tests override if needed
        exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        process.argv = OLD_ARGV;
        exitSpy.mockRestore();
        logSpy.mockRestore();
        errSpy.mockRestore();
    });

    test('Imported functions exist', () => {
        expect(summaryFunctions.readNetwork).toBeDefined()
        expect(summaryFunctions.sortRoutesByName).toBeDefined()
        expect(summaryFunctions.sortRoutesByLength).toBeDefined()
        expect(summaryFunctions.addDistances).toBeDefined()
        expect(summaryFunctions.routeSummary).toBeDefined()
    })



})

describe("Tests for readNetwork", () => {
    const OLD_ARGV = process.argv;
    let exitSpy, logSpy, errSpy;
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        exitSpy.mockRestore();
        logSpy.mockRestore();
        errSpy.mockRestore();

    })

    test("Tests read network when given a correct file", async () => {
        const fileName = "uk.json"
       
    
        const result = await summaryFunctions.readNetwork(fileName)
    
        expect(axios.get).toHaveBeenCalledWith("http://localhost:30546/fileName?fileName=uk.json")
        
    
    })
    
    test("Tests that shutdown is correctly called when an error happens", async () => {
        const errorMessage = "Invalid File Name"
        axios.get.mockRejectedValue(new Error(errorMessage))
    
        await summaryFunctions.readNetwork("")
    
        expect(axios.get).toHaveBeenCalledWith(`http://localhost:30546/quit`)
    
    })
    
    

})

describe("Tests for routeSummary", () => {
    const OLD_ARGV = process.argv;
    let exitSpy, logSpy, errSpy;
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        exitSpy.mockRestore();
        logSpy.mockRestore();
        errSpy.mockRestore();

    })

    test("Tests that output is correctly printed when somthing is returned from network call", async () => {

        axios.get.mockResolvedValue({data: "Correct Value"})
        testLine = "Correct Values"
        summaryFunctions.routeSummary()
        
        expect(logSpy).toHaveBeenCalledWith("\n===Route Summary TEST=1=ROUTE=SUMMARY===")
        expect(logSpy).toHaveBeenCalledWith("Routes Summary")
        expect(logSpy).toHaveBeenCalledWith("==============")

        expect(logSpy).toHaveBeenCalledTimes(4)

        



    })

})