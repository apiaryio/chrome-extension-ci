var assert = require('chai').assert
var webdriverio = require('webdriverio')
var options = { desiredCapabilities: { browserName: 'chrome' } };
var client = webdriverio.remote(options);

describe('Webdriver.io', function(){
  this.timeout(60000);
  beforeEach(function(done){
    client.init().call(done)
  });
  afterEach(function(done){
    client.end().call(done)
  });

  describe('when I go to google', function(){
    it('the page should have google\'s title', function(done){
      client
        .url("https://google.com")
        .getTitle()
        .then(function(title){
          assert.equal(title, 'Google')
        })
        .call(done)
    });
  });

  describe('when I execute an async JS code', function(){
    it('should return result', function(done){

      fn = function(number1, number2) {
        var result = number1 + number2;
        return(result);
      };

      client
        .url("https://google.com")
        .execute(fn, 1, 2)
        .then(function(result){
          assert.equal(result.value, 3);
        })
        .call(done);

    });
  });
});