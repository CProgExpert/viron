angular.module('starter.services', [])

.factory('Posts', function ($firebaseArray) {
  var postsRef = new Firebase('https://environ-test.firebaseio.com/posts');
  var _posts = $firebaseArray(postsRef.orderByChild('date_created'));
  return {
    all: function(){
      return _posts;
    },
    push: function(post){
      postsRef.push().set(post);
    }
  }
})

.factory('HeatMap', function(){
  var points = [
    new google.maps.LatLng(13.13442,-59.6304048),
    new google.maps.LatLng(13.13442,-59.6303048),
    new google.maps.LatLng(13.13442,-59.6302048),
    new google.maps.LatLng(13.134242,-59.6301048),
    new google.maps.LatLng(13.134242,-59.6301048),
    new google.maps.LatLng(13.134242,-59.6301048),
    new google.maps.LatLng(13.134842,-59.6301038),
    new google.maps.LatLng(13.134642,-59.6301028),
    new google.maps.LatLng(13.134642,-59.6301028),
    new google.maps.LatLng(13.134442,-59.6301018),
    new google.maps.LatLng(13.134442,-59.6301018),
    new google.maps.LatLng(13.134442,-59.6301018),
    new google.maps.LatLng(13.134442,-59.6301018),
  ];
  return {
    all: function () {
      return points;
    }
  };
});