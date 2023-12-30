self.addEventListener('message', function(e) {
    const payload = e.data;
  
    fetch('https://api.jayride.com/internal/v2/quote-request?key=a988097b5d9c4975a06df44a35aa90e0', {
      method: 'POST',
      headers: {
        'Host': 'api.jayride.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
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