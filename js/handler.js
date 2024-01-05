const path = window.location.pathname.includes('multi') ? '../icon/' : 'icon/';
let listItemTemplate = null;
let spinner = null;
let notificationCount = 0;


function swapInputs(input1, input2, icon1Selector, icon2Selector) {
  const tempValue = input1.value;
  const tempPlaceId = input1.getAttribute('data-placeid');
  const tempIconSrc = document.getElementById(icon1Selector).src;

  input1.value = input2.value;
  input1.setAttribute('data-placeid', input2.getAttribute('data-placeid'));
  document.getElementById(icon1Selector).src = document.getElementById(icon2Selector).src;

  input2.value = tempValue;
  input2.setAttribute('data-placeid', tempPlaceId);
  document.getElementById(icon2Selector).src = tempIconSrc;
}
function search(input, iconId, listId, worker, pickupLocationId, destinationId) {
  const locationIcon = document.getElementById(iconId);
  const list = document.getElementById(listId);
  const pickupLocation = document.querySelector(
    `#${pickupLocationId}, #${destinationId}`
  );

  if (!input) {
    locationIcon.src = `${path}geo-pin.svg`;
    if (list) {
      list.innerHTML = '';
      list.style.display = 'none';
    }
    return;
  }

  const data = {
    input,
    placeid: pickupLocation?.dataset.placeid || '',
    lat: parseFloat(pickupLocation?.dataset.lat) || 0,
    lon: parseFloat(pickupLocation?.dataset.lon) || 0,
  };

  worker.postMessage(data);
}

function getListItemTemplate() {
  if (!listItemTemplate) {
    const item = document.createElement('li');
    item.classList.add('list-item');

    const textContainer = document.createElement('div');
    textContainer.classList.add('text-container');

    const mainText = document.createElement('span');
    mainText.classList.add('main-text');

    const secondaryText = document.createElement('span');
    secondaryText.classList.add('secondary-text');

    const icon = document.createElement('img');
    icon.alt = 'Location icon';
    icon.classList.add('location-icon');

    textContainer.appendChild(mainText);
    textContainer.appendChild(secondaryText);

    item.appendChild(icon);
    item.appendChild(textContainer);

    listItemTemplate = item;
  }

  return listItemTemplate.cloneNode(true);
}

function createListItem(prediction) {
  const item = getListItemTemplate();

  item.querySelector('.main-text').textContent = prediction.description;
  item.querySelector('.secondary-text').textContent = prediction.terms[0].value;
  item.querySelector('.location-icon').src = path + prediction['icon'];

  item.dataset.description = prediction.description;
  item.dataset.placeid = prediction.place_id;
  item.dataset.lat = prediction.lat;
  item.dataset.lon = prediction.lon;

  return item;
}

function handleListClick(event, input, iconId) {
  const item = event.target.closest('.list-item');
  if (item) {
    event.preventDefault();
    event.stopPropagation();
    const locationIcon = document.getElementById(iconId);
    locationIcon.src = item.querySelector('.location-icon').src;
    input.value = item.dataset.description;
    input.dataset.placeid = item.dataset.placeid;
    input.dataset.lat = item.dataset.lat;
    input.dataset.lon = item.dataset.lon;
    event.currentTarget.innerHTML = '';
    event.currentTarget.style.display = 'none';
  }
}

function updateList(predictions, listId, inputId, iconId) {
  const list = document.getElementById(listId);
  const input = document.getElementById(inputId);

  if (!list) {
    console.error(`Element with id "${listId}" not found`);
    return;
  }

  list.innerHTML = '';

  const fragment = document.createDocumentFragment();

  predictions.forEach((prediction) => {
    const item = createListItem(prediction);
    fragment.appendChild(item);
  });

  list.appendChild(fragment);
  list.style.display = 'block';

  list.addEventListener('click', (event) => handleListClick(event, input, iconId));
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
  
function getSpinner() {
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.classList.add("loader");
  }
  return spinner;
}

function showLoadingSpinner() {
  const submitButton = document.querySelector('#submit-button');
  submitButton.textContent = '';
  if (!submitButton.contains(getSpinner())) {
    submitButton.appendChild(getSpinner());
  }
}

function hideLoadingSpinner() {
  const submitButton = document.querySelector('#submit-button');
  submitButton.textContent = 'Search';
  if (submitButton.contains(getSpinner())) {
    submitButton.removeChild(getSpinner());
  }
}

function setupWorker(worker, listSelector, inputSelector, iconSelector) {
    worker.addEventListener('message', function(e) {
      const processedData = e.data;
      if (processedData.filter(Boolean).length > 0) {
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
const carDescriptionOrderTaxi2Airport = [
  'SEDAN',
  'VAN',
  'MINIBUS',
  'MINIVAN',
  'EXCLUSIVE_MINIVAN',
  'BUSINESS_SEDAN',
  'HIGH_END_ELECTRIC_CAR',
  'SUV',
  'BUS',
  'COACH'
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
const carOrderIndexesTaxi2Airport = carDescriptionOrderTaxi2Airport.reduce((acc, description, index) => {
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
function sortQuotesByOrder(quotes) {
  return quotes.sort((a, b) => {
    const aOrderIndex = carOrderIndexesTaxi2Airport[a.vehicleCategory];
    const bOrderIndex = carOrderIndexesTaxi2Airport[b.vehicleCategory];
    if (aOrderIndex === undefined && bOrderIndex === undefined) return 0;
    if (aOrderIndex === undefined) return 1;
    if (bOrderIndex === undefined) return -1;
    return aOrderIndex - bOrderIndex;
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

function smoothScroll(target, duration) {
  var targetPosition = target === 'top' ? 0 : document.body.scrollHeight;
  var startPosition = window.pageYOffset;
  var distance = targetPosition - startPosition;
  var startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    var timeElapsed = currentTime - startTime;
    var run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

function showNotification(message, duration, type) {
  const notification = document.createElement('div');
  notification.classList.add(type ? type : 'notification');
  notification.innerText = message;
  notification.style.top = `${notificationCount * 40}px`; 
  document.querySelector('#notification-container').appendChild(notification);
  notificationCount++;

  setTimeout(() => {
    notification.classList.add('show');
  }, 0);

  setTimeout(() => {
    notification.classList.remove('show');

    setTimeout(() => {
      notification.remove();
      notificationCount--;
    }, 500);
  }, duration ? duration : 1500);
}
function showWarning(message, duration) {
  showNotification(message, duration? duration : 1500, 'warning');
}