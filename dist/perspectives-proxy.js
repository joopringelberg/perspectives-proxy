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
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar resolver = void 0,\n    rejecter = void 0;\n\n// This promise will resolve to an instance of PerspectivesProxy, with an InternalChannel.\n// The proxy uses the channel to actually send requests to the core. These requests will\n// turn up as 'output' of a Producer, ready to be consumed by some process.\n// The channel uses the emit function as a callback: when it has a request to send, it calls 'emit'\n// after wrapping the request in the appropriate constructor (usually the emitStep).\nvar Perspectives = new Promise(function (resolve, reject) {\n  resolver = resolve;\n  rejecter = reject;\n});\n\n// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.\n// emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.\nfunction createRequestEmitterImpl(emitStep, finishStep, emit) {\n  try {\n    // Resolve the Perspectives promise made above for the proxy.\n    var pp = new PerspectivesProxy(new InternalChannel(emitStep, finishStep, emit));\n    resolver(pp);\n  } catch (e) {\n    rejecter(e);\n  }\n}\n\n// Top level entry function to set up a TCP channel with a Perspectives Core endpoint.\n// From module Control.Aff.Sockets:\n// type TCPOptions opts = {port :: Port, host :: Host, allowHalfOpen :: Boolean | opts}\n// type Port = Int\n// type Host = String\nfunction createTcpConnectionToPerspectives(options) {\n  try {\n    // Resolve the Perspectives promise made above for the proxy.\n    resolver(new PerspectivesProxy(new TcpChannel(options)));\n  } catch (e) {\n    rejecter(e);\n  }\n}\n\nvar TcpChannel = function () {\n  function TcpChannel(options) {\n    _classCallCheck(this, TcpChannel);\n\n    var connection = void 0;\n    this.requestId = -1;\n    var valueReceivers = {};\n    this.connection = __webpack_require__(/*! net */ \"net\").createConnection(options,\n    // message will be in base64. Appending a string to it converts it to a new string.\n    function () {\n      console.log(\"Connection made.\");\n    });\n    connection = this.connection;\n    this.valueReceivers = valueReceivers;\n\n    connection.on('data',\n    // message will be in base64. Appending a string to it converts it to a new string.\n    function (message) {\n      var messages = (message + \"\").split(\"\\n\");\n      messages.forEach(function (m) // m :: PerspectivesApiTypes.ResponseRecord\n      {\n        if (m !== \"\") {\n          try {\n            var responseRecord = JSON.parse(m);\n            valueReceivers[responseRecord.corrId](responseRecord);\n          } catch (e) {\n            console.log(e);\n          }\n        }\n      });\n    });\n\n    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_error\n    // Emitted when an error occurs. The 'close' event will be called\n    // directly following this event.\n    connection.on('error', function (error) {\n      console.log(\"Error on the connection: \" + error);\n      // Half-closes the socket. i.e., it sends a FIN packet.\n      // It is possible the server will still send some data.\n      connection.end();\n    });\n\n    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_close\n    // Emitted once the socket is fully closed. The argument had_error is a boolean\n    // which says if the socket was closed due to a transmission error.\n    connection.on('close', function (had_error) {\n      // No data will come anymore.\n      if (had_error) {\n        console.log(\"The Perspectives Core has hung up because of an error.\");\n      } else {\n        console.log(\"The Perspectives Core has hung up.\");\n      }\n    });\n\n    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_end\n    // Emitted when the other end of the socket sends a FIN packet.\n    // By default (allowHalfOpen == false) the socket will destroy its file\n    // descriptor once it has written out its pending write queue.\n    connection.on('end', function () {\n      // This means the other side will no longer send data.\n      console.log(\"The Perspectives Core has hung up.\");\n    });\n  }\n\n  _createClass(TcpChannel, [{\n    key: \"nextRequestId\",\n    value: function nextRequestId() {\n      this.requestId = this.requestId + 1;\n      return this.requestId.toString();\n    }\n\n    // close will lead the messageProducer of the perspectives core to receive (Right unit).\n\n  }, {\n    key: \"close\",\n    value: function close() {\n      this.connection.end();\n      this.send = function () {\n        throw \"This client has shut down!\";\n      };\n    }\n\n    // req has the following format (taken from: module Perspectives.Api)\n    //   { request :: String\n    //   , subject :: String\n    //   , predicate :: String\n    //   , setterId :: ReactStateSetterIdentifier}\n    // type ReactStateSetterIdentifier = String\n    // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.\n\n  }, {\n    key: \"send\",\n    value: function send(req, receiveValues) {\n      req.corrId = this.nextRequestId();\n      this.valueReceivers[req.setterId] = receiveValues;\n      this.connection.write(JSON.stringify(req) + \"\\n\");\n      // return the elementary data for unsubscribing.\n      return { subject: req.subject, predicate: req.corrId };\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      delete this.valueReceivers[req.setterId];\n      this.connection.write({ request: \"Unsubscribe\", subject: req.subject, predicate: req.predicate, setterId: req.setterId });\n    }\n  }]);\n\n  return TcpChannel;\n}();\n\nvar InternalChannel = function () {\n  // emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.\n  // emit must be bound to an Effect producing function.\n  function InternalChannel(emitStep, finishStep, emit) {\n    _classCallCheck(this, InternalChannel);\n\n    this.emitStep = emitStep;\n    this.finishStep = finishStep;\n    this.emit = emit;\n    this.requestId = -1;\n  }\n\n  _createClass(InternalChannel, [{\n    key: \"nextRequestId\",\n    value: function nextRequestId() {\n      this.requestId = this.requestId + 1;\n      return this.requestId;\n    }\n\n    // Inform the server that this client shuts down.\n    // No other requests may follow this message.\n\n  }, {\n    key: \"close\",\n    value: function close() {\n      this.emit(this.finishStep({}))();\n      this.emit = function () {\n        throw \"This client has shut down!\";\n      };\n    }\n\n    // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.\n\n  }, {\n    key: \"send\",\n    value: function send(req) {\n      var proxy = this;\n      // Create a correlation identifier and store it in the request.\n      if (!req.corrId) {\n        req.corrId = this.nextRequestId();\n      }\n      this.emit(this.emitStep(req))();\n      // return the elementary data for unsubscribing.\n      return { subject: req.subject, corrId: req.corrId };\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      this.send({ request: \"Unsubscribe\", subject: req.subject, predicate: req.predicate, setterId: req.setterId });\n    }\n  }]);\n\n  return InternalChannel;\n}();\n\nvar PerspectivesProxy = function () {\n  function PerspectivesProxy(channel) {\n    _classCallCheck(this, PerspectivesProxy);\n\n    this.channel = channel;\n  }\n\n  // Inform the server that this client shuts down.\n  // No other requests may follow this message.\n\n\n  _createClass(PerspectivesProxy, [{\n    key: \"close\",\n    value: function close() {\n      this.channel.close();\n    }\n\n    // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.\n\n  }, {\n    key: \"send\",\n    value: function send(req, receiveValues) {\n      var defaultRequest = {\n        request: \"WrongRequest\",\n        subject: \"The original request did not have a request type!\",\n        predicate: \"\",\n        object: \"\",\n        reactStateSetter: handleErrors,\n        corrId: \"\",\n        contextDescription: {}\n      };\n      // Handle errors here. TODO: pas aan op nieuw response format.\n      var handleErrors = function handleErrors(response) // response = PerspectivesApiTypes.ResponseRecord\n      {\n        if (response.error) {\n          throw response.error;\n        } else {\n          receiveValues(response.result);\n        }\n        // This is the Effect.\n        return function () {};\n      };\n      req.reactStateSetter = handleErrors;\n      // Move all properties to the default request to ensure we send a complete request.\n      Object.assign(defaultRequest, req);\n      return this.channel.send(defaultRequest);\n    }\n\n    // unsubscribe from the channel.\n\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      this.channel.unsubscribe(req);\n    }\n  }, {\n    key: \"getRolBinding\",\n    value: function getRolBinding(contextID, rolName, receiveValues) {\n      return this.send({ request: \"GetRolBinding\", subject: contextID, predicate: rolName }, receiveValues);\n    }\n  }, {\n    key: \"getRol\",\n    value: function getRol(contextID, rolName, receiveValues) {\n      return this.send({ request: \"GetRol\", subject: contextID, predicate: rolName }, receiveValues);\n    }\n  }, {\n    key: \"getUnqualifiedRol\",\n    value: function getUnqualifiedRol(contextID, localRolName, receiveValues) {\n      return this.send({ request: \"GetUnqualifiedRol\", subject: contextID, predicate: localRolName }, receiveValues);\n    }\n  }, {\n    key: \"getProperty\",\n    value: function getProperty(rolID, propertyName, roleType, receiveValues) {\n      return this.send({ request: \"GetProperty\", subject: rolID, predicate: propertyName, object: roleType }, receiveValues);\n    }\n  }, {\n    key: \"getBinding\",\n    value: function getBinding(rolID, receiveValues) {\n      return this.send({ request: \"GetBinding\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getBindingType\",\n    value: function getBindingType(rolID, receiveValues) {\n      return this.send({ request: \"GetBindingType\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getViewProperties\",\n    value: function getViewProperties(rolType, viewName, receiveValues) {\n      return this.send({ request: \"GetViewProperties\", subject: rolType, predicate: viewName }, receiveValues);\n    }\n  }, {\n    key: \"getRolContext\",\n    value: function getRolContext(rolID, receiveValues) {\n      return this.send({ request: \"GetRolContext\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getContextType\",\n    value: function getContextType(contextID, receiveValues) {\n      return this.send({ request: \"GetContextType\", subject: contextID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getRolType\",\n    value: function getRolType(rolID, receiveValues) {\n      return this.send({ request: \"GetRolType\", subject: rolID, predicate: \"\" }, receiveValues);\n    }\n  }, {\n    key: \"getUnqualifiedRolType\",\n    value: function getUnqualifiedRolType(contextType, localRolName, receiveValues) {\n      return this.send({ request: \"GetUnqualifiedRolType\", subject: contextType, predicate: localRolName }, receiveValues);\n    }\n\n    // Returns an array of Role Types.\n\n  }, {\n    key: \"getMeForContext\",\n    value: function getMeForContext(externalRoleInstance, receiveValues) {\n      return this.send({ request: \"GetMeForContext\", subject: externalRoleInstance }, receiveValues);\n    }\n  }, {\n    key: \"getUserIdentifier\",\n    value: function getUserIdentifier(receiveValues) {\n      return this.send({ request: \"GetUserIdentifier\" }, receiveValues);\n    }\n\n    // Either throws an error, or returns an array with a context identifier.\n\n  }, {\n    key: \"createContext\",\n    value: function createContext(contextDescription, receiveResponse) {\n      this.send({ request: \"CreateContext\", contextDescription: contextDescription }, function (r) {\n        receiveResponse(r);\n      });\n    }\n\n    // Either throws an error, or returns an array of context identifiers.\n\n  }, {\n    key: \"importContexts\",\n    value: function importContexts(contextDescription, receiveResponse) {\n      this.send({ request: \"ImportContexts\", contextDescription: contextDescription }, function (r) {\n        receiveResponse(r);\n      });\n    }\n\n    // Either throws an error, or returns an id.\n\n  }, {\n    key: \"deleteContext\",\n    value: function deleteContext(id, receiveResponse) {\n      this.send({ request: \"DeleteContext\", subject: id }, function (r) {\n        receiveResponse(r);\n      });\n    }\n  }, {\n    key: \"setProperty\",\n    value: function setProperty(rolID, propertyName, value) {\n      this.send({ request: \"SetProperty\", subject: rolID, predicate: propertyName, object: value }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"Property could not be set: \" + r;\n        }\n      });\n    }\n  }, {\n    key: \"setBinding\",\n    value: function setBinding(rolID, bindingID) {\n      this.send({ request: \"SetBinding\", subject: rolID, object: bindingID }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"Binding could not be created: \" + r;\n        }\n      });\n    }\n  }, {\n    key: \"removeBinding\",\n    value: function removeBinding(rolID, bindingID) {\n      this.send({ request: \"RemoveBinding\", subject: rolID }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"Binding could not be removed: \" + r;\n        }\n      });\n    }\n  }, {\n    key: \"removeRol\",\n    value: function removeRol(contextID, rolName, rolID) {\n      this.send({ request: \"RemoveRol\", subject: contextID, predicate: rolName, object: rolID }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"Rol could not be removed: \" + r;\n        }\n      });\n    }\n\n    // TODO: deleteRol\n\n  }, {\n    key: \"bindInNewRol\",\n    value: function bindInNewRol(contextID, rolType, rolInstance) {\n      this.send({ request: \"BindInNewRol\", subject: contextID, predicate: rolType, object: rolInstance }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"Binding could not be created in new rol: \" + r;\n        }\n      });\n    }\n\n    // checkBinding( <contexttype>, <localRolName>, <type-of-rol-to-bind>, [() -> undefined] )\n\n  }, {\n    key: \"checkBinding\",\n    value: function checkBinding(contextType, localRolName, rolInstance, callback) {\n      this.send({ request: \"CheckBinding\", subject: contextType, predicate: localRolName, object: rolInstance }, callback);\n    }\n  }, {\n    key: \"createRol\",\n    value: function createRol(contextinstance, rolType, rolDescription, receiveResponse) {\n      this.send({ request: \"CreateRol\", subject: contextinstance, predicate: rolType, rolDescription: rolDescription }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"CreateRol fails: \" + r;\n        }\n        receiveResponse(r);\n      });\n    }\n  }, {\n    key: \"createRolWithLocalName\",\n    value: function createRolWithLocalName(contextinstance, localRolName, contextType, rolDescription, receiveResponse) {\n      this.send({ request: \"CreateRolWithLocalName\", subject: contextinstance, predicate: localRolName, object: contextType, rolDescription: rolDescription }, function (r) {\n        if (r.indexOf[\"ok\"] < 0) {\n          throw \"CreateRolWithLocalName fails: \" + r;\n        }\n        receiveResponse(r);\n      });\n    }\n  }]);\n\n  return PerspectivesProxy;\n}();\n\nmodule.exports = {\n  Perspectives: Perspectives,\n  createRequestEmitterImpl: createRequestEmitterImpl,\n  createTcpConnectionToPerspectives: createTcpConnectionToPerspectives\n};\n\n//# sourceURL=webpack://perspectivesProxy/./src/perspectivesApiProxy.js?");

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