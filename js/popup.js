const locationWorker = new Worker('worker/locationWorker.js');
const destinationWorker = new Worker('worker/locationWorker.js');
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
    document.querySelector('#copyJayrideTable2').addEventListener('click', function() {
      const table = document.querySelector('#data-table-jayride2 tbody');
      let route = '';
      let rowspanCount = 0;
      const text = Array.from(table.rows)
        .map(row => {
          const cells = Array.from(row.cells);
          if (cells.length > 7) {
            route = cells.shift().textContent;
            rowspanCount = cells[0].hasAttribute('rowspan') ? parseInt(cells[0].getAttribute('rowspan')) : 1;
            return [route, ...cells.map(cell => cell.textContent)].join('\t');
          } else if (rowspanCount > 1) {
            rowspanCount--;
            return ['', ...cells.map(cell => cell.textContent)].join('\t');
          } else {
            return ['', ...cells.map(cell => cell.textContent)].join('\t');
          }
        })
        .join('\n');
    
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      document.body.appendChild(textarea);
    
      textarea.select();
      document.execCommand('copy');
    
      document.body.removeChild(textarea);
      showNotification('Copied whole table to clipboard');
    });
    // document.querySelector('#copyJayrideTable2').addEventListener('click', function() {
    //   var range = document.createRange(); 
    //   range.selectNode(document.querySelector('#data-table-jayride2 tbody'));
    //   window.getSelection().removeAllRanges(); 
    //   window.getSelection().addRange(range); 
    //   document.execCommand('copy'); 
    //   window.getSelection().removeAllRanges();
    //   showNotification('Copied whole table to clipboard');
    // });



    setupWorker(locationWorker, '#location-list', '#pickup-location', '#pickup-icon');
    setupWorker(destinationWorker, '#destination-list', '#destination', '#destination-icon');

    function clearAndHideList(list) {
      if (list) {
        list.innerHTML = '';
        list.style.display = 'none';
      }
    }
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.autocomplete')) {
        clearAndHideList(document.querySelector('#location-list'));
        clearAndHideList(document.querySelector('#destination-list'));
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
  
      const inputs = [
      {
        id: '#pickup-location',
        worker: locationWorker,
        iconSelector: '#pickup-icon',
        listSelector: '#location-list'
      },
      {
        id: '#destination',
        worker: destinationWorker,
        iconSelector: '#destination-icon',
        listSelector: '#destination-list'
      }
    ];

    let isPasting = false;
    let enterPressed = false;

    inputs.forEach(({ id, worker, iconSelector, listSelector }) => {
      const input = document.querySelector(id);

      input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          enterPressed = true;
          event.preventDefault();
          event.stopPropagation();
          const firstItem = document.querySelector(`${listSelector} .list-item`);
          if (firstItem) {
            firstItem.click();
            input.blur();
          }
        }
      });

      input.addEventListener('paste', (event) => {
        isPasting = true;
        const pasteData = event.clipboardData || window.clipboardData;
        if (pasteData) {
          const pastedText = pasteData.getData('text');
          search(pastedText, iconSelector, listSelector, worker, '#pickup-location', '#destination');
        }
      });

      input.addEventListener('input', debounce(() => {
        if (isPasting) {
          isPasting = false;
          return;
        }
        search(input.value, iconSelector, listSelector, worker, '#pickup-location', '#destination');
      }, 150));

      input.addEventListener('change', function() {
        if (!enterPressed) {
          const items = document.querySelectorAll(`${listSelector} .autocomplete-item`);
          const match = Array.from(items).find(item => item.textContent === this.value);
          if (!match) {
            this.setAttribute('data-placeid', '');
          }
        } else {
          enterPressed = false;
        }
      });
    });

    function swapInputs(input1, input2, icon1Selector, icon2Selector) {
      const tempValue = input1.value;
      const tempPlaceId = input1.getAttribute('data-placeid');
      const tempIconSrc = document.querySelector(icon1Selector).src;
    
      input1.value = input2.value;
      input1.setAttribute('data-placeid', input2.getAttribute('data-placeid'));
      document.querySelector(icon1Selector).src = document.querySelector(icon2Selector).src;
    
      input2.value = tempValue;
      input2.setAttribute('data-placeid', tempPlaceId);
      document.querySelector(icon2Selector).src = tempIconSrc;
    }
    
    document.querySelector('#swap-button').addEventListener('click', function(event) {
      event.preventDefault();
      const [input1, input2] = inputs.map(({ id }) => document.querySelector(id));
      if (!input1.value && !input2.value) {
        return;
      }
      swapInputs(input1, input2, inputs[0].iconSelector, inputs[1].iconSelector);
    });


    const submitButton = document.querySelector('#submit-button');
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitButton.click();
      }
    });
    document.querySelector('#multi-button').addEventListener('click', function(event) {
      event.preventDefault();
      window.open('multi', '_self');
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
    
      const pickupLocation = document.querySelector('#pickup-location');
      const destination = document.querySelector('#destination');
      const passenger = document.querySelector('#passenger');
    
      const pickupPlaceId = pickupLocation.getAttribute('data-placeid');
      if (!pickupPlaceId || !pickupLocation.value) {
        pickupLocation.focus();
        return showErrorAndReturn('Please select a valid pickup location from the list');
      }
    
      const destinationPlaceId = destination.getAttribute('data-placeid');
      if (!destinationPlaceId || !destination.value) {
        destination.focus();
        return showErrorAndReturn('Please select a valid destination from the list');
      }
    
      const date = fp.formatDate(fp.selectedDates[0], "Y-m-d");
      if (!date) {
        return showErrorAndReturn('Please select a date');
      }
    
      const time = fp.formatDate(fp.selectedDates[0], "H:i");
      if (!time) {
        return showErrorAndReturn('Please select a time');
      }
    
      if (!passenger.value) {
        return showErrorAndReturn('Please select a passenger');
      }
    
      hideAllTables();
      showInstructions('Loading...');
      fetchDataWorker.postMessage(generateDynamicLinks(pickupPlaceId, destinationPlaceId, date, time, passenger.value));
    });
  });

  