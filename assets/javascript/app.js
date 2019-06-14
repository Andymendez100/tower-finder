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
var markers = [];
//var infoTemplate = '<div><h4>%Title</h4>%Tel<br><br>%Add</div>';


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

// Make towers
function makeTowers(data) {

  // Match towerId to array or markers
  var i = 0;
  
  //
  for (tower in data) {
    // Save cell tower data into variables
    var tOwner = data[tower].LICENSEE;
    var lat = parseFloat(data[tower].LAT_DMS);
    var long = parseFloat(data[tower].LON_DMS);
    var city = data[tower].LOCCITY;
    var state = data[tower].LOCSTATE;
    var height = data[tower].SUPSTRUC;
    var id = i;
    //console.log("id", id);
    i++;

    // Get coordinates for new cell tower
    towerCoord = { lat: lat, lng: long };

    // Add tower marker to the array
    markers.push(addMarker(towerCoord));

    // Populate table
    populateTable(tOwner, lat, long, city, state, height, towerCoord, id);
  }
}

// Make a row with table data and pushes it onto the table
function populateTable(owner, lat, long, city, state, height, towerCoord, id) {
  // Create a new row and populate with tower data
  var newRow = $("<tr>").append(
    $("<td>").text(owner),
    $("<td>").text(lat + ", " + long),
    $("<td>").text(city),
    $("<td>").text(state),
    $("<td>").text(height)
  ).data("coordinates", towerCoord).attr("data-id", id);

  // Append the row to document table
  $("#tower-table > tbody").append(newRow);
}


//     // 
//     var contentString = "<div><br><b>LICENSEE: </b>" + tOwner + "<br><b>LATITUDE: </b>" + lat +
//       "<br><b>LONGITUDE: </b>" + long + "<br><b>CITY: </b>" + city + "<br><b>STATE: </b>" + state +
//       "<br><b>HEIGHT: </b>" + height + " ft." + "</div>";

//     // 
//     //initMarker(towerCoord, contentString, towerId);
//   }



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
  console.log("Markers Array:", markers);
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll();
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

      // Delete markers
      deleteMarkers();

      // Url for arcgis api call
      var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=" + userLong + "," + userLat;

      // Get the city in user inputed coordinates
      $.when(getCity(queryURL)).then(function (response) {

        // Sets user's city equal to the city containing coodinates
        var userCity = response.address.City; //.toLowerCase();
        console.log(userCity);

        // Get towers that match user city from firebase database
        $.when(getTowers(userCity)).then(function (data) {
          // Towers equal to response
          var towers = data.val();

          // Adds a marker for the user
          var userMarker = addMarker(userCoord);
          userMarker.setIcon(iconUser);
          markers.push(userMarker);

          // Centers map on user
          map.setCenter(userCoord);

          // Make towers
          makeTowers(towers);

          // Show map and table
          $("#map").removeClass("hide");
          $(".row").removeClass("hide");

          console.log("At end of response: ", markers.length + '\n\n');

        });
      });
    }
  });
});


// When table row is clicked open the corresponding markers info window
$("tbody").on("click", "tr", function (e) {
  // 
  //console.log("e: ", e);
  var towerCoordinates = $(this).data("coordinates");
  console.log("coordinates", towerCoordinates);
  console.log("TowerID: ", $(this).attr("data-id"));

  map.setCenter(towerCoordinates);

  // markers[i]


  //console.log(markers[towerId]);

  //infowindow.open(map, markers[towerId]);

})