assert = require('chai').assert
echoController = require('../../../lib/controllers/echo')
sinon = require('sinon')

describe("Echo controller", function(){
  it('is a fuction',function(){
    assert.isFunction(echoController)
  })

  describe("When called", function(){
    it('calls the callback sendResponse', function(done) {
      request = {

      }
      sender = {}
      sendResponse = function(data){
        done()
      }
      echoController(request, sender, sendResponse)
    })

    it('should return object',function(done){
      request = {
        data: "BooBoo"
      }
      sender = {}
      sendResponse = function(data){
        assert.isObject(data)
        done()
      }

      echoController(request, sender, sendResponse)
    })

    it('returned object should have the data property',function(done){
      request = {
        data: "BooBoo"
      }
      sender = {}
      sendResponse = function(data){
        assert.property(data,'data')
        done()
      }

      echoController(request, sender, sendResponse)
    })

    it('returned data should be the same as the sent request', function(done){
      request = {
        data: "BooBoo"
      }

      sender = {}
      sendResponse = function(data){
        assert.equal(data['data'], request['data'])
        done()
      }

      echoController(request, sender, sendResponse)
    })
  })
})