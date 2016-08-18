var assert = require('chai').assert;
var webdriverio = require('webdriverio');
var express = require('express');
var fs = require('fs');
var https = require('https');
var enableDestroy = require('server-destroy');
var url = require('url');
var bodyParser = require('body-parser')
var concat = require('concat-stream')

var options = {
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
         "--load-extension=./"
       ]
    }
  }
};

var client = webdriverio.remote(options);
var helpers = require('../webdriver-helpers')(client);

var transaction = {
  request: {
    //url: "http://localhost:3001/message",
    url: "http://private-04ecc3-swaggernewapi.apiary-mock.com/message",
    method: "post",
    headers: {
      "X-first-request-header": "first-request-value",
      "X-second-request-header": "second-request-value"
    },
    body: "Hello world!"
  },

  response: {
    statusCode: 201,
    headers: {
      "X-first-respose-header": "first-response-value",
      "X-second-respose-header": "second-response-value",
    },
    body: "Good bye!"
  }
}

var backendServer;
var pageServer;
var lastRequest;
var lastExtensionResponse;
var extensionId;

var configureExpressEndpoint = function(transaction, app){
  var tReq = transaction['request'];
  var tRes = transaction['response'];
  var uri = url.parse(tReq['url'])['pathname']
  app[tReq['method']](uri, function(req, res){
    console.log(req.headers)
    lastRequest = {
      body: req['body'],
      method: req['method'],
      headers: req['headers']
    };

    Object.keys(tRes['headers']).forEach(function(key){
      res.set(key, tRes['headers'][key]);
    });

    res.status(tRes['statusCode']).send(tRes['body']);
  });
}

describe.only('HTTP Request', function(){
  this.timeout(60000);

  before(function(done){
    client.init()
      .timeouts('script', 60000)
      .then(function(){
        // Get the extension ID
        helpers.getExtensionId(function(err, theExtensionId){
          extensionId = theExtensionId;
          done(err);
        });
    }).call();
  });

  after(function(done){
    //client.end().call();
    done();
  })

  describe("When the server doesn't support CORS",  function(){
    before(function(done){
      // Spin up the local server hosting the backend
      // - 'localhost:3001'
      app = express();
      app.use(function(req, res, next){
        req.pipe(concat(function(data){
          req.body = data;
          next();
        }));
      })

      configureExpressEndpoint(transaction, app);

      // TODO pull this out into a separate helper function

      backendApp = app.listen(3001, function(){
        enableDestroy(backendApp);
        done();
      })
    });

    after(function(done){
      backendApp.on('close', done)
      backendApp.destroy();
    });

    describe("When I send the request from a different domain", function(){
      before(function(done){
        // - 'third.second.first:3000'
        // - 'fourth.third.second.first:3000'
        app = express();

        app.get('/', function (req, res) {
          res.send('Extension test page.');
        });

        pageApp = app.listen(3000, function(){
          enableDestroy(pageApp);

          client
            .url('http://fourth.third.second.first:3000')
            .pause(2000)
            .then(function(){

              // Send the action request message to the extension
              // Function executed in the page context
              // This should be encapsulated and tested somewhere else as an isolated functionality
              fn = function(extId, message, callback){

                var waitForResponse = 5000;
                var callbackCalled = false;

                var timeout = setTimeout(function() {
                  if(callbackCalled !== true){
                    console.log("Time out!")
                    response = {
                      error: "Time out! Wait time for response exceeded: " + waitForResponse,
                      request: message
                    }
                    callback(response)
                  }
                }, waitForResponse)

                chrome.runtime.sendMessage(extId, message, function(response){
                  console.log("Received response in the page")
                  console.log(response)
                  callback(response);

                  clearTimeout(timeout);
                  callbackCalled = true;
                });

                return true;
              };

              dataToSend = {
                action: "httpRequest",
                data: {
                  httpRequest: transaction['request']
                }
              };

              helpers.executeAsync([fn, extensionId, dataToSend], function(err, result){
                console.log(result);
                lastExtensionResponse = result.value;
                done(err)
              });
            });
        });
      });

      after(function(done){
        pageApp.on('close', done);
        pageApp.destroy();
      });

      describe("And it successfuly responds", function(){
        it("the extension response shouldn't have an error", function(){
          assert.notProperty(lastExtensionResponse, 'error');
        })

        it("the backend should receive the request", function(){
          assert.isObject(lastRequest);
          assert.equal(lastRequest['body'], transaction['request']['body']);
          assert.equal(lastRequest['method'].toLowerCase(), transaction['request']['method'].toLowerCase());
          assert.isObject(lastRequest['headers']);

          Object.keys(transaction['request']['headers']).forEach(function(key){
            // express is lowercasing all the header keys
            lowCasedKey = key.toLowerCase()
            assert.property(lastRequest['headers'], lowCasedKey)
            assert.equal(
              lastRequest['headers'][lowCasedKey],

              transaction['request']['headers'][key]
            )
          })
        });

        it("the browser should get the response",function(){
          httpResponse = lastExtensionResponse['data']['httpResponse'];
          console.log(httpResponse)

          assert.isObject(httpResponse);
          assert.equal(httpResponse['body'], transaction['response']['body']);
          assert.equal(httpResponse['statusCode'], transaction['response']['statusCode']);

          Object.keys(transaction['response']['headers']).forEach(function(key){
            // express is lowercasing all the header keys
            lowCasedKey = key.toLowerCase()
            assert.property(httpResponse['headers'], lowCasedKey)
            assert.equal(
              httpResponse['headers'][lowCasedKey],

              transaction['request']['headers'][key]
            )
          })


        });

        it("no other headers should be received on the backend");
      });
    });
  });
});

