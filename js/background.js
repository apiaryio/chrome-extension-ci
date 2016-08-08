externalMessageHandler = function(request, sender, sendResponse) {
  sendResponse("BooBoo");
};

chrome.runtime.onMessageExternal.addListener(externalMessageHandler);
