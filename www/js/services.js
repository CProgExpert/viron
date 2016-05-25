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
});