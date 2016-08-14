var echoController = require('./controllers/echo')

// The message dispatcher is meant to be plugged in as a listener
// for background script's 'onMessageExternal' event.
// see js/background.js
//
// It expects 'request' object as a first parameter with properties:
// - action (string, required) the action name to dispatch
// - data (required) any data passed to the action to process
//
// The 'response' object has oneOf the following properties:
// - error (object) The error object in casd of error during the executrion
//   - message (string) The error message
// - data () The response data in case of successful executrion of the acion
//
// The `sendResonse` is browser's function sending the first passed argument
// back to the page.

dispatcher = function (request, sender, sendResponse) {
  //Request is not an object
  if(typeof(request) !== 'object'){
    response = {
      "error": {
        "message": "Error: sent message is not an object"
      }
    }
    return(sendResponse(response));
  }

  // Request has no action
  if(request['action'] === undefined){
    response = {
      "error": {
        "message": "Error: sent message object doesn't have the 'action' property"}
    }
    return(sendResponse(response));
  }

  // Connect controllers to actions
  switch(request['action']){

    // Add your actions heress
    case "echo":
      return echoController(request, sender, sendResponse)

    // Unknown action controller
    default:
      response = {
        "error": {
          "message": "Error: unknown action"
        }
      }
      return(sendResponse(response));
  }
}

module.exports = dispatcher