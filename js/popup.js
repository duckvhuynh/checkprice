const locationWorker = new Worker('worker/locationWorker.js');
const destinationWorker = new Worker('worker/locationWorker.js');

// let pickupPlace = null;
// let destinationPlace = null;

// function initAutocomplete() {
//   initMapOld(16.0555992, 108.2371671, 14);
//   map.addListener('click', (event) => {
//     if (event.placeId) {
//       event.stop();
  
//       const service = new google.maps.places.PlacesService(map);
//       service.getDetails({ placeId: event.placeId }, (place, status) => {
//         if (status === google.maps.places.PlacesServiceStatus.OK) {
//           if (!pickupInput.value) {
//             pickupInput.value = place.name;
//             pickupInput.setAttribute('data-placeid', place.place_id);
//             pickupPlace = place;
//             map.setCenter(pickupPlace.geometry.location);
//             return;
//           }
//           destinationInput.value = place.name;
//           destinationInput.setAttribute('data-placeid', place.place_id);
//           destinationPlace = place;
//           if (pickupPlace) {
//             calculateAndDisplayRoute(directionsService, directionsRenderer);
//           }
//         } else {
//           window.alert('PlacesService failed due to: ' + status);
//         }
//       });
//     }
//   });
  
//   const pickupInput = document.getElementById('pickup-location');
//   const destinationInput = document.getElementById('destination');
//   const options = {
//     fields: ["name", "formatted_address", "geometry", "place_id", "icon"]
//   };

//   const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, options);
//   const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, options);
  
//   const directionsService = new google.maps.DirectionsService();
//   const directionsRenderer = new google.maps.DirectionsRenderer({
//     polylineOptions: {
//       strokeColor: '#e14d20'
//     }
//   });
//   directionsRenderer.setMap(map);

//   pickupAutocomplete.addListener('place_changed', () => {
//     pickupPlace = pickupAutocomplete.getPlace();
//     if (!pickupPlace.geometry) {
//       return;
//     }
//     showNotification('You can select destination\n by clicking places on the map', 9000);
//     pickupInput.value = pickupPlace.name;
//     pickupInput.setAttribute('data-placeid', pickupPlace.place_id);
//     destinationAutocomplete.setBounds(pickupPlace.geometry.viewport);

//     map.setCenter(pickupPlace.geometry.location);

//     const icon = {
//       url: pickupPlace.icon,
//       size: new google.maps.Size(71, 71),
//       origin: new google.maps.Point(0, 0),
//       anchor: new google.maps.Point(17, 34),
//       scaledSize: new google.maps.Size(25, 25),
//     };

//     new google.maps.Marker({
//       position: pickupPlace.geometry.location,
//       icon: icon,
//       title: pickupPlace.name,
//       map: map
//     });


//     if (pickupPlace && destinationPlace) {
//       calculateAndDisplayRoute(directionsService, directionsRenderer);
//     }
//   });

//   destinationAutocomplete.addListener('place_changed', () => {
//     destinationPlace = destinationAutocomplete.getPlace();
//     if (!destinationPlace.geometry) {
//       return;
//     }
//     destinationInput.value = destinationPlace.name;
//     destinationInput.setAttribute('data-placeid', destinationPlace.place_id);
//     pickupAutocomplete.setBounds(destinationPlace.geometry.viewport);

//     map.setCenter(destinationPlace.geometry.location);

//     const icon = {
//       url: destinationPlace.icon,
//       size: new google.maps.Size(71, 71),
//       origin: new google.maps.Point(0, 0),
//       anchor: new google.maps.Point(17, 34),
//       scaledSize: new google.maps.Size(25, 25),
//     };

//     new google.maps.Marker({
//       position: destinationPlace.geometry.location,
//       icon: icon,
//       title: destinationPlace.name,
//       map: map
//     });

//     if (pickupPlace && destinationPlace) {
//       calculateAndDisplayRoute(directionsService, directionsRenderer);
//     }
//   });
// }

// function calculateAndDisplayRoute(directionsService, directionsRenderer) {
//   if (!pickupPlace || !destinationPlace) {
//     return;
//   }

//   directionsService.route(
//     {
//       origin: pickupPlace.geometry.location,
//       destination: destinationPlace.geometry.location,
//       travelMode: google.maps.TravelMode.DRIVING,
//     },
//     (response, status) => {
//       if (status === "OK") {
//         directionsRenderer.setDirections(response);
//         const submitButton = document.getElementById('submit-button');
//         submitButton.click();
//       } else if (status == "ZERO_RESULTS") {
//         showWarning('No directions found for this route.');
//         const submitButton = document.getElementById('submit-button');
//         submitButton.click();
//       } else {
//         const destinationInput = document.getElementById('destination');
//         destinationInput.value = '';
//         destinationInput.setAttribute('data-placeid', '');
//         destinationPlace = null;
//       }
//     }
//   );
// }

  document.addEventListener("DOMContentLoaded", function() {

    const priceHeader = document.querySelector("#data-table th:nth-child(4)");
    const carDescriptionHeader = document.querySelector("#data-table th:nth-child(3)");
    const carSupplierHeader = document.querySelector("#data-table th:nth-child(5)");
    const priceHeaderElife = document.querySelector("#data-table-elifelimo th:nth-child(4)");
    const carDescriptionHeaderElife = document.querySelector("#data-table-elifelimo th:nth-child(3)");
    const cellDropoff = document.querySelector("#data-table-route th:nth-child(2)");
    const cellDistance = document.querySelector("#data-table-route th:nth-child(4)");
  
    addCopyIconToCell(cellDropoff);
    addCopyIconToCell(cellDistance);
    [priceHeader, carDescriptionHeader, carSupplierHeader].forEach(addCopyIconToCell);
    [priceHeaderElife, carDescriptionHeaderElife].forEach(addCopyIconToCell);
  
    cellDropoff.style.cursor = "pointer";
    cellDropoff.title = "Click to copy dropoff location";
    cellDropoff.addEventListener("click", () => {
      copyToClipboard(copyDataDropoff, "Copied dropoff location");
    });
  
    cellDistance.style.cursor = "pointer";
    cellDistance.title = "Click to copy distance";
    cellDistance.addEventListener("click", () => {
      copyToClipboard(copyDataDistance, "Copied distance");
    });
  
    priceHeader.style.cursor = "pointer"; 
    priceHeader.title = "Click to copy all prices"; 
    priceHeader.addEventListener("click", () => {
      copyToClipboard(copyData.map(data => data.price).join("\n"), "Copied all prices");
    });
    carDescriptionHeader.style.cursor = "pointer";
    carDescriptionHeader.title = "Click to copy all car descriptions";
    carDescriptionHeader.addEventListener("click", () => {
      copyToClipboard(copyData.map(data => data.carDescription).join("\n"), "Copied all car descriptions");
    });

    carSupplierHeader.style.cursor = "pointer";
    carSupplierHeader.title = "Click to copy all car suppliers";
    carSupplierHeader.addEventListener("click", () => {
      copyToClipboard(copyData.map(data => data.carSupplier).join("\n"), "Copied all car suppliers");
    });
  
    priceHeaderElife.style.cursor = "pointer";
    priceHeaderElife.title = "Click to copy all prices";
    priceHeaderElife.addEventListener("click", () => {
      copyToClipboard(copyDataElife.map(data => data.price).join("\n"), "Copied all prices");
    });
  
    carDescriptionHeaderElife.style.cursor = "pointer";
    carDescriptionHeaderElife.title = "Click to copy all car descriptions";
    carDescriptionHeaderElife.addEventListener("click", () => {
      copyToClipboard(copyDataElife.map(data => data.carDescription).join("\n"), "Copied all car descriptions");
    });
    
    //initAutocomplete();
    initMap(16.0555992, 108.2371671, 14);
    //drawCircle(16.0555992, 108.2371671, 1000);
    //drawCircleAndTriangle(15.887746792486352, 107.95146650372304, 1000);
    document.getElementById('scrollToTop').addEventListener('click', function() {
      smoothScroll('top', 1000);
    });

    document.getElementById('scrollToBottom').addEventListener('click', function() {
      smoothScroll('bottom', 1000);
    });
    document.getElementById('copyJayrideTable').addEventListener('click', function() {
      var range = document.createRange(); 
      range.selectNode(document.getElementById('data-table-jayride'));
      window.getSelection().removeAllRanges(); 
      window.getSelection().addRange(range); 
      document.execCommand('copy'); 
      window.getSelection().removeAllRanges();
      showNotification('Copied whole table to clipboard');
    });

    document.getElementById('copyJayrideTable2').addEventListener('click', function() {
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

    setupWorker(locationWorker, 'location-list', 'pickup-location', 'pickup-icon');
    setupWorker(destinationWorker, 'destination-list', 'destination', 'destination-icon');

    document.addEventListener('click', function(event) {
      if (!event.target.closest('.autocomplete')) {
        clearAndHideList(document.getElementById('location-list'));
        clearAndHideList(document.getElementById('destination-list'));
      }
    });
    const fp = implementFlatpickr();

      const inputs = [
      {
        id: 'pickup-location',
        worker: locationWorker,
        iconSelector: 'pickup-icon',
        listSelector: 'location-list',
      },
      {
        id: 'destination',
        worker: destinationWorker,
        iconSelector: 'destination-icon',
        listSelector: 'destination-list'
      }
    ];

    let isPasting = false;
    let enterPressed = false;

    inputs.forEach(({ id, worker, iconSelector, listSelector }) => {
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

      input.addEventListener('paste', (event) => {
        isPasting = true;
        const pasteData = event.clipboardData || window.clipboardData;
        if (pasteData) {
          const pastedText = pasteData.getData('text');
          search(pastedText, iconSelector, listSelector, worker, 'pickup-location', 'destination');
        }
      });

      input.addEventListener('input', debounce(() => {
        if (isPasting) {
          isPasting = false;
          return;
        }
        search(input.value, iconSelector, listSelector, worker, 'pickup-location', 'destination');
      }, 200));

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
    
    document.getElementById('swap-button').addEventListener('click', function(event) {
      event.preventDefault();
      const [input1, input2] = inputs.map(({ id }) => document.getElementById(id));
      if (!input1.value && !input2.value) {
        return;
      }
      swapInputs(input1, input2, inputs[0].iconSelector, inputs[1].iconSelector);
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
    
      const pickupLocation = document.getElementById('pickup-location');
      const destination = document.getElementById('destination');
      const passenger = document.getElementById('passenger');
    
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
      hideInstructions();
      showLoadingSkeleton();
      //showInstructions('Loading...');
      fetchDataWorker.postMessage(generateDynamicLinks(pickupPlaceId, destinationPlaceId, date, time, passenger.value));
    });
  });

  let copyData = [];
  let copyDataDropoff = "";
  let copyDataElife = [];
  let copyDataDistance = 0;

  