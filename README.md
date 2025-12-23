# CS253 Project 3: Railway API
By Elijah McCray, and Noah Prohl

This project uses user input from the command line to fetch and display information about railway
systems from JSON files in the provided_data_sets folder using a client/server system and includes
testing files for every client and railway file except for routeSummary files.

# The project is split into three different groups:
    1. The Network API
    2. The RouteSummary API
    3. The BestJourneys API
    4. The Route API
    5. Testing




# Dependencies

## Ensure Axios and Express are Installed
    1. npm install axios
    2. npm install express

## 1. The Network API:
    This API provides basic information about the selected railway, including:
        1. The network name
        2. The number of routes on the network, and then object type of the routes
        3. The route name(s) as an array
        4. The route name(s) as a string
        5. The numbner of stations on the network
        6. A list of stations, and their distance from the start

    In order to use the Network API, you have two options:
        1. Open two shells.
        2. Navigate to the directory containing the .js files (project1).
        3. In the first shell, type "node railway_network.js".
        4. In the second shell, type "node client_network.js (file name here)".
            for the file name, you can either include, or exclude .json
            ex) "simpleton.json" or just "simpleton"
        5. You should now have an output on the client shell.
            As a note, you do NOT need to stop the server after each test is done, the client
            automatically sends a request to shutdown the server after the last test is done.

        or

        1. Open a shell.
        2. Navigate to the directory containing the .js files (project1).
        3. Type "node railway_network.js &".
            this will run the railway_network server in the background.
        4. Type "node client_network.js (file name here)".
            for the file name, you can either include, or exclude .json
            ex) "simpleton.json" or just "simpleton"
        5. You shold now have an output in your shell.
            As a note, you do NOT need to stop the server after each test is done, the client
            automatically sends a request to shutdown the server after the last test is done.

## 2. The RouteSummary API:
        This API provides a summary of all the routes in the selected railway, including:
        1. The route name
        2. The starting station
        3. The ending station
        4. The total distance of the route in miles
        5. The ability to sort the routes either by name (ascending or descending)
        6. The ability to sort the routes by total length (ascending or descending)

    In order to use the RouteSummary API, you have two options:
        1. Open two shells.
        2. Navigate to the directory containing the .js files (project1).
        3. In the first shell, type "node railway_routeSummary.js".
        4. In the second shell, type "node client_routeSummary.js (file name here)".
            For the file name, you can either include, or exclude .json
            ex) "uk.json" or just "uk"
        5. You should now have an output on the client shell that lists the route summaries
        and shows the results of the sort tests.
        6. As a note, you do NOT need to stop the server after each test is done, the client
        automatically sends a request to shutdown the server after the last test is done.

## 3. The BestJourneys API
        This API provides a summary of all the routes in the selected railway, including:  
    1. The route name  
    2. The starting station  
    3. The ending station  
    4. The total distance of the route in miles  
    5. The ability to sort the routes either by name (ascending or descending)  
    6. The ability to sort the routes by total length (ascending or descending)  

        In order to use the RouteSummary API, you have two options:  
    1. Open two shells.  
    2. Navigate to the directory containing the `.js` files (project1).  
    3. In the first shell, type `node railway_routeSummary.js`.  
    4. In the second shell, type `node client_routeSummary.js (file name.json)`.  
        **Note:** You must include the `.json` file extension for the dataset to load correctly.  
        Example: `node client_routeSummary.js uk.json`  
    5. You should now have an output on the client shell that lists the route summaries  
       and shows the results of the sort tests.  
    6. As a note, you do **not** need to stop the server after each test is done—the client  
       automatically sends a request to shut down the server after the last test is done.  
       
## 4. The Route API:
    This API provides basic information about the selected railway, including:
        1. The route you have selected
        2. The route name, along with the route color and a list of all the stations that 
        make up the route you have selected, and their distance from the start of the route.
        3. The total distance of the selcted route.
        4. (Optionally) the distance and number of stops between two stations on the selected line
        5. (Optionally) the distance and number of stops between two stations on any network.

    In order to use the Route API, you have two options:
        1. Open two shells.
        2. Navigate to the directory containing the .js files (project1).
        3. In the first shell, type "node railway_route.js".
        4. If you just want to view the non-optional Tests, in the second shell type:
            "node client_route.js (file name here) (route name here)".
           If you want to view the optional tests too, in the second shell type:
            "node client_route.js (file name here) (route name here) (first stop here) (second stop here)"
            For the file name, you can either include, or exclude .json
            ex) "simpleton.json" or just "simpleton"
        5. You should now have an output on the client shell.
            As a note, you do NOT need to stop the server after each test is done, the client
            automatically sends a request to shutdown the server after the last test is done.

        or

        1. Open a shell.
        2. Navigate to the directory containing the .js files (project1).
        3. Type "node railway_route.js &".
            this will run the railway_route server in the background.
        4. If you just want to view the non-optional Tests, type:
            "node client_route.js (file name here) (route name here)".
           If you want to view the optional tests too, type:
            "node client_route.js (file name here) (route name here) (first stop here) (second stop here)"
            For the file name, you can either include, or exclude .json
            ex) "simpleton.json" or just "simpleton"
        5. You should now have an output on the client shell.
            As a note, you do NOT need to stop the server after each test is done, the client
            automatically sends a request to shutdown the server after the last test is done.

## 5. Test Installation

1. Initialize the project: npm init
2. When asked for test command enter "jest"
3. Install jest as a dev dependancy using: npm install --save-dev jest            

## 6. Testing

    1. This project uses jest for testing and code coverage
    *Note: Tests are implemented for all files except client_routeSummary and railway_routeSummary
    2. To run tests enter: "npm run test:coverage" into the command line. (Without the quotes)
