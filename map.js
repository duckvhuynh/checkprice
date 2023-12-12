function initMap() {
    var map = L.map('map').setView([14.0583, 108.2772], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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