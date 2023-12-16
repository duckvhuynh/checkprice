var map;
function initMap(lat, lng, zoom) {
    if (!map) {
        map = L.map('map').setView([lat, lng], zoom);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lng], zoom);
    }
}

function updateRoute(fromLat, fromLng, toLat, toLng) {
    if (!map) {
        initMap(fromLat, fromLng, 10);
    }
    routeMap(fromLat, fromLng, toLat, toLng);
}

function routeMap(fromLat, fromLng, toLat, toLng) {
    map.setView([fromLat, fromLng], 10);
    L.Routing.control({
        waypoints: [
            L.latLng(fromLat, fromLng),  // Location coordinates
            L.latLng(toLat, toLng)  // Destination coordinates
        ],
        routeWhileDragging: false,
        lineOptions: {
            styles: [{ color: "red", opacity: 0.7, weight: 8 }],
        },
        router: new L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving',
            show: false
        }),
        show: false
    }).addTo(map);
}
function drawCircle(lat, lng, radius) {
    var map = L.map('map').setView([lat, lng], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    L.circle([lat, lng], {
        color: '#e14d20', // change the color of the circle's outline
        fillColor: '#f88a4b', // change the color of the circle's interior
        fillOpacity: 0.4, // change the opacity of the circle's interior
        weight: 1, // change the width of the circle's outline
        radius: radius
    }).addTo(map);
}

function calculateTrianglePoints(lat, lng, radius) {
    var points = [];
    var side = radius * Math.sqrt(3);
    for (var i = 0; i < 3; i++) {
        var angle = (i / 3) * 2 * Math.PI;
        var pointLat = lat + side * Math.cos(angle);
        var pointLng = lng + side * Math.sin(angle);
        points.push([pointLat, pointLng]);
    }
    return points;
}

function drawCircleAndTriangle(lat, lng, radius) {
    var map = L.map('map').setView([lat, lng], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    L.circle([lat, lng], {
        color: '#e14d20', // change the color of the circle's outline
        fillColor: '#f88a4b', // change the color of the circle's interior
        fillOpacity: 0.4, // change the opacity of the circle's interior
        weight: 1, // change the width of the circle's outline
        radius: radius
    }).addTo(map);

    // Calculate the coordinates of the triangle's vertices
    var trianglePoints = calculateTrianglePoints(lat, lng, radius);

    // Draw the triangle
    L.polygon(trianglePoints, {
        color: '#3388ff', // change the color of the triangle's outline
        fillColor: '#3388ff', // change the color of the triangle's interior
        fillOpacity: 0.5, // change the opacity of the triangle's interior
        weight: 1 // change the width of the triangle's outline
    }).addTo(map);
}