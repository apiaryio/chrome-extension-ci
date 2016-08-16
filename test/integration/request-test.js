var assert = require('chai').assert;
var webdriverio = require('webdriverio');
var express = require('express');
var fs = require('fs');
var https = require('https');
var enableDestroy = require('server-destroy');

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
    uri: "/message",
    method: "get",
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

  app[tReq['method']](tReq['uri'], function(req, res){
    lastRequest = {
      body: req['body'],
      method: req['method'],
      headers: req['headers']
    };

    console.log('headers', req.headers);
    Object.keys(tRes['headers']).forEach(function(key){
      res.set(key, key['value']);
    });

    res.status(tRes['statusCode']).send(tRes['body']);
  });
}

describe.only('HTTP Request', function(){
  this.timeout(10000);

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

      configureExpressEndpoint(transaction, app);

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

          client.url('http://fourth.third.second.first:3000').then(function(){

            //send the action request message to the extension
            message = {
              action: "httpRequest",
              data: {
                httpRequest: transaction['request']
              }
            }

            fn = function(extId, message, callback){
              chrome.runtime.sendMessage(extId, message, function(response){
                callback(response);
              });
            };

            helpers.executeAsync([fn, extensionId, message], function(err, result){
              lastExtensionResponse = result.value;
              done(err)
            });
          }).call();
        });
      });

      after(function(done){
        pageApp.on('close', done);
        pageApp.destroy()
      });

      describe("And it successfuly responds", function(){
        it("the extension response shouldn't have an error", function(){
          assert.notProperty(lastExtensionResponse, 'error');
        })

        it("the backend should receive the request", function(){
          assert.isObject(lastRequest);
          assert.equal(lastRequest['body'], transaction['request']['body']);
          assert.equal(lastRequest['uri'], transaction['request']['method']);
          assert.isObject(lastRequest['headers']);

          Object.keys(transaction['request']['headers']).forEach(function(key){
            assert.property(lastRequest['headers'], key)
            assert.equal(lastRequest['headers'][key],transaction['request']['headers'][key])
          })
        });

        it("the browser should get the response", function(){
          client.debug()
        });

        it("no other headers should be received on the backend");
      });
    });
  });
});

