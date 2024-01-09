var map;
var routingControl;
var circle;
var markers = {};
var markerIdCounter = 0;
var centerMarker;


function initMapOld(lat, lng, zoom) {
    var center = {lat: lat, lng: lng};
    map = new google.maps.Map(document.getElementById('map'), {
        minZoom: 5,
        zoom: zoom,
        center: center,
        disableDefaultUI: true,
        zoomControl: true
    });
    
    new google.maps.Marker({
        position: center,
        map: map
    });
}
function initMap(lat, lng, zoom) {
    if (!map) {
        map = L.map('map', { minZoom: 5 }).setView([lat, lng], zoom);
        addTileLayerToMap();
        addMarkerToMap(lat, lng, `${path}mtt-pin.png`);
    } else {
        map.setView([lat, lng], zoom);
    }
}

function updateRoute(fromLat, fromLng, toLat, toLng) {
    if (!map) {
        map = L.map('map').setView([fromLat, fromLng], 10);
        addTileLayerToMap();
    }
    routeMap(fromLat, fromLng, toLat, toLng);
}

function routeMap(fromLat, fromLng, toLat, toLng) {
    var from = L.latLng(fromLat, fromLng);
    var to = L.latLng(toLat, toLng);

    var pickupIcon = createIconRoute('#pickup-icon');
    var dropoffIcon = createIconRoute('#destination-icon');

    if (!map) {
        map = L.map('map').flyToBounds([from, to], {duration: 2.0});
        addTileLayerToMap();
    } else {
        map.flyToBounds([from, to], {duration: 2.0});
    }

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.Routing.waypoint(from),
            L.Routing.waypoint(to)
        ],
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        lineOptions: {
            styles: [{ color: "#e14d20", opacity: 1, weight: 3 }],
        },
        router: new L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving',
            show: false
        }),
        createMarker: function(i, wp) {
            var icon = i === 0 ? pickupIcon : dropoffIcon;
            return L.marker(wp.latLng, {icon: icon});
        },
        show: false
    }).addTo(map);
}

function drawCircle(lat, lng, radius) {
    if (!map) {
        initMap(lat, lng, 10);
    }
    
    if (circle) {
        map.removeLayer(circle);
    }

    circle = L.circle([lat, lng], {
        color: '#e14d20', 
        fillColor: '#f88a4b', 
        fillOpacity: 0.4, 
        weight: 1, 
        radius: radius
    }).addTo(map);
}
function updateCircle(lat, lng, radius) {
    if (circle) {
      // If a circle already exists, just update its position and radius
      circle.setLatLng([lat, lng]);
      circle.setRadius(radius);
    } else {
      // If no circle exists, create a new one
      circle = drawCircle(lat, lng, radius);
    }
  }

function addTileLayerToMap() {
    // L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=07420e59-d599-4f1f-b5ce-3d843b0c8b40', {}).addTo(map);
    // L.tileLayer('https://{s}.tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=OcSnuVIhYcxuMJfVYr1Wt9P4CFi7ae5R3KaSsWbpmHG5Wg9tCXmQgXyRsQtsRagK', {}).addTo(map);
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {subdomains:['mt0','mt1','mt2','mt3']}).addTo(map);
}


// function addMarkerToMap(lat, lng, iconUrl, draggable) {
//     var customIcon = createIcon(iconUrl);
//     var markerOptions = {
//         icon: customIcon,
//         draggable: !!draggable // Convert draggable to a boolean
//     };
//     var marker = L.marker([lat, lng], markerOptions).addTo(map);

//     if (draggable) {
//         marker.on('dragend', function(event) {
//             var newLatLng = event.target.getLatLng();
//             // Update the center location with the new position
//             // For example, update the dataset of the center-location input
//             document.getElementById('center-location').dataset.lat = newLatLng.lat;
//             document.getElementById('center-location').dataset.lon = newLatLng.lng;
//             clearMarkers();

//             // Set the new icon for the centerMarker
//             var newIconUrl = createIcon(`${path}marker/geo-pin-drag.png`); // Replace with the path to your new icon
//             event.target.setIcon(newIconUrl);
//             const radiusValue = parseFloat(document.getElementById('radius').value);
//             if (!isNaN(radiusValue)) {
//                 updateCircle(newLatLng.lat, newLatLng.lng, radiusValue);
//             }
//         });
//     }

//     return marker;
// }
function addMarkerToMap(lat, lng, iconUrl, draggable) {
    var customIcon = createIcon(iconUrl);
    var markerOptions = {
        icon: customIcon,
        draggable: !!draggable // Convert draggable to a boolean
    };
    var marker = L.marker([lat, lng], markerOptions).addTo(map);

    if (draggable) {
        marker.on('dragstart', function() {
            clearMarkers();
        });
        marker.on('drag', function(event) {
            var newLatLng = event.target.getLatLng();
            if (circle) {
                circle.setLatLng(newLatLng);
            }
        });
        marker.on('dragend', function(event) {
            var newLatLng = event.target.getLatLng();
            document.getElementById('center-location').dataset.lat = newLatLng.lat;
            document.getElementById('center-location').dataset.lon = newLatLng.lng;
            var newIconUrl = createIcon(`${path}marker/geo-pin-drag.png`);
            event.target.setIcon(newIconUrl);
            
        });
    }

    return marker;
}

function addPoint(lat, lng, locationName, iconUrl) {
    var marker = addMarkerToMap(lat, lng, iconUrl);
    // Increment the counter to get a unique ID for the marker
    markerIdCounter++;
    var markerId = `marker-${markerIdCounter}`;

    // Store the marker with its initial position and name
    markers[markerId] = {
        marker: marker,
        lat: lat,
        lng: lng,
        name: locationName // Store the location name
    };

    // Update the position and name in the marker object when the marker is dragged
    marker.on('dragend', function(event) {
        var newLatLng = event.target.getLatLng();
        markers[markerId].lat = newLatLng.lat;
        markers[markerId].lng = newLatLng.lng;
        // Optionally update the name if needed
        console.log(`Marker ${markerId}: ${newLatLng.lat},${newLatLng.lng}`);
    });
}

function clearMarkers() {
    Object.keys(markers).forEach(function(markerId) {
        map.removeLayer(markers[markerId].marker);
    });
    markers = {}; // Reset the markers object
    markerIdCounter = 0; // Reset the counter
}

function createIconRoute(elementId) {
    var iconUrl = document.querySelector(elementId).src;
    var marker = iconUrl.includes('hotel') ? 'hotel.png' : iconUrl.includes('airport') ? 'airport.png' : 'geo-pin.png';
    var markerPath = `${path}marker/${marker}`;
    return L.icon({ iconUrl: markerPath, iconSize: [36, 36], iconAnchor: [18, 36] });
}

function createIcon(iconUrl) {
    return L.icon({ iconUrl: iconUrl? iconUrl : `${path}marker/geo-pin.png`, iconSize: [36, 36], iconAnchor: [18, 36] });
}

function centerMapAndAddMarker(lat, lng, iconUrl) {
    if (centerMarker) {
        map.removeLayer(centerMarker);
    }
    if (map) {
        map.setView([lat, lng], map.getZoom());
        centerMarker = addMarkerToMap(lat, lng, iconUrl, true); // Pass true for the draggable parameter
    }
}

function getRandomPointsInCircle(centerLat, centerLng, radius, count) {
    let points = [];
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2; // Random angle
        let r = Math.sqrt(Math.random()) * radius; // Random radius
        let offsetX = r * Math.cos(angle); // Convert polar coordinates to Cartesian
        let offsetY = r * Math.sin(angle);
        let earthRadius = 6371000; // Earth's radius in meters

        // Offset the latitude and longitude by the random x and y offsets
        let randomLat = centerLat + (offsetY / earthRadius) * (180 / Math.PI);
        let randomLng = centerLng + (offsetX / earthRadius) * (180 / Math.PI) / Math.cos(centerLat * Math.PI/180);

        points.push({ lat: randomLat, lng: randomLng });
    }
    return points;
}
function getValidPointInCircle(centerLat, centerLng, radius) {
    return new Promise((resolve, reject) => {
        function tryPoint() {
            let angle = Math.random() * Math.PI * 2; // Random angle
            let r = Math.sqrt(Math.random()) * radius; // Random radius
            let offsetX = r * Math.cos(angle); // Convert polar coordinates to Cartesian
            let offsetY = r * Math.sin(angle);
            let earthRadius = 6371000; // Earth's radius in meters

            // Offset the latitude and longitude by the random x and y offsets
            let randomLat = centerLat + (offsetY / earthRadius) * (180 / Math.PI);
            let randomLng = centerLng + (offsetX / earthRadius) * (180 / Math.PI) / Math.cos(centerLat * Math.PI/180);

            fetch(`https://geo-service.talixo.de/api/v1/geoservice/geocoder:geocode?latlng=${randomLat},${randomLng}&result_type=point_of_interest`)
                .then(response => response.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        let formattedAddress = data.results[0].formatted_address;
                        // Perform the second check with the formatted address
                        return fetch(`https://taxi.booking.com/places/autocomplete/${encodeURIComponent(formattedAddress)}?isDropOff=true&language=en-gb&lat=${randomLat}&lon=${randomLng}`);
                    } else {
                        throw new Error('No address found, trying again.');
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        // If there is a result, it is valid
                        resolve({
                            lat: randomLat,
                            lng: randomLng,
                            address: data[0].description,
                            placeId: data[0].place_id,
                            locationId: data[0].lat,
                            locationId: data[0].lon
                        });
                    } else {
                        throw new Error('Address not valid, trying again.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    tryPoint(); // Try again on error or no valid address
                });
        }

        tryPoint();
    });
}