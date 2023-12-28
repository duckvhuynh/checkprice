let copyData = [];
let copyDataDropoff = "";
let copyDataElife = [];
let copyDataDistance = 0;
let notificationCount = 0;

document.addEventListener("DOMContentLoaded", function() {
  const priceHeader = document.querySelector("#data-table th:nth-child(4)");
  const carDescriptionHeader = document.querySelector("#data-table th:nth-child(3)");
  const priceHeaderElife = document.querySelector("#data-table-elifelimo th:nth-child(4)");
  const carDescriptionHeaderElife = document.querySelector("#data-table-elifelimo th:nth-child(3)");
  const cellDropoff = document.querySelector("#data-table-route th:nth-child(2)");
  const cellDistance = document.querySelector("#data-table-route th:nth-child(5)");

  addCopyIconToCell(cellDropoff);
  addCopyIconToCell(cellDistance);
  [priceHeader, carDescriptionHeader].forEach(addCopyIconToCell);
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
  
});

function updateCopyDataDistance() {
  copyDataDistance = 0;
  const cellDistance = document.querySelector("#data-table-route td:nth-child(5)");
  copyDataDistance = cellDistance.textContent.split(" ")[0];
}

function addCopyOnClickDistance() {
  updateCopyDataDistance();
}

function updateCopyDataRoute() {
  copyDataDropoff = "";
  const cellDropoff = document.querySelector("#data-table-route td:nth-child(2)");
  copyDataDropoff = cellDropoff.textContent;
}

function addCopyOnClickRoute() {
  updateCopyDataRoute();
}

function updateCopyData() {
  copyData = [];
  const priceCells = document.querySelectorAll("#data-table td:nth-child(4)");
  const carDescriptionCells = document.querySelectorAll("#data-table td:nth-child(3)");
  priceCells.forEach((cell, index) => {
    copyData.push({
      price: cell.textContent,
      carDescription: carDescriptionCells[index].textContent
    });
  });
}

function addCopyOnClickBooking() {
  updateCopyData();
}

function updateCopyDataElife() {
  copyDataElife = [];
  const priceCells = document.querySelectorAll("#data-table-elifelimo td:nth-child(4)");
  const carDescriptionCells = document.querySelectorAll("#data-table-elifelimo td:nth-child(3)");
  priceCells.forEach((cell, index) => {
    copyDataElife.push({
      price: cell.textContent,
      carDescription: carDescriptionCells[index].textContent
    });
  });

}

function addCopyOnClickElife() {
  updateCopyDataElife();
}

function copyToClipboard(text, message) {
  if (!navigator.clipboard && !document.execCommand) {
    showWarning('Copying text is not supported in your browser');
    return;
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      document.execCommand('copy');
    }
    showNotification(message);

    document.body.removeChild(textarea);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

function createCopyIcon() {
  const img = document.createElement('img');
  img.src = 'icon/copy.svg';
  img.classList.add('copy-icon'); 
  return img;
}

function addCopyIconToCell(cell) {
  const existingCopyIcon = cell.querySelector('img');
  if (existingCopyIcon) {
    cell.removeChild(existingCopyIcon);
  }

  const copyIcon = createCopyIcon();
  cell.appendChild(copyIcon);
}

function showNotification(message) {
  showNotification(message, 1500);
}

function showNotification(message, duration) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = message;
  notification.style.top = `${notificationCount * 40}px`; 
  document.querySelector('#notification-container').appendChild(notification);
  notificationCount++;
  setTimeout(() => {
    notification.remove();
    notificationCount--;
  }, duration);
}
function showWarning(message) {
  const warning = document.createElement("div");
  warning.classList.add("warning");
  warning.innerText = message;
  warning.style.top = `${notificationCount * 40}px`; 
  document.querySelector('#notification-container').appendChild(warning);
  notificationCount++;
  setTimeout(() => {
    warning.remove();
    notificationCount--;
  }, 1500);
}

function showTableHeader() {
    document.querySelector("#data-table thead").style.display = "table-header-group";
    document.querySelector("#data-table-route thead").style.display = "table-header-group";
    document.querySelector("#data-table-elifelimo thead").style.display = "table-header-group";
    document.querySelector("#data-table-mytransfers thead").style.display = "table-header-group";
    document.querySelector("#data-table-jayride thead").style.display = "table-header-group";
}

function clearTable(tableId) {
    const tableBody = document.querySelector(tableId + ' tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
    } else {
        alert('Table not found: ', tableId);
    }
}

function clearAll() {
    clearTable("#data-table");
    clearTable("#data-table-route");
}

function showRoute() {
    document.querySelector("#data-table-route").style.display = "block";
}
function hideRoute() {
    document.querySelector("#data-table-route").style.display = "none";
}

function showSixtURL(){
    document.querySelector("#sixt-container").style.display = "block";
}

function hideSixtURL(){
    document.querySelector("#sixt-container").style.display = "none";
}

function hideInstructions() {
    document.querySelector('#placeholder-text').style.display = 'none';
}

function showInstructions(text) {
    const intructions = document.querySelector('#placeholder-text');
    intructions.textContent = text;
    intructions.style.display = 'block';
}

function showDefaultInstructions() {
  showInstructions('🛈 Please fill all pickup and dropoff locations');
}

function showElifeLimo() {
    document.querySelector('#elifelimo-container').style.display = 'block';
}
function hideElifeLimo() {
    document.querySelector('#elifelimo-container').style.display = 'none';
}
function showMyTransfers() {
    document.querySelector('#mytransfers-container').style.display = 'block';
}
function hideMyTransfers() {
    document.querySelector('#mytransfers-container').style.display = 'none';
}
function showJayride() {
    document.querySelector('#jayride-container').style.display = 'block';
}
function hideJayride() {
    document.querySelector('#jayride-container').style.display = 'none';
}

function showBooking() {
    document.querySelector('#booking-container').style.display = 'block';
}
function hideBooking() {
    document.querySelector('#booking-container').style.display = 'none';
}

function hideAllTables() {
    hideRoute();
    hideSixtURL();
    hideElifeLimo();
    hideMyTransfers();
    hideJayride();
    hideBooking();
}

function showAllTables() {
    showRoute();
    showSixtURL();
    showElifeLimo();
    showMyTransfers();
    showJayride();
    showBooking();
}