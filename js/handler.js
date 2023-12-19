function search(input, iconId, listId, worker, pickupLocationId, destinationId) {
  const locationIcon = document.querySelector(iconId);
  const list = document.querySelector(listId);
  const pickupLocation = document.querySelector(pickupLocationId).dataset.placeid ? document.querySelector(pickupLocationId) : document.querySelector(destinationId);
  const data = {input: input, placeid: '', lat: 0, lon: 0};

  if (!input) {
    locationIcon.src = '../icon/location.svg';
    if (list) {
      list.innerHTML = '';
      list.style.display = 'none';
    }
    return;
  }
  data.placeid = pickupLocation.dataset.placeid ? pickupLocation.dataset.placeid : '';
  data.lat = pickupLocation.dataset.lat ? pickupLocation.dataset.lat : 0;
  data.lon = pickupLocation.dataset.lon ? pickupLocation.dataset.lon : 0;
  worker.postMessage(data);
}

function updateList(predictions, listId, inputId, iconId) {
  const list = document.querySelector(listId);
  const input = document.querySelector(inputId);


  if (!list) {
      console.error(`Element with id "${listId}" not found`);
      return;
  }
  list.innerHTML = '';

  const fragment = document.createDocumentFragment();

  predictions.forEach(prediction => {
    const item = document.createElement('li');
    item.classList.add('list-item');
  
    const mainText = document.createElement('span');
    mainText.classList.add('main-text');
    mainText.textContent = prediction.description;
  
    const secondaryText = document.createElement('span');
    secondaryText.classList.add('secondary-text');
    secondaryText.textContent = `\n${prediction.city}, ${prediction.country}`;
  
    const icon = document.createElement('img');
    icon.src = prediction['location-icon'];
    icon.alt = 'Location icon';
    icon.classList.add('location-icon');
  
    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container');
    textContainer.appendChild(mainText);
    textContainer.appendChild(secondaryText);
  
    item.appendChild(icon);
    item.appendChild(textContainer);
  
    item.dataset.description = prediction.description;
    item.dataset.placeid = prediction.place_id;
    item.dataset.lat = prediction.lat;
    item.dataset.lon = prediction.lon;
  
    fragment.appendChild(item);
  });

  list.appendChild(fragment);
  list.style.display = 'block';

  list.addEventListener('click', function(event) {
      const item = event.target.closest('.list-item');
      if (item) {
      event.stopPropagation();
      const locationIcon = document.querySelector(iconId);
      locationIcon.src = item.querySelector('.location-icon').src;
      input.value = item.dataset.description;
      input.dataset.placeid = item.dataset.placeid;
      input.dataset.lat = item.dataset.lat;
      input.dataset.lon = item.dataset.lon;
      list.innerHTML = '';
      list.style.display = 'none';
      }
  });
}
function generateDynamicLinks(pickup, destination, date, time, passenger) {
  const baseURL = "https://taxi.booking.com/search-results-mfe/rates?format=envelope";

  const generateLink = (pickup, dropoff) => {
    const queryParams = {
      passenger: passenger,
      pickup: pickup,
      pickupDateTime: `${date}T${time}`,
      dropoff: dropoff,
      affiliate: "booking-taxi",
      language: "en-gb",
      currency: "USD",
    };

    const queryString = Object.keys(queryParams)
      .map((key) => `${key}=${queryParams[key]}`)
      .join("&");

    return `${baseURL}&${queryString}`;
  };

  if (Array.isArray(pickup)) {
    return pickup.filter(Boolean).map(pickupLocation => generateLink(pickupLocation, destination));
  }

  if (Array.isArray(destination)) {
    return destination.filter(Boolean).map(destinationLocation => generateLink(pickup, destinationLocation));
  }

  return [generateLink(pickup, destination)];
}
  
function showLoadingSpinner() {
    const submitButton = document.querySelector('#submit-button');
    const spinner = document.createElement("div");
    spinner.classList.add("loader");
    submitButton.textContent = '';
    if (!submitButton.contains(spinner)) {
    submitButton.appendChild(spinner);
    }
}

function hideLoadingSpinner() {
    const submitButton = document.querySelector('#submit-button');
    const spinner = document.createElement("div");
    spinner.classList.add("loader");
    submitButton.textContent = 'Search';
    if (submitButton.contains(spinner)) {
        submitButton.removeChild(spinner);
    }
}

function setupWorker(worker, listSelector, inputSelector, iconSelector) {
    worker.addEventListener('message', function(e) {
      const processedData = e.data;
      if (processedData) {
        updateList(processedData, listSelector, inputSelector, iconSelector);
      } else {
        console.error('Predictions not found in response data');
      }
    }, false);
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

  const sortedVehicleTypes = carDescriptionOrderJayRide.filter(type => groupedQuotes.hasOwnProperty(type));

  sortedVehicleTypes.forEach(vehicleType => {
      groupedQuotes[vehicleType].sort((a, b) => a.fare.price - b.fare.price);
      groupedQuotes[vehicleType] = groupedQuotes[vehicleType].slice(0, 3);
  });
  const sortedQuotes = sortedVehicleTypes.flatMap(vehicleType => groupedQuotes[vehicleType]);

  return sortedQuotes;
}