const fetchMytransfersWorker = new Worker('worker/fetchMytransfersWorker.js');
const fetchElifeLimoWorker = new Worker('worker/fetchElifeLimoWorker.js');
const fetchDataWorker = new Worker('worker/fetchDataWorker.js');
const fetchJayRideWorker = new Worker('worker/fetchJayRideWorker.js');
let pickup = '';
let dropoff = '';
fetchDataWorker.addEventListener('message', function(e) {
  const data = e.data;
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
  processElfieLimo(websiteData);
}

function processRoute(websiteData) {
  const dataTableRoute = document.querySelector("#data-table-route tbody");
  const leg = websiteData.journeys[0].legs[0];
  pickup = leg.pickupLocation.name.split(',')[0];
  dropoff = leg.dropoffLocation.name.split(',')[0];
  const dateTime = leg.requestedPickupDateTime;
  const currency = leg.results[0].currency;
  const distance = leg.results[0].drivingDistance;
  const time = leg.results[0].duration;
  const rowRoute = dataTableRoute.insertRow();
  const cellPickup = rowRoute.insertCell(0);
  const cellDropoff = rowRoute.insertCell(1);
  const cellDateTime = rowRoute.insertCell(2);
  const cellCurrency = rowRoute.insertCell(3);
  const cellDistance = rowRoute.insertCell(4);
  cellPickup.textContent = pickup;
  cellDropoff.textContent = dropoff;
  cellDateTime.textContent = dateTime.substring(0, 16);
  cellCurrency.textContent = currency;
  cellDistance.textContent = distance.toFixed(2) + " km" + " (" + time + " min)";
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
  clearTable("#data-table-elifelimo");
  const data = e.data;

  if (data.fleets[0].vehicle_classes) {
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
  } else {
    console.error('Error:', data.error);
    showWarning("No data found for ElifeLimo");
    hideElifeLimo();
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
  // routeMap(pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude);
  const dateTime = locationData.requestedPickupDateTime;
  const dateTimeURL = encodeURIComponent(dateTime.substring(0, 16));
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

function clearTable(selector) {
  const tableBody = document.querySelector(selector + " tbody");
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
}

function filterQuotesByType(quotes, type) {
  return quotes.filter(quote => quote.service_info.vehicle_type === type);
}

function populateVehicleTable(tableSelector, quotes) {
  const dataTable = document.querySelector(tableSelector + " tbody");
  quotes.forEach((quote, index) => {
    const row = dataTable.insertRow();
    row.insertCell(0).textContent = index + 1;
    row.insertCell(1).textContent = quote.service_info.supplier.name;
    row.insertCell(2).textContent = (quote.fare.price / 1.44).toFixed(2);
  });
}

fetchJayRideWorker.addEventListener('message', function(e) {
  clearTable("#data-table-jayride");
  clearTable("#data-table-jayride2");

  const data = e.data;

  if (data.results.quotes) {
    const dataTable = document.querySelector("#data-table-jayride tbody");

    console.log(data);
    const sortedQuotes = sortAndCategorizeQuotes(data.results.quotes);
    console.log(sortedQuotes);

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

      // Insert the "Route" cell only for the first row
      if (typeIndex === 0) {
        const routeCell = row.insertCell(0);
        routeCell.textContent = `${pickup} - ${dropoff}`;
        routeCell.rowSpan = 4;  // Make the cell span across 4 rows
      }

      const vehicleCell = row.insertCell(typeIndex === 0 ? 1 : 0);
      vehicleCell.textContent = type;

      for (let index = 0; index < 3; index++) {
        const quoteGroup = sortedQuotes[index] || {};
        const supplierCell = row.insertCell(typeIndex === 0 ? 2 + index * 2 : 1 + index * 2);
        const priceCell = row.insertCell(typeIndex === 0 ? 3 + index * 2 : 2 + index * 2);
        const quote = quoteGroup[type];

        if (quote) {
          supplierCell.textContent = quote.service_info.supplier.name;
          priceCell.textContent = (quote.fare.price / 1.44).toFixed(2);
        } else {
          supplierCell.textContent = '-';
          priceCell.textContent = '-';
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

function showWarning(message) {
  const warningElement = document.getElementById('warning-message');
  warningElement.textContent = message;
  warningElement.style.display = 'block';
}

function hideJayride() {
  document.getElementById('jayride-container').style.display = 'none';
}
function sortAndCategorizeQuotes(quotes) {

  console.log(quotes);

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