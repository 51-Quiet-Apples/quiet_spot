/* eslint-disable no-unused-vars */
'use strict';

// ----- dependencies -----
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();


// ----- spin up the server -----
const app = express();
const PORT = process.env.PORT || 3001;


// ----- database client -----
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));


// ----- middleware -----
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));


// ----- templates -----
app.set('view engine', 'ejs');


// ----- error handling -----
function errorHandler(error, request, response) {
  console.error(error);
  response.status(500).render('pages/error');
}


// ----- Routes -----
app.get('/', (request, response) => response.render('pages/index'));

app.get('/about', (request, response) => response.render('pages/about'));

app.get('/search/', getSearches );

app.post('/search', getLatLong);

app.post('/favorites/:places_id', saveFavorite );

app.get('/favorites/', getFavorites );

app.get('/searches/', getSearches );

app.get('/details/:places_id', detailCafe);

app.get('/favorites/delete/:places_id', deleteFavorite );

// ----- default route -----
app.get('*', (request, response) => console.log('hitting * route here!'));

app.listen(PORT, () => console.log(`listening on port ${PORT}` ));

let lat = 0;
let lng = 0;
let cafes = [];
let filteredCafes = [];
let listWithQuietScore = [];


//function to find the longitude and latitude of the city using Google Geocode API
function getLatLong(request, response) {
  const searchQuery = request.body.searchquery;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GOOGLE_API_KEY}`;

  superagent
    .get(url)
    .then(result => {
      lat = result.body.results[0].geometry.location.lat;
      lng = result.body.results[0].geometry.location.lng;
      saveSearch(searchQuery, lat, lng);
      allCafes(lat,lng, request, response);
    })
    .catch(error => errorHandler(error, request, response));
}


function saveSearch(searchQuery, lat, lng) {

  const sql = `INSERT INTO searches (query, lat, long) VALUES ($1, $2, $3);`;
  const values = [searchQuery, lat, lng];

  client.query(sql, values)
}


function saveFavorite(request, response) {

  filteredCafes.forEach(cafe => {
    if (cafe.places_id === request.params.places_id) {
      const sql = 'INSERT INTO favorites (name, address, rating, photo, places_id) VALUES ($1, $2, $3, $4, $5);';
      const values = [cafe.name, cafe.address, cafe.rating, cafe.photo, cafe.places_id];

      client.query(sql, values)
        .then( response.redirect('/') )
    }
    else {console.log('🔥🔥🔥🔥🔥🔥 Save to DB Failed 🔥🔥🔥🔥🔥🔥')}
  })
}


function getFavorites(request, response){
  const sql = 'SELECT * FROM favorites;';
  client
    .query(sql)
    .then(result => response.render('partials/favorites', {data:result.rows}))
}

function deleteFavorite(request, response){
  const sql = 'DELETE FROM favorites WHERE places_id=$1;';
  let values = [request.params.places_id];
  client.query(sql, values)
    .then( response.redirect('/') )
    .catch(error => errorHandler(error, response))
}


function getSearches(request, response){
  const sql = 'SELECT * FROM searches ORDER BY id DESC LIMIT 10;';
  client.query(sql)
    .then(result => {
      response.render('partials/recent-searches', {data:result.rows})
    })
}


//function to list all Cafes from Google API
//function will search places API and get results of all Cafes in the specified area
//store cafe address (along with other info) in an array of objects
function allCafes(lat, lng, request, response) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=cafe&key=${process.env.GOOGLE_API_KEY}`;

  superagent
    .get(url)
    .then(result => {
      cafes = result.body.results.map(resultObj => new Cafe(resultObj))
      allEventLocations(request, response);
    })
    .catch(error => errorHandler(error, response));
}


function Cafe(resultObj){
  this.name = resultObj.name;
  this.rating = resultObj.rating;
  this.address = resultObj.vicinity;
  this.photo = resultObj.photos ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${resultObj.photos[0].photo_reference}&maxheight=500&key=${process.env.GOOGLE_API_KEY}` : 'https://via.placeholder.com/500';
  this.places_id = resultObj.id;
  this.count = 0;
  this.quietScore = 0;
}


//function to list all Eventbrite event locations in the same specified area of today
//store event locations in an array
function allEventLocations(request, response){
  const url = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${lng}&location.latitude=${lat}&location.within=2km&start_date.keyword=today&expand=venue&token=${process.env.EVENTBRITE_PUBLIC_TOKEN}`;

  superagent
    .get(url)
    .then(result => result.body.events.map(resultObj => new EventLatLong(resultObj)))
    .then(result => cafesNearEvent(result, response))
    .catch(error => errorHandler(error, response))
}


function EventLatLong(resultObj){
  this.lat = resultObj.venue.latitude;
  this.lng = resultObj.venue.longitude;
}

//function to list all Cafes near Eventbrite locations from Google API
//store cafe locations in an array
function cafesNearEvent(arr, response){
  const promises = [];
  arr.forEach(location => {
    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=200&type=cafe&key=${process.env.GOOGLE_API_KEY}`;

    promises.push(superagent
      .get(url)
      .then(result => result.body.results.map(resultObj => new Cafe(resultObj)))
      .catch(error => console.log('heyyyy', error)))
  })
  Promise
    .all(promises)
    .then(result => result.reduce((acc, cur) => acc.concat(cur), []))
    .then(result => {
      const listWithOverlaps  = cafes.concat(updateCount(removeOverLaps(result), checkOverLaps(result)));
      const listNoOverlaps = removeOverLaps(listWithOverlaps);
      listWithQuietScore = (updateQuietScore(listNoOverlaps).sort((a, b) => (a.quietScore < b.quietScore) ? 1 : -1)).slice(0, 25);
      response.render('pages/searchresults', {data: listWithQuietScore} );
    })
    // .then(result => console.log(cafes.filter(cafe => !result.includes(cafe.address))));
}

function checkOverLaps(arr){
  const result = {};
  for (let i = 0; i < arr.length; i++){
    result[arr[i].address] = (result[arr[i].address] || 0) + 1
  }

  const pairCounted = Object.keys(result).map(key => ({
    address: key,
    count: result[key]
  }))
  return pairCounted;
}


function removeOverLaps(arr){
  return arr.reduce((unique, o) => {
    if(!unique.some(obj => obj.address === o.address)) {
      unique.push(o);
    }
    return unique;
  },[]);
}

function updateCount(arr1, arr2){
  return arr1.map(cafe => {
    for(let i = 0; i < arr2.length; i++) {
      if(cafe.address === arr2[i].address) {
        cafe.count = arr2[i].count;
      }
    }
    return cafe;
  })
}

function updateQuietScore(arr){
  const max = arr.reduce((max, cur) => Math.max(max, cur.count), arr[0].count);
  return arr.map(cafe => {
    cafe.quietScore = 5 - 5 * cafe.count / max;
    return cafe;
  })
}

//details page
function detailCafe (request, response) {
  listWithQuietScore.forEach(cafe => {
    if(cafe.places_id === request.params.places_id) {
      return response.render('pages/detail', {data:cafe})
    }
  })
}

