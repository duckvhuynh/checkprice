self.addEventListener('message', function(e) {
    const { lat, lng } = e.data;

    fetch(`https://geo-service.talixo.de/api/v1/geoservice/geocoder:geocode?latlng=${lat},${lng}&result_type=point_of_interest`)
        .then(response => response.json())
        .then(data => {
            const placeId = data.results[0].place_id;
            self.postMessage({ lat, lng, placeId });
        })
        .catch(error => console.error('Error:', error));
}, false);