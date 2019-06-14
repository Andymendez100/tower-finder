// ========================
// Global Variables
// ========================

// Create a variable to reference the database.
var database;
var towerCoord = { lat: 33.9745, lng: -117.3374 }; // These coordinates getting called by google maps somehow. github bug #
var map;
var towerCity;
var iconBase = 'assets/images/tower-icon.png';
var iconUser = "assets/images/walking-icon.png";
var userCoord;
//var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=-117.3374,33.9745";
var markers = [];


// ========================
// Functions
// ========================

// Initialize firebase
function initFirebase() {
  var config = {
    apiKey: " AIzaSyDOUxD0QFTDg2BKTNPA10x1-fhhidwDD-I",
    authDomain: "tower-finder-7c3ef.firebaseapp.com",
    databaseURL: "https://tower-finder-7c3ef.firebaseio.com/",
    storageBucket: "gs://tower-finder-7c3ef.appspot.com/"
  };
  firebase.initializeApp(config);

  // Set database
  database = firebase.database();
}

// Initializes map
function initMap(location) {
  // Unhide spinner 
  //$(".preloader-background").removeClass("hide");

  // getting the div map and putting the google maps api there
  map = new google.maps.Map(document.getElementById('map'), {
    center: location,
    mapTypeId: 'terrain',
    zoom: 13
  });

  // Added an event listener to when the tiles are loaded
  //google.maps.event.addListenerOnce(map, 'tilesloaded', mapLoaded);

  // 
  // function mapLoaded() {
  //   $(".preloader-background").addClass("hide");
  // }
}

// Ajax call to ArcGIS to get reverse geocode of coordinates
function getCity(url) {
  return $.ajax({
    url: url,
    method: "GET",
  });
}

// Creates cell towers markers in maps in user coordinates
function getTowers(userCity) {

  console.log(userCity);
  // Query city equal to coordinate city
  return database.ref().orderByChild("LOCCITY").equalTo(userCity).once("value");
}

// // Data in firebase database
// //database.ref().on("value", function (data) {
// database.ref().once("value").then(function (data) {
//   // Loops through dataset by each tower object
//   for (tower in data.val()) {

//     // Saves the location(city) of the tower to a variable
//     towerCity = data.val()[tower].LOCCITY.toLowerCase();

//     // If the cell tower's city is the same city as the user entered coordinates
//     if (towerCity === userCity) {

//       // Save cell tower data into variables
//       var tOwner = data.val()[tower].LICENSEE;
//       var lat = parseFloat(data.val()[tower].LAT_DMS);
//       var long = parseFloat(data.val()[tower].LON_DMS);
//       var city = data.val()[tower].LOCCITY;
//       var state = data.val()[tower].LOCSTATE;
//       var height = data.val()[tower].SUPSTRUC;
//       var towerId = tower;

//       // Get coordinates for new cell tower
//       towerCoord = { lat: lat, lng: long };

//       // Create a new row and populate with tower data
//       var newRow = $("<tr>").append(
//         $("<td>").text(tOwner),
//         $("<td>").text(lat + ", " + long),
//         $("<td>").text(city),
//         $("<td>").text(state),
//         $("<td>").text(height)
//       ).attr("data-id", towerId);

//       // Append the row to document table
//       $("#tower-table > tbody").append(newRow);

//       // Creates and adds marker to the array
//       markers.push(addMarker(towerCoord));
//       console.log(markers.length);
//     }

//     // 
//     var contentString = "<div><br><b>LICENSEE: </b>" + tOwner + "<br><b>LATITUDE: </b>" + lat +
//       "<br><b>LONGITUDE: </b>" + long + "<br><b>CITY: </b>" + city + "<br><b>STATE: </b>" + state +
//       "<br><b>HEIGHT: </b>" + height + " ft." + "</div>";

//     // 
//     //initMarker(towerCoord, contentString, towerId);
//   }




//});


// Add a marker to the map at loc
function addMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    icon: iconBase,
    map: map
  });

  // Returns the marker
  return marker;
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    console.log("Marker: ", markers[i]);
    console.log("Map: ", map);
    markers[i].setMap(map);
  }
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}


/*
// Created a function to create markers
function initMarker(coords, contentString, towerId) {
  var marker = new google.maps.Marker({
    position: coords,
    icon: iconBase,
    map: map,
    id: towerId,
    title: 'Click for details'
  });

  // 
  attachMessage(marker, contentString);
}
*/
/*
// Attaches an info window to a marker with the provided message
function attachMessage(marker, content) {

  // Info window to show information about towers
  var infowindow = new google.maps.InfoWindow({
    content: content,
    maxWidth: 200
  });

  // Listening for a click on the marker
  marker.addListener('click', function (event) {
    // open the info window on top of marker
    infowindow.open(map, marker);

    // 
    if (!marker.open) {
      infowindow.open(map, marker);
      marker.open = true;
    }
    else {
      infowindow.close();
      marker.open = false;
    }
  });
}
*/

// Checks if user input is a valid lat and long range
function isValid(lat, long) {

  // Checks latitude range
  if (lat < -90 || lat > 90) {
    // maybe add a modal here?
    return false;
  }

  // Checks longitude range
  else if (long < -180 || long > 180) {
    // maybe add a modal here?
    return false;
  }

  // Checks if input is empty
  else if (isNaN(lat) || isNaN(long)) {
    // maybe add a modal here
    return false;
  }
  return true;
}


// ========================
// Main 
// ========================

// Shorthand document ready
$(function () {

  // Initialiaze firebase
  initFirebase();

  // Initializes map
  initMap(towerCoord);
  console.log("On Document ready: ", markers.length);

  // Get user submit and runs core logic
  $("#submitButton").on("click", function (event) {

    // Prevents default form actions
    event.preventDefault();

    // Get user coordinates
    var userLat = parseFloat($("#latInput").val());
    var userLong = parseFloat($("#longInput").val());
    userCoord = { lat: userLat, lng: userLong };

    // Error Checking
    if (isValid(userLat, userLong)) {

      // Empty table
      $("tbody").empty();

      // Url for arcgis api call
      var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=" + userLong + "," + userLat;


      // Gets the city of user inputed coordinates
      $.when(getCity(queryURL)).then(function (response) {

        // Delete markers
        //deleteMarkers();

        // Sets user's city equal to the city containing coodinates
        var userCity = response.address.City; //.toLowerCase();
        //console.log(userCity);

        $.when(getTowers(userCity)).then(function (data) {
          //
          console.log("Tower Objects: ", data.val());

          
        });
        //var tempTowers = getTowers(userCity);
        //console.log("Towers: ", tempTowers);



        // Adds a marker for the user
        markers.push(addMarker(userCoord).setIcon(iconUser));
        // Centers map on user
        map.setCenter(userCoord);

        // Show map and table
        $("#map").removeClass("hide");
        $(".row").removeClass("hide");

        console.log("At end of response: ", markers.length);

      });
      console.log("Outside when: ", markers.length);
    }

    console.log("outside if loop", markers.length);
  });
});



// When table row is clicked open the corresponding markers info window
$("tbody").on("click", "tr", function (e) {
  // 
  var towerId = $(this).attr("data-id");
  console.log("TowerID", towerId);

  console.log(markers[towerId]);

  //infowindow.open(map, markers[towerId]);

})