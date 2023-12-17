const fetchDistancesWorker = new Worker('../worker/fetchDistancesWorker.js');
self.addEventListener('message', function(e) {
    const urls = e.data;
    Promise.all(urls.map(url => fetch(url).then(response => response.json())))
      .then(data => {
        data.forEach(sortCarDecription);
        let latLngs = {
          'latLngOne': {'from': {'lat': 0, 'lng': 0}, 'to': {'lat' : 0, 'lng': 0}}, 
          'latLngTwo': {'from': {'lat': 0, 'lng': 0}, 'to': {'lat' : 0, 'lng': 0}}, 
          'latLngThree': {'from': {'lat': 0, 'lng': 0}, 'to': {'lat' : 0, 'lng': 0}}
        };
        let cars = [];
        let prices = {'priceOne': [], 'priceTwo': [], 'priceThree': []};
        let newData = {cars: [], prices: {'priceOne': [], 'priceTwo': [], 'priceThree': []}, distances: {'distanceOne': 0, 'distanceTwo': 0, 'distanceThree': 0}};
        
        data[0].journeys.forEach(({legs}) => {
          legs[0].results.forEach(({carDetails}) => {
            cars.push(carDetails.description);
          });
        });
        data.forEach((dataItem, index) => {
          const i = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
          dataItem.journeys.forEach(({legs}) => {
            const leg = legs[0];
            latLngs[`latLng${i}`]['from']['lat'] = leg.pickupLocation.latLng.latitude;
            latLngs[`latLng${i}`]['from']['lng'] = leg.pickupLocation.latLng.longitude;
            latLngs[`latLng${i}`]['to']['lat'] = leg.dropoffLocation.latLng.latitude;
            latLngs[`latLng${i}`]['to']['lng'] = leg.dropoffLocation.latLng.longitude;
            
            leg.results.forEach(({price}) => {
              prices[`price${i}`].push(price);
            });
          });
        });

        newData.cars = cars;
        newData.prices = prices;
        fetchDistancesWorker.postMessage(latLngs);
        new Promise((resolve, reject) => {
          fetchDistancesWorker.onmessage = function(e) {
            if (e.data.error) {
              reject(e.data.error);
            } else {
              resolve(e.data);
            }
          };
        })
        .then(distancesData => {
          newData.distances = distancesData;
          self.postMessage(newData);
        })
        .catch(error => {
          console.error('Error fetching distances:', error);
        });
      })
      .catch(error => {
        self.postMessage({ error: error.message });
      });
  }, false);


  const carDescriptionOrder = [
    'Standard',
    'People Carrier',
    'Minibus',
    'Large People Carrier',
    'Executive People Carrier',
    'Luxury',
    'Executive',
    'Electric Standard',
    'Electric Luxury'
  ];

  const carOrderIndexes = carDescriptionOrder.reduce((acc, description, index) => {
    acc[description] = index;
    return acc;
  }, {});
  function sortCarDecription(websiteData) {
    websiteData.journeys.forEach((journey) => {
      journey.legs[0].results.sort((a, b) => {
        const aOrderIndex = carOrderIndexes[a.carDetails.description];
        const bOrderIndex = carOrderIndexes[b.carDetails.description];
        if (aOrderIndex === undefined && bOrderIndex === undefined) return 0;
        if (aOrderIndex === undefined) return 1;
        if (bOrderIndex === undefined) return -1;
        return aOrderIndex - bOrderIndex;
      });
    });
  }