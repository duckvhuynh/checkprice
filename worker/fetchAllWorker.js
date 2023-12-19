self.addEventListener('message', function(e) {
  const urls = e.data;
  Promise.all(urls.map(url => fetch(url).then(response => response.json())))
    .then(data => {
      data.forEach(sortCarDecription);
      let cars = [];
      let prices = {};
      let newData = {cars: [], prices: {}, distances: []};

      data[0].journeys.forEach(({legs}) => {
        legs[0].results.forEach(({carDetails}) => {
          cars.push(carDetails.description);
        });
      });
      data.forEach((dataItem, index) => {
        const i = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
        prices[`price${i}`] = [];
        newData.distances.push(dataItem.journeys[0].legs[0].results[0].drivingDistance);
        dataItem.journeys.forEach(({legs}) => {
          legs[0].results.forEach(({price}) => {
            prices[`price${i}`].push(price);
          });
        });
      });

      newData.cars = cars;
      newData.prices = prices;
      self.postMessage(newData);
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