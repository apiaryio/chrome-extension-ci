var async = require('async');
var assert = require('chai').assert;
var webdriverio = require('webdriverio');

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


describe('Webdriver.io', function(){
  this.timeout(60000);

  beforeEach(function(done){
    client.init().call(done)
  });

  afterEach(function(done){
    //client.end().call(done)
    done();
  });

  describe('when I go to the extension page', function(){
    it('the page should have the extension name listed', function(done){
      var extensionName = helpers.getExtensionName()
      client
        .url("chrome://extensions")
        .waitForExist('iframe[name=extensions]')
        .frame("extensions")
        .click('#toggle-dev-on')
        .getText('h2.extension-title')
        .then(function(extensionTitles){
          assert.include(extensionTitles, extensionName)
        })
        .call(done)
    });

    it('I should be able to get the extension id', function(done){
      helpers.getExtensionId(function(err, extensionId){
        assert.lengthOf(extensionId, 32);
        done();
      })
    });

    it.only('I should be able to open the background page inspector', function(done){
      helpers.getExtensionId(function(err, extensionId){
        var debugTabId
        client
          .click("#" + extensionId + " .active-views a")
          .getTabIds()
          .then(function(tabs){
            debugTabId = tabs[1]
          })
          .switchTab(debugTabId)
          .call()
      });
    });
  });

  describe('when I execute a sync JS code', function(){
    it('should return result', function(done){

      fn = function(number1, number2) {
        var result = number1 + number2;
        return(result);
      };

      helpers.execute([fn, 1, 2], function(err, result){
        assert.equal(result.value, 3);
        done()
      })
    });
  });

  describe('when I execute an async JS code', function(){
    it('should return result', function(done){

      fn = function(number1, number2, callback) {
        var result = number1 + number2;
        console.log(callback);
        callback(result);
        return("not a return value");
      };

      helpers.executeAsync([fn, 1, 2], function(err, result){
        assert.equal(result.value, 3);
        done();
      })
    });
  });


  describe('when I execute sync JS code 100 times in one context',function(){
    it('should return result 100 times and in a reasonable time', function(done){

      fn = function(number1, number2) {
        var result = number1 + number2;
        return(result);
      };

      async.times(100, function(n, next) {
        helpers.execute([fn, 1, 2], function(err, result){

          assert.equal(result.value, 3);
          next();
        })
      }, function(err, users) {
        done()
      });
    });
  });
});