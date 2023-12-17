function search(input, iconId, listId, worker) {
    const locationIcon = document.querySelector(iconId);
    const list = document.querySelector(listId);
  
    if (!input) {
      locationIcon.src = '../icon/location.svg';
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
      return;
    }
    worker.postMessage(input);
}
function updateList(predictions, listId, inputId, iconId) {
    const list = document.querySelector(listId);
    const input = document.querySelector(inputId);


    if (!list) {
        console.error(`Element with id "${listId}" not found`);
        return;
    }

    // Clear the list
    list.innerHTML = '';

    const fragment = document.createDocumentFragment();

    predictions.forEach(prediction => {
        const item = document.createElement('li');
        item.classList.add('list-item');

        const mainText = document.createElement('span');
        mainText.classList.add('main-text');
        mainText.textContent = prediction.structured_formatting.main_text + ' ';

        const secondaryText = document.createElement('span');
        secondaryText.classList.add('secondary-text');
        secondaryText.textContent = prediction.structured_formatting.secondary_text;

        const icon = document.createElement('img');
        icon.src = prediction['location-icon'];
        icon.alt = 'Location icon';
        icon.classList.add('location-icon');

        item.appendChild(icon);
        item.appendChild(mainText);
        item.appendChild(secondaryText);

        item.dataset.placeid = prediction.place_id;

        fragment.appendChild(item);
    });

    list.appendChild(fragment);
    list.style.display = 'block';

    // Use event delegation to handle click events on list items
    list.addEventListener('click', function(event) {
        const item = event.target.closest('.list-item');
        if (item) {
        event.stopPropagation();
        const locationIcon = document.querySelector(iconId);
        locationIcon.src = item.querySelector('.location-icon').src;
        input.value = item.textContent;
        input.dataset.placeid = item.dataset.placeid;
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
  
    // If pickup is an array, map over it and generate a link for each pickup location
    if (Array.isArray(pickup)) {
      return pickup.map(pickupLocation => generateLink(pickupLocation, destination));
    }
  
    // If destination is an array, map over it and generate a link for each destination
    if (Array.isArray(destination)) {
      return destination.map(destinationLocation => generateLink(pickup, destinationLocation));
    }
  
    // If neither pickup nor destination is an array, just generate a single link
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