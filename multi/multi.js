const locationOneWorker = new Worker('../worker/locationWorker.js');
const locationTwoWorker = new Worker('../worker/locationWorker.js');
const locationThreeWorker = new Worker('../worker/locationWorker.js');
const destinationOneWorker = new Worker('../worker/locationWorker.js');
const destinationTwoWorker = new Worker('../worker/locationWorker.js');
const destinationThreeWorker = new Worker('../worker/locationWorker.js');
const fetchAllWorker = new Worker('../worker/fetchAllWorker.js');

function updateTable(data, type) {
  const table = document.getElementById('data-table-multi');

  if (!table) {
    console.error('Element with id "data-table" not found');
    return;
  }

  let dataTable = document.querySelector('#data-table-multi tbody');
  dataTable.innerHTML = '';

  data.cars.forEach((car, i) => {
    let row = dataTable.insertRow();

    const cells = Array.from({ length: 8 }, () => row.insertCell());

    cells[0].textContent = i + 1;
    cells[1].textContent = car;
    cells[2].textContent = data.prices.priceOne[i];
    cells[4].textContent = data.prices.priceTwo[i];
    cells[6].textContent = type === 'Three' ? data.prices.priceThree[i] : '';

    if (i === 0) {
      cells[3].textContent = data.distances[0];
      cells[5].textContent = data.distances[1];
      cells[7].textContent = type === 'Three' ? data.distances[2] : '';
    }
  });

  showMultiTable();
  hideInstructions();
  hideLoadingSpinner();
}

document.addEventListener('DOMContentLoaded', function() {
    let toggle = true;
    document.getElementById('swap-button').addEventListener('click', function(event) {
      event.preventDefault();
      function swapValues(pickupInputId, destinationInputId, pickupIconId, destinationIconId) {
        const pickupInput = document.getElementById(pickupInputId);
        const destinationInput = document.getElementById(destinationInputId);
      
        if (!pickupInput.value && !destinationInput.value) {
          return;
        }
      
        const tempValue = pickupInput.value;
        const tempPlaceId = pickupInput.getAttribute('data-placeid');
        const tempIconSrc = document.getElementById(pickupIconId).src;
      
        pickupInput.value = destinationInput.value;
        pickupInput.setAttribute('data-placeid', destinationInput.getAttribute('data-placeid'));
        document.getElementById(pickupIconId).src = document.getElementById(destinationIconId).src;
      
        destinationInput.value = tempValue;
        destinationInput.setAttribute('data-placeid', tempPlaceId);
        document.getElementById(destinationIconId).src = tempIconSrc;
      }
      
      if (toggle) {
        swapValues('pickup-location-one', 'destination-one', 'pickup-icon-one', 'destination-icon-one');
        swapValues('pickup-location-two', 'destination-two', 'pickup-icon-two', 'destination-icon-two');
        swapValues('pickup-location-three', 'destination-three', 'pickup-icon-three', 'destination-icon-three');
      
        document.querySelector('.pickup-container-one').style.display = 'block';
        document.querySelector('.pickup-container-three').style.display = 'block';
        document.querySelector('.dropoff-container-one').style.display = 'none';
        document.querySelector('.dropoff-container-three').style.display = 'none';
      
        toggle = false;
      } else {
        swapValues('pickup-location-one', 'destination-one', 'pickup-icon-one', 'destination-icon-one');
        swapValues('pickup-location-two', 'destination-two', 'pickup-icon-two', 'destination-icon-two');
        swapValues('pickup-location-three', 'destination-three', 'pickup-icon-three', 'destination-icon-three');
      
        document.querySelector('.pickup-container-one').style.display = 'none';
        document.querySelector('.pickup-container-three').style.display = 'none';
        document.querySelector('.dropoff-container-one').style.display = 'block';
        document.querySelector('.dropoff-container-three').style.display = 'block';
      
        toggle = true;
      }
    });
    document.getElementById('copy-multi').addEventListener('click', function() {
      let textToCopy = '';
      const table = document.getElementById('data-table-multi');
      for (let r = 1, n = table.rows.length; r < n; r++) {
        for (let c of [2, 3, 4, 5, 6, 7]) {
          if (table.rows[r].cells[c]) {
            textToCopy += table.rows[r].cells[c].innerText;
            if (c !== 7) {
              textToCopy += '\t';
            }
          }
        }
        textToCopy += '\n';
      }
    
      if (!navigator.clipboard) {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showNotification('Price and KM data copied to clipboard', 1500);
        } catch (err) {
          console.error('Error copying text: ', err);
        }
        document.body.removeChild(textarea);
      } else {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            showNotification('Price and KM data copied to clipboard', 1500);
          })
          .catch(err => {
            console.error('Error copying text: ', err);
          });
      }
    });

    fetchAllWorker.addEventListener('message', function(e) {
      const data = e.data;
      if (data.error) {
        showWarning('Error fetching data! Re-check\n your inputs and try again.');
        hideLoadingSpinner();
        showDefaultInstructions();
        console.error('Error fetching data:', data.error);
      } else {
        updateCarDescription(data.cars);
        const type = Object.keys(data.prices).length === 3 ? 'Three' : 'Two';
        updateTable(data, type);
      }
    });

    const workers = [
      { worker: locationOneWorker, updateFunction: (data) => updateList(data, 'location-list-one', 'pickup-location-one', 'pickup-icon-one') },
      { worker: locationTwoWorker, updateFunction: (data) => updateList(data, 'location-list-two', 'pickup-location-two', 'pickup-icon-two') },
      { worker: locationThreeWorker, updateFunction: (data) => updateList(data, 'location-list-three', 'pickup-location-three', 'pickup-icon-three') },
      { worker: destinationOneWorker, updateFunction: (data) => updateList(data, 'destination-list-one', 'destination-one', 'destination-icon-one') },
      { worker: destinationTwoWorker, updateFunction: (data) => updateList(data, 'destination-list-two', 'destination-two', 'destination-icon-two') },
      { worker: destinationThreeWorker, updateFunction: (data) => updateList(data, 'destination-list-three', 'destination-three', 'destination-icon-three') },
    ];
    
    workers.forEach(({ worker, updateFunction }) => {
      worker.addEventListener('message', function(e) {
        const processedData = e.data;
        if (processedData) {
          updateFunction(processedData);
        } else {
          console.error('Predictions not found in response data');
        }
      }, false);
    });

    document.addEventListener('click', function(event) {
      const lists = [
        'location-list-one',
        'location-list-two',
        'location-list-three',
        'destination-list-one',
        'destination-list-two',
        'destination-list-three'
      ];
    
      if (!event.target.closest('.autocomplete')) {
        lists.forEach(listId => {
          const list = document.getElementById(listId);
          if (list) {
            list.innerHTML = '';
            list.style.display = 'none';
          }
        });
      }
    });

    const fp = implementFlatpickr();

    

    const inputs = [
      { id: 'pickup-location-one', event: 'input', handler: (input) => search(input, 'pickup-icon-one', 'location-list-one', locationOneWorker, 'pickup-location-two', 'destination-two'), listSelector: 'location-list-one' },
      { id: 'pickup-location-two', event: 'input', handler: (input) => search(input, 'pickup-icon-two', 'location-list-two', locationTwoWorker, 'pickup-location-two', 'destination-two'), listSelector: 'location-list-two' },
      { id: 'pickup-location-three', event: 'input', handler: (input) => search(input, 'pickup-icon-three', 'location-list-three', locationThreeWorker, 'pickup-location-two', 'destination-two'), listSelector: 'location-list-three' },
      { id: 'destination-one', event: 'input', handler: (input) => search(input, 'destination-icon-one', 'destination-list-one', destinationOneWorker, 'pickup-location-two', 'destination-two'), listSelector: 'destination-list-one' },
      { id: 'destination-two', event: 'input', handler: (input) => search(input, 'destination-icon-two', 'destination-list-two', destinationTwoWorker, 'pickup-location-two', 'destination-two'), listSelector: 'destination-list-two' },
      { id: 'destination-three', event: 'input', handler: (input) => search(input, 'destination-icon-three', 'destination-list-three', destinationThreeWorker, 'pickup-location-two', 'destination-two'), listSelector: 'destination-list-three' },
    ];

    let enterPressed = false;
    inputs.forEach(({ id, event, handler, list, listSelector }) => {
      const input = document.getElementById(id);

      input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          enterPressed = true;
          event.preventDefault();
          event.stopPropagation();
          const firstItem = document.querySelector(`#${listSelector} .list-item`);
          if (firstItem) {
            firstItem.click();
            input.blur();
          }         
        }
      });

      input.addEventListener(event, debounce(() => handler(input.value), 50));

      input.addEventListener('change', function() {
        if (!enterPressed) {
          const items = document.querySelectorAll(`#${listSelector} .autocomplete-item`);
          const match = Array.from(items).find(item => item.textContent === this.value);
          if (!match) {
            this.setAttribute('data-placeid', '');
          }
        } else {
          enterPressed = false;
        }
      });
      
    });

    const submitButton = document.getElementById('submit-button');

    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitButton.click();
      }
    });

    submitButton.addEventListener('click', function(event) {
      event.preventDefault();

      const showErrorAndReturn = (message) => {
        showWarning(message);
        hideLoadingSpinner();
        return;
      };

      if (!navigator.onLine) {
        return showErrorAndReturn('You are offline.');
      }

      if (submitButton.textContent === '') {
        return;
      }
    
      showLoadingSpinner();
      const date = fp.formatDate(fp.selectedDates[0], "Y-m-d");
      if (!date) {
        return showErrorAndReturn('Please select a date');
      }
      const time = fp.formatDate(fp.selectedDates[0], "H:i");
      if (!time) {
        return showErrorAndReturn('Please select a time');
      }
      const passenger = document.getElementById('passenger').value;
      if (!passenger) {
        return showErrorAndReturn('Please select a passenger');
      }
      const locations = toggle ? [
        { id: 'pickup-location-two' },
        { id: 'destination-one' },
        { id: 'destination-two' },
        { id: 'destination-three' },
      ] : [
        { id: 'pickup-location-one' },
        { id: 'pickup-location-two' },
        { id: 'pickup-location-three' },
        { id: 'destination-two' },
      ];
      const placeIds = locations.map(({ id }) => {
        const input = document.getElementById(id);
        const dataValue = input.value;
        const dataPlaceId = input.getAttribute('data-placeid');
        if ((!id.includes('three')) && (!dataValue || !dataPlaceId)) {
          input.focus();
          return showErrorAndReturn('Please select a valid location from the list');
        }
        return dataPlaceId;
      });
    
      if (placeIds.some((id, index) => !id && !locations[index].id.includes('three'))) {
        showErrorAndReturn('Please select a valid location from the list');
        return;
      }

      hideMultiTable();
      showInstructions('Loading...');

      if (toggle) {
        const [pickupPlaceIdTwo, ...destinations] = placeIds;
        fetchAllWorker.postMessage(generateDynamicLinks(pickupPlaceIdTwo, destinations, date, time, passenger));
      } else {
        const destinationPlaceIdTwo = placeIds.pop();
        fetchAllWorker.postMessage(generateDynamicLinks(placeIds, destinationPlaceIdTwo, date, time, passenger));
      }

    });
});