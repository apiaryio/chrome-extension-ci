var url = require('url')
var http = require('http')

// Http Request action controller for execution HTTP and HTTPS requests
// This action is plugged to the dispatcher in ./src/dispatcher.js
httpRequestController = function(request, sender, sendResponse){
  // var httpRequest = request['data']['httpRequest']

  // var request = new XMLHttpRequest();

  // request.open(httpRequest['method'].toUpperCase(), httpRequest['url']);

  // // Set headers
  // Object.keys(httpRequest['headers'], function(key){
  //   request.setRequestHeader(key, httpRequest['headers'][value]);
  // })

  // request.onreadystatechange = function () {
  //   if (this.readyState === 4) {
  //     console.log('Status:', this.status);
  //     console.log('Headers:', this.getAllResponseHeaders());
  //     console.log('Body:', this.responseText);

  //     var httpResponse = {
  //       statusCode: this.status,
  //       headers: this.getAllResponseHeaders(),
  //       body: this.responseText
  //     }

  //     var response = {
  //       data: {
  //         httpResponse: httpResponse
  //       }
  //     };

  //     // Send the response back to the page
  //     console.log(response)
  //     sendResponse(response);
  //   }
  // };

  // var body = "Hello World!";

  // request.send(body);


  var httpRequest = request['data']['httpRequest']

  // TODO
  // This is a clusterfuck I need to learn how to debug
  // The erro sometimes appear in the backgraund page console
  // var parsedUrl = url.parse(httpRequest['urls'])

  var parsedUrl = url.parse(httpRequest['url'])

  var requestOptions = {
    host: parsedUrl['hostname'],
    port: parsedUrl['port'],
    path: parsedUrl['path'],
    method: httpRequest['method'],
    headers: httpRequest['headers'],
    mode: "allow-wrong-content-type"
  }

  var handleResponse = function(res){
    buffer = ""

    res.on('data', function(chunk){
      buffer += chunk;
    })

    res.on('error', function(error){
      // Response error handling here
      console.log("response error")
      throw(error);
    })

    res.once('end', function(){
      var httpResponse = {
        statusCode: res['statusCode'],
        headers: res['headers'],
        body: buffer
      }

      var response = {
        data: {
          httpResponse: httpResponse
        }
      };

      // Send the response back to the page
      console.log(response)
      sendResponse(response);
    })
  }

  req = http.request(requestOptions, handleResponse);

  req.on('error', function(error){
    // Request error handling here
    throw(error);
  })

  req.write(httpRequest['body'])
  req.end()

  return true;

}

module.exports = httpRequestController