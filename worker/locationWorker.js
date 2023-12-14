self.addEventListener('message', function(e) {
  const input = e.data;
  fetch(`https://388bivap71.execute-api.us-east-2.amazonaws.com/prod/maps/places/auto-comp?input_text=${input}`)
    .then(response => response.json())
    .then(data => {
      self.postMessage(data.predictions.predictions);
    })
    .catch(error => console.error(error));
}, false);