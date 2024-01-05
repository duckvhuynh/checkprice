const fetchMytransfersWorker = new Worker('worker/fetchMytransfersWorker.js');
const fetchElifeLimoWorker = new Worker('worker/fetchElifeLimoWorker.js');
const fetchDataWorker = new Worker('worker/fetchDataWorker.js');
const fetchJayRideWorker = new Worker('worker/fetchJayRideWorker.js');
const fetchTaxi2AirportWorker = new Worker('worker/fetchTaxi2AirportWorker.js');

fetchDataWorker.addEventListener('message', function(event) {
  const data = event.data;
  if (data.error) {
    console.error('Error fetching data:', data.error);
    showWarning("No data found");
    hideLoadingSpinner();
    showInstructions('Please enter a route');
  } else {
    processWebsiteData(data);
  }
});

function processWebsiteData(websiteData) {
  hideInstructions();
  clearAll();
  showTableHeader();
  processRoute(websiteData);
  processMain(websiteData);
  hideLoadingSpinner();
  showAllTables();
}

function processMain(websiteData) {
  processBooking(websiteData);
  processData(websiteData);
}

function createTableCell(row, textContent) {
  const cell = row.insertCell();
  cell.textContent = textContent;
  return cell;
}

function processRoute(websiteData) {
  const dataTableRoute = document.querySelector("#data-table-route tbody");
  const leg = websiteData.journeys[0].legs[0];
  const pickup = leg.pickupLocation.name.split(',')[0];
  const dropoff = leg.dropoffLocation.name.split(',')[0];
  const dateTime = leg.requestedPickupDateTime;
  const currency = leg.results[0].currency;
  const distance = leg.results[0].drivingDistance;
  const time = leg.results[0].duration;

  const rowRoute = dataTableRoute.insertRow();
  createTableCell(rowRoute, pickup);
  createTableCell(rowRoute, dropoff);
  createTableCell(rowRoute, dateTime.substring(0, 16));
  createTableCell(rowRoute, currency);
  createTableCell(rowRoute, distance ? `${distance.toFixed(2)} km (${time} min)` : "N/A");

  addCopyOnClickRoute();
  addCopyOnClickDistance();
}

fetchMytransfersWorker.addEventListener('message', function(e) {
  const data = e.data;
  clearTable("#data-table-mytransfers");
  processMyTransfers(data);
});

function processMyTransfers(data) {
  const dataTableMytransfers = document.querySelector("#data-table-mytransfers tbody");
  if (data.response) {
      data.response.transferPriceList.forEach((transfer, index) => {
          const row = dataTableMytransfers.insertRow();
          createTableCell(row, ++index);
          createTableCell(row, transfer.transportName);
          createTableCell(row, `${(transfer.price * 1.09476082005).toFixed(2)}`);
      });
      showMyTransfers();
    } else {
        console.log('No data found');
        showWarning("No data found for Mytransfers");
        hideMyTransfers();
    }
}

fetchElifeLimoWorker.addEventListener('message', function(e) {
  clearTable("#data-table-elifelimo");
  const data = e.data;

  if (data.fleets[0].vehicle_classes) {
    const dataTableElifelimo = document.querySelector("#data-table-elifelimo tbody");
    const filteredVehicleClasses = data.fleets[0].vehicle_classes.filter(vehicle => 
      carDescriptionOrderElifeLimo.includes(vehicle.vehicle_class)
     );
    const sortedVehicleClasses = sortDescriptionElifeLimo(filteredVehicleClasses);
    sortedVehicleClasses.forEach((vehicle, index) => {
      const { typical_vehicle: { manufacturer, model }, vehicle_class, price: { amount } } = vehicle;
      const row = dataTableElifelimo.insertRow();
      createTableCell(row, ++index);
      createTableCell(row, `${manufacturer} ${model}`);
      createTableCell(row, vehicle_class);
      createTableCell(row, amount);
    });
    addCopyOnClickElife();
    showElifeLimo();
  } else {
    console.error('Error:', data.error);
    showWarning("No data found for ElifeLimo");
    hideElifeLimo();
  }
}, false);

// async function processElfieLimo(websiteData) {
//   const locationData = websiteData.journeys[0].legs[0];
//   const { passenger, pickupLocation, dropoffLocation, requestedPickupDateTime: dateTime } = locationData;
//   const { name: pickupName, locationId: pickupID, latLng: { latitude: pickupLatitude, longitude: pickupLongitude }, establishment: establishment } = pickupLocation;
//   const { name: dropoffName, locationId: dropoffID, latLng: { latitude: dropoffLatitude, longitude: dropoffLongitude } } = dropoffLocation;

//   routeMap(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude);

//   const dateTimeRequest = dateTime.substring(0, 16).replace(" ", "T");
//   const dateTimeURL = encodeURIComponent(dateTime.substring(0, 16));
//   const dateTimeUTC = new Date(dateTime);
//   const urlSixt = `https://www.sixt.com/ride/new/offers?datetime=${dateTimeUTC.getTime()}&destination=${dropoffID}&pickup=${pickupID}&type=DISTANCE`;
//   const urlMyTransfers = `https://www.mytransfers.com/api/list?adults=2&arrival_date=${dateTimeURL}&arrival_lat=${pickupLatitude}&arrival_lng=${pickupLongitude}&departure_lat=${dropoffLatitude}&departure_lng=${dropoffLongitude}&lang=en&type=oneway`;

//   dateTimeUTC.setHours(dateTimeUTC.getHours() + 5);
//   const utcFormat = dateTimeUTC.getTime() / 1000;

//   let request = {
//     "include_return_trip": false,
//     "passenger": {"count": passenger},
//     "flight": {"landing_datetime_local": dateTimeRequest},
//     "from_location": {"type": "airport-terminal", "description": pickupName, "lat": pickupLatitude, "lng": pickupLongitude},
//     "to_location": {"type": "others", "description": dropoffName, "lat": dropoffLatitude, "lng": dropoffLongitude}
//   };

//   let taxi2airportRequest = {
//     "operationName": "Quotes",
//     "variables": {
//       "params": {
//         "partnerId": 18,
//         "hub": 0,
//         "directionality": "OUTBOUND",
//         "destination": dropoffName,
//         "isRoundTrip": false,
//         "adultPassengerCount": passenger,
//         "childPassengerCount": 0,
//         "infantPassengerCount": 0,
//         "luggage": 0,
//         "inboundPickup": "2023-12-21T00:00:00",
//         "outboundPickup": dateTimeRequest,
//         "preferredCurrencyCode": "USD"
//       }
//     },
//     "query": "query Quotes($params: RetrieveQuotesParams!) {\n  quotes(params: $params) {\n    vehicleCategory\n    passengerCapacity\n    luggageCapacity\n    pricePerPassenger\n    ids\n    price\n    discount\n    combinedBabyAndBoosterSeatsCapacity\n    travelAddons {\n      type\n      fare\n      quoteTravelAddonIdPairs\n      price {\n        price\n        vat\n        fareVat\n        partnerMargin\n        partnerMarginVat\n        platformMargin\n        platformMarginVat\n        __typename\n      }\n      maxAllowed\n      __typename\n    }\n    currencyCode\n    includedWaitingTimeInMinutes\n    __typename\n  }\n}\n"
//   };
//   async function fetchHubId() {
//     const response = await fetch(`https://www.taxi2airport.com/wp-json/vo/v1/locations/search?query=${encodeURIComponent(establishment)}`);
//     const data = await response.json();
  
//     const airportData = data.find(item => item.type === 'AIRPORT');
  
//     if (airportData) {
//       return airportData.hubId;
//     } else {
//       throw new Error('No airport data found');
//     }
//   }
  
//   fetchHubId().then(hubId => {
//     taxi2airportRequest.variables.params.hub = hubId;
//     fetchTaxi2AirportWorker.postMessage(taxi2airportRequest);
//   }).catch(error => {
//     console.error('Error:', error);
//   });

//   fetchJayRideWorker.postMessage(request);

//   let sixtElement = document.querySelector('#sixt-url');
//   sixtElement.innerHTML = `<a href="${urlSixt}" target="_blank">Sixt URL</a>`;

//   showSixtURL();

//   const getDistanceURL = `https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/routes/distance-time?from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}`;
//   let url;

//   fetchMytransfersWorker.postMessage(urlMyTransfers);

//   try {
//     const response = await fetch(getDistanceURL);
//     const data = await response.json();
//     const { distance } = data;
//     url = `https://k3zdvi12m6.execute-api.us-east-2.amazonaws.com/prod/ride-pricings?currency=USD&from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}&distance=${distance}&from_utc=${utcFormat}&from_time_str=${dateTimeURL}&passenger_count=${passenger}`;
//     fetchElifeLimoWorker.postMessage(url);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

function postMessageToWorker(worker, message) {
  worker.postMessage(message);
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function fetchHubId(establishment) {
  const data = await fetchJson(`https://www.taxi2airport.com/wp-json/vo/v1/locations/search?query=${encodeURIComponent(establishment)}`);
  const airportData = data.find(item => item.type === 'AIRPORT');

  if (!airportData) {
    throw new Error('No airport data found');
  }

  return airportData.hubId;
}

async function fetchDistance(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude) {
  const data = await fetchJson(`https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/routes/distance-time?from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}`);
  return data.distance;
}

function createTaxi2AirportRequest(params) {
  return {
    operationName: "Quotes",
    variables: { params },
    query: `query Quotes($params: RetrieveQuotesParams!) {
      quotes(params: $params) {
        vehicleCategory
        passengerCapacity
        luggageCapacity
        pricePerPassenger
        ids
        price
        discount
        combinedBabyAndBoosterSeatsCapacity
        travelAddons {
          type
          fare
          quoteTravelAddonIdPairs
          price {
            price
            vat
            fareVat
            partnerMargin
            partnerMarginVat
            platformMargin
            platformMarginVat
            __typename
          }
          maxAllowed
          __typename
        }
        currencyCode
        includedWaitingTimeInMinutes
        __typename
      }
    }`
  };
}

async function processData(websiteData) {
  const locationData = websiteData.journeys[0].legs[0];
  const { passenger, pickupLocation, dropoffLocation, requestedPickupDateTime: dateTime } = locationData;
  const { name: pickupName, locationId: pickupID, latLng: { latitude: pickupLatitude, longitude: pickupLongitude }, establishment: establishment } = pickupLocation;
  const { name: dropoffName, locationId: dropoffID, latLng: { latitude: dropoffLatitude, longitude: dropoffLongitude } } = dropoffLocation;

  routeMap(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude);

  const dateTimeRequest = dateTime.substring(0, 16).replace(" ", "T");
  const dateTimeURL = encodeURIComponent(dateTime.substring(0, 16));
  const dateTimeUTC = new Date(dateTime);
  dateTimeUTC.setHours(dateTimeUTC.getHours() + 5);
  const utcFormat = dateTimeUTC.getTime() / 1000;

  const urlSixt = `https://www.sixt.com/ride/new/offers?datetime=${dateTimeUTC.getTime()}&destination=${dropoffID}&pickup=${pickupID}&type=DISTANCE`;
  const urlMyTransfers = `https://www.mytransfers.com/api/list?adults=2&arrival_date=${dateTimeURL}&arrival_lat=${pickupLatitude}&arrival_lng=${pickupLongitude}&departure_lat=${dropoffLatitude}&departure_lng=${dropoffLongitude}&lang=en&type=oneway`;

  const request = {
    include_return_trip: false,
    passenger: { count: passenger },
    flight: { landing_datetime_local: dateTimeRequest },
    from_location: { type: "airport-terminal", description: pickupName, lat: pickupLatitude, lng: pickupLongitude },
    to_location: { type: "others", description: dropoffName, lat: dropoffLatitude, lng: dropoffLongitude }
  };

  const hubId = await fetchHubId(establishment);
  const taxi2airportRequest = createTaxi2AirportRequest({
    partnerId: 18,
    hub: hubId,
    directionality: "OUTBOUND",
    destination: dropoffName,
    isRoundTrip: false,
    adultPassengerCount: passenger,
    childPassengerCount: 0,
    infantPassengerCount: 0,
    luggage: 0,
    inboundPickup: "2023-12-21T00:00:00",
    outboundPickup: dateTimeRequest,
    preferredCurrencyCode: "USD"
  });

  postMessageToWorker(fetchTaxi2AirportWorker, taxi2airportRequest);
  postMessageToWorker(fetchJayRideWorker, request);

  document.querySelector('#sixt-url').innerHTML = `<a href="${urlSixt}" target="_blank">Sixt URL</a>`;

  showSixtURL();

  const distance = await fetchDistance(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude);
  const url = `https://k3zdvi12m6.execute-api.us-east-2.amazonaws.com/prod/ride-pricings?currency=USD&from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}&distance=${distance}&from_utc=${utcFormat}&from_time_str=${dateTimeURL}&passenger_count=${passenger}`;

  postMessageToWorker(fetchElifeLimoWorker, url);
  postMessageToWorker(fetchMytransfersWorker, urlMyTransfers);
}

function displayTaxi2AirportData(data) {
  const dataTable = document.querySelector('#data-table-taxi2airport tbody');

  sortQuotesByOrder(data.quotes);

  data.quotes.forEach((quote, index) => {
    const row = dataTable.insertRow();
    createTableCell(row, index + 1);
    createTableCell(row, quote.vehicleCategory);
    createTableCell(row, quote.price);
  });
}
fetchTaxi2AirportWorker.onmessage = function(event) {
  clearTable("#data-table-taxi2airport");
  displayTaxi2AirportData(event.data.data);
};

function processBooking(websiteData) {
  const dataTable = document.querySelector("#data-table tbody");
  sortCarDecription(websiteData);

  websiteData.journeys.forEach(({ legs }, journeyIndex) => {
    legs[0].results.forEach(({ carDetails, price, supplierName, supplierCategory }) => {
      const row = dataTable.insertRow();
      createTableCell(row, ++journeyIndex);
      createTableCell(row, carDetails.model);
      createTableCell(row, carDetails.description);
      createTableCell(row, price);
      createTableCell(row, supplierName);
      createTableCell(row, supplierCategory);
    });
  });
  showBooking();
  addCopyOnClickBooking();
}


function fetchWithHeadersAndPayload(url, headers, payload) {
  return fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });
}

function filterQuotesByType(quotes, type) {
  return quotes.filter(quote => quote.service_info.vehicle_type === type);
}

function populateVehicleTable(tableSelector, quotes) {
  const dataTable = document.querySelector(tableSelector + " tbody");
  quotes.forEach((quote, index) => {
    const row = dataTable.insertRow();
    createTableCell(row, index + 1);
    createTableCell(row, quote.service_info.supplier.name);
    createTableCell(row, (quote.fare.price / 1.44).toFixed(2));
  });
}

fetchJayRideWorker.addEventListener('message', function(e) {
  clearTable("#data-table-jayride");
  clearTable("#data-table-jayride2");

  const data = e.data;

  if (data.results.quotes) {
    const dataTable = document.querySelector("#data-table-jayride tbody");
    
    const sortedQuotes = sortAndCategorizeQuotes(data.results.quotes);

    for (let index = 0; index < 3; index++) {
      const quoteGroup = sortedQuotes[index] || {};
      const row = dataTable.insertRow();
      row.insertCell(0).textContent = index + 1;

      ['SEDAN', 'SUV', 'VAN', 'BUS'].forEach((type, typeIndex) => {
        const supplierCell = row.insertCell(1 + typeIndex * 2);
        const priceCell = row.insertCell(2 + typeIndex * 2);
        const quote = quoteGroup[type];

        if (quote) {
          supplierCell.textContent = quote.service_info.supplier.name;
          priceCell.textContent = (quote.fare.price / 1.44).toFixed(2);
        } else {
          supplierCell.textContent = '-';
          priceCell.textContent = '-';
        }
      });
    }
    const dataTable2 = document.querySelector("#data-table-jayride2 tbody");

    ['SEDAN', 'SUV', 'VAN', 'BUS'].forEach((type, typeIndex) => {
      const row = dataTable2.insertRow();

      const vehicleCell = row.insertCell(0);
      vehicleCell.textContent = type;

      for (let index = 0; index < 3; index++) {
        const quoteGroup = sortedQuotes[index] || {};
        const priceCell = row.insertCell(1 + index * 2);
        const supplierCell = row.insertCell(2 + index * 2);
        const quote = quoteGroup[type];

        if (quote) {
          priceCell.textContent = (quote.fare.price / 1.44).toFixed(2);
          supplierCell.textContent = quote.service_info.supplier.name;
        } else {
          priceCell.textContent = '-';
          supplierCell.textContent = '-';
        }
      }
    });
    showJayride();
  } else {
    console.log('No data found for Jayride');
    showWarning("No data found for Jayride");
    hideJayride();
  }
});

function showJayride() {
  document.getElementById('jayride-container').style.display = 'block';
}

function hideJayride() {
  document.getElementById('jayride-container').style.display = 'none';
}
function sortAndCategorizeQuotes(quotes) {
  const sedans = [];
  const suvs = [];
  const vans = [];
  const buses = [];

  quotes.forEach(quote => {
    switch (quote.service_info.vehicle_type.toLowerCase()) {
      case 'sedan':
        sedans.push(quote);
        break;
      case 'suv':
        suvs.push(quote);
        break;
      case 'van':
        vans.push(quote);
        break;
      case 'bus':
        buses.push(quote);
        break;
      default:
        break;
    }
  });

  sedans.sort((a, b) => a.fare.price - b.fare.price);
  suvs.sort((a, b) => a.fare.price - b.fare.price);
  vans.sort((a, b) => a.fare.price - b.fare.price);
  buses.sort((a, b) => a.fare.price - b.fare.price);

  const sortedQuotes = [];
  const maxLength = Math.max(sedans.length, suvs.length, vans.length, buses.length);
  for (let i = 0; i < maxLength; i++) {
    sortedQuotes.push({
      SEDAN: sedans[i] || null,
      SUV: suvs[i] || null,
      VAN: vans[i] || null,
      BUS: buses[i] || null,
    });
  }

  return sortedQuotes;
}