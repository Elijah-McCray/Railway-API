// Test file for railway_route.js 
jest.mock('fs', () => ({
    readFileSync: jest.fn()
}));

const axios = require('axios');

const BASE_URL = "http://localhost:30547";

const fs = require('fs');



describe("Tests for railway_route", () => {

    let server;
    let app;

    beforeAll((done) => {
        app = require('./railway_route.js');
        server = app.listen(30547, done)
    });

    afterAll((done) => {
        if (server) {
            server.close(done);
        }else {
            done();
            }
    
    })

    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe("Tests for filename endpoint",  () =>{
        
        
        test("That correct file is returned as JSON object", async () => {
        testFile = "uk.json"
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: ["Stop One", "Stop Two", "Stop Three"]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: ["Stop One", "Stop Two", "Stop Three"]
                }
            ]
        }
        mockFileContents = JSON.stringify(mockData);
        fs.readFileSync.mockReturnValue(mockFileContents);
        let file = fs.readFileSync(mockData, "utf-8")
        let testObject = JSON.parse(file);

        const response = await axios.get(`${BASE_URL}/fileName/${testFile}`)

        expect(response.data).toEqual(testObject)
        })

    })
    test("That correct error is output", async () =>{
        	    fs.readFileSync.mockImplementation(() => {
                throw new Error("File not found");
            });
        testFile = "uk.json"
	    try {
		await axios.get(`${BASE_URL}/fileName/${testFile}`);
		
		
	    } catch (error) {
            expect(error.response).toBeDefined();
		    expect(error.response.status).toBe(500);
	        expect(error.message).toEqual("Request failed with status code 500");
	    }


    })



 describe("Tests for getRoute endpoint",  () =>{
        
        
    test("That correct route is returned", async () => {
        testFile = "uk.json"
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: ["Stop One", "Stop Two", "Stop Three"]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: ["Stop One", "Stop Two", "Stop Three"]
                }
            ]
        }

    

        testRouteName = "Route Two"
        mockFileContents = JSON.stringify(mockData);
        fs.readFileSync.mockReturnValue(mockFileContents)

        const response = await axios.get(`${BASE_URL}/getRoute/${testRouteName}`)

        expect(response.data.name).toEqual(testRouteName)
    })

    test("That correct error is output", async () =>{
        errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        
	   try{
		await axios.get(`${BASE_URL}/getRoute/someRoute`);
       }
		catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data).toHaveProperty('error')
        }

        

    })
})
    describe("routeToString",  () =>{
        
        
        test("That correct data is returned", async () => {
        testFile = "uk.json"
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                }
            ]
        }

        const testedRoute = mockData.routes[1]
        const routeString = JSON.stringify(testedRoute)  

        let response = await axios.get(`${BASE_URL}/routeToString/${routeString}`);

        expect(response.data).toBeDefined();
        expect(typeof response.data).toBe('string');
        expect(response.data).toContain(`ROUTE: Route Two`)
        })
    

        test("That mile count is not implemented if distanceToNext is null", async() => {
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stationName: "Stop One", distanceToNext: null}, {stationName: "Stop Two", distanceToNext: null}, {stationName: "Stop Three", distanceToNext: null}]
                }
            ]
        }

        const testedRoute = mockData.routes[1]
        const routeString = JSON.stringify(testedRoute)  

        let response = await axios.get(`${BASE_URL}/routeToString/${routeString}`);
        expect(typeof response.data).toBe('string');
        expect(response.data).toContain(`\nTotal Route Distance: 0`)
        })

        test("Tests that error is correctly output when valid", async() =>{
            let mockData = {
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stationName: "Stop One", distanceToNext: null}, {stationName: "Stop Two", distanceToNext: null}, {stationName: "Stop Three", distanceToNext: null}]
                }
            ]
        }

    try {
        let response = await axios.get(`${BASE_URL}/routeToString/food`);
		
		
	    } catch (error) {
            expect(error.response).toBeDefined();
		    expect(error.response.status).toBe(500);
	        expect(error.message).toEqual("Request failed with status code 500");
	    }

            
        })
    })
    describe("Tests for routeDistance endpoint", () => {
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                }
            ]
        }
        test("That correct miles are output", async() => {
        const testedRoute = mockData.routes[1]
        const routeString = JSON.stringify(testedRoute)         

        let response = await axios.get(`${BASE_URL}/routeDistance/${routeString}`);
        
        expect(response.data).toContain(`Distance of Line as calculated: 150`)

        })

        test("That mile count is not implemented if distanceToNext is null", async() => {
        mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stationName: "Stop One", distanceToNext: 50}, {stationName: "Stop Two", distanceToNext: 50}, {stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stationName: "Stop One", distanceToNext: null}, {stationName: "Stop Two", distanceToNext: null}, {stationName: "Stop Three", distanceToNext: null}]
                }
            ]
        }

        const testedRoute = mockData.routes[1]
        const routeString = JSON.stringify(testedRoute)  
        

        let response = await axios.get(`${BASE_URL}/routeDistance/${routeString}`);
        expect(typeof response.data).toBe('string');
        expect(response.data).toContain(`Distance of Line as calculated: 0`)

        })
    })
    describe("Tests for routeDistance endpoint", () => {
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stop: 1, stationName: "Stop One", distanceToNext: 50}, {stop: 2, stationName: "Stop Two", distanceToNext: 50}, 
                        {stop: 3, stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stop: 1, stationName: "Stop One", distanceToNext: 50}, {stop: 2, stationName: "Stop Two", distanceToNext: 50}, 
                        {stop: 3, stationName: "Stop Three", distanceToNext: 50}]
                }
            ]
        }



        test("Tests the that correct data is output with correct inputs", async() =>{
            const testedRoute = mockData.routes[1]
            const routeString = JSON.stringify(testedRoute) 
            startStop = "Stop One";
            endStop = "Stop Two";
            let response = await axios.get(`${BASE_URL}/getDistanceBetweenStops/${routeString}\
            ?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain('50 miles')

        })

        test("Tests the output with the station order reversed", async() => {
            const testedRoute = mockData.routes[1]
            const routeString = JSON.stringify(testedRoute) 
            startStop = "Stop Two";
            endStop = "Stop One";
            let response = await axios.get(`${BASE_URL}/getDistanceBetweenStops/${routeString}\
            ?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain('50 miles')
        })
        test("Tests the output with null miles", async() => {
            let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stop: 1, stationName: "Stop One", distanceToNext: 50}, {stop: 2, stationName: "Stop Two", distanceToNext: 50}, 
                        {stop: 3, stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stop: 1, stationName: "Stop One", distanceToNext: null}, {stop: 2, stationName: "Stop Two", distanceToNext: null}, 
                        {stop: 3, stationName: "Stop Three", distanceToNext: null}]
                }
            ]
            }

            const testedRoute = mockData.routes[1]
            const routeString = JSON.stringify(testedRoute) 
            startStop = "Stop One";
            endStop = "Stop Two";
            let response = await axios.get(`${BASE_URL}/getDistanceBetweenStops/${routeString}\
            ?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain('NaN miles')
        })
        test("Tests the output with invalid station", async() => {
            const testedRoute = mockData.routes[1]
            const routeString = JSON.stringify(testedRoute) 
            startStop = "Stop Seven";
            endStop = "Stop One";
            let response = await axios.get(`${BASE_URL}/getDistanceBetweenStops/${routeString}\
            ?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain('No direct route found')
        })
    })

    describe("Tests for findRoute endpoint", () => {
        let mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stop: 1, stationName: "Stop One", distanceToNext: 50}, {stop: 2, stationName: "Stop Two", distanceToNext: 50}, 
                        {stop: 3, stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stop: 1, stationName: "Apple", distanceToNext: 50}, {stop: 2, stationName: "Pear", distanceToNext: 50}, 
                        {stop: 3, stationName: "Orange", distanceToNext: 50}]
                }
            ]
        }

        test("Tests for the correct output when correct input is given", async() => {

            const routeString = JSON.stringify(mockData) 
            startStop = "Apple";
            endStop = "Orange";
            fs.readFileSync.mockReturnValue(routeString);
            await axios.get(`${BASE_URL}/fileName/uk.json`)
            let response = await axios.get(`${BASE_URL}/findRoute?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain(" stops")

        })

        test("Tests for the correct output when correct input is given and when endStop is the first station", async() => {

            const routeString = JSON.stringify(mockData) 
            startStop = "Orange";
            endStop = "Apple";
            fs.readFileSync.mockReturnValue(routeString);
            await axios.get(`${BASE_URL}/fileName/uk.json`)
            let response = await axios.get(`${BASE_URL}/findRoute?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain(" stops")

        })

        test("Tests for when distanceToNext is null", async() => {
            mockData = {
            name: "UK Railway",
            routes: [
                {
                    name: "Route One",
                    color: "blue",
                    stops: [{stop: 1, stationName: "Stop One", distanceToNext: 50}, {stop: 2, stationName: "Stop Two", distanceToNext: 50}, 
                        {stop: 3, stationName: "Stop Three", distanceToNext: 50}]
                },
                {
                    name: "Route Two",
                    color: "green",
                    stops: [{stop: 1, stationName: "Apple", distanceToNext: null}, {stop: 2, stationName: "Pear", distanceToNext: null}, 
                        {stop: 3, stationName: "Orange", distanceToNext: null}]
                }
            ]
            }
            const routeString = JSON.stringify(mockData) 
            startStop = "Orange";
            endStop = "Apple";
            fs.readFileSync.mockReturnValue(routeString);
            await axios.get(`${BASE_URL}/fileName/uk.json`)
            let response = await axios.get(`${BASE_URL}/findRoute?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain(" NaN miles")

        })

            test("Tests for when one stop is not in route", async() => {

            const routeString = JSON.stringify(mockData) 
            startStop = "Apple";
            endStop = "Bannana";
            fs.readFileSync.mockReturnValue(routeString);
            await axios.get(`${BASE_URL}/fileName/uk.json`)
            let response = await axios.get(`${BASE_URL}/findRoute?start=${startStop}&end=${endStop}`)

            expect(response.data).toContain("No direct route")

        })
    })    

    describe("Tests for shutdown function", ()=>{
        mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
        throw new Error(`Process exited with code: ${code}`);});
        test("Tests that shutdown signal is correctly sent", async() => {
            response = await axios.get(`${BASE_URL}/quit`)
            expect(mockExit).toHaveBeenCalledWith(0);

        })
    })
})  
