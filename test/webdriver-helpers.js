var fs = require('fs');

helpers = {}

helpers.getExtensionName = function(){
  manifestFile = 'manifest.json'
  manifest = JSON.parse(fs.readFileSync(manifestFile).toString())
  return(manifest['name'])
}

helpers.getExtensionId = function(browserInstance, callback){
  extensionName = helpers.getExtensionName()
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

module.exports = helpers