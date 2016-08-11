# Chrome Extension in Continuous Integration
[![Build Status](https://travis-ci.org/apiaryio/chrome-extension-ci.svg?branch=master)](https://travis-ci.org/apiaryio/chrome-extension-ci)


## The Stack

- [Node.js](https://nodejs.org/en/) - Programming Language
- [Mocha](https://mochajs.org/) - Node.js test frameworks
- [Chai](http://chaijs.com/) - Node.js test assertion/framework
- [Browserify](http://browserify.org/) - To be able unit test everything locally and then inject it into the extension scope
- [Webdriver.io](http://webdriver.io/) - Node.js bindings and DSL for Selenium
- [selenium-standalone](https://github.com/vvo/selenium-standalone) - Node.js wrapper runnnig and fetching the Standalone selenium server and its dependencies (ChromeFriver etc...)
- [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/capabilities) -Selenium driver for commanding Chrome
- [xvfb](https://docs.travis-ci.com/user/gui-and-headless-browsers/) (for headless Chrome in the CI) - Virtaul frame buffer for X server
- [Travis CI](https://travis-ci.org) - the CI


## How to TDD the unpacked chrome extension locally


- Install NPM dependecies
```
$ npm install
```

- Install Selenium Drivers
```
$ npm run selenium-install
```

- Spin up the Standalone Selenium Server
```
$ npm run selenium-start
```

- Run the tests suite
```
$ npm test
```


