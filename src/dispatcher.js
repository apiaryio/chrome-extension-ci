var echoController = require('./controllers/echo')
var httpRequestController = require('./controllers/http-request')

// The message dispatcher is meant to be plugged in as a listener
// for background script's 'onMessageExternal' event.
// See: js/background.js
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
      error: {
        message: "Error: sent message is not an object"
      },
      request: request
    }
    return(sendResponse(response));
  }

  // Request has no action
  if(request['action'] === undefined){
    response = {
      error: {
        message: "Error: sent message object doesn't have the 'action' property"
      },
      request: request
    }
    return(sendResponse(response));
  }

  // Connect controllers to actions
  switch(request['action']){

    // Add your actions here
    case "echo":
      echoController(request, sender, sendResponse)
      break;


    // ./src/controllers/http-request.js
    case "httpRequest":
      httpRequestController(request, sender, sendResponse)
      break;

    // Unknown action controller
    default:
      response = {
        error: {
          "message": "Error: unknown action"
        },
        request: request
      }
      sendResponse(response);
  }
}

module.exports = dispatcher