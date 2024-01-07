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
    hideLoadingSkeleton();
    showInstructions('🛈 Please enter a route');
  } else {
    processWebsiteData(data);
  }
});

function processWebsiteData(websiteData) {
  //hideInstructions();
  hideLoadingSkeleton();
  clearAll();
  showAllTables();
  processRoute(websiteData);
  processMain(websiteData);
  hideLoadingSpinner();
}

function processMain(websiteData) {
  processBooking(websiteData);
  processData(websiteData);
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
  displayValue(rowRoute, pickup);
  displayValue(rowRoute, dropoff);
  displayValue(rowRoute, dateTime.substring(0, 16));
  displayValue(rowRoute, distance ? `${distance.toFixed(2)} km (${time} min)` : "N/A");
  displayValue(rowRoute, currency);
  
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
          displayValue(row, ++index);
          displayValue(row, transfer.transportName);
          displayValue(row, `${(transfer.price * 1.09476082005).toFixed(2)}`);
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
      displayValue(row, ++index);
      displayValue(row, `${manufacturer} ${model}`);
      displayValue(row, vehicle_class);
      displayValue(row, amount);
    });
    addCopyOnClickElife();
    showElifeLimo();
  } else {
    console.error('Error:', data.error);
    showWarning("No data found for ElifeLimo");
    hideElifeLimo();
  }
}, false);

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
    displayValue(row, index + 1);
    displayValue(row, quote.vehicleCategory);
    displayValue(row, quote.price);
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
      displayValue(row, ++journeyIndex);
      displayValue(row, carDetails.model);
      displayValue(row, carDetails.description);
      displayValue(row, price);
      displayValue(row, supplierName, supplierName === "MyTravelThru" ? "is-mtt" : "");
      displayValue(row, supplierCategory);
    });
  });
  showBooking();
  addCopyOnClickBooking();
}

fetchJayRideWorker.addEventListener('message', function(e) {
  clearTable("#data-table-jayride");
  clearTable("#data-table-jayride2");

  const data = e.data;

  if (data.results.quotes) {
    const sortedQuotes = sortAndCategorizeQuotes(data.results.quotes);

    for (let index = 0; index < 3; index++) {
      const quoteGroup = sortedQuotes[index] || {};
      createQuoteRow(document.querySelector("#data-table-jayride tbody"), quoteGroup, index);
    }

    ['SEDAN', 'SUV', 'VAN', 'BUS'].forEach((type) => {
      createVehicleRow(document.querySelector("#data-table-jayride2 tbody"), sortedQuotes, type);
    });

    showJayride();
  } else {
    console.log('No data found for Jayride');
    showWarning("No data found for Jayride");
    hideJayride();
  }
});
