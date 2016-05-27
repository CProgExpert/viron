angular.module('starter.controllers', [])

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
      $state.go('lgtab.login');
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
    Users.resetPassword({
      email: user.email.$modelValue
    }, function(userData){
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

.controller('AccountCtrl', function($scope, $state, $ionicPopup, Users) {
  $scope.logout = function () {
    Users.logout();
    $state.go('lgtab.login');
  };
  
  $scope.community_points = 0;
  
  $scope.changePassword = function(cp){
    if (!Users.changePassword({
      oldPassword: cp.password.$modelValue,
      newPassword: cp.newpassword.$modelValue
    },
    function () {
      $ionicPopup.alert({
        title: 'Success',
        template: 'Password Changed!'
      });
    }, function(error){
      $ionicPopup.alert({
        title: 'Password Change Failed',
        template: error
      });
    })){
      $ionicPopup.alert({
        title: 'Password Change Failed',
        template: 'Unexpected error, Please contact the administration.'
      });
    }
  };
  
  var user = Users.getUserObject();
  user.$loaded(function(data){
    $scope.community_points = data.community_points;
  });
  
  $scope.$on('$ionicView.enter', function() {
    var user = Users.getUserObject();
    user.$loaded(function(data){
      $scope.community_points = data.community_points;
    });
  });
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
      $state.go('tab.posts', {}, {reload: true});
    });
  };
  
  $scope.createPost = function(post) {
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
        $ionicPopup.alert({
          title: 'Alert',
          template: 'Your login session has expired.'
        })
        $state.go('lgtab.login');
        return;
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
    $scope.$on('$ionicView.enter', function() {
      var posts = Posts.all();
      posts.$loaded().then(function (all_posts) {
        var positions = [];
        angular.forEach(all_posts, function (post){
          positions.push(new google.maps.LatLng(post.latitude, post.longitude));
        });
        
        heatmap.set('data', positions);
      })
      google.maps.event.trigger($scope.map, "resize");
    });
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

.controller('PostsCtrl', function($scope, $state, Posts, $ionicPopup) {
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
    var month = months[d.getMonth()];
    var date = d.getDate();
    var time = date + ' ' + month + ', ' + year;
    return time;
  }
  $scope.report = function(id){
    if (!Posts.reportPost(id)) {
      $ionicPopup.alert({
        title: 'Alert',
        template: 'Your login session has expired.'
      })
      $state.go('lgtab.login');
      return;
    }
    $ionicPopup.alert({
      title: 'Report',
      template: 'Your report has been sent.'
    })
  };
  
  $scope.createComment = function(comment, key) {
    if (!Posts.pushComment(comment.postid.$modelValue, {
      title: comment.ctitle.$modelValue ? comment.ctitle.$modelValue : '',
      caption: comment.caption.$modelValue
    })){
      $ionicPopup.alert({
        title: 'Alert',
        template: 'Your login session has expired.'
      })
      $state.go('lgtab.login');
      return;
    }
    
    if (!$scope.comment_sent)
      $scope.comment_sent = [];
    $scope.comment_sent[key] = true;
  };
  var postsDb = Posts.all();
  
  postsDb.$loaded().then(function(posts) {
    $scope.posts = posts;
  });
  $scope.$on('$ionicView.enter', function() {
    var posts = Posts.all();
    posts.$loaded().then(function (all_posts) {
      $scope.posts = all_posts;
    })
  });
});
