self.addEventListener('message', async (e) => {
  try {
      const urls = Object.values(e.data).map(({from, to}) => {
          const {lat: pickupLatitude, lng: pickupLongitude} = from;
          const {lat: dropoffLatitude, lng: dropoffLongitude} = to;
          return `https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/routes/distance-time?from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}`;
      });

      const data = await Promise.all(urls.map(url => fetch(url).then(response => response.json())));

      const distances = data.reduce((acc, dataItem, index) => {
          const i = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
          acc[`distance${i}`] = dataItem.distance;
          return acc;
      }, {'distanceOne': 0, 'distanceTwo': 0, 'distanceThree': 0});

      self.postMessage(distances);
  } catch (error) {
      self.postMessage({ error: error.message });
  }
}, false);