var assert = require('chai').assert

var webdriverio = require('webdriverio')
var options = { desiredCapabilities: { browserName: 'chrome' } };
var client = webdriverio.remote(options);

describe('Extension to web page integration', function(){
  describe('When I send a message', function(){
    it('message should be processed by the backend script')
    it('browser should get the response')
  })
})