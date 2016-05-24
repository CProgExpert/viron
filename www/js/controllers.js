angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

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

.controller('CameraCtrl', function ($scope, $stateParams, $cordovaCamera, $cordovaGeolocation){
   $scope.takePhoto = function() {
      var options = {
          quality : 75,
          destinationType : 0,
          sourceType : 1,
          encodingType: 0,
          targetWidth: 250,
          targetHeight: 350,
          saveToPhotoAlbum: false
      };

      //TODO: Attach this to a comment
      $cordovaCamera.getPicture(options).then(function(imageData) {
        var image_source = "data:image/jpeg;base64," + imageData;
        var img = document.getElementById('myImage');
        var input_src = document.getElementById('img_src');
        img.src = image_source;
        input_src.value = image_source;
      }, function(error) {
          console.error(error);
      });
  };
  
  $scope.createPost = function(post) {
    var options = {
      timeout: 5000,
      enableHighAccuracy: false
    }
    $cordovaGeolocation.getCurrentPosition(options)
      .then(function(position){
        post.latitude = position.coords.latitude;
        post.longitude = position.coords.longitude;
        
        //send to server
      });
  };
})

.controller('MapCtrl', function($scope, $stateParams, HeatMap) {

  var myLatlng = new google.maps.LatLng(13.1704468,-59.6357891); //Sandy Lane Golf Course lol

  var mapOptions = {
    center: myLatlng,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  };

  var map = new google.maps.Map(document.getElementById("map"),mapOptions);
  var heatmap = new google.maps.visualization.HeatmapLayer(
    {
      data: HeatMap.all(),
      map: map,
      radius: 20
    }
  );
  navigator.geolocation.getCurrentPosition(function(pos) {
      map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      var myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
          map: map,
          title: "My Location"
      });

      //Add infowindow
      var infowindow = new google.maps.InfoWindow({
        content: "You Are Here!"
      });

      //Display infowindow when user clicks on map marker
      google.maps.event.addListener(myLocation, 'click', function() {
        infowindow.open(map,myLocation);
      });
  });
  $scope.map = map;
  $scope.heatmap = heatmap;
  

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

.controller('PostsCtrl', function($scope) {
  $scope.posts = [
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
  ];
});
