'use strict';

// ----- dependencies -----
const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');

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
function errorHandler(error, request, respnse) {
  console.error(error);
  response.status(500).render('pages/error');
}

// ----- Routes -----
app.get('/', (request, response) => console.log('homepage route here'));

// ----- default route -----
app.get('*', (request, response) => console.log('hitting * route here!'));

app.listen(PORT, () => console.log(`listening on port ${PORT}` ));
