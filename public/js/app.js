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

  $.ajax({
    url: '/search/',
    type: 'get',
    dataType: 'html'
  })
    .then(recentsList => {
      console.log(recentsList);
      $('#recents').append(recentsList);
    })
    .catch(error => {
      console.log('error: ' + error);
    });

  return false;


})
