
// Initialize firebase
var config = {
  apiKey: " AIzaSyDOUxD0QFTDg2BKTNPA10x1-fhhidwDD-I",
  authDomain: "tower-finder-7c3ef.firebaseapp.com",
  databaseURL: "https://tower-finder-7c3ef.firebaseio.com/",
  storageBucket: "gs://tower-finder-7c3ef.appspot.com/"
};

firebase.initializeApp(config);

// Variables
// Create a variable to reference the database.
var database = firebase.database();
var towerCoord = { lat: 33.9745, lng: -117.3374 };
var userCity = "LA";
var fbCity;
var iconBase = 'assets/images/tower-icon.png';


// Creates cell towers in maps in user specified citites
function cityLoc() {
  // $(".spinner-layer").removeClass("hide");
  // Goes into our database
  database.ref().on("value", function (data) {
    // Creates var tower for arrays in database
    for (tower in data.val()) {
      // Saves city loc in var
      fbCity = data.val()[tower].LOCCITY;
      fbCity = fbCity.toLowerCase();

      // If user city equals the cell tower city
      if (fbCity === userCity) {
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
    
    // $("#map").onload = function() {myFunction()};

    // function myFunction(){
    //   console.log("working");
    //   $(".spinner-layer").addClass("hide");
    // }
  });

  // then(function() {
  //   console.log("working");
  //   $(".spinner-layer").addClass("hide");
  // })
  
}



var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 33, lng: -117 },
    zoom: 5
  });

};


//getting input value of text box
var submitButton = $("#submitButton");

//when user clicks submits show all towers
submitButton.on("click", function (event) {
  event.preventDefault();
  // clear markers on map
  initMap();
  // clear table data
  $("tbody").empty();
  var userLat = $("#latInput").val();
  var userLong = $("#longInput").val();
  userCity = $("#cityInput").val().trim();
  userCity = userCity.toLowerCase();

  userLat = parseInt(userLat);
  userLong = parseInt(userLong);

  if (!isNaN(userLat) && !isNaN(userLong) && userCity !== "") {
    //console.log("Entered check input");
    map.setCenter({ lat: userLat, lng: userLong });
    $("#map").removeClass("hide");
    $("#tableDiv").removeClass("hide");
    cityLoc();
  }

  //$(".spinner-layer").addClass("hide");

});
$(document).ready(function() {
  $('.modal').modal();
  $('select').material_select();
  $('input.autocomplete').autocomplete2({
    data: [
      {id:1,text:'Apple',img:'http://placehold.it/250x250'},
      {id:2,text:'Microsoft',img:'http://placehold.it/250x250'},
      {id:3,text:'Google',img:'http://placehold.it/250x250'},
    ]
  });
});

  function getId() {
    alert($('#autocomplete').data('id'));
  }
