

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8

  });
}
// map.setCenter(new google.maps.LatLng(-33.9745, -117.3374));
// map.setCenter({ lat: 33.9745, lng: -117.3374 });

initMap();
map.setCenter({ lat: 33, lng: -117 });
new google.maps.Marker({ position: { lat: 33, lng: -117 }, map: map });


