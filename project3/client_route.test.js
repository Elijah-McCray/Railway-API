// Test file for client_route.js
jest.mock("axios", () => ({ get: jest.fn() }), { virtual: true });
const axios = require("axios")
const routeFunctions = require('./client_route.js');
const fs = require('fs');
const path = require('path');
const { error } = require("console");







describe('Testing that functions exist', () => {
    const OLD_ARGV = process.argv;
    let exitSpy, logSpy, errSpy;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.argv = ["node", "client_route.js", "uk.json", "Great Western Railway", 
                        "Cardiff", "Reading"]; // default; individual tests override if needed
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
        expect(routeFunctions.readNetwork).toBeDefined();
        expect(routeFunctions.getRoute).toBeDefined();
        expect(routeFunctions.routeToString).toBeDefined();
        expect(routeFunctions.routeDistance).toBeDefined();
        expect(routeFunctions.getDistanceBetweenStops).toBeDefined();
        expect(routeFunctions.findRoute).toBeDefined();
        expect(routeFunctions.shutDown).toBeDefined();


    })



})

describe("Tests for getRoute", () => {


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



    test("Testing that readNetwork sends correct address and receives correct output", async () => {
        const mockRoute = {name: "Test Route", color: "Black", stops: ["A", "B", "C"] }
        axios.get.mockResolvedValue({ data: mockRoute});

        const result = await routeFunctions.getRoute("Test Route");

        expect(axios.get).toHaveBeenCalledWith("http://localhost:30547/getRoute/Test Route" );
        expect(result).toEqual(mockRoute);
    })
    

    test("Tests that correct error is output with a incorrect route name", async () => {
        const errorMessage = "Invalid Route Name";
        axios.get.mockRejectedValue(new Error(errorMessage));

        await routeFunctions.getRoute("Test Route");

        expect(errSpy).toHaveBeenCalledWith('Error finding the route: ', errorMessage);




    })
})

describe("Tests for readNetwork", () => {
    
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
   

    const result = await routeFunctions.readNetwork(fileName)

    expect(axios.get).toHaveBeenCalledWith("http://localhost:30547/fileName/uk.json")
    

    })

    test("Tests that correct error is output with incorrect file name", async () => {
        const errorMessage = "Invalid File Name"
        axios.get.mockRejectedValue(new Error(errorMessage))

        await routeFunctions.readNetwork("uks.json")

        expect(errSpy).toHaveBeenCalledWith(`Not able to parse the input file: ${errorMessage}`)

    })
})

describe("Tests for routeToString", () => {

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

    test("Correctly converts route object into string", async () => {
        const mockRoute = {name: "Test Route", color: "Black", stops: ["A", "B", "C"] }
        const stringRep = JSON.stringify(mockRoute)
        axios.get.mockResolvedValue({ data: mockRoute});

        await routeFunctions.routeToString(mockRoute);

        expect(axios.get).toHaveBeenCalledWith(`http://localhost:30547/routeToString/${stringRep}`)
        expect(logSpy).toHaveBeenCalledWith(mockRoute)


    })

    test("Tests that error is correctly output when incorrect input is given", async () => {
        const mockRoute = ""
        const errorMessage = "Invalid Route Object"
        axios.get.mockRejectedValue(new Error(errorMessage))

        await routeFunctions.routeToString(mockRoute);

        expect(errSpy).toHaveBeenCalledWith("Error getting routeToString: ", errorMessage)
    })

})

describe("Tests for routeDistance", () => {

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

    test("That the function correctly sends a string version of the route to the server", async() => 
        {
        const mockRoute = {name: "Test Route", color: "Black", stops: ["A", "B", "C"] }
        const stringRep = JSON.stringify(mockRoute)
        axios.get.mockResolvedValue({ data: mockRoute});
        let distance = mockRoute.data;


        await routeFunctions.routeDistance(mockRoute);

        expect(axios.get).toHaveBeenCalledWith(`http://localhost:30547/routeDistance/${stringRep}`)
        expect(distance).toEqual(mockRoute.data)
    })

    test("That error is correctly thrown when routeDistance is given incorrect parameter", async()=>
    {
        const mockRoute = ""
        const errorMessage = "Invalid Route Object"
        axios.get.mockRejectedValue(new Error(errorMessage))

        await routeFunctions.routeDistance(mockRoute);

        expect(errSpy).toHaveBeenCalledWith("Error getting routeDistance: " + errorMessage);

    })


})

describe("Tests for getDistanceBetweenStops", () => {
   
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


    test("That server endpoint is correctly called with string route", async()=> {
    
        const mockRoute = {name: "Test Route", color: "Black", stops: ["A", "B", "C"] }
        const startStop = "A"
        const endStop = "B"
        const stringRep = JSON.stringify(mockRoute)
        axios.get.mockResolvedValue({ data: mockRoute});
        let routeData = mockRoute.data

        await routeFunctions.getDistanceBetweenStops(mockRoute, startStop, endStop);


        expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:30547/getDistanceBetweenStops/${stringRep}\?start=${startStop}&end=${endStop}`);
        expect(routeData).toEqual(mockRoute.data)
        expect(logSpy).toHaveBeenCalledWith(mockRoute)


    })

    test("That error is correctly thrown with incorrect parameter", async () => {
        const mockRoute = ""
        const errorMessage = "Invalid Route Object"
        axios.get.mockRejectedValue(new Error(errorMessage))

        await routeFunctions.getDistanceBetweenStops(mockRoute);

        expect(errSpy).toHaveBeenCalledWith("Error getting distance between stops: " + errorMessage);

    })


})

describe("Tests for findRoute function", () => {
    
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

    test("Tests that endpoint is correctly called", async () => {
        const startStop = "A"
        const endStop = "B"
        axios.get.mockResolvedValue({ data: "A - B"});
        let route = (`${startStop} - ${endStop}`)

        await routeFunctions.findRoute(startStop, endStop)

        expect(axios.get).toHaveBeenCalledWith(
                               `http://localhost:30547/findRoute?start=${startStop}&end=${endStop}`)

        expect(route).toEqual("A - B")
        expect(logSpy).toHaveBeenCalledWith(route)


    })

})

describe("Test for shutDown function", () => {

    test("Tests that shutdown endpoint is called", async () => {
    axios.get.mockResolvedValue("Shutdown");

    await routeFunctions.shutDown();

    expect(axios.get).toHaveBeenCalledWith(`http://localhost:30547/quit`)
    })
})
