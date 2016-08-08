var assert = require('chai').assert;
var webdriverio = require('webdriverio');
var express = require('express');


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
    client.end();
    done();
  })

  describe('Externally connectable', function(){
    before(function(done){
      // Spin up the local server listsening on 'http://third.second.first'
      app = express();

      app.use(express.static('test/fixtures/embed/'));

      app.get('/', function (req, res) {
        res.send('Hello World!');
      });

      backendServer = app.listen(3000, function(){
        done()
      });
    })

    after(function(done){
      client.end()

      backendServer.close(function(){
        done();
      })
    });

    describe('When the page is accessed on a third level domain',function(){
      describe('When I go to the page where the extension should be connectable',function(){
        describe('And I send a message to the extension', function(){
          it('The page JS should get an answer', function(done){
            fn = function(extId, callback){
              chrome.runtime.sendMessage(extId, "Foo Bar", function(response){
                callback(response)
              });
            }

            client
              .url('http://third.second.first:3000/')
              .then(function(){
                helpers.executeAsync([fn, extensionId], function(err, result){
                  assert.equal(result.value, "BooBoo")
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
              chrome.runtime.sendMessage(extId, "Foo Bar", function(response){
                callback(response)
              });
            }

            client
              .url('http://fourth.third.second.first:3000/')
              .then(function(){
                helpers.executeAsync([fn, extensionId], function(err, result){
                  assert.equal(result.value, "BooBoo")
                  done()
                })
              });
          });
        });
      });
    });

    describe('When the page is accessed via iframe from to third level domain via completely different domain', function(){
      var iframeBackend
      before(function(done){
        // Spin up the local server listsening on 'http://third.second.first'
        app = express();

        app.use(express.static('test/fixtures/embed/'));

        app.get('/', function (req, res) {
          res.send('Hello World!');
        });

        iframeBackend = app.listen(3001, function(){
          done()
        });
      });

      after(function(done){
        client.end()

        iframeBackend.close(function(){
          done();
        })
      });
      describe('When I go to the page where the connectable page is embedded', function(){
        describe('And I send interact with the extension', function(){
          it("Should have the data returned from the extension", function(done){

            client
              .url('http://localhost:3001/embed.html')
              .waitForExist('iframe[name=embed]')
              .frame("embed")
              .then(function(){
                fn = function(injectedExtId){
                  extId = injectedExtId;
                }

                helpers.execute([fn, extensionId], function(){
                  client
                    .click('#interaction')
                    .waitForExist('#extension-data')
                    .getText("#extension-data")
                    .then(function(text){
                      console.log('preassertion');
                      assert.equal(text,"BooBoo");
                      done();
                    }).call();
                });

            });
          });
        });
      });
    });
  });
});