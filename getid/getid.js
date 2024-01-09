const locationWorker = new Worker('../worker/locationWorker.js');
const placeNameWorker = new Worker('../worker/locationWorker.js');


document.addEventListener('DOMContentLoaded', function() {
    initMap(16.0555992, 108.2371671, 14);

    const nameHeader = document.querySelector("#places-table th:nth-child(1)");
    const idHeader = document.querySelector("#places-table th:nth-child(2)");
    [nameHeader, idHeader].forEach(item => {
      addCopyIconToCell(item);
      item.style.cursor = "pointer";
      item.title = "Click to copy all values";
      item.addEventListener("click", () => {
        const index = item.cellIndex + 1;
        const copyData = Array.from(document.querySelectorAll(`#places-table td:nth-child(${index})`))
          .map(td => td.textContent)
          .join('\n');
        copyToClipboard(copyData, `Copied all ${item.textContent.toLowerCase()}`);
      });
    });

    setupWorker(locationWorker, 'location-list', 'center-location', 'center-icon', true);

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.autocomplete')) {
          clearAndHideList(document.getElementById('location-list'));
        }
    });

    const inputs = [
        {
          id: 'center-location',
          worker: locationWorker,
          iconSelector: 'center-icon',
          listSelector: 'location-list',
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
          search(pastedText, iconSelector, listSelector, worker, 'center-location');
        }
      });

      input.addEventListener('input', debounce(() => {
        if (isPasting) {
          isPasting = false;
          return;
        }
        search(input.value, iconSelector, listSelector, worker, 'center-location');
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

    const centerLocationInput = document.getElementById('center-location');
    centerLocationInput.addEventListener('placeSelected', function(event) {
      const { lat, lon } = event.detail;
      const radiusValue = document.getElementById('radius').value;
      const radius = parseFloat(radiusValue); // The radius is in meters

      if (!isNaN(lat) && !isNaN(lon) && !isNaN(radius)) {
        updateCircle(lat, lon, radius);
        clearMarkers();
      }
    });

    const radiusInput = document.getElementById('radius');

    radiusInput.addEventListener('input', function() {
        // Replace any non-digit characters with an empty string
        this.value = this.value.replace(/[^0-9.]/g, '');

        if (this.value === '') {
            // If the input is empty, remove the existing circle
            if (circle) {
                map.removeLayer(circle);
                circle = null; // Clear the reference to the removed circle
            }
        } else {
            // Parse the number and draw the circle if needed
            const radiusValue = this.value;
            const lat = parseFloat(document.getElementById('center-location').dataset.lat);
            const lng = parseFloat(document.getElementById('center-location').dataset.lon);
            const radius = parseFloat(radiusValue); // The radius is in meters

            if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
                drawCircle(lat, lng, radius);
            }
        }
    });

    const getIdButton = document.getElementById('getid-button');
    const pointsInput = document.getElementById('points'); // Get the points input element

    placeNameWorker.addEventListener('message', async function(e) {
      if (e.data && e.data.length > 0) {
        let placeData = e.data[0];
        const table = document.querySelector('#places-table tbody');
        const row = table.insertRow();
    
        // Assuming displayValue returns a promise
        await displayValue(row, placeData.description);
        await displayValue(row, placeData.place_id);
        await displayValue(row, placeData.lat);
        await displayValue(row, placeData.lon);
      }
    }, false);

    getIdButton.addEventListener('click', async function(event) {
        event.preventDefault();

        const showErrorAndReturn = (message) => {
          showWarning(message);
          hideLoadingSpinner(getIdButton, 'Get ID');
          return;
        };
      
        if (!navigator.onLine) {
          return showErrorAndReturn('You are offline.');
        }
        if (getIdButton.textContent === '') {
          return;
        }

        showLoadingSpinner(getIdButton);
        
        
        const lat = parseFloat(document.getElementById('center-location').dataset.lat);
        if (isNaN(lat)) return showErrorAndReturn('Please enter a valid location.');
        const lng = parseFloat(document.getElementById('center-location').dataset.lon);
        
        const radius = parseFloat(radiusInput.value);
        if (isNaN(radius)) return showErrorAndReturn('Please enter a valid radius.');
        const numberOfPoints = parseInt(pointsInput.value);
        if (isNaN(numberOfPoints) || numberOfPoints <= 0) return showErrorAndReturn('Please enter a valid number of points.');
        
        
        const pointsDataPromises = [];
        for (let i = 0; i < numberOfPoints; i++) {
          pointsDataPromises.push(getValidPointInCircle(lat, lng, radius));
        }
        const pointsData = await Promise.all(pointsDataPromises);
        clearMarkers();
        clearTable('#places-table');
        pointsData.forEach(point => {
                  addPoint(point.lat, point.lng, point.address);
                  const table = document.querySelector('#places-table tbody');
                  const row = table.insertRow();
                  displayValue(row, point.address);
                  displayValue(row, point.placeId);
                  displayValue(row, point.lat);
                  displayValue(row, point.lng);
              });
        hideLoadingSpinner(getIdButton, 'Get ID');
    });
});
