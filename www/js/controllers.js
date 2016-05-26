angular.module('starter.controllers', [])

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('LoginCtrl', function($scope, $state, Users, $ionicLoading, $ionicPopup) {
  $scope.login = function(user){
    $ionicLoading.show({
      template: 'Logging In'
    });
    Users.login({
      email: user.email.$modelValue,
      password: user.password.$modelValue
    }, function(authData){
      $ionicLoading.hide();
      $state.go('tab.map');
    }, function(error){
      $ionicLoading.hide();
      $ionicPopup.alert({
          title:'Login Failed',
          template: error
        })
    });
  };
  
  $scope.signup = function(user){
    $ionicLoading.show({
      template: 'Signing In'
    });
    Users.signup({
      email: user.email.$modelValue,
      password: user.password.$modelValue
    }, function(userData){
      $ionicLoading.hide();
      $ionicPopup.alert({
          title:'Sign-Up Successful',
          template: 'Welcome to Viron!'
        })
    }, function(error){
      $ionicLoading.hide();
      $ionicPopup.alert({
          title:'Sign-Up Failed',
          template: error
        })
    });
  };
  
  $scope.resetPassword = function(user){
    $ionicLoading.show({
      template: 'Sending reset email...'
    });
    Users.resetPassword(user.email.$modelValue, function(userData){
      $ionicLoading.hide();
      $ionicPopup.alert({
          title:'Success',
          template: 'Email Sent!'
        })
    }, function(error){
      $ionicLoading.hide();
      $ionicPopup.alert({
          title:'Failed',
          template: error
        })
    });
  };
})

.controller('AccountCtrl', function($scope, $state, Users) {
  $scope.logout = function () {
    Users.logout();
    $state.go('login');
  };
  $scope.community_points = 0;
  var user = Users.getUserObject();
  user.$loaded(function(data){
    $scope.community_points = data.community_points;
  });
  $scope.settings = {
    enableFriends: true
  };
})

.controller('CameraCtrl', function ($scope, $state, Posts, $ionicPopup, $ionicHistory, $cordovaCamera, $cordovaGeolocation){
  $scope.takePhoto = function () {
    var options = {
        quality : 75,
        destinationType : 0,
        sourceType : 1,
        encodingType: 0,
        allowEdit: false,
        targetWidth: 350,
        targetHeight: 250,
        saveToPhotoAlbum: false,
        correctOrientation: true
    };
  
    $cordovaCamera.getPicture(options).then(function(imageData) {
      var image_source = "data:image/jpeg;base64," + imageData;
      var img = document.getElementById('myImage');
      var input_src = document.getElementById('img_src');
      img.src = image_source;
      if ($scope.post)
      {
        $scope.post.img = image_source;
      }
      else
      {
        $scope.post = {
          img: image_source
        };
      }
    }, function(error) {
      $state.go('tab.posts');
    });
  };
  
  $scope.createPost = function(post) {
    console.log(post)
    var newPost = {
      face: 'https://api.adorable.io/avatars/150/' + Math.random() + '@adorable.io.png',
      title: post.title,
      caption: '',
      latitude: 0.00000,
      longitude: 0.00000,
      date_created: -Date.now(),
      images: [
        {
          src: post.img,
          caption: post.caption 
        }
      ],
      comments: []
    };
    var options = {
      timeout: 5000,
      enableHighAccuracy: false,
      maximumAge: Infinity
    }
    var positionSuccess = function(position){
      newPost.latitude = position.coords.latitude;
      newPost.longitude = position.coords.longitude;
      
      //send to server
      var posts = Posts;
      if(!posts.push(newPost))
      {
        $state.go('login');
      }
      $state.go('tab.posts');
    };
    $cordovaGeolocation.getCurrentPosition(options)
      .then(positionSuccess,
      function () {
        $ionicPopup.alert({
          title:'Post Failed',
          template: 'Cannot complete post because geolocation failed.'
        })
      });
  };
},
function() {
  $ionicHistory.backView();
})

.controller('MapCtrl', function($scope, $stateParams, Posts, $ionicPopup, $cordovaGeolocation) {
  $scope.initMap = function () {
    var myLatlng = new google.maps.LatLng(13.1704468,-59.6357891); //Sandy Lane Golf Course lol

    var mapOptions = {
      center: myLatlng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    document.getElementById("map").innerHTML = "";
    var map = new google.maps.Map(document.getElementById("map"),mapOptions);
    var heatmap = new google.maps.visualization.HeatmapLayer(
      {
        map: map,
        radius: 20
      }
    );
    var posts = Posts.all();
    posts.$loaded().then(function (all_posts) {
      var positions = [];
      angular.forEach(all_posts, function (post){
        positions.push(new google.maps.LatLng(post.latitude, post.longitude));
      });
      
      heatmap.set('data', positions);
    })
    
    $scope.map = map;
    $scope.heatmap = heatmap;
    
    var positionSuccess = function (pos) {
      var geoPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map.setCenter(geoPos);
      var myLocation = new google.maps.Marker({
          position: geoPos,
          map: map,
          title: "You Are Here!"
      });
    };
    
    var positionFailed = function (error) {
      $ionicPopup.alert({
        title: 'Well this is embarrassing',
        template: error.message
      })
    };
    var options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: Infinity
    };
    $cordovaGeolocation.getCurrentPosition(options)
      .then(positionSuccess,
      function () {
        navigator.geolocation.getCurrentPosition(
          positionSuccess,
          positionFailed,
          options
        );
      });
  };
  
  $scope.centerOnMe = function() {
      if(!$scope.map) {
          return;
      }

      navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
  };
})

.controller('PostsCtrl', function($scope, $state, Posts) {
  $scope.commentCount = function(comments) {
    if (!comments || comments == undefined)
      return 0;
    return Object.keys(comments).length;
  };
  
  $scope.getDate = function (time){
    var d = new Date(-time);
    var months = [
      'January',
      'February',
      'March',
      'April',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    
    var year = d.getFullYear();
    var month = months[d.getMonth()-1];
    var date = d.getDate();
    var time = date + ' ' + month + ', ' + year;
    return time;
  }
  
  $scope.createComment = function(comment, key) {
    console.log(comment);
    if (!Posts.pushComment(comment.postid.$modelValue, {
      title: comment.ctitle.$modelValue ? comment.ctitle.$modelValue : '',
      caption: comment.caption.$modelValue
    })){
      $state.go('login');
    }
    
    if (!$scope.comment_sent)
      $scope.comment_sent = [];
    $scope.comment_sent[key] = true;
  };
  var postsDb = Posts.all();
  
  postsDb.$loaded().then(function(posts) {
    $scope.posts = posts;
    console.log(posts)
  });
});
