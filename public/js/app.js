'use strict';

console.log('app.js reporting');

$(document).ready(function () {

  // get favorites
  $.ajax({
    url: '/favorites/',
    type: 'get',
    dataType: 'html'
  })
    .then(favoritesList => {
      $('#favorites').append(favoritesList);
    })
    .catch(error => {
      console.log('error: ' + error);
    });

  // get recents
  $.ajax({
    url: '/search/',
    type: 'get',
    dataType: 'html'
  })
    .then(recentsList => {
      // console.log(recentsList);
      $('#recents').append(recentsList);

      $('.recent-search').on('click', function(event) {
        event.preventDefault();
        $('#location-search input').val(event.target.text);
        $('#location-search').submit();
      })
    })
    .catch(error => {
      console.log('error: ' + error);
    });


  return false;

})
