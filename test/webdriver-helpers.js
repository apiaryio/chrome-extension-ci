var fs = require('fs');

helpers = function(browserInstance){

  returnObject = {}

  returnObject.getExtensionName = function(){
    var manifestFile = 'manifest.json'
    var manifest = JSON.parse(fs.readFileSync(manifestFile).toString());
    return(manifest['name']);
  }

  returnObject.getExtensionId = function(callback){
    var extensionName = returnObject.getExtensionName();
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
      }).call()
  }

  returnObject.execute = function(argumentArray, callback){
    browserInstance
      .execute.apply(browserInstance, argumentArray)
      .then(function(result){
        callback(result)
      }).call();
  }

  returnObject.executeAsync = function(argumentArray, callback){
    browserInstance
      .executeAsync.apply(browserInstance, argumentArray)
      .then(function(result){
        callback(result)
      }).call();
  }


  return(returnObject);
}
module.exports = helpers