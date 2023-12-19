const icons = {
  'airport': 'https://raw.githubusercontent.com/duckvhuynh/checkprice/main/icon/airport.svg',
  'hotel': 'https://raw.githubusercontent.com/duckvhuynh/checkprice/main/icon/hotel.svg',
  'default': 'https://raw.githubusercontent.com/duckvhuynh/checkprice/main/icon/location.svg'
};

self.addEventListener('message', async ({ data: { input, placeid, lat, lon } }) => {
  const placeId = placeid ? `&radiusSearchPlaceId=${placeid}` : '';
  const latitude = lat ? `&lat=${lat}` : '';
  const longitude = lon ? `&lon=${lon}` : '';

  try {
    const response = await fetch(`https://taxi.booking.com/places/autocomplete/${input}?isDropOff=false&language=en-gb${placeId}${latitude}${longitude}`);
    const data = await response.json();

    const modifiedData = data.map(prediction => {
      const icon = icons[prediction.types[0]] || icons.default;
      return { ...prediction, 'location-icon': icon };
    });

    self.postMessage(modifiedData);
  } catch (error) {
    console.error(error);
  }
}, false);