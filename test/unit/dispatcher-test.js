var assert = require('chai').assert
var sinon = require('sinon')
var proxyquire = require('proxyquire').noCallThru()

var echoController = require('../../lib/controllers/echo')

var echoControllerSpy = sinon.spy(echoController);

var dispatcher = proxyquire('../../lib/dispatcher', {
  './controllers/echo': echoControllerSpy
})


describe('Module Dispatcher', function(){
  it('exports a function', function(){
    assert.isFunction(dispatcher);
  })

  describe("When the request object is not an object",function(){
    var request

    beforeEach(function(){
      request = "Foo Bar";
    });

    afterEach(function(){
      echoControllerSpy.reset()
    })

    it('should send back an object',function(done){
      sender = {};

      sendRequest = function(data){
        assert.isObject(data);
        done()
      }
      dispatcher(request, sender, sendRequest)
    });

    describe('and the received object', function(){
      var receivedObject;

      beforeEach(function(done){
        request = "Foo Bar";
        sender = {};

        sendRequest = function(data){
          receivedObject = data;
          assert.isObject(data);
          done()
        }
        dispatcher(request, sender, sendRequest)
      });

      it('should have the "error" property', function(){
        assert.property(receivedObject, 'error')
      });

      it('should have the "error.messge" property', function(){
        assert.deepProperty(receivedObject, 'error.message')
      });

      it('error.message should contain descriptive error', function(){
        assert.include(receivedObject['error']['message'], 'Error')
        assert.include(receivedObject['error']['message'], 'object')
      })

    })

    it("and the echo controller shouoldn't be called", function(){
      assert.isFalse(echoControllerSpy.called)
    })
  })

  describe("When the request object doesn't have the 'action' key",function(){
    var request;

    beforeEach(function(){
      request = {};
    });

    afterEach(function(){
      echoControllerSpy.reset()
    })

    it('should send back an object',function(done){
      sender = {};

      sendRequest = function(data){
        assert.isObject(data);
        done()
      }
      dispatcher(request, sender, sendRequest)
    });

    describe('and the received object', function(){
      var receivedObject;

      beforeEach(function(done){
        sender = {};

        sendRequest = function(data){
          receivedObject = data;
          assert.isObject(data);
          done()
        }
        dispatcher(request, sender, sendRequest)
      });

      it('should have the "error" property', function(){
        assert.property(receivedObject, 'error')
      });

      it('should have the "error.messge" property', function(){
        assert.deepProperty(receivedObject, 'error.message')
      });

      it('error.message should contain descriptive error', function(){
        assert.include(receivedObject['error']['message'], 'Error')
        assert.include(receivedObject['error']['message'], 'object')
      })
    })
  })

  describe("When the request object doesn't have the 'action' key",function(){
    var request;

    beforeEach(function(){
      request = {
        "action": "VeryUnkonwnAction"
      };
    });

    afterEach(function(){
      echoControllerSpy.reset()
    })

    it('should send back an object',function(done){
      sender = {};

      sendRequest = function(data){
        assert.isObject(data);
        done()
      }
      dispatcher(request, sender, sendRequest)
    });

    describe('and the received object', function(){
      var receivedObject;

      beforeEach(function(done){
        sender = {};

        sendRequest = function(data){
          receivedObject = data;
          assert.isObject(data);
          done()
        }
        dispatcher(request, sender, sendRequest)
      });

      it('should have the "error" property', function(){
        assert.property(receivedObject, 'error')
      });

      it('should have the "error.messge" property', function(){
        assert.deepProperty(receivedObject, 'error.message')
      });

      it('error.message should contain descriptive error', function(){
        assert.include(receivedObject['error']['message'], 'Error')
        assert.include(receivedObject['error']['message'], 'unknown')
      })
    })
  })

  describe("When the action is 'echo'",function(){
    var request;

    beforeEach(function(done){
      request = {
        "action": "echo"
      };
      sender = {};
      sendRequest = function(data){
        receivedObject = data;
        done()
      }
      dispatcher(request, sender, sendRequest)
    });

    afterEach(function(){
      echoControllerSpy.reset()
    })

    it('should call the echo controller', function(){
      assert.isTrue(echoControllerSpy.called)
    });
  });
});