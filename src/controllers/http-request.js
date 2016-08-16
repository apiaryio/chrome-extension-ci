var url = require('url')
var http = require('http')

// Http Request action controller for execution HTTP and HTTPS requests
// This action is plugged to the dispatcher in ./src/dispatcher.js

httpRequestController = function(request, sender, sendResponse){
  console.log(request)
  var httpRequest = request['data']['httpRequest']

  var parsedUrl = url.parse("http://localhost:3001" + httpRequest['uri'])

  var requestOptions = {
    host: parsedUrl['hostname'],
    port: parsedUrl['port'],
    path: parsedUrl['path'],
    method: httpRequest['method'],
    headers: httpRequest['headers'],
  }

  handleResponse = function(res){
    buffer = ""

    res.on('data', function(chunk){
      buffer += chunk;
    })

    res.on('error', function(error){
      // Response error handling here
      console.log("response error")
      //throw(error);
    })

    res.once('end', function(){
      httpResponse = {
        statusCode: res['statusCode'],
        headers: res['headers'],
        body: buffer
      }

      var response = {
        "data": {
          httpResponse: httpResponse
        }
      };

      // Send the response back to the page
      sendResponse(response);
    })
  }

  req = http.request(requestOptions, handleResponse);
  req.on('error', function(error){
    // Request error handling here
    console.log("request error")
    //throw(error);
  })
  req.write(httpRequest['body'])
  req.end()
}

module.exports = httpRequestController