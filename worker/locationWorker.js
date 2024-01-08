const BASE_URL = 'https://taxi.booking.com/places/autocomplete/';

self.addEventListener('message', async ({ data: { input, placeid, lat, lon } }) => {
  const params = new URLSearchParams({
    isDropOff: false,
    language: 'en-gb'
  });

  if (placeid) params.append('radiusSearchPlaceId', placeid);
  if (lat) params.append('lat', lat);
  if (lon) params.append('lon', lon);

  try {
    const response = await fetch(`${BASE_URL}${encodeURIComponent(input)}?${params}`);
    const data = await response.json();
    console.log(data);
    self.postMessage(data);
  } catch (error) {
    console.error(error);
  }
}, false);