self.addEventListener('message', function(e) {
    const url = e.data;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        self.postMessage(data);
      })
      .catch(error => {
        self.postMessage({ error: error.message });
      });
  }, false);