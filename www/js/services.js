angular.module('starter.services', [])

.factory('Users', function($firebaseAuth, $firebaseObject){
  
  var ref = new Firebase('https://environ-test.firebaseio.com/');
  var userRef = ref.child('users');
  var _users = $firebaseAuth(ref);
  
  return {
    login: function(obj, callback, errorCallback) {
      ref.authWithPassword(obj, function(error, authData){
        if (error){
          errorCallback(error);
        }
        else{
          userRef.child(authData.uid).child('face').set(authData.password.profileImageURL);
          this.email = authData.password.email;
          callback(authData);
        }
      });
    },
    signup: function(obj, callback, errorCallback){
      ref.createUser(obj, function(error, userData){
        if (error){
          errorCallback(error);
        }
        else{
          userRef.child(userData.uid).set({
            community_points: 0
          });
          callback(userData);
        }
      });
    },
    changePassword: function(obj, callback, errorCallback){
      if (!this.email)
        return false;
      obj.email = this.email;
      ref.changePassword(obj, function(error){
        if (error) {
          errorCallback(error);
        } else {
          callback();
        }
      })
    },
    resetPassword: function(email, callback, errorCallback){
      ref.resetPassword(email, function(error){
        if (error){
          errorCallback(error);
        }
        else{
          callback();
        }
      });
    },
    getLogin: function (){
      return ref.getAuth();
    },
    logout: function(){
      ref.unauth();
    },
    getUser: function(){
      var auth = ref.getAuth();
      if (!auth)
        return null;
      
      return userRef.child(auth.uid);
    },
    getUserObject: function(){
      var auth = ref.getAuth();
      if (!auth)
        return null;
      
      return $firebaseObject(userRef.child(auth.uid));
    }
   
  };
})

.factory('Posts', function ($firebaseArray, Users, $firebaseObject) {
  var postsRef = new Firebase('https://environ-test.firebaseio.com/posts');
  var _posts = $firebaseArray(postsRef.orderByChild('date_created'));
  return {
    all: function(){
      return _posts;
    },
    push: function(post){
      var userRef = Users.getUser();
      if (!userRef)
        return false;
      
      var user = $firebaseObject(userRef);
      post.userid = user.$id;
      postsRef.push().set(post);
      userRef.child('community_points').transaction(function(community_points) {
        return community_points+5;
      });
      return true;
    },
    pushComment: function(id, comment){
      var userRef = Users.getUser();
      if (!userRef)
        return false;
      
      var user = $firebaseObject(userRef);
      comment.userid = user.$id;
      postsRef.child(id).child('comments').push().set(comment);
      userRef.child('community_points').transaction(function(community_points) {
        return community_points+1;
      });
      return true;
    },
    reportPost: function(id){
      var user = Users.getUserObject();
      if (!user)
        return false;
      
      postsRef.child(id).child('reports').child(user.$id).set(true);
      return true
    }
  }
});