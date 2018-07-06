(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["perspectivesProxy"] = factory();
	else
		root["perspectivesProxy"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/perspectivesApiProxy.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/perspectivesApiProxy.js":
/*!*************************************!*\
  !*** ./src/perspectivesApiProxy.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar resolver = void 0,\n    rejecter = void 0;\n\nvar Perspectives = new Promise(function (resolve, reject) {\n  resolver = resolve;\n  rejecter = reject;\n});\n\n// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.\nfunction createRequestEmitterImpl(left, right, emit) {\n  try {\n    // Resolve the Perspectives promise made above for the proxy.\n    var pp = new PerspectivesProxy(new InternalChannel(left, right, emit));\n    resolver(pp);\n    return Perspectives;\n  } catch (e) {\n    rejecter(e);\n  }\n}\n\n// Top level entry function to set up a TCP channel with a Perspectives Core endpoint.\n// From module Control.Aff.Sockets:\n// type TCPOptions opts = {port :: Port, host :: Host, allowHalfOpen :: Boolean | opts}\n// type Port = Int\n// type Host = String\nfunction createTcpConnectionToPerspectives(options) {\n  try {\n    // Resolve the Perspectives promise made above for the proxy.\n    resolver(new PerspectivesProxy(new TcpChannel(options)));\n  } catch (e) {\n    rejecter(e);\n  }\n}\n\nvar TcpChannel = function () {\n  function TcpChannel(options) {\n    _classCallCheck(this, TcpChannel);\n\n    var connection = void 0;\n    this.requestId = -1;\n    var valueReceivers = {};\n    this.connection = __webpack_require__(/*! net */ \"net\").createConnection(options,\n    // message will be in base64. Appending a string to it converts it to a new string.\n    function () {\n      console.log(\"Connection made.\");\n    });\n    connection = this.connection;\n    this.valueReceivers = valueReceivers;\n\n    connection.on('data',\n    // message will be in base64. Appending a string to it converts it to a new string.\n    function (message) {\n      var messages = (message + \"\").split(\"\\n\");\n      messages.forEach(function (m) {\n        if (m !== \"\") {\n          try {\n            var _JSON$parse = JSON.parse(m),\n                setterId = _JSON$parse.setterId,\n                objects = _JSON$parse.objects;\n\n            valueReceivers[setterId](objects);\n          } catch (e) {\n            console.log(e);\n          }\n        }\n      });\n    });\n\n    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_error\n    // Emitted when an error occurs. The 'close' event will be called\n    // directly following this event.\n    connection.on('error', function (error) {\n      console.log(\"Error on the connection: \" + error);\n      // Half-closes the socket. i.e., it sends a FIN packet.\n      // It is possible the server will still send some data.\n      connection.end();\n    });\n\n    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_close\n    // Emitted once the socket is fully closed. The argument had_error is a boolean\n    // which says if the socket was closed due to a transmission error.\n    connection.on('close', function (had_error) {\n      // No data will come anymore.\n      if (had_error) {\n        console.log(\"The Perspectives Core has hung up because of an error.\");\n      } else {\n        console.log(\"The Perspectives Core has hung up.\");\n      }\n    });\n\n    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_end\n    // Emitted when the other end of the socket sends a FIN packet.\n    // By default (allowHalfOpen == false) the socket will destroy its file\n    // descriptor once it has written out its pending write queue.\n    connection.on('end', function () {\n      // This means the other side will no longer send data.\n      console.log(\"The Perspectives Core has hung up.\");\n    });\n  }\n\n  _createClass(TcpChannel, [{\n    key: \"nextRequestId\",\n    value: function nextRequestId() {\n      this.requestId = this.requestId + 1;\n      return this.requestId.toString();\n    }\n\n    // close will lead the messageProducer of the perspectives core to receive (Right unit).\n\n  }, {\n    key: \"close\",\n    value: function close() {\n      this.connection.end();\n      this.send = function () {\n        throw \"This client has shut down!\";\n      };\n    }\n\n    // req has the following format (taken from: module Perspectives.Api)\n    //   { request :: String\n    //   , subject :: String\n    //   , predicate :: String\n    //   , setterId :: ReactStateSetterIdentifier}\n    // type ReactStateSetterIdentifier = String\n\n  }, {\n    key: \"send\",\n    value: function send(req, receiveValues) {\n      req.setterId = this.nextRequestId();\n      this.valueReceivers[req.setterId] = receiveValues;\n      this.connection.write(JSON.stringify(req) + \"\\n\");\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      delete this.valueReceivers[req.setterId];\n      this.connection.write({ request: \"Unsubscribe\", subject: req.subject, predicate: req.predicate, setterId: req.setterId });\n    }\n  }]);\n\n  return TcpChannel;\n}();\n\nvar InternalChannel = function () {\n  function InternalChannel(left, right, emit) {\n    _classCallCheck(this, InternalChannel);\n\n    this.left = left;\n    this.right = right;\n    this.emit = emit;\n    this.requestId = -1;\n  }\n\n  _createClass(InternalChannel, [{\n    key: \"nextRequestId\",\n    value: function nextRequestId() {\n      this.requestId = this.requestId + 1;\n      return this.requestId;\n    }\n\n    // Inform the server that this client shuts down.\n    // No other requests may follow this message.\n\n  }, {\n    key: \"close\",\n    value: function close() {\n      this.emit(this.right({}))();\n      this.emit = function () {\n        throw \"This client has shut down!\";\n      };\n    }\n  }, {\n    key: \"send\",\n    value: function send(req, receiveValues) {\n      var proxy = this;\n      // Create a correlation identifier and store 'receiveValues' with it.\n      // Send the correlation identifier instead of reactStateSetter.\n      req.reactStateSetter = function (arrString) {\n        receiveValues(arrString);\n        return function () {};\n      };\n      req.setterId = this.nextRequestId();\n      this.emit(this.left(req))();\n      // return the unsubscriber.\n      return function () {\n        proxy.unsubscribe(req);\n      };\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      this.send({ request: \"Unsubscribe\", subject: req.subject, predicate: req.predicate, setterId: req.setterId });\n    }\n  }]);\n\n  return InternalChannel;\n}();\n\nvar PerspectivesProxy = function () {\n  function PerspectivesProxy(channel) {\n    _classCallCheck(this, PerspectivesProxy);\n\n    this.channel = channel;\n  }\n\n  // Inform the server that this client shuts down.\n  // No other requests may follow this message.\n\n\n  _createClass(PerspectivesProxy, [{\n    key: \"close\",\n    value: function close() {\n      this.channel.close();\n    }\n  }, {\n    key: \"send\",\n    value: function send(req, receiveValues) {\n      this.channel.send(req, receiveValues);\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      this.channel.unsubscribe(req);\n    }\n  }, {\n    key: \"getRolBinding\",\n    value: function getRolBinding(contextID, rolName, receiveValues) {\n      this.send({ request: \"GetRolBinding\", subject: contextID, predicate: rolName }, receiveValues);\n    }\n  }, {\n    key: \"getRol\",\n    value: function getRol(contextID, rolName, receiveValues) {\n      this.send({ request: \"GetRol\", subject: contextID, predicate: rolName }, receiveValues);\n    }\n  }, {\n    key: \"getProperty\",\n    value: function getProperty(rolID, propertyName, receiveValues) {\n      this.send({ request: \"GetProperty\", subject: rolID, predicate: propertyName }, receiveValues);\n    }\n  }, {\n    key: \"getBinding\",\n    value: function getBinding(rolID, receiveValues) {\n      this.send({ request: \"GetBinding\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getBindingType\",\n    value: function getBindingType(rolID, receiveValues) {\n      this.send({ request: \"GetBindingType\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getViewProperties\",\n    value: function getViewProperties(viewName, receiveValues) {\n      this.send({ request: \"GetViewProperties\", subject: viewName, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getRolContext\",\n    value: function getRolContext(rolID, receiveValues) {\n      this.send({ request: \"GetRolContext\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getContextType\",\n    value: function getContextType(contextID, receiveValues) {\n      this.send({ request: \"GetContextType\", subject: contextID, predicate: \"\" }, receiveValues);\n    }\n  }]);\n\n  return PerspectivesProxy;\n}();\n\nmodule.exports = {\n  Perspectives: Perspectives,\n  createRequestEmitterImpl: createRequestEmitterImpl,\n  createTcpConnectionToPerspectives: createTcpConnectionToPerspectives\n};\n\n//# sourceURL=webpack://perspectivesProxy/./src/perspectivesApiProxy.js?");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"net\");\n\n//# sourceURL=webpack://perspectivesProxy/external_%22net%22?");

/***/ })

/******/ });
});