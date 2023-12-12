self.addEventListener('message', function(e) {
    const link = e.data;
    fetch(link)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (!data.journeys) {
          throw new Error('Website data or journeys is undefined');
        } else {
          self.postMessage(data);
        }
      })
      .catch(error => {
        self.postMessage({ error: error.message });
      });
  }, false);