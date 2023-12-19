self.addEventListener('message', async ({ data: { input, placeid, lat, lon } }) => {
  const placeId = placeid ? `&radiusSearchPlaceId=${placeid}` : '';
  const latitude = lat ? `&lat=${lat}` : '';
  const longitude = lon ? `&lon=${lon}` : '';

  try {
    const response = await fetch(`https://taxi.booking.com/places/autocomplete/${input}?isDropOff=false&language=en-gb${placeId}${latitude}${longitude}`);
    const data = await response.json();
    self.postMessage(data);
  } catch (error) {
    console.error(error);
  }
}, false);