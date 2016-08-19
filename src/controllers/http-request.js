var url = require('url')
var http = require('http')

// Http Request action controller for execution HTTP and HTTPS requests
// This action is plugged to the dispatcher in ./src/dispatcher.js
httpRequestController = function(request, sender, sendResponse){
  var httpRequest = request['data']['httpRequest']

  var request = new XMLHttpRequest();

  request.open(httpRequest['method'].toUpperCase(), httpRequest['url']);

  // Set headers
  Object.keys(httpRequest['headers']).forEach(function(key){
    request.setRequestHeader(key, httpRequest['headers'][key]);
  })


  // TODO comment this out and try to debug it. Chrome sends to selenimu just an empty response
  // Object.keys(httpRequest['headers']).each(function(key){
  //   request.setRequestHeader(key, httpRequest['headers'][value]);
  // })

  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      var httpResponse = {
        statusCode: this.status,
        headers: parseHeaders(this),
        body: this.responseText
      }

      var response = {
        data: {
          httpResponse: httpResponse
        }
      };

      // Send the response back to the page
      sendResponse(response);
    }
  };

  var body = "Hello world!";

  request.send(body);

  return true;

}

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;

        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];

            if (headers[key] !== undefined) {

                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}


module.exports = httpRequestController