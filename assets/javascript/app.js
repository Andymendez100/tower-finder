// Initialize firebase
var config = {
  apiKey: " AIzaSyDOUxD0QFTDg2BKTNPA10x1-fhhidwDD-I",
  authDomain: "tower-finder-7c3ef.firebaseapp.com",
  databaseURL: "https://tower-finder-7c3ef.firebaseio.com/",
  storageBucket: "gs://tower-finder-7c3ef.appspot.com/"
};

firebase.initializeApp(config);


// ========================
// Global Variables
// ========================

// Create a variable to reference the database.
var database = firebase.database();
var towerCoord = { lat: 33.9745, lng: -117.3374 };
var map;
var userCity;
var towerCity;
var iconBase = 'assets/images/tower-icon.png';
var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=-117.3374,33.9745";


// ========================
// Functions
// ========================

// Initializes map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 33, lng: -117 },
    zoom: 8
  });
};

// Ajax call to ArcGIS to get reverse geocode of coordinates
function getCity() {
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);

    // Sets userCity equal to the city containing coodinates
    userCity = response.address.City;
    console.log("User City: ", userCity);

    // Calls makeTowers
    makeTowers();
  });
}

// Creates cell towers markers in maps in user coordinates
function makeTowers() {

  // Goes into our database
  database.ref().on("value", function (data) {

    // Creates var tower for arrays in database
    for (tower in data.val()) {

      // Saves city loc in var
      towerCity = data.val()[tower].LOCCITY;

      // If user city equals the cell tower city
      if (towerCity === userCity) {
        // Get coordinates for new cell tower
        towerCoord = { lat: data.val()[tower].LAT_DMS, lng: data.val()[tower].LON_DMS };

        // Creates new google map marker
        var marker = new google.maps.Marker({
          position: towerCoord,
          icon: iconBase,
          map: map
        });

        // Saving cell tower data into variables
        var tOwner = data.val()[tower].LICENSEE;
        var coords = data.val()[tower].LAT_DMS + ", " + data.val()[tower].LON_DMS;
        var city = data.val()[tower].LOCCITY;
        var state = data.val()[tower].LOCSTATE;
        var height = data.val()[tower].SUPSTRUC;

        // Create a new row
        var newRow = $("<tr>").append(
          $("<td>").text(tOwner),
          $("<td>").text(coords),
          $("<td>").text(city),
          $("<td>").text(state),
          $("<td>").text(height)
        );

        // Append the row to table
        $("#tower-table > tbody").append(newRow);
      }
    }
  });
}

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
  else if (lat == "" || long == "") {
    // maybe add a modal here?
    return false;
  }
  return true;
}


// ========================
// Main 
// ========================

// Shorthand document ready
$(function () {

  // Get user submit and runs core logic
  $("#submitButton").on("click", function (event) {

    // Prevents default form actions
    event.preventDefault();

    // Refresh map
    initMap();

    // Empty table
    $("tbody").empty();

    // Get user coordinates
    var userLat = parseFloat($("#latInput").val());
    var userLong = parseFloat($("#longInput").val());

    console.log(userLat, userLong);

    // Error Checking
    if (isValid) {
      // Url for arcgis api call
      queryURL = "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=" + userLong + "," + userLat;

      console.log(queryURL);

      // Gets the city of user inputed coordinates
      getCity();

      // Centers map to entered coordinates
      map.setCenter({ lat: userLat, lng: userLong });

      // Show map and table
      $("#map").removeClass("hide");
      $(".row").removeClass("hide");
    }

  });

});




