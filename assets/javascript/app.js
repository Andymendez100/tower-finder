
var config = {
  apiKey: "AIzaSyAMPjG7vghDD6o2-pwFbiQVAu1gK4T1guQ",
  authDomain: "tower-finder-project1.firebaseapp.com",
  databaseURL: "https://tower-finder-project1.firebaseio.com/",
  storageBucket: "gs://tower-finder-project1.appspot.com/"
};

firebase.initializeApp(config);

var database = firebase.database();



//Google map api and markers

var initCoord = { lat: 33.9745, lng: -117.3374 };

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 33, lng: -117 },
    zoom: 5
    
  });

  //console.log("working");
  database.ref().once('value', function(data){
    console.log(data.val());
   });
  for(var towerId in database.features){
    console.log("working");
    //display towerId.geometry.coordinates[0] & towerId.geometry.coordinates[1]
    console.log(towerId.geometry.coordinates[0] & towerId.geometry.coordinates[1]);
    console.log(childSnapshot.val());
    
   }

  var iconBase = 'assets/images/tower-icon.png';
  var marker = new google.maps.Marker({
    
    position: initCoord,
    icon: iconBase,
    map: map
  });
};

initMap();


//getting input value of text box
var submitButton = $("#submitButton");

//when user clicks submits show all towers
submitButton.on("click", function () {
  var userLat = $("#latInput").val().trim();
  var userLong = $("#longInput").val().trim();
  userLat = parseInt(userLat);
  userLong = parseInt(userLong);

  map.setCenter({ lat: userLat, lng: userLong });

  // var iconBase = 'assets/images/tower-icon.png';
  // var marker = new google.maps.Marker({
    
  //   position: initCoord,
  //   icon: iconBase,
  //   map: map
  });





// Populate the table with api response from fcc and 
// Create icons for all nearby towers within a 1 mile radius
// 