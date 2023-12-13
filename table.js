function copyToClipboard(text, message) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      document.execCommand('copy');
    }
    showNotification(message);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }

  document.body.removeChild(textarea);
}

let isBookingListenerAdded = false;
let isCarDescriptionListenerAdded = false;

function addCopyOnClickBooking() {
  const priceCells = document.querySelectorAll("#data-table td:nth-child(4)");
  const priceHeader = document.querySelector("#data-table th:nth-child(4)");
  const carDescriptionCells = document.querySelectorAll("#data-table td:nth-child(3)");
  const carDescriptionHeader = document.querySelector("#data-table th:nth-child(3)");

  [priceHeader, carDescriptionHeader].forEach(addCopyIconToCell);

  priceHeader.style.cursor = "pointer"; 
  priceHeader.title = "Click to copy all prices"; 
  if (!isBookingListenerAdded) {
    priceHeader.addEventListener("click", () => {
      let allPrices = Array.from(priceCells).map(cell => cell.innerText).join("\n");
      copyToClipboard(allPrices, "Copied all prices");
    });
    isBookingListenerAdded = true;
  }

  carDescriptionHeader.style.cursor = "pointer"; 
  carDescriptionHeader.title = "Click to copy all car descriptions"; 
  if (!isCarDescriptionListenerAdded) {
    carDescriptionHeader.addEventListener("click", () => {
      let allCarDescriptions = Array.from(carDescriptionCells).map(cell => cell.innerText).join("\n");
      copyToClipboard(allCarDescriptions, "Copied all car descriptions");
    });
    isCarDescriptionListenerAdded = true;
  }

  priceCells.forEach((cell) => {
    cell.style.cursor = "pointer";
    cell.title = "Click to copy"
    cell.addEventListener("click", () => {
      const value = cell.innerText;
      copyToClipboard(value, "Copied: " + value);
    });
  });
}

function addCopyOnClickRoute() {
  const cellDropoff = document.querySelector("#data-table-route td:nth-child(2)");

  addCopyIconToCell(cellDropoff);

  cellDropoff.style.cursor = "pointer";

  cellDropoff.addEventListener("click", () => {
    const value = cellDropoff.innerText;
    copyToClipboard(value, "Copied dropoff location");
  });
}


let isElifeListenerAdded = false;
let isCarDescriptionElifeListenerAdded = false;
function addCopyOnClickElife() {
  const priceCells = document.querySelectorAll("#data-table-elifelimo td:nth-child(4)");
  const priceHeader = document.querySelector("#data-table-elifelimo th:nth-child(4)");
  const carDescriptionCells = document.querySelectorAll("#data-table-elifelimo td:nth-child(3)");
  const carDescriptionHeader = document.querySelector("#data-table-elifelimo th:nth-child(3)");

  [priceHeader, carDescriptionHeader].forEach(addCopyIconToCell);

  priceHeader.style.cursor = "pointer"; 
  priceHeader.title = "Click to copy all prices"; 
  if (!isElifeListenerAdded) {
    priceHeader.addEventListener("click", () => {
      let allPrices = Array.from(priceCells).map(cell => cell.innerText).join("\n");
      copyToClipboard(allPrices, "Copied all prices");
    });
    isElifeListenerAdded = true;
  }

  carDescriptionHeader.style.cursor = "pointer"; 
  carDescriptionHeader.title = "Click to copy all car descriptions"; 
  if (!isCarDescriptionElifeListenerAdded) {
    carDescriptionHeader.addEventListener("click", () => {
      let allCarDescriptions = Array.from(carDescriptionCells).map(cell => cell.innerText).join("\n");
      copyToClipboard(allCarDescriptions, "Copied all car descriptions");
    });
    isCarDescriptionElifeListenerAdded = true;
  }

  priceCells.forEach((cell) => {
    cell.style.cursor = "pointer";
    cell.title = "Click to copy"
    cell.addEventListener("click", () => {
      const value = cell.innerText;
      copyToClipboard(value, "Copied price: " + value);
    });
  });

}

  function createCopyIcon() {
    const img = document.createElement('img');
    img.src = 'copy.png';
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
  let notificationCount = 0;

  function showNotification(message) {
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.innerText = message;
    notification.style.top = `${notificationCount * 40}px`; 
    document.querySelector('#notification-container').appendChild(notification);
    notificationCount++;
    setTimeout(() => {
      notification.remove();
      notificationCount--;
    }, 1500);
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
    //clearTable("#data-table-elifelimo");
    //clearTable("#data-table-mytransfers");
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