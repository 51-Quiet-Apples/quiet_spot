'use strict';

// ----- dependencies -----
const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');
const superagent = require('superagent');

require('dotenv').config();


// ----- spin up the server -----
const app = express();
const PORT = process.env.PORT || 3001;


// ----- middleware -----
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
// doublecheck this bit before using to verify working.
// app.use(methodOverride((request, response) => {
//   if(request.body && typeof request.body === 'object' && '_method' in request.body) {
//     let method = request.body._method;
//     delete request.body._method;
//     return method;
//   }
// }));


// ----- templates -----
app.set('view engine', 'ejs');


// ----- error handling -----
function errorHandler(error, request, response) {
  console.error(error);
  response.status(500).render('pages/error');
}

// ----- Routes -----
app.post('/search', getLatLong);
// app.post('/search', getLatLong);

// app.post('/results', {data: })
app.get('/', (request, response) => response.render('pages/index'));


// ----- default route -----
app.get('*', (request, response) => console.log('hitting * route here!'));

app.listen(PORT, () => console.log(`listening on port ${PORT}` ));

let lat = 0;
let lng = 0;

//function to find the longitude and latitude of the city using Google Geocode API
function getLatLong(request, response) {
  // console.log( request.body.searchquery );
  const searchQuery = request.body.searchquery;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GOOGLE_API_KEY}`;

  superagent
    .get(url)
    .then(result => {
      // console.log(result);
      lat = result.body.results[0].geometry.location.lat;
      lng = result.body.results[0].geometry.location.lng;
      allCafes(lat,lng, request, response);
    })
    .catch(error => errorHandler(error, request, response));
}



//function to list all Cafes from Google API
//function will search places API and get results of all Cafes in the specified area
//store cafe address (along with other info) in an array of objects
function allCafes(lat, lng, request, response) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=cafe&key=${process.env.GOOGLE_API_KEY}`;

  superagent
    .get(url)
    .then(result => {
      const cafes = result.body.results.map(resultObj => new Cafe(resultObj))
      allEventLocations(request, response);
      response.render('pages/searchresults', {data: cafes} )
    })
    .catch(error => errorHandler(error, response));
}

function Cafe(resultObj){
  this.name = resultObj.name;
  this.rating = resultObj.rating;
  this.address = resultObj.vicinity;
}

//function to list all Eventbrite event locations in the same specified area of today
//store event locations in an array

function allEventLocations(request, response){
  const url = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${lng}&location.latitude=${lat}&start_date.keyword=today&expand=venue&token=${process.env.EVENTBRITE_API_KEY}`;

  superagent
    .get(url)
    .then(result => {
      const eventLocations = result.body.events.map(resultObj => new EventLatLong(resultObj))
      cafesNearEvent(eventLocations);
    })
    .catch(error => errorHandler(error, response))
}
function EventLatLong(resultObj){
  this.lat = resultObj.venue.latitude;
  this.lng = resultObj.venue.longitude;
}

//function to list all Cafes near Eventbrite locations from Google API
//store cafe locations in an array

const eventCafes =[];

function cafesNearEvent(eventLocations, response){
  eventLocations.forEach(location => {
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=100&type=cafe&key=${process.env.GOOGLE_API_KEY}`;

    superagent
      .get(url)
      .then(result => result.body.results.forEach(result => console.log(result.vicinity)))
      .catch(error => errorHandler(error, response));
  })
}

//function to filter out Cafe locations that are not in third array
//render to the front end
