// Initialize firebase
$(document).ready(function () {
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
  var iconPerson = "assets/images/walking-icon.png"
  var queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=-117.3374,33.9745";

  var markers = [];
  // var infowindow;
  // ========================
  // Functions
  // ========================

  // Initializes map
  function initMap() {
    // Unhide spinner 
    $(".preloader-background").removeClass("hide");

    // getting the div map and putting the google maps api there
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 33, lng: -117 },
      mapTypeId: 'terrain',
      zoom: 13
    });

    // Added an event listener to when the tiles are loaded
    google.maps.event.addListenerOnce(map, 'tilesloaded', mapLoaded);

    // 
    function mapLoaded() {
      $(".preloader-background").addClass("hide");
    }
  }

  // Ajax call to ArcGIS to get reverse geocode of coordinates
  function getCity() {
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {

      // Sets userCity equal to the city containing coodinates
      userCity = response.address.City;

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

          // Saving cell tower data into variables
          var tOwner = data.val()[tower].LICENSEE;
          var coords = data.val()[tower].LAT_DMS + ", " + data.val()[tower].LON_DMS;
          var lat = data.val()[tower].LAT_DMS;
          var long = data.val()[tower].LON_DMS;
          var city = data.val()[tower].LOCCITY;
          var state = data.val()[tower].LOCSTATE;
          var height = data.val()[tower].SUPSTRUC;
          var towerId = tower;
          var tableId = tower;

          // Create a new row
          var newRow = $("<tr>").append(
            $("<td>").text(tOwner),
            $("<td>").text(coords),
            $("<td>").text(city),
            $("<td>").text(state),
            $("<td>").text(height)
          ).attr("data-id", towerId).attr("coords", coords);


          // Append the row to table
          $("#tower-table > tbody").append(newRow);
        }

        // 
        var contentString = "<ul style='list-style: none;'><li><b>LICENSEE:</b></li>" + tOwner + "<li><b>LATITUDE:</b></li>" + lat +
          "<li><b>LONGITUDE:</b></li>" + long + "<li><b>CITY:</b></li>" + city + "<li><b>STATE:</b></li>" + state +
          "<li><b>HEIGHT:</b></li>" + height + " ft." + "</ul>" ;


        // 
        initMarker(towerCoord, contentString);
      }
    });
  }

  // 
  function userMarker(lat, long) {
    var marker = new google.maps.Marker({
      position: { lat: lat, lng: long },
      icon: iconPerson,
      map: map
    });
  }
  // Created a function to create markers
  function initMarker(coords, contentString) {
    var marker = new google.maps.Marker({
      position: coords,
      icon: iconBase,
      map: map,
      id: tower,
      title: 'Click for details'
    });

    markers.push(marker)

    // Info window to show information about towers
    infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 200
    });

    // Listening for a click on the marker
    marker.addListener('click', function (event) {
      // open the info window on top of marker
      infowindow.open(map, marker);
      

      if (!marker.open) {
        infowindow.open(map, marker);
        marker.open = true;
      }
      else {
        infowindow.close();
        marker.open = false;
      }
      google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
        marker.open = false;
      });
    });

  }

  // Checks if user input is a valid lat and long range

  function isValid(lat, long) {

    // Checks latitude range
    if (lat < -90 || lat > 90) {
      // maybe add a modal here?
      return false;
      console.log("working");
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

    // Get user submit and runs core logic
    $("#submitButton").on("click", function (event) {

      // Prevents default form actions
      event.preventDefault();

      // Get user coordinates
      var userLat = parseFloat($("#latInput").val());
      var userLong = parseFloat($("#longInput").val());

      // Error Checking
      if (isValid(userLat, userLong)) {

        // Refresh map
        initMap();

        // Empty table
        $("tbody").empty();

        // Url fogr arcis api call
        queryURL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&langCode=EN&location=" + userLong + "," + userLat;

        // Gets the city of user inputed coordinates
        getCity();

        // Centers map to entered coordinates
        map.setCenter({ lat: userLat, lng: userLong });

        // Show map and table
        $("#map").removeClass("hide");
        $(".row").removeClass("hide");

        // Create user marker
        userMarker(userLat, userLong);
      }
    });
  });

  // Whenever the table is clicked it shows the markers info window
  $("tbody").on("click", "tr", function (e) {
    var towerId = $(this).attr("data-id");

    var selectedMarker = markers.findIndex(function(marker) {
      return marker.id === towerId;
    })    
    infowindow.open(map, markers[selectedMarker]);


  })
});