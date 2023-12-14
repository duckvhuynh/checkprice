self.addEventListener('message', function(e) {
    const urlMyTransfers = e.data;
    fetch(urlMyTransfers)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        self.postMessage(data);
      })
      .catch(error => {
        self.postMessage({ error: error.message });
      });
  }, false);