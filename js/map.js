var map;
var routingControl;

// Initialize the map
function initMap(lat, lng, zoom) {
    if (!map) {
        map = L.map('map', { minZoom: 5 }).setView([lat, lng], zoom);
        addTileLayerToMap();
        addMarkerToMap(lat, lng, '../icon/mtt-pin.png');
    } else {
        map.setView([lat, lng], zoom);
    }
}

// Update the route
function updateRoute(fromLat, fromLng, toLat, toLng) {
    if (!map) {
        map = L.map('map').setView([fromLat, fromLng], 10);
        addTileLayerToMap();
    }
    routeMap(fromLat, fromLng, toLat, toLng);
}

// Route the map
function routeMap(fromLat, fromLng, toLat, toLng) {
    var from = L.latLng(fromLat, fromLng);
    var to = L.latLng(toLat, toLng);

    var pickupIcon = createIcon('#pickup-icon');
    var dropoffIcon = createIcon('#destination-icon');

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

// Draw a circle on the map
function drawCircle(lat, lng, radius) {
    if (!map) {
        map = L.map('map').setView([lat, lng], 10);
        addTileLayerToMap();
    }
    L.circle([lat, lng], {
        color: '#e14d20', 
        fillColor: '#f88a4b', 
        fillOpacity: 0.4, 
        weight: 1, 
        radius: radius
    }).addTo(map);
}

// Helper function to add tile layer to the map
function addTileLayerToMap() {
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=07420e59-d599-4f1f-b5ce-3d843b0c8b40', {}).addTo(map);
}

// Helper function to add a marker to the map
function addMarkerToMap(lat, lng, iconUrl) {
    var customIcon = L.icon({ iconUrl: iconUrl, iconSize: [24, 24], iconAnchor: [12, 24]});
    L.marker([lat, lng], {icon: customIcon}).addTo(map).openPopup();
}

// Helper function to create an icon
function createIcon(elementId) {
    var iconUrl = document.querySelector(elementId).src;
    return L.icon({ iconUrl: iconUrl, iconSize: [24, 24], iconAnchor: [12, 24] });
}