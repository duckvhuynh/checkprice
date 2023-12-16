const locationWorker = new Worker('worker/locationWorker.js');
const destinationWorker = new Worker('worker/destinationWorker.js');

  function searchLocation(input) {
    const locationIcon = document.querySelector('#pickup-icon');
    const list = document.querySelector('#location-list');
  
    if (!input) {
      locationIcon.src = 'icon/location.svg';
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
      return;
    }
    locationWorker.postMessage(input);
  }
  
  function updateLocationList(predictions) {
    const list = document.querySelector('#location-list');
    const pickupLocation = document.querySelector('#pickup-location');
  
    if (!list) {
      console.error('Element with id "location-list" not found');
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
        const locationIcon = document.querySelector('#pickup-icon');
        locationIcon.src = item.querySelector('.location-icon').src;
        pickupLocation.value = item.textContent;
        pickupLocation.dataset.placeid = item.dataset.placeid;
        list.innerHTML = '';
        list.style.display = 'none';
      }
    });
  }
  
  function searchDestination(input) {
    const locationIcon = document.querySelector('#destination-icon');
    const list = document.querySelector('#destination-list');
  
    if (!input) {
      locationIcon.src = 'icon/location.svg';
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
      return;
    }
    destinationWorker.postMessage(input);
  }

  function updateDestinationList(predictions) {
    const list = document.querySelector('#destination-list');
    const destinationInput = document.querySelector('#destination');
  
    if (!list) {
      console.error('Element with id "destination-list" not found');
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
        const locationIcon = document.querySelector('#destination-icon');
        locationIcon.src = item.querySelector('.location-icon').src;
        destinationInput.value = item.textContent;
        destinationInput.dataset.placeid = item.dataset.placeid;
        list.innerHTML = '';
        list.style.display = 'none';
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    // initMap(14.0583, 108.2772, 6);
    //drawCircleAndTriangle(15.887746792486352, 107.95146650372304, 1000);
    document.querySelector('#copyJayrideTable').addEventListener('click', function() {
      var range = document.createRange(); 
      range.selectNode(document.querySelector('#data-table-jayride')); 
      window.getSelection().removeAllRanges(); 
      window.getSelection().addRange(range); 
      document.execCommand('copy'); 
      window.getSelection().removeAllRanges();
      showNotification('Copied whole table to clipboard');
    });
    locationWorker.addEventListener('message', function(e) {
      const processedData = e.data;
      if (processedData) {
        updateLocationList(processedData);
      } else {
        console.error('Predictions not found in response data');
      }
    }, false);
    destinationWorker.addEventListener('message', function(e) {
      const processedData = e.data;
      if (processedData) {
        updateDestinationList(processedData);
      } else {
        console.error('Predictions not found in response data');
      }
    }, false);
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
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    oneWeekFromNow.setHours(12, 0, 0, 0);
    const fp = flatpickr("#date", {
      allowInput: true,
      enableTime: true,
      dateFormat: "D j, M Y H:i",
      minDate: "today",
      defaultDate: oneWeekFromNow,
      time_24hr: true,
      onChange: function(selectedDates, dateStr, instance) {
        if (selectedDates.length === 0) {
          instance.setDate(instance.latestSelectedDateObj);
        }
      },
      onReady: function(selectedDates, dateStr, instance) {
        const todayButton = document.createElement('button');
        todayButton.textContent = 'Today';
        todayButton.className = 'flatpickr-today-button';
        todayButton.type = 'button';
        todayButton.addEventListener('click', function() {
          const selectedTime = instance.selectedDates[0];
          
          const hours = selectedTime ? selectedTime.getHours() : 12;
          const minutes = selectedTime ? selectedTime.getMinutes() : 0;
          
          const newDate = new Date();
          newDate.setHours(hours, minutes, 0, 0);

          instance.setDate(newDate, false);
        });
        instance.calendarContainer.appendChild(todayButton);
      }
    });
    function debounce(func, delay) {
      let debounceTimer;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
      }
    }
  
    const pickupInput = document.querySelector('#pickup-location');
    const destinationInput = document.querySelector('#destination');
    let isPasting = false;

    pickupInput.addEventListener('paste', (event) => {
      isPasting = true;
      const pasteData = event.clipboardData || window.clipboardData;
      if (pasteData) {
        const pastedText = pasteData.getData('text');
        searchLocation(pastedText);
      }
    });

    destinationInput.addEventListener('paste', (event) => {
      isPasting = true;
      const pasteData = event.clipboardData || window.clipboardData;
      if (pasteData) {
        const pastedText = pasteData.getData('text');
        searchDestination(pastedText);
      }
    });

    pickupInput.addEventListener('input', debounce(() => {
      if (isPasting) {
        isPasting = false;
        return;
      }
      searchLocation(pickupInput.value);
    }, 150));

    destinationInput.addEventListener('input', debounce(() => {
      if (isPasting) {
        isPasting = false;
        return;
      }
      searchDestination(destinationInput.value);
    }, 150));

    const locationListItems = document.querySelectorAll('#location-list .autocomplete-item');
    const destinationListItems = document.querySelectorAll('#destination-list .autocomplete-item');

    pickupInput.addEventListener('change', function() {
      const match = Array.from(locationListItems).find(item => item.textContent === this.value);
      if (!match) {
        this.setAttribute('data-placeid', '');
      }
    });

    destinationInput.addEventListener('change', function() {
      const match = Array.from(destinationListItems).find(item => item.textContent === this.value);
      if (!match) {
        this.setAttribute('data-placeid', '');
      }
    });
    

    document.querySelector('#swap-button').addEventListener('click', function(event) {
      event.preventDefault();
      if (!pickupInput.value && !destinationInput.value) {
        return;
      }
      const tempValue = pickupInput.value;
      const tempPlaceId = pickupInput.getAttribute('data-placeid');
      const tempIconSrc = document.querySelector('#pickup-icon').src;
      
      pickupInput.value = destinationInput.value;
      pickupInput.setAttribute('data-placeid', destinationInput.getAttribute('data-placeid'));
      document.querySelector('#pickup-icon').src = document.querySelector('#destination-icon').src;
      
      destinationInput.value = tempValue;
      destinationInput.setAttribute('data-placeid', tempPlaceId);
      document.querySelector('#destination-icon').src = tempIconSrc;
    });


    const submitButton = document.querySelector('#submit-button');
    // const spinner = document.createElement("div");
    // spinner.classList.add("loader");

    // function showLoadingSpinner() {
    //   submitButton.textContent = '';
    //   if (!submitButton.contains(spinner)) {
    //     submitButton.appendChild(spinner);
    //   }
    // }
    
    // function hideLoadingSpinner() {
    //   submitButton.textContent = 'Search';
    //   if (submitButton.contains(spinner)) {
    //     submitButton.removeChild(spinner);
    //   }
    // }
    submitButton.addEventListener('click', function(event) {
      event.preventDefault();
      if (!navigator.onLine) {
        showWarning('You are offline.');
        return;
      }
      if (submitButton.textContent === '') {
        return;
      }

      showLoadingSpinner();

      const pickupPlaceId = document.querySelector('#pickup-location').getAttribute('data-placeid');
      if (!pickupPlaceId) {
        showWarning('Please select a pickup location from the list');
        hideLoadingSpinner();
        return;
      }

      const destinationPlaceId = document.querySelector('#destination').getAttribute('data-placeid');
      if (!destinationPlaceId) {
        showWarning('Please select a destination from the list');
        hideLoadingSpinner();
        return;
      }

      const date = fp.formatDate(fp.selectedDates[0], "Y-m-d");
      if (!date) {
        showWarning('Please select a date');
        hideLoadingSpinner();
        return;
      }

      const time = fp.formatDate(fp.selectedDates[0], "H:i");
      if (!time) {
        showWarning('Please select a time');
        hideLoadingSpinner();
        return;
      }

      const passenger = document.querySelector('#passenger').value;
      if (!passenger) {
        showWarning('Please select a passenger');
        hideLoadingSpinner();
        return;
      }
      hideAllTables();
      showInstructions('Loading...');
      fetchDataWorker.postMessage(generateNewDynamicLink(pickupPlaceId, destinationPlaceId, date, time, passenger))
    });
  });

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

  function generateNewDynamicLink(pickupPlaceId, destinationPlaceId, date, time, passenger) {
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

  