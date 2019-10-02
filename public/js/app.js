'use strict';

console.log('app.js reporting');

$(document).ready(function () {

  //   $('#favorites').append('derp');

  $.ajax({
    url: '/favorites/',
    type: 'get',
    dataType: 'html'
  })
    .then(favoritesList => {
      console.log(favoritesList);
      $('#favorites').append(favoritesList);
    })
    .catch(error => {
      console.log('error: ' + error);
    });

  return false;


})
