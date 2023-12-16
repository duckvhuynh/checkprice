const locationWorker = new Worker('worker/locationWorker.js');
const destinationOneWorker = new Worker('worker/destinationOneWorker.js');
const destinationTwoWorker = new Worker('worker/destinationTwoWorker.js');
const destinationThreeWorker = new Worker('worker/destinationThreeWorker.js');
const fetchAllWorker = new Worker('worker/fetchAllWorker.js');

document.addEventListener('DOMContentLoaded', function() {

  fetchAllWorker.addEventListener('message', function(e) {
    const data = e.data;
    if (data.error) {
      console.error('Error fetching data:', data.error);
    } else {
        // const dataTable = document.querySelector('#data-tablea');

        // data.cars.forEach((car, index) => {
        //   const row = dataTable.insertRow();
        //   row.insertCell(0).textContent = ++index;
        //   row.insertCell(1).textContent = car;
        //   index++;
        // });
        // data.prices.forEach(({price}) => {
        //     price.forEach(({ priceOne, priceTwo, priceThree }, index) => {
        //         const row = dataTable.insertRow();
        //         row.insertCell(2).textContent = priceOne[index];
        //         row.insertCell(3).textContent = priceTwo[index];
        //         row.insertCell(4).textContent = priceThree[index];
        //         index++;
        //     });
        // });
        let dataTable = document.querySelector("#data-tablea tbody");

        for (let i = 0; i < data.cars.length; i++) {
          let row = dataTable.insertRow();

          // Insert cells in the row
          let cell1 = row.insertCell(0); // NO.
          let cell2 = row.insertCell(1); // CAR DESCRIPTION
          let cell3 = row.insertCell(2); // PRICE ONE
          let cell4 = row.insertCell(3); // PRICE TWO
          let cell5 = row.insertCell(4); // PRICE THREE

          // Add text to the cells
          cell1.textContent = i + 1; // NO. (1-based index)
          cell2.textContent = data.cars[i]; // CAR DESCRIPTION
          cell3.textContent = data.prices.priceOne[i]; // PRICE ONE
          cell4.textContent = data.prices.priceTwo[i]; // PRICE TWO
          cell5.textContent = data.prices.priceThree[i]; // PRICE THREE
        }

        // data.forEach((data) => sortCarDecription(data));
        // const price = data.map((data) => data.journeys[0].legs[0].results[0].price);
        // data.forEach((data) => {
        //     data.journeys.forEach(({ legs }, journeyIndex) => {
        //         legs[0].results.forEach(({ carDetails, price, supplierName, supplierCategory }) => {
        //         const row = dataTable.insertRow();
        //         row.insertCell(0).textContent = ++journeyIndex;
        //         row.insertCell(1).textContent = carDetails.model;
        //         row.insertCell(2).textContent = carDetails.description;
        //         row.insertCell(3).textContent = price;
        //         row.insertCell(4).textContent = supplierName;
        //         row.insertCell(5).textContent = supplierCategory;
        //         });
        //     });
        // });
    }
  });

    locationWorker.addEventListener('message', function(e) {
        const processedData = e.data;
        if (processedData) {
          updateLocationList(processedData);
        } else {
          console.error('Predictions not found in response data');
        }
      }, false);
      destinationOneWorker.addEventListener('message', function(e) {
        const processedData = e.data;
        if (processedData) {
          updateDestinationListOne(processedData);
        } else {
          console.error('Predictions not found in response data');
        }
      }, false);
    destinationTwoWorker.addEventListener('message', function(e) {
        const processedData = e.data;
        if (processedData) {
        updateDestinationListTwo(processedData);
        } else {
        console.error('Predictions not found in response data');
        }
    }, false);
    destinationThreeWorker.addEventListener('message', function(e) {
        const processedData = e.data;
        if (processedData) {
        updateDestinationListThree(processedData);
        } else {
        console.error('Predictions not found in response data');
        }
    }, false);

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
    const destinationOneInput = document.querySelector('#destination-one');
    const destinationTwoInput = document.querySelector('#destination-two');
    const destinationThreeInput = document.querySelector('#destination-three');

    pickupInput.addEventListener('paste', (event) => {
      const pasteData = event.clipboardData || window.clipboardData;
      if (pasteData) {
        const pastedText = pasteData.getData('text');
        searchLocation(pastedText);
      }
    });
    
    destinationOneInput.addEventListener('paste', (event) => {
      const pasteData = event.clipboardData || window.clipboardData;
      if (pasteData) {
        const pastedText = pasteData.getData('text');
        searchDestinationOne(pastedText);
      }
    });
    destinationTwoInput.addEventListener('paste', (event) => {
        const pasteData = event.clipboardData || window.clipboardData;
        if (pasteData) {
            const pastedText = pasteData.getData('text');
            searchDestinationTwo(pastedText);
        }
    });
    destinationThreeInput.addEventListener('paste', (event) => {
        const pasteData = event.clipboardData || window.clipboardData;
        if (pasteData) {
            const pastedText = pasteData.getData('text');
            searchDestinationThree(pastedText);
        }
    });

    
    pickupInput.addEventListener('input', debounce(() => searchLocation(pickupInput.value), 150));
    destinationOneInput.addEventListener('input', debounce(() => searchDestinationOne(destinationOneInput.value), 150));
    destinationTwoInput.addEventListener('input', debounce(() => searchDestinationTwo(destinationTwoInput.value), 150));
    destinationThreeInput.addEventListener('input', debounce(() => searchDestinationThree(destinationThreeInput.value), 150));

    const locationListItems = document.querySelectorAll('#location-list .autocomplete-item');
    const destinationListOneItems = document.querySelectorAll('#destination-list-one .autocomplete-item');
    const destinationListTwoItems = document.querySelectorAll('#destination-list-two .autocomplete-item');
    const destinationListThreeItems = document.querySelectorAll('#destination-list-three .autocomplete-item');

    pickupInput.addEventListener('change', function() {
      const match = Array.from(locationListItems).find(item => item.textContent === this.value);
      if (!match) {
        this.setAttribute('data-placeid', '');
      }
    });

    destinationOneInput.addEventListener('change', function() {
      const match = Array.from(destinationListOneItems).find(item => item.textContent === this.value);
      if (!match) {
        this.setAttribute('data-placeid', '');
      }
    });
    destinationTwoInput.addEventListener('change', function() {
        const match = Array.from(destinationListTwoItems).find(item => item.textContent === this.value);
        if (!match) {
          this.setAttribute('data-placeid', '');
        }
    });
    destinationThreeInput.addEventListener('change', function() {
        const match = Array.from(destinationListThreeItems).find(item => item.textContent === this.value);
        if (!match) {
          this.setAttribute('data-placeid', '');
        }
    });

    const submitButton = document.querySelector('#submit-button');

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

      const destinationPlaceIdOne = document.querySelector('#destination-one').getAttribute('data-placeid');
      if (!destinationPlaceIdOne) {
        showWarning('Please select a destination from the list');
        hideLoadingSpinner();
        return;
      }
      const destinationPlaceIdTwo = document.querySelector('#destination-two').getAttribute('data-placeid');
      if (!destinationPlaceIdTwo) {
          showWarning('Please select a destination from the list');
          hideLoadingSpinner();
          return;
      }
      const destinationPlaceIdThree = document.querySelector('#destination-three').getAttribute('data-placeid');
      if (!destinationPlaceIdThree) {
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
    //   hideAllTables();
    //   showInstructions('Loading...');
      fetchAllWorker.postMessage(generateNewDynamicLink(pickupPlaceId, destinationPlaceIdOne, destinationPlaceIdTwo, destinationPlaceIdThree, date, time, passenger))
    });
});

function generateNewDynamicLink(pickupPlaceId, destinationPlaceIdOne, destinationPlaceIdTwo, destinationPlaceIdThree, date, time, passenger) {
    var links = [];
    var baseURL = "https://taxi.booking.com/search-results-mfe/rates?format=envelope";
    const queryParamsOne = {
      passenger: passenger,
      pickup: pickupPlaceId,
      pickupDateTime: `${date}T${time}`,
      dropoff: destinationPlaceIdOne,
      affiliate: "booking-taxi",
      language: "en-gb",
      currency: "USD",
    };
  
    const queryStringOne = Object.keys(queryParamsOne)
      .map((key) => `${key}=${queryParamsOne[key]}`)
      .join("&");

    const queryParamsTwo = {
      passenger: passenger,
      pickup: pickupPlaceId,
      pickupDateTime: `${date}T${time}`,
      dropoff: destinationPlaceIdTwo,
      affiliate: "booking-taxi",
      language: "en-gb",
      currency: "USD",
    };
  
    const queryStringTwo = Object.keys(queryParamsTwo)
      .map((key) => `${key}=${queryParamsTwo[key]}`)
      .join("&");

    const queryParamsThree = {
      passenger: passenger,
      pickup: pickupPlaceId,
      pickupDateTime: `${date}T${time}`,
      dropoff: destinationPlaceIdThree,
      affiliate: "booking-taxi",
      language: "en-gb",
      currency: "USD",
    };
  
    const queryStringThree = Object.keys(queryParamsThree)
      .map((key) => `${key}=${queryParamsThree[key]}`)
      .join("&");

    links.push(`${baseURL}&${queryStringOne}`);
    links.push(`${baseURL}&${queryStringTwo}`);
    links.push(`${baseURL}&${queryStringThree}`);
  
    return links;
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
function searchLocation(input) {
    const locationIcon = document.querySelector('#pickup-icon');
    const list = document.querySelector('#location-list');
  
    if (!input) {
      locationIcon.src = '../icon/location.svg';
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

function searchDestinationOne(input) {
    const locationIcon = document.querySelector('#destination-icon-one');
    const list = document.querySelector('#destination-list-one');
  
    if (!input) {
      locationIcon.src = '../icon/location.svg';
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
      return;
    }
    destinationOneWorker.postMessage(input);
  }
  function searchDestinationTwo(input) {
    const locationIcon = document.querySelector('#destination-icon-two');
    const list = document.querySelector('#destination-list-two');
  
    if (!input) {
      locationIcon.src = '../icon/location.svg';
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
      return;
    }
    destinationTwoWorker.postMessage(input);
  }
  function searchDestinationThree(input) {
    const locationIcon = document.querySelector('#destination-icon-three');
    const list = document.querySelector('#destination-list-three');
  
    if (!input) {
      locationIcon.src = '../icon/location.svg';
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
      return;
    }
    destinationThreeWorker.postMessage(input);
  }
function updateDestinationListOne(predictions) {
    const list = document.querySelector('#destination-list-one');
    const destinationInput = document.querySelector('#destination-one');
  
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
        const locationIcon = document.querySelector('#destination-icon-one');
        locationIcon.src = item.querySelector('.location-icon').src;
        destinationInput.value = item.textContent;
        destinationInput.dataset.placeid = item.dataset.placeid;
        list.innerHTML = '';
        list.style.display = 'none';
      }
    });
  }

  function updateDestinationListTwo(predictions) {
    const list = document.querySelector('#destination-list-two');
    const destinationInput = document.querySelector('#destination-two');
  
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
        const locationIcon = document.querySelector('#destination-icon-two');
        locationIcon.src = item.querySelector('.location-icon').src;
        destinationInput.value = item.textContent;
        destinationInput.dataset.placeid = item.dataset.placeid;
        list.innerHTML = '';
        list.style.display = 'none';
      }
    });
  }

  function updateDestinationListThree(predictions) {
    const list = document.querySelector('#destination-list-three');
    const destinationInput = document.querySelector('#destination-three');
  
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
        const locationIcon = document.querySelector('#destination-icon-three');
        locationIcon.src = item.querySelector('.location-icon').src;
        destinationInput.value = item.textContent;
        destinationInput.dataset.placeid = item.dataset.placeid;
        list.innerHTML = '';
        list.style.display = 'none';
      }
    });
  }