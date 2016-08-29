// - `dispatcher` variable is exported by index.js
// - index.js is browserified to ./js/build.js
// - build.js is injected into the background page in manifest.json
//   before this script and it exports to the global index
// - background page doesn't share the context with the web pages

chrome.runtime.onMessageExternal.addListener( function(request, sender, sendResponse){
  dispatcher(request, sender, sendResponse)

  // This is a must! http://stackoverflow.com/questions/14940752/chrome-extension-messaging-timeout
  return true;
});
