// Echo Action controller
// This is the demo action controller connected to the 'echo'
// action in the message dispatcher ./lib/dispatcher
echoController = function(request, sender, sendResponse){
  var response = {
    "data": request['data']
  };
  sendResponse(response);
}

module.exports = echoController