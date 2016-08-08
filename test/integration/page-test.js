var assert = require('chai').assert
var webdriverio = require('webdriverio')

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



describe('Extension and web page integration', function(){
  describe('', function(){
    it.skip('message should be processed by the extension script browser JS should get the response', function(done){
      done()
    });
  })
})