function searchLocation(input) {
  if (!input) {
    const list = document.querySelector('#location-list');
    if (list) {
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      list.style.display = 'none';
    }
    return;
  }
  fetch(`https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/places/auto-comp?input_text=${input}`)
    .then(response => response.json())
    .then(data => {
      console.log(data); 
      if (data.predictions.predictions) {
        updateLocationList(data.predictions.predictions);
      } else {
        console.error('Predictions not found in response data');
      }
    })
    .catch(error => console.error(error));
}
  
function updateLocationList(predictions) {
  const list = document.querySelector('#location-list');
  if (list) {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
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
      icon.src = 'location.png'; 
      icon.alt = 'Location icon'; 
      icon.classList.add('location-icon');

      item.appendChild(icon);
      item.appendChild(mainText);
      item.appendChild(secondaryText);

      item.setAttribute('data-placeid', prediction.place_id);
      item.addEventListener('click', function() {
        document.querySelector('#pickup-location').value = this.textContent;
        document.querySelector('#pickup-location').setAttribute('data-placeid', this.getAttribute('data-placeid'));
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        list.style.display = 'none';
      });
      list.appendChild(item);
    });
    list.style.display = 'block';
  } else {
    console.error('Element with id "location-list" not found');
  }
}
  
  function searchDestination(input) {
    fetch(`https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/places/auto-comp?input_text=${input}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.predictions.predictions) {
          updateDestinationList(data.predictions.predictions);
        } else {
          console.error('Predictions not found in response data');
        }
      })
      .catch(error => console.error(error));
  }

  document.addEventListener('click', function(event) {
    const locationList = document.querySelector('#location-list');
    const destinationList = document.querySelector('#destination-list');
  
    if (!event.target.closest('.autocomplete')) {
      if (locationList) {
        while (locationList.firstChild) {
          locationList.removeChild(locationList.firstChild);
        }
        locationList.style.display = 'none';
      }
      if (destinationList) {
        while (destinationList.firstChild) {
          destinationList.removeChild(destinationList.firstChild);
        }
        destinationList.style.display = 'none';
      }
    }
  });
  
  function updateDestinationList(predictions) {
    const list = document.querySelector('#destination-list');
    if (list) {
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
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
      icon.src = 'location.png';
      icon.alt = 'Location icon';
      icon.classList.add('location-icon');

      item.appendChild(icon);
      item.appendChild(mainText);
      item.appendChild(secondaryText);
        item.setAttribute('data-placeid', prediction.place_id);
        item.addEventListener('click', function() {
          document.querySelector('#destination').value = this.textContent;
          document.querySelector('#destination').setAttribute('data-placeid', this.getAttribute('data-placeid'));
          while (list.firstChild) {
            list.removeChild(list.firstChild);
          }
          list.style.display = 'none';
        });
        list.appendChild(item);
      });
      list.style.display = 'block';
    } else {
      console.error('Element with id "destination-list" not found');
    }
  }

  
  
  document.addEventListener("DOMContentLoaded", function() {
    const pickupInput = document.querySelector('#pickup-location');
    const destinationInput = document.querySelector('#destination');
  
    pickupInput.addEventListener('input', () => searchLocation(pickupInput.value));
    destinationInput.addEventListener('input', () => searchDestination(destinationInput.value));

    document.querySelector('#swap-button').addEventListener('click', function(event) {
      event.preventDefault();
      if (!pickupInput.value && !destinationInput.value) {
        return;
      }
      const tempValue = pickupInput.value;
      const tempPlaceId = pickupInput.getAttribute('data-placeid');
      
      pickupInput.value = destinationInput.value;
      pickupInput.setAttribute('data-placeid', destinationInput.getAttribute('data-placeid'));
      
      destinationInput.value = tempValue;
      destinationInput.setAttribute('data-placeid', tempPlaceId);
    });
  
    // Your existing code
  });

  var pickupPlaceId;
  var destinationPlaceId;
  var date;
  var time;
  var passenger;
  const spinner = document.createElement("div");
  spinner.classList.add("loader");

  document.addEventListener("DOMContentLoaded", function() {
  
    const submitButton = document.querySelector('#submit-button');
    submitButton.addEventListener('click', function(event) {
      event.preventDefault();
      if (!navigator.onLine) {
        showWarning('You are offline. Please connect to the internet and try again.');
        return;
      }
      if (submitButton.textContent === '') {
        return;
      }
      submitButton.textContent = '';
      if (!submitButton.contains(spinner)) {
        submitButton.appendChild(spinner);
      }
    
      pickupPlaceId = document.querySelector('#pickup-location').getAttribute('data-placeid');
      if (!pickupPlaceId) {
        showWarning('Please select a pickup location from the list');
        submitButton.textContent = 'Search';
        if (submitButton.contains(spinner)) {
          submitButton.removeChild(spinner);
        }
        return;
      }
      destinationPlaceId = document.querySelector('#destination').getAttribute('data-placeid');
      if (!destinationPlaceId) {
        showWarning('Please select a destination from the list');
        submitButton.textContent = 'Search';
        if (submitButton.contains(spinner)) {
          submitButton.removeChild(spinner);
        }
        return;
      }
      date = document.querySelector('#date').value;
      if (!date) {
        showWarning('Please select a date');
        submitButton.textContent = 'Search';
        if (submitButton.contains(spinner)) {
          submitButton.removeChild(spinner);
        }
        return;
      }

      time = document.querySelector('#time').value;
      if (!time) {
        showWarning('Please select a time');
        submitButton.textContent = 'Search';
        if (submitButton.contains(spinner)) {
          submitButton.removeChild(spinner);
        }
        return;
      }
      passenger = document.querySelector('#passenger').value;
      if (!passenger) {
        showWarning('Please select a passenger');
        submitButton.textContent = 'Search';
        if (submitButton.contains(spinner)) {
          submitButton.removeChild(spinner);
        }
        return;
      }
    
      console.log(generateNewDynamicLink());
      fetchDataFromNetwork(generateNewDynamicLink())
        .then(() => {
          submitButton.textContent = 'Search';
          if (submitButton.contains(spinner)) {
            submitButton.removeChild(spinner);
          }
        });
    });

  });

  function showLoadingSpinner() {
    const refreshButton = document.querySelector("#refresh-button");
    refreshButton.textContent = '';
    if (!refreshButton.contains(spinner)) {
      refreshButton.appendChild(spinner);
    }
  }
  
  function hideLoadingSpinner() {
    const refreshButton = document.querySelector("#refresh-button");
    refreshButton.textContent = 'Refresh';
    spinner.remove();
  }
  function generateNewDynamicLink() {
    const baseURL = "https://taxi.booking.com/search-results-mfe/rates?format=envelope";
    const queryParams = {
      passenger: passenger,
      pickup: pickupPlaceId,
      pickupDateTime: `${date}T${time}`,
      dropoff: destinationPlaceId,
      affiliate: "booking-taxi",
      language: "en-gb",
      currency: "USD",
    };
  
    const queryString = Object.keys(queryParams)
      .map((key) => `${key}=${queryParams[key]}`)
      .join("&");
  
    return `${baseURL}&${queryString}`;
  }

  