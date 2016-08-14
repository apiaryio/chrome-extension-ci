assert = require('chai').assert;
index = require('../../index');

describe('Package index', function(){
  it('exports an object', function(){
    assert.isObject(index);
  });

  describe('the exported obejct', function(){
    it('has a dispatcher propoerty', function(){
      assert.property(index, 'dispatcher');
    });
  });
});