var assert = require('chai').assert;
var webdriverio = require('webdriverio');
var express = require('express');
var fs = require('fs');
var https = require('https');

var options = {
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
         "--load-extension=./"
       ]
    }
  }
};

var client = webdriverio.remote(options);
var helpers = require('../webdriver-helpers')(client);

var extensionId;
var backendServer;

describe('Debugging and error handling', function(){
  describe('Syntax error in the background page JS',function(){
    it('should expolode in in the get extensionId')
  });

  describe('Exception in the background page JS after loading', function(){
    it('should expolode in in the get extensionId')
  })

  describe('Exception in webdriver execute in the web page', function(){
    it('should thow that exception')
  })

  describe('Exception in webdriver executeAsync in the web page', function(){
    it('should throw that exception')
  })

  describe('When exception is thrown in the background page',function(){
    describe('During processing the mesasge and before sending the response', function(){

    })

    describe('Any other time', function(){
      it('I should be able to retreive any exception')
    })
  })
})