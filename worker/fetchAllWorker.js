self.addEventListener('message', async (e) => {
  try {
    const urls = e.data;
    const data = await Promise.all(urls.map(url => fetch(url).then(response => response.json())));

    data.forEach(sortCarDecription);

    const newData = {
      cars: getCars(data),
      prices: getPrices(data),
      distances: getDistances(data)
    };

    self.postMessage(newData);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
}, false);

function getCars(data) {
  return data[0].journeys.flatMap(({legs}) => legs[0].results.map(({carDetails}) => carDetails.description));
}

function getPrices(data) {
  return data.reduce((prices, dataItem, index) => {
    const i = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
    prices[`price${i}`] = dataItem.journeys.flatMap(({legs}) => legs[0].results.map(({price}) => price));
    return prices;
  }, {});
}

function getDistances(data) {
  return data.map(dataItem => dataItem.journeys[0].legs[0].results[0].drivingDistance);
}

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