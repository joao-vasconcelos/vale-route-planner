'use strict';

/* * * * * */
/* VALE ROUTE PLANNER */
/* * */

/* * */
/* IMPORTS */
//const config = require("config");
const fs = require('fs');
const config = require('config');
const spreadsheetAPI = require('./services/spreadsheetAPI');

/* * */
/* At program initiation all stores are retrieved from the database */
/* and, for each store, orders are retrieved from Square API. */
/* Each order is formated into a Transaction and saved to the database. */
(async () => {
  // Store start time for logging purposes
  const startTime = process.hrtime();

  console.log('****************************************');
  console.log(new Date().toISOString());
  console.log('****************************************');

  console.log();
  console.log('Starting...');
  console.log();

  const rows = await spreadsheetAPI.getRows();

  let vehiclesList = [];
  let jobsToBeOptimized = [];
  let capacity = 0;
  let vehicleID = 1;
  let jobID = 1;
  let serviceDuration = 0;

  for (const row of rows) {
    // If place doesn't need to be visited
    if (Number(row.pickup) < 1 && Number(row.delivery) < 1) continue;

    // Create New Vehicle if capacity exceeds
    if (capacity > config.get('settings.vehicle-capacity') || vehicleID == 1) {
      vehiclesList.push({
        id: Number(vehicleID++),
        start: config.get('settings.starting-location'),
        end: config.get('settings.starting-location'),
        capacity: [config.get('settings.vehicle-capacity')],
      });
      capacity = 0;
    }

    // Save the Job
    jobsToBeOptimized.push({
      id: Number(jobID++),
      description: row.description,
      service: Number(row.service),
      delivery: [Number(row.delivery)],
      pickup: [Number(row.pickup)],
      location: [Number(row.lon), Number(row.lat)],
    });
    capacity += Number(row.pickup);
    serviceDuration += Number(row.service);
  }

  const fileData = {
    vehicles: vehiclesList,
    jobs: jobsToBeOptimized,
  };

  console.log('• Saving data to file.');

  const filename = 'route-1.json';
  const data = JSON.stringify(fileData);
  fs.writeFile(filename, data, 'utf8', function (err) {
    if (err) {
      console.log('! An error occured while writing JSON to File.');
      return console.log(error);
    }
    console.log('• File has been created.');
  });

  console.log();
  console.log('- - - - - - - - - - - - - - - - - - - -');
  console.log('Done!');
  console.log('Number of Vehicles: ' + vehiclesList.length);
  console.log('Number of Jobs: ' + jobsToBeOptimized.length);
  console.log('Total service duration: ' + serviceDuration / 60 + ' minutes.');
  console.log('- - - - - - - - - - - - - - - - - - - -');
  console.log();
  console.log('- - - - - - - - - - - - - - - - - - - -');
  console.log('Shutting down...');
  console.log('Operation took ' + getDuration(startTime) / 1000 + ' seconds.');
  console.log('- - - - - - - - - - - - - - - - - - - -');
  console.log();
})();

/* * */
/* Returns a time interval for a provided start time. */
const getDuration = (startTime) => {
  const interval = process.hrtime(startTime);
  return parseInt(
    // seconds -> miliseconds +
    interval[0] * 1000 +
      // + nanoseconds -> miliseconds
      interval[1] / 1000000
  );
};
