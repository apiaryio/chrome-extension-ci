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

var extensionId;
var backendServer;

describe('Extension to web page integration', function(){
  this.timeout(10000)

  before(function(done){
    client.init()
      .timeouts('script', 60000)
      .then(function(){
        // Get the extension ID
        helpers.getExtensionId(function(err, theExtensionId){
          extensionId = theExtensionId;
          done(err);
        });
    });
  });

  after(function(done){
    client.end().call();
    done();
  })

  var schemas = [
    'http',
    'https'
  ]
  schemas.forEach(function(schema){
    describe('Externally connectable', function(){
      before(function(done){

        // Spin up the local server listsening on:
        // - 'third.second.first:3000'
        // - 'fourth.third.second.first:3000'
        app = express();
        app.use(express.static('test/fixtures/embed/'));
        app.get('/', function (req, res) {
          res.send('Hello World!');
        });

        if(schema === 'http') {
          backendServer = app.listen(3000, function(){
            enableDestroy(backendServer);
            done()
          });
        } else {
          options = {
            key: fs.readFileSync('test/fixtures/certs/key'),
            cert: fs.readFileSync('test/fixtures/certs/cert')
          };

          backendServer = https.createServer(options, app).listen(3000,function(){
            enableDestroy(backendServer);
            done();
          });
        };

      });

      after(function(done){
        backendServer.on('close', function(){
          done();
        });

        // Selenium Chromedriver keeps the conection to the backend open
        // and the `close` callback is never called until all the connections are closed.
        // So we have to force-terminate all the connections to the server.
        backendServer.destroy();
      });

      describe('When the page is accessed on a third level domain',function(){
        describe('When I go to the page where the extension should be connectable',function(){
          describe('And I send a message to the extension', function(){
            it('The page JS should get an answer', function(done){
              fn = function(extId, callback){
                message = {
                  action: "echo",
                  data: "Booboo"
                }
                chrome.runtime.sendMessage(extId, message, function(response){
                  callback(response)
                });
              }

              client
                .url(schema + '://third.second.first:3000/')
                .then(function(){
                  helpers.executeAsync([fn, extensionId], function(err, result){
                    assert.isObject(result['value'])
                    assert.property(result['value'], 'data')
                    assert.equal(result['value']['data'], 'Booboo')
                    done()
                  })
                });
            });
          });
        });

        describe('When I go to the page where the extension should be connectable',function(){
          describe('And I send a message to the extension', function(){
            it('The page JS should get an answer', function(done){
              fn = function(extId, callback){
                message = {
                  action: "echo",
                  data: "Booboo"
                }
                chrome.runtime.sendMessage(extId, message, function(response){
                  callback(response)
                });
              }

              client
                .url(schema + '://third.second.first:3000/')
                .then(function(){
                  helpers.executeAsync([fn, extensionId], function(err, result){
                    assert.isObject(result['value'])
                    assert.property(result['value'], 'data')
                    assert.equal(result['value']['data'], 'Booboo')
                    done()
                  })
                });
            });
          });
        });
      });

      describe('When the page is accessed on a fourth level domain',function(){
        describe('When I go to the page where the extension should be connectable',function(){
          describe('And I send a message to the extension', function(){
            it('The page JS should get an answer', function(done){
              fn = function(extId, callback){
                message = {
                  action: "echo",
                  data: "Booboo"
                }
                chrome.runtime.sendMessage(extId, message, function(response){
                  callback(response)
                });
              }

              client
                .url(schema + '://fourth.third.second.first:3000/')
                .then(function(){
                  helpers.executeAsync([fn, extensionId], function(err, result){
                    assert.isObject(result['value'])
                    assert.property(result['value'], 'data')
                    assert.equal(result['value']['data'], 'Booboo')
                    done()
                  })
                });
            });
          });
        });
      });

      describe('When the page is accessed via iframe from to third level domain via iframe on a completely different domain', function(){

        var iframeBackend;
        before(function(done){
          // Spin up the local server hosting the embedding html listsening on:
          // - 'localhost:3001'
          app = express();
          app.use(express.static('test/fixtures/embed/'));
          app.get('/', function (req, res) {
            res.send('Hello World!');
          });

          if(schema === 'http') {
            iframeBackend = app.listen(3001, function(){
              enableDestroy(iframeBackend);
              done()
            });
          } else {
            options = {
              key: fs.readFileSync('test/fixtures/certs/key'),
              cert: fs.readFileSync('test/fixtures/certs/cert')
            };

            iframeBackend = https.createServer(options, app).listen(3001,function(){
              enableDestroy(iframeBackend);
              done();
            });
          };
        });

        after(function(done){
          iframeBackend.on('close', function(){
            done();
          });

          // Selenium Chromedriver keeps the conection to the backend open
          // and the `close` callback is never called until all the connections are closed.
          // So we have to force-terminate all the connections to the server.
          iframeBackend.destroy();
        });

        describe('When I go to the page where the connectable page is embedded', function(){
          describe('And I send interact with the extension', function(){
            it("Should have the data returned from the extension", function(done){

              client
                .url(schema + '://localhost:3001/embed-' + schema + '.html')
                .waitForExist('iframe[name=embed]',1000)
                .frame("embed")
                .then(function(){

                  // Inject the extensionId into the browser context
                  fn = function(injectedExtId){
                    extId = injectedExtId;
                  }

                  helpers.execute([fn, extensionId], function(){
                    client
                      .click('#interaction')
                      .waitForExist('#extension-data', 1000)
                      .getText("#extension-data")
                      .then(function(text){
                        assert.equal(text, "Booboo");
                        done();
                      }).call();
                  });
                }).call();
            });
          });
        });
      });
    });
  });
});