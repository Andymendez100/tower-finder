// ========================
// Global Variables
// ========================

// Create a variable to reference the database.
var database;
var towerCoord; //= { lat: 33.9745, lng: -117.3374 };
var map;
var towerCity;
var iconBase = 'assets/images/tower-icon.png';
var iconUser = "assets/images/walking-icon.png";
var userCoord;
var markers = [];
var infowindow;
var activeInfoWindow;


// ========================
// Functions
// ========================

// Initialize firebase
function initFirebase() {
  var config = {
    apiKey: "AIzaSyDqBdI91HIVFwk6UhLGvfuGP8Lg42FQp80",
    authDomain: "tower-finder-30aa8.firebaseapp.com",
    databaseURL: "https://tower-finder-30aa8.firebaseio.com",
    storageBucket: "gs://tower-finder-7c3ef.appspot.com/"
  };
  firebase.initializeApp(config);

  // Set database
  database = firebase.database();
}

// Initializes map
function initMap(location) {
  // getting the div map and putting the google maps api there
  map = new google.maps.Map(document.getElementById('map'), {
    center: location,
    mapTypeId: 'terrain',
    zoom: 10
  });
}

// Ajax call to ArcGIS to get reverse geocode of coordinates
function getCity(url) {
  return Promise.resolve($.ajax({
    url: url,
    method: "GET"
  }));
}

// Creates cell towers markers in maps in user coordinates
function getTowers(userCity) {
  // Query city equal to coordinate city
  return database.ref().orderByChild("LOCCITY").equalTo(userCity).once("value");
}

// Make towers
function makeTowers(data) {

  // Match towerId to array or markers initialize to 1, 0 is userIcon
  var i = 1;

  // Loop through all towers in response data
  for (tower in data) {
    // Save cell tower data into variables
    var tOwner = data[tower].LICENSEE;
    var lat = parseFloat(data[tower].LAT_DMS);
    var long = parseFloat(data[tower].LON_DMS);
    var city = data[tower].LOCCITY;
    var state = data[tower].LOCSTATE;
    var height = data[tower].SUPSTRUC;

    // Set towerID and increment
    var tid = i;
    i++;

    // Get coordinates for new cell tower
    towerCoord = { lat: lat, lng: long };

    // Add tower marker to the array
    markers.push(addMarker(towerCoord, tid));

    // Populate table
    populateTable(tOwner, lat, long, city, state, height, towerCoord, tid);
  }
}

// Make a row with table data and pushes it onto the table
function populateTable(owner, lat, long, city, state, height, towerCoord, tid) {
  // Create a new row and populate with tower data
  var newRow = $("<tr>").append(
    $("<td>").text(owner),
    $("<td>").text(lat + ", " + long),
    $("<td>").text(city),
    $("<td>").text(state),
    $("<td>").text(height)
  ).attr("data-id", tid);

  // Append the row to document table
  $("#tower-table > tbody").append(newRow);
}

// Add a marker to the map at location
function addMarker(location, tid) {
  var marker = new google.maps.Marker({
    position: location,
    icon: iconBase,
    map: map
  });

  // If more than 2 params are passed in add a listener
  if (tid) { //arguments.length >= 2) {
    marker.addListener("click", function () {
      // Create a infowindow with the relavant content
      makeInfowindow(tid, makeInfoContent(tid));

      // Scroll to tower in table
      var element = $("[data-id=" + tid + "]")[0];
      element.scrollIntoView({ block: "nearest", inline: "start", behavior: "smooth" });
    });
  }

  // Returns the marker
  return marker;
}

// Sets the map on all markers in the array
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Shows any markers currently in the array
function showMarkers() {
  setMapOnAll();
}

// Deletes all markers in the array by removing references to them
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// Removes the markers from the map, but keeps them in the array
function clearMarkers() {
  setMapOnAll(null);
}

// Creates a inforwindow for the passed in marker
function makeInfowindow(markerID, infoContent) {
  infowindow = new google.maps.InfoWindow({
    content: infoContent
  });

  // Closes the previous infowindow when a new one is opened
  if (activeInfoWindow) {
    activeInfoWindow.close();
  }
  // New infowindow is set to the current/avtive one
  activeInfoWindow = infowindow;

  // Open infowindow
  infowindow.open(map, markers[markerID]);

  // Move map to selected tower coordinates
  map.panTo(markers[markerID].position)
}

// Gets and creates infowindow content
function makeInfoContent(towerID) {
  // Variable to store infowindow content
  var infoString = "";

  // Gets the tower row
  var row = $("tbody").find("[data-id='" + towerID + "']")[0];

  // For every cell in table row
  for (let i = 0; i < row.cells.length; i++) {
    // Generate and add headers with cell data
    infoString += "<b>" + $("thead > tr > th").eq(i).text() + ": </b>" + $(row).find("td:eq(" + i + ")").text() + "<br>";
  }

  // Returns infowindow content
  return infoString;
}

// Checks if user input is a valid lat and long range
function isValid(lat, long) {

  // Checks latitude range
  if (lat < -90 || lat > 90) {
    inValidInput();
    return false;
  }

  // Checks longitude range
  else if (long < -180 || long > 180) {
    inValidInput();
    return false;
  }

  // Checks if input is empty
  else if (isNaN(lat) || isNaN(long)) {
    inValidInput();
    return false;
  }
  return true;
}

// Setup and display invalid input message
function inValidInput() {
  var elem = document.querySelector('.modal');
  var instance = M.Modal.init(elem);
  instance.open();
}

// Setup and display invalid input message
function noCityModal() {
  var elem = document.querySelector('#modal2');
  var instance = M.Modal.init(elem);
  instance.open();
}



// ========================
// Main 
// ========================

// Shorthand document ready
$(function () {

  // Enable trigger funtionaility for materialize components
  $('.tap-target').tapTarget();
  $('.tooltipped').tooltip();

  // Initialiaze firebase
  initFirebase();

  // Initializes map
  initMap({ lat: 33.9745, lng: -117.3374 });

  // Prevent right click context menu
  window.onload = (function () {
    document.addEventListener("mouseup", function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    });
    document.addEventListener("contextmenu", function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    });
  })();

  // Get user submit on google maps and runs core logic
  google.maps.event.addListener(map, "rightclick", function (event) {

    // Get user coordinates
    var userLat = event.latLng.lat(); //parseFloat($("#latInput").val());
    var userLong = event.latLng.lng(); //parseFloat($("#longInput").val());
    userCoord = { lat: userLat, lng: userLong };

    // Error Checking
    if (isValid(userLat, userLong)) {

      // Preloader overlay
      $(".preloader-background").removeClass("hide");

      // Empty table
      $("tbody").empty();

      // Delete previous markers
      deleteMarkers();

      // Url for arcGIS api call
      var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=" + userLong + "," + userLat;

      // Get the city in user inputed coordinates
      $.when(getCity(queryURL)).then(function (response) {

        // Check if error is returned
        var key = Object.keys(response)[0];

        // Checks if coordinates are in valid city
        if (key == "address") {
          // Sets user's city equal to the city containing coodinates
          var userCity = response.address.City;

          // Get towers that match user city from firebase database
          $.when(getTowers(userCity)).then(function (data) {
            // Towers equal to response
            var towers = data.val();

            // Adds a marker for the user
            var userMarker = addMarker(userCoord);
            userMarker.setIcon(iconUser);
            markers.push(userMarker);

            // Make towers
            makeTowers(towers);

            // Remove preloader
            $(".preloader-background").addClass("hide");

          });
        }
        else {
          // Remove preloader
          $(".preloader-background").addClass("hide");

          noCityModal();
        }

      });
    }
  });

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

      // Preloader overlay
      $(".preloader-background").removeClass("hide");

      // Remove instruction button pulsing effect
      $('#menu').removeClass("pulse");

      // Empty table
      $("tbody").empty();

      // Delete markers
      deleteMarkers();

      // Url for arcgis api call
      var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=" + userLong + "," + userLat;

      // Get the city in user inputed coordinates
      $.when(getCity(queryURL)).then(function (response) {

        // Check if error is returned
        var key = Object.keys(response)[0];

        // Checks if coordinates are in valid city
        if (key == "address") {
          // Sets user's city equal to the city containing coodinates
          var userCity = response.address.City;

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
            map.setZoom(13);

            // Make towers
            makeTowers(towers);

            // Show map and table
            $("#map").removeClass("hide");
            $(".row").removeClass("hide");

            // Remove preloader
            $(".preloader-background").addClass("hide");

          });
        }
        else {
          // Remove preloader
          $(".preloader-background").addClass("hide");

          noCityModal();
        }

      });

    }
  });

  // When table row is clicked open the corresponding markers info window
  $("tbody").on("click", "tr", function () {
    // Get tower position in array
    var towerID = $(this).attr("data-id");

    // Creates and returns infowindow content
    var infoContent = makeInfoContent(towerID);

    // Generate infowindow
    makeInfowindow(towerID, infoContent);
  });

  // Open close instructions tap target from feature discovery when clicked
  $("#menu").on("click", function () {
    $('.tap-target').tapTarget('open');
    // Remove instruction button pulsing effect
    $('#menu').removeClass("pulse");
  });


});

