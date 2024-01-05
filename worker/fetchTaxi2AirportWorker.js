self.addEventListener('message', function(e) {
    const payload = e.data;
  
    fetch('https://booking.taxi2airport.com/graphql', {
      method: 'POST',
      headers: {
        'Host': 'booking.taxi2airport.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      self.postMessage(data);
    })
    .catch(error => console.error('Error:', error));
  }, false);