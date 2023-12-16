self.addEventListener('message', function(e) {
    const urls = e.data; // Assuming you're passing an array of URLs
    Promise.all(urls.map(url => fetch(url).then(response => response.json())))
      .then(data => {

        data.forEach(sortCarDecription);
        // self.postMessage(data);
        // console.log(data);
        var newData = {cars: [], prices: {'priceOne': [], 'priceTwo': [], 'priceThree': []}}
        var cars = [];
        var prices = {'priceOne': [], 'priceTwo': [], 'priceThree': []};
        console.log(data[0]);
        console.log(data);
        data[0].journeys.forEach(({legs}) => {
          legs[0].results.forEach(({carDetails}) => {
            cars.push(carDetails.description);
          });
        });
        //console.log(data[0]);
        console.log(cars);

        data.forEach((data, index) => {
          var i = index === 0 ? 'One' : index === 1 ? 'Two' : 'Three';
          index++;
          console.log(data);
          data.journeys.forEach(({legs}) => {
            legs[0].results.forEach(({price}) => {
              prices[`price${i}`].push(price);
            });
          });
        });

        newData.cars = cars;
        newData.prices = prices;
        
        self.postMessage(newData);
        console.log(newData);
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