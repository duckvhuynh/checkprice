let pickupPlace = null;
let destinationPlace = null;

function initAutocomplete() {
  initMapOld(16.0555992, 108.2371671, 14);
  map.addListener('click', (event) => {
    if (event.placeId) {
      event.stop();
  
      const service = new google.maps.places.PlacesService(map);
      service.getDetails({ placeId: event.placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          destinationInput.value = place.name;
          destinationInput.setAttribute('data-placeid', place.place_id);
          destinationPlace = place;
          if (pickupPlace) {
            calculateAndDisplayRoute(directionsService, directionsRenderer);
          }
        } else {
          window.alert('PlacesService failed due to: ' + status);
        }
      });
    }
  });
  const pickupInput = document.querySelector('#pickup-location');
  const destinationInput = document.querySelector('#destination');
  const options = {
    fields: ["name", "formatted_address", "geometry", "place_id", "icon"]
  };

  const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, options);
  const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, options);
  
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: '#e14d20'
    }
  });
  directionsRenderer.setMap(map);

  pickupAutocomplete.addListener('place_changed', () => {
    pickupPlace = pickupAutocomplete.getPlace();
    if (!pickupPlace.geometry) {
      return;
    }
    showNotification('You can select destination\n by clicking places on the map', 9000);
    pickupInput.value = pickupPlace.name;
    pickupInput.setAttribute('data-placeid', pickupPlace.place_id);
    destinationAutocomplete.setBounds(pickupPlace.geometry.viewport);

    map.setCenter(pickupPlace.geometry.location);

    const icon = {
      url: pickupPlace.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25),
    };

    new google.maps.Marker({
      position: pickupPlace.geometry.location,
      icon: icon,
      title: pickupPlace.name,
      map: map
    });


    if (pickupPlace && destinationPlace) {
      calculateAndDisplayRoute(directionsService, directionsRenderer);
    }
  });

  destinationAutocomplete.addListener('place_changed', () => {
    destinationPlace = destinationAutocomplete.getPlace();
    if (!destinationPlace.geometry) {
      return;
    }
    destinationInput.value = destinationPlace.name;
    destinationInput.setAttribute('data-placeid', destinationPlace.place_id);
    pickupAutocomplete.setBounds(destinationPlace.geometry.viewport);

    map.setCenter(destinationPlace.geometry.location);

    const icon = {
      url: destinationPlace.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25),
    };

    new google.maps.Marker({
      position: destinationPlace.geometry.location,
      icon: icon,
      title: destinationPlace.name,
      map: map
    });

    if (pickupPlace && destinationPlace) {
      calculateAndDisplayRoute(directionsService, directionsRenderer);
    }
  });
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  if (!pickupPlace || !destinationPlace) {
    return;
  }

  directionsService.route(
    {
      origin: pickupPlace.geometry.location,
      destination: destinationPlace.geometry.location,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        const submitButton = document.querySelector('#submit-button');
        submitButton.click();
      } else {
        const destinationInput = document.querySelector('#destination');
        destinationInput.value = '';
        destinationInput.setAttribute('data-placeid', '');
        destinationPlace = null;
      }
    }
  );
}

  document.addEventListener("DOMContentLoaded", function() {
    initAutocomplete();
    //initMapOld(16.0555992, 108.2371671, 14);
    //drawCircleAndTriangle(15.887746792486352, 107.95146650372304, 1000);
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

    document.getElementById('scrollToTop').addEventListener('click', function() {
      smoothScroll('top', 1000);
    });

    document.getElementById('scrollToBottom').addEventListener('click', function() {
      smoothScroll('bottom', 1000);
    });
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
      const text = Array.from(table.rows)
        .map(row => Array.from(row.cells)
          .map(cell => cell.textContent)
          .join('\t'))
        .join('\n');
    
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      document.body.appendChild(textarea);
    
      textarea.select();
      document.execCommand('copy');
    
      document.body.removeChild(textarea);
      showNotification('Copied whole table to clipboard');
    });


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

    const inputs = [
      {
        id: '#pickup-location',
        iconSelector: '#pickup-icon',
        listSelector: '#location-list'
      },
      {
        id: '#destination',
        iconSelector: '#destination-icon',
        listSelector: '#destination-list'
      }
    ];

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

  