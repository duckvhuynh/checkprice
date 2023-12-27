self.addEventListener('message', function(e) {
    const payload = e.data.payload;
    const refererUrl = e.data.refererUrl;
  
    fetch('https://www.klook.com/v1/transferairportapisrv/product/search/get_search_id', {
      method: 'POST',
      headers: {
        'Host': 'www.klook.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en_US',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json;charset=utf-8',
        'Version': '5.4',
        'X-Requested-With': 'XMLHttpRequest',
        'Currency': 'USD',
        'Origin': 'https://www.klook.com',
        'Connection': 'keep-alive',
        'Referer': refererUrl,
        'TE': 'trailers'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      // Send the data back to the main thread
      console.log(data);
      self.postMessage(data);
    })
    .catch(error => console.error('Error:', error));
  }, false);