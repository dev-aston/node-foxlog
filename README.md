# node-foxlog

W3C formatted Access log parser.

# Presentation
This app consumes an actively written-to access.log file, and displays every 10 seconds statistics of the trafic for the last 10 seconds. 

The statistics are, by section :
-   The most visited sections
-   The number of visits per section
-   The error ratio per section

The statistics can be consulted on :
-   **The console outuput** : Statistics and alerts are displayed in the console every 10sec.
-   **In a web page on http://localhost:3000** : Statistics and alerts are pushed every 10sec via socket.io

The app monitors the average traffic load for the last 2 minutes. If the average exceeds a threshold, the app displays an alert message. When the average goes below the threshold, a recovery message is displayed.
The alerts messages persistent for historical reasons.
The default threshold value is 10, and can be overrided by environment variables.

# Getting Started
## Installation

## Env variables
The default access.log file parsed is /tmp/access.log.
You can override this location by passing ENV variable to the app

    # Passing LOG_PATH env variable
    LOG_PATH="/path/to/access/log/file" npm start
    # Passing ALERT_THRESHOLD env variable
    ALERT_THRESHOLD="4.5" npm start
The path can be relative or absolute

For testing purposes, a routine has been added to populate the access.log consistently during the app execution.
You can enable it by passing the POPULATE_LOGS env variable.

## Run localy
Make sure you have node.js ans npm installed. Then in this directory :

    # To install dependencies
    npm install
    # Run app
    npm start

Sample output in the console :
```
-
Load check, threshold set to 3.3 (last 10 events):
High traffic generated an alert - hits = 3.35, triggered at 03/04/2020 15:54:44
-
Report (last 10 seconds): 
-----------------+---------------+-------------
 Section  	 | Visits    | Error ratio
-----------------+---------------+-------------
 /users      | 10		 | 50%
 /fox    	 | 8		 | 37.5%
 /tyler  	 | 8		 | 62.5%
 /posts  	 | 6		 | 50%
 /marla  	 | 5		 | 60%
 /terms  	 | 4		 | 50%
-----------------+---------------+-------------
Average req/s last 120sec: 4.43 (threshold : 3.3)
```
You can access the report web page at the address : http://localhost:3000

## Run in Docker
You can build a docker image to run the app in a container.

    # Build the app
    docker build -t <tag> .
    # Run the container
    docker run -p <local_port>:3000 -d <tag>


You can refer to the [Docker documentation](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file "Docker documentation") to pass env variables to the container. 

### Console output in docker
You can monitor the console output in the container

    # Log container output
    docker logs -f <cotainer_id>

### Access the report page
If you choose to redirect a local port to the container, you can access the report page on http://localhost:<local_port>

## Test

    # To install mocha
    npm install -g mocha

Then in this directory :

    # Run tests with mocha
    mocha

## Follow Up
### Data
Data is not stored in any database what so ever, nor visualized over time.
A TSBD like InfluxDB could be used along with a graph tool such as grafana to provide a better reporting plateform.

More data could be used or displayed in the stats (source IP...)

### Services
This app could be part of a monitoring infrastructure.
Having it warn a load balancer for example to scale in realtime.