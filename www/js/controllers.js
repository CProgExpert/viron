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

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('CameraCtrl', function ($scope, Posts, $ionicPopup, $ionicHistory, $cordovaCamera, $cordovaGeolocation){
  
   $scope.takePhoto = function() {
      var options = {
          quality : 75,
          destinationType : 0,
          sourceType : 1,
          encodingType: 0,
          allowEdit: false,
          targetWidth: 250,
          targetHeight: 350,
          saveToPhotoAlbum: false,
          correctOrientation: false
      };

      //TODO: Attach this to a comment
      $cordovaCamera.getPicture(options).then(function(imageData) {
        var image_source = "data:image/jpeg;base64," + imageData;
        var img = document.getElementById('myImage');
        var input_src = document.getElementById('img_src');
        img.src = image_source;
        input_src.value = image_source;
      }, function(error) {
        $ionicHistory.backView();
      });
  };
  
  $scope.createPost = function(post) {
    console.log(JSON.stringify(post));
    var newPost = {
      face: 'https://api.adorable.io/avatars/150/' + Math.random() + '@adorable.io.png',
      title: post.title,
      caption: post.caption,
      latitude: 0.00000,
      longitude: 0.00000,
      date_created: -Date.now(),
      images: [
        {
          src: post.img,
          caption: '' 
        }
      ],
      comments: []
    };
    
    var options = {
      timeout: 5000,
      enableHighAccuracy: false
    }
    var positionSuccess = function(position){
      newPost.latitude = position.coords.latitude;
      newPost.longitude = position.coords.longitude;
      
      //send to server
      var posts = Posts;
      posts.push(newPost);
      $scope.go('tab.posts');
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

.controller('MapCtrl', function($scope, $stateParams, Posts, $ionicPopup) {
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
    
    setTimeout(function() { // Async call
      navigator.geolocation.getCurrentPosition(
        positionSuccess,
        positionFailed,
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity
        }
      );
    }, 0);
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

.controller('PostsCtrl', function($scope, Posts) {
  var posts = Posts
  $scope.posts = posts.all();
  /*[
    {
      face: 'img\\adam.jpg',
      title: 'Lucka dis mess',
      caption: 'Wanna think it right',
      date: '24 May, 2016'
    },
    {
      face: 'img\\ben.png',
      title: 'As I walk to town',
      caption: 'Wanna think it right',
      date: '24 May, 2016'
    },
    {
      face: 'img\\adam.jpg',
      title: 'Out day by de warth',
      caption: 'Wanna think it right',
      date: '24 May, 2016'
    },
    {
      face: 'img\\max.png',
      title: 'It smell bad',
      caption: 'Wanna think it right',
      date: '24 May, 2016'
    },
  ];*/
});
