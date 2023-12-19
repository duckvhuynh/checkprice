const hotelKeywords = ['hôtel', 'hotel', 'inn', 'resort', 'lodge', 'suites', 'motel', 'b&b', 'bed and breakfast', 'guesthouse', 'hostel', 'boutique', 'serviced apartments', 'villa'];

self.addEventListener('message', async (e) => {
  const { input, placeid, lat, lon } = e.data;
  const placeId = placeid ? `&radiusSearchPlaceId=${placeid}` : '';
  const latitude = lat ? `&lat=${lat}` : '';
  const longitude = lon ? `&lon=${lon}` : '';

  try {
    const response = await fetch(`https://taxi.booking.com/places/autocomplete/${input}?isDropOff=false&language=en-gb${placeId}${latitude}${longitude}`);
    const data = await response.json();

    const modifiedData = data.map(prediction => {
      const type = prediction.types[0];
      const icon = '../icon/' + (type.includes('airport') ? 'airport' : (hotelKeywords.some(keyword => type.includes(keyword)) ? 'hotel' : 'location')) + '.svg';
      return { ...prediction, 'location-icon': icon };
    });

    self.postMessage(modifiedData);
  } catch (error) {
    console.error(error);
  }
}, false);