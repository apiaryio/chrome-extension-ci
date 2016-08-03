var fs = require('fs');
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

getExtensionName = function(){
  manifestFile = 'manifest.json'
  manifest = JSON.parse(fs.readFileSync(manifestFile).toString())
  return(manifest['name'])
}

getExtensionId = function(browserInstance, callback){
  extensionName = getExtensionName()
  var extensionIndex = null;
  browserInstance
    .url("chrome://extensions")
    .waitForExist('iframe[name=extensions]')
    .frame("extensions")
    .click('#toggle-dev-on')
    .getText('h2.extension-title')
    .then(function(extensionTitles){
      extensionIndex = extensionTitles.indexOf(extensionName)
    }).getText('.extension-id')
    .then(function(extensionIds){
      extensionId = extensionIds[extensionIndex];
      callback(undefined, extensionId)
    })
}

describe('Webdriver.io', function(){
  this.timeout(60000);

  beforeEach(function(done){
    client.init().call(done)
  });

  afterEach(function(done){
    client.end().call(done)
  });

  describe ('when I go to the extension page', function(){
    it('the page should have the extension name listed', function(done){
      var extensionName = getExtensionName()
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
      getExtensionId(client, function(err, extensionId){
        assert.lengthOf(extensionId, 32);
        done();
      })
    });
  });

  describe('when I execute a JS code', function(){
    it('should return result', function(done){

      fn = function(number1, number2) {
        var result = number1 + number2;
        return(result);
      };

      client
        .execute(fn, 1, 2)
        .then(function(result){
          assert.equal(result.value, 3);
        })
        .call(done);

    });
  });

  describe('when I execute JS code 100 times in one context',function(){
    it('should return result 100 times', function(done){

      fn = function(number1, number2) {
        var result = number1 + number2;
        return(result);
      };

      var i = 0;
      while(i < 100){
        i++;

        client
          .execute(fn, 1, 2)
          .then(function(result){
            assert.equal(result.value, 3);
          })
      }
      client.call(done);
    });
  });
});