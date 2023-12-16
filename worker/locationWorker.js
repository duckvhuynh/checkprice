const hotelKeywords = ['hotel', 'inn', 'resort', 'lodge', 'suites', 'motel', 'b&b', 'bed and breakfast', 'guesthouse', 'hostel', 'boutique', 'serviced apartments', 'villa'];
self.addEventListener('message', function(e) {
  const input = e.data;
  fetch(`https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/places/auto-comp?input_text=${input}`)
    .then(response => response.json())
    .then(data => {
      const modifiedData = data.predictions.predictions.map(prediction => {
        const description = prediction.description.toLowerCase();
        const icon = 'icon/' + (description.includes('airport') ? 'airport' : (hotelKeywords.some(keyword => description.includes(keyword)) ? 'hotel' : 'location')) + '.svg';
        return { ...prediction, 'location-icon': icon };
      });
      self.postMessage(modifiedData);
    })
    .catch(error => console.error(error));
}, false);