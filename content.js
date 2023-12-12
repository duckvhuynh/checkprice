const fetchMytransfersWorker = new Worker('fetchMytransfersWorker.js');
const fetchElifeLimoWorker = new Worker('fetchElifeLimoWorker.js');

async function fetchDataFromNetwork(link) {
  try {
    const response = await fetch(link);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    processWebsiteData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

function processWebsiteData(websiteData) {
  if (websiteData && websiteData.journeys) {
      hideInstructions();
      clearAll();
      showTableHeader();
      processRoute(websiteData);
      processMain(websiteData);
      // addCopyOnClick();
  } else {
      console.error('Website data or journeys is undefined');
      showWarning("No data found");
      hideBooking();
      showInstructions('Please enter a route');
  }
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

const carDescriptionOrderElifeLimo = [
  'Sedan',
  'MPV-4',
  'Minibus-8',
  'MPV-5',
  'Business MPV-5',
  'First Class',
  'Business Sedan'
];

const carDescriptionOrderJayRide = [
  'sedan',
  'suv',
  'van',
  'bus'
];

const carOrderIndexes = carDescriptionOrder.reduce((acc, description, index) => {
  acc[description] = index;
  return acc;
}, {});

const carOrderIndexesJayRide = carDescriptionOrderJayRide.reduce((acc, description, index) => {
  acc[description] = index;
  return acc;
}, {});

const carOrderIndexesElifeLimo = carDescriptionOrderElifeLimo.reduce((acc, description, index) => {
  acc[description] = index;
  return acc;
}, {});

function processMain(websiteData) {
  processBooking(websiteData);
  processElfieLimo(websiteData);
}

let cellTime;
function processRoute(websiteData) {
  const dataTableRoute = document.querySelector("#data-table-route tbody");
  const leg = websiteData.journeys[0].legs[0];
  const pickup = leg.pickupLocation.name.split(',')[0];
  const dropoff = leg.dropoffLocation.name.split(',')[0];
  const dateTime = leg.requestedPickupDateTime;
  const currency = leg.results[0].currency;
  const rowRoute = dataTableRoute.insertRow();
  const cellPickup = rowRoute.insertCell(0);
  const cellDropoff = rowRoute.insertCell(1);
  const cellDateTime = rowRoute.insertCell(2);
  const cellCurrency = rowRoute.insertCell(3);
  cellTime = rowRoute.insertCell(4);
  cellPickup.textContent = pickup;
  cellDropoff.textContent = dropoff;
  cellDateTime.textContent = dateTime.substring(0, 16);
  cellCurrency.textContent = currency;
  addCopyOnClickRoute();
}

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

function sortDescriptionElifeLimo(vehicleClasses) {
  return vehicleClasses.sort((a, b) => {
      const aOrderIndex = carOrderIndexesElifeLimo[a.vehicle_class];
      const bOrderIndex = carOrderIndexesElifeLimo[b.vehicle_class];
      if (aOrderIndex === undefined && bOrderIndex === undefined) return 0;
      if (aOrderIndex === undefined) return 1;
      if (bOrderIndex === undefined) return -1;
      return aOrderIndex - bOrderIndex;
  });
}
function sortDescriptionJayride(quotes) {
  const groupedQuotes = quotes.reduce((groups, quote) => {
      const vehicleType = quote.service_info.vehicle_type;
      if (!groups[vehicleType]) {
          groups[vehicleType] = [];
      }
      groups[vehicleType].push(quote);
      return groups;
  }, {});

  Object.keys(groupedQuotes).forEach(vehicleType => {
      groupedQuotes[vehicleType].sort((a, b) => a.fare.price - b.fare.price);
      groupedQuotes[vehicleType] = groupedQuotes[vehicleType].slice(0, 3);
  });

  const sortedQuotes = [].concat(...Object.values(groupedQuotes));

  return sortedQuotes;
}

fetchMytransfersWorker.addEventListener('message', function(e) {
  const data = e.data;
  clearTable("#data-table-mytransfers");
  processMyTransfers(data);
});

function processMyTransfers(data) {
  const dataTableMytransfers = document.querySelector("#data-table-mytransfers tbody");
  if (data) {
      data.response.transferPriceList.forEach((transfer, index) => {
          const row = dataTableMytransfers.insertRow();
          row.insertCell(0).textContent = ++index;
          row.insertCell(1).textContent = transfer.transportName;
          row.insertCell(2).textContent = `${(transfer.price * 1.09476082005).toFixed(2)}`;
      });
      showMyTransfers();
    } else {
        console.log('No data found');
        showWarning("No data found for Mytransfers");
        hideMyTransfers();
    }
}

fetchElifeLimoWorker.addEventListener('message', function(e) {
  const data = e.data;
  if (data.error) {
    console.error('Error:', data.error);
    showWarning("No data found for ElifeLimo");
    hideElifeLimo();
  } else {
    const dataTableElifelimo = document.querySelector("#data-table-elifelimo tbody");
    const filteredVehicleClasses = data.fleets[0].vehicle_classes.filter(vehicle => 
      carDescriptionOrderElifeLimo.includes(vehicle.vehicle_class)
     );
    const sortedVehicleClasses = sortDescriptionElifeLimo(filteredVehicleClasses);
    sortedVehicleClasses.forEach((vehicle, index) => {
        const row = dataTableElifelimo.insertRow();
        row.insertCell(0).textContent = ++index
        row.insertCell(1).textContent = vehicle.typical_vehicle.manufacturer + " " + vehicle.typical_vehicle.model;
        row.insertCell(2).textContent = vehicle.vehicle_class;
        row.insertCell(3).textContent = vehicle.price.amount;
    });
    addCopyOnClickElife();
    showElifeLimo();
  }
}, false);

function processElfieLimo(websiteData) {
// const dataTableElifelimo = document.querySelector("#data-table-elifelimo tbody");
const locationData = websiteData.journeys[0].legs[0];
const passenger = websiteData.journeys[0].legs[0].passenger;
const pickupName = locationData.pickupLocation.name;
const dropoffName = locationData.dropoffLocation.name;
const pickupID = locationData.pickupLocation.locationId;
const dropoffID = locationData.dropoffLocation.locationId;
const pickupLatitude = locationData.pickupLocation.latLng.latitude;
const pickupLongitude = locationData.pickupLocation.latLng.longitude;
const dropoffLatitude = locationData.dropoffLocation.latLng.latitude;
const dropoffLongitude = locationData.dropoffLocation.latLng.longitude;
const dateTime = locationData.requestedPickupDateTime;
const dateTimeURL = encodeURI(dateTime.substring(0, 16));
const dateTimeUTC = new Date(dateTime);
const urlSixt = `https://www.sixt.com/ride/new/offers?datetime=${dateTimeUTC.getTime()}&destination=${dropoffID}&pickup=${pickupID}&type=DISTANCE`;
const urlMyTransfers = `https://www.mytransfers.com/api/list?adults=2&arrival_date=${dateTimeURL}&arrival_lat=${pickupLatitude}&arrival_lng=${pickupLongitude}&departure_lat=${dropoffLatitude}&departure_lng=${dropoffLongitude}&lang=en&type=oneway`;
dateTimeUTC.setHours(dateTimeUTC.getHours() + 5);
const utcFormat = dateTimeUTC.getTime() / 1000;


let request = {
  "include_return_trip": false,
  "passenger": {"count": passenger},
  "flight": {"landing_datetime_local": dateTime.substring(0, 16).replace(" ", "T")},
  "from_location": {"type": "airport-terminal", "description": pickupName, "lat": pickupLatitude, "lng": pickupLongitude},
  "to_location": {"type": "others", "description": dropoffName, "lat": dropoffLatitude, "lng": dropoffLongitude}
};

fetchJayRideWorker.postMessage(request);
//fetchJayRide(request);

let sixtElement = document.querySelector('#sixt-url');
sixtElement.innerHTML = `<a href="${urlSixt}" target="_blank">Sixt URL</a>`;

showSixtURL();

const getDistanceURL = `https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/routes/distance-time?from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}`;
let url;

fetchMytransfersWorker.postMessage(urlMyTransfers);

fetch(getDistanceURL)
  .then(response => response.json())
  .then(data => {
      const distance = data.distance;
      if (data) {
          const time = data.time / 60;
          const distance = data.distance / 1000;
          cellTime.textContent = distance.toFixed(2) + " km" + " (" + time.toFixed(0) + " min)";
      } else {
          console.log('No data found');
      }
      url = `https://k3zdvi12m6.execute-api.us-east-2.amazonaws.com/prod/ride-pricings?currency=USD&from_lat=${pickupLatitude}&from_lng=${pickupLongitude}&to_lat=${dropoffLatitude}&to_lng=${dropoffLongitude}&distance=${distance}&from_utc=${utcFormat}&from_time_str=${dateTimeURL}&passenger_count=${passenger}`;
      fetchElifeLimoWorker.postMessage(url);
  })
  .catch(error => console.error('Error:', error));
}

function processBooking(websiteData) {
  const dataTable = document.querySelector("#data-table tbody");
  sortCarDecription(websiteData);

  websiteData.journeys.forEach(({ legs }, journeyIndex) => {
    legs[0].results.forEach(({ carDetails, price, supplierName, supplierCategory }) => {
      const row = dataTable.insertRow();
      row.insertCell(0).textContent = ++journeyIndex;
      row.insertCell(1).textContent = carDetails.model;
      row.insertCell(2).textContent = carDetails.description;
      row.insertCell(3).textContent = price;
      row.insertCell(4).textContent = supplierName;
      row.insertCell(5).textContent = supplierCategory;
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

const fetchJayRideWorker = new Worker('fetchJayRideWorker.js');
fetchJayRideWorker.addEventListener('message', function(e) {
  clearTable("#data-table-jayride");
  const data = e.data;

  if (data) {
    const dataTableJayRide = document.querySelector("#data-table-jayride tbody");
    const sortedQuotes = sortDescriptionJayride(data.results.quotes);
    sortedQuotes.forEach((quote, index) => {
      const row = dataTableJayRide.insertRow();
      row.insertCell(0).textContent = ++index;
      row.insertCell(1).textContent = quote.service_info.vehicle_type;
      row.insertCell(2).textContent = quote.service_info.supplier.name;
      row.insertCell(3).textContent = (quote.fare.price / 1.44).toFixed(2);
    });
    showJayride();
  } else {
    console.log('No data found for Jayride');
    showWarning("No data found for Jayride");
    hideJayride();
  }
});