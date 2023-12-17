let copyData = [];
let notificationCount = 0;

document.addEventListener("DOMContentLoaded", function() {
  const carDescriptionHeader = document.querySelector("#data-table-multi th:nth-child(2)");

  addCopyIconToCell(carDescriptionHeader);
  carDescriptionHeader.style.cursor = "pointer";
  carDescriptionHeader.title = "Click to copy all car descriptions";
  carDescriptionHeader.addEventListener("click", () => {
    copyToClipboard(copyData.map(data => data.carDescription).join("\n"), "Copied all car descriptions");
  });
  
});

function updateCarDescription(data) {
    copyData = [];
    data.forEach((dataItem) => {
        copyData.push({
            carDescription: dataItem
        });
    });
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
  img.src = '../icon/copy.svg';
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
    document.querySelector("#data-table-multi thead").style.display = "table-header-group";
}

function clearTable(tableId) {
    const tableBody = document.querySelector(tableId + ' tbody');
    if (tableBody) {
        tableBody.innerHTML = '';
    } else {
        alert('Table not found: ', tableId);
    }
}

function hideInstructions() {
    document.querySelector('#placeholder-text').style.display = 'none';
}

function showInstructions(text) {
    const intructions = document.querySelector('#placeholder-text');
    intructions.textContent = text;
    intructions.style.display = 'block';
}

function showMultiTable() {
    document.querySelector('#booking-container-multi').style.display = 'block';
}
function hideMultiTable() {
    document.querySelector('#booking-container-multi').style.display = 'none';
}