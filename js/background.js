// - dispatcher is exported by index.js
// - index.js is browserified to ./js/build.js
// - build.js is injected into the background page in manifest.json
//   before this script and it exports to the global index

chrome.runtime.onMessageExternal.addListener(dispatcher);
