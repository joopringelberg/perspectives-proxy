/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["perspectives-proxy"] = factory();
	else
		root["perspectives-proxy"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/perspectivesApiProxy.js":
/*!*************************************!*\
  !*** ./src/perspectivesApiProxy.js ***!
  \*************************************/
/***/ ((module) => {

eval("function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n// BEGIN LICENSE\n// Perspectives Distributed Runtime\n// Copyright (C) 2019 Joop Ringelberg (joopringelberg@perspect.it), Cor Baars\n//\n// This program is free software: you can redistribute it and/or modify\n// it under the terms of the GNU General Public License as published by\n// the Free Software Foundation, either version 3 of the License, or\n// (at your option) any later version.\n//\n// This program is distributed in the hope that it will be useful,\n// but WITHOUT ANY WARRANTY; without even the implied warranty of\n// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n// GNU General Public License for more details.\n//\n// You should have received a copy of the GNU General Public License\n// along with this program.  If not, see <https://www.gnu.org/licenses/>.\n//\n// Full text of this license can be found in the LICENSE file in the projects root.\n// END LICENSE\n\n/*\nThis module is imported both by the core and by clients and bridges the gap between the two. It supports several architectures:\n  1 with core and client in the same javascript process;\n  2 with core and client in different javascript processes, connected by the Channel Messaging API\n    https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API\n  3 with core and client in different processes, connected by TCP. OBSOLETE!! We have commented the code out. It will serve as an example when we develop the Language Server. See the design text \"TCP architecture.txt\".\nThe core resolves two promises:\n  - one called PDRproxy, resolving to an instance of PerspectivesProxy with an InternalChannel, to be used in the first architecture by direct import;\n  - one called InternalChannel, resolving to an instance of InternalChannel, to be used in the second architecture, used by the Service Worker by direct import;\nThen there are two functions to be used by clients, that both resolve the PDRproxy promise.\n  - createServiceWorkerConnectionToPerspectives, for the second architecture. It resolves the PDRproxy promise with an instance of SharedWorkerChannel, that *uses* the InternalChannel to communicate with the core;\n  - createTcpConnectionToPerspectives, for the third architecture. It resolves the PDRproxy promise with an instance of TcpChannel.\nThe PDRproxy promise is imported by all of the modules in perspectives-react that must connect to the core.\n*/\n////////////////////////////////////////////////////////////////////////////////\n//// CLIENT SIDE PROMISES\n////////////////////////////////////////////////////////////////////////////////\nvar pdrProxyResolver, pdrProxyRejecter;\nvar internalChannelResolver, internalChannelRejecter;\nvar sharedWorkerChannelResolver, sharedWorkerChannelRejecter; // This promise will resolve to an instance of PerspectivesProxy, with an InternalChannel.\n// The proxy uses the channel to actually send requests to the core. These requests will\n// turn up as 'output' of a Producer, ready to be consumed by some process.\n// The channel uses the emit function as a callback: when it has a request to send, it calls 'emit'\n// after wrapping the request in the appropriate constructor (usually the emitStep).\n\nvar PDRproxy = new Promise(function (resolve, reject) {\n  pdrProxyResolver = resolve;\n  pdrProxyRejecter = reject;\n}); // This promise will resolve to an instance of the InternalChannel.\n// It is used by a ServiceWorker that runs in the same javascript process as the core.\n\nvar InternalChannelPromise = new Promise(function (resolve, reject) {\n  internalChannelResolver = resolve;\n  internalChannelRejecter = reject;\n}); // This promise will resolve to an instance of the the SharedWorkerChannel.\n// It is used by InPlace, running in the same javascript process as this proxy.\n\nvar SharedWorkerChannelPromise = new Promise(function (resolve, reject) {\n  sharedWorkerChannelResolver = resolve;\n  sharedWorkerChannelRejecter = reject;\n}); ////////////////////////////////////////////////////////////////////////////////\n//// RESOLVE AND CONFIGURE PDRPROXY WITH A CHANNEL\n////////////////////////////////////////////////////////////////////////////////\n// Creates an instance of PerspectivesProxy with a selected type of channel and\n// fullfills the PDRproxy with it.\n// Options as described in the module Control.Aff.Sockets:\n// type TCPOptions opts = {port :: Port, host :: Host, allowHalfOpen :: Boolean | opts}\n// type Port = Int\n// type Host = String\n\nfunction configurePDRproxy(channeltype, options) {\n  var sharedWorkerChannel;\n\n  switch (channeltype) {\n    case \"internalChannel\":\n      InternalChannelPromise.then(function (ic) {\n        pdrProxyResolver(new PerspectivesProxy(ic));\n      });\n      break;\n    // case \"tcpChannel\":\n    //   pdrProxyResolver( new PerspectivesProxy( new TcpChannel( options ) ) );\n    //   break;\n\n    case \"sharedWorkerChannel\":\n      sharedWorkerChannel = new SharedWorkerChannel(sharedWorkerHostingPDRPort());\n      sharedWorkerChannelResolver(sharedWorkerChannel);\n      pdrProxyResolver(new PerspectivesProxy(sharedWorkerChannel));\n      break;\n\n    case \"hostPageChannel\":\n      sharedWorkerChannel = new SharedWorkerChannel(options.pageHostingPDRPort());\n      sharedWorkerChannelResolver(sharedWorkerChannel);\n      pdrProxyResolver(new PerspectivesProxy(sharedWorkerChannel));\n      break;\n  }\n} ////////////////////////////////////////////////////////////////////////////////\n//// PORT TO SHARED WORKER THAT HOSTS PDR\n////////////////////////////////////////////////////////////////////////////////\n\n\nfunction sharedWorkerHostingPDRPort() {\n  return new SharedWorker('perspectives-sharedworker.js').port;\n} ////////////////////////////////////////////////////////////////////////////////\n//// SERVER SIDE RESOLVER TO INTERNAL CHANNEL\n////////////////////////////////////////////////////////////////////////////////\n// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.\n// emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.\n\n\nfunction createRequestEmitterImpl(emitStep, finishStep, emit) {\n  try {\n    // Resolve InternalChannelPromise made above.\n    var icp = new InternalChannel(emitStep, finishStep, emit);\n    internalChannelResolver(icp);\n  } catch (e) {\n    internalChannelRejecter(e);\n  }\n} ////////////////////////////////////////////////////////////////////////////////\n//// REQUEST STRUCTURE\n////////////////////////////////////////////////////////////////////////////////\n\n\nvar defaultRequest = {\n  request: \"WrongRequest\",\n  subject: \"The original request did not have a request type!\",\n  predicate: \"\",\n  object: \"\",\n  reactStateSetter: function reactStateSetter() {},\n  corrId: \"\",\n  contextDescription: {}\n}; ////////////////////////////////////////////////////////////////////////////////\n//// INTERNAL CHANNEL\n////////////////////////////////////////////////////////////////////////////////\n\nvar InternalChannel = /*#__PURE__*/function () {\n  // emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.\n  // emit must be bound to an Effect producing function.\n  function InternalChannel(emitStep, finishStep, emit) {\n    _classCallCheck(this, InternalChannel);\n\n    this.emitStep = emitStep;\n    this.finishStep = finishStep;\n    this.emit = emit;\n    this.requestId = -1;\n  }\n\n  _createClass(InternalChannel, [{\n    key: \"nextRequestId\",\n    value: function nextRequestId() {\n      this.requestId = this.requestId + 1;\n      return this.requestId;\n    } // Inform the server that this client shuts down.\n    // No other requests may follow this message.\n\n  }, {\n    key: \"close\",\n    value: function close() {\n      this.emit(this.finishStep({}))();\n\n      this.emit = function () {\n        throw \"This client has shut down!\";\n      };\n    } // Returns a promise for unsubscriber information of the form: {subject: req.subject, corrId: req.corrId}\n\n  }, {\n    key: \"send\",\n    value: function send(req, fireAndForget) {\n      var proxy = this;\n      var setter = req.reactStateSetter; // Create a correlation identifier and store it in the request.\n\n      if (!req.corrId) {\n        req.corrId = this.nextRequestId();\n      } // console.log( req );\n\n\n      if (fireAndForget) {\n        req.reactStateSetter = function (result) {\n          // Move all properties to the default request to ensure we send a complete request.\n          proxy.send(Object.assign(Object.assign({}, defaultRequest), {\n            request: \"Unsubscribe\",\n            subject: req.subject,\n            corrId: req.corrId\n          }));\n          setter(result);\n        };\n      }\n\n      this.emit(this.emitStep(req))(); // return a promise for the elementary data for unsubscribing.\n\n      return new Promise(function (resolver\n      /*.rejecter*/\n      ) {\n        resolver({\n          subject: req.subject,\n          corrId: req.corrId\n        });\n      });\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      this.send({\n        request: \"Unsubscribe\",\n        subject: req.subject,\n        predicate: req.predicate,\n        setterId: req.setterId\n      });\n    }\n  }]);\n\n  return InternalChannel;\n}(); ////////////////////////////////////////////////////////////////////////////////\n//// SHARED WORKER CHANNEL\n//// This code will be executed by the client!\n//// The SharedWorkerChannel is a proxy for the ServiceWorker for the client.\n////////////////////////////////////////////////////////////////////////////////\n\n\nvar SharedWorkerChannel = /*#__PURE__*/function () {\n  function SharedWorkerChannel(port) {\n    _classCallCheck(this, SharedWorkerChannel);\n\n    var serviceWorkerChannel = this;\n    this.requestId = -1;\n    this.valueReceivers = {};\n    this.channelIdResolver = undefined;\n    this.channelId = new Promise(function (resolve\n    /*, reject*/\n    ) {\n      serviceWorkerChannel.channelIdResolver = resolve;\n    });\n    this.port = port;\n    this.handleWorkerResponse = this.handleWorkerResponse.bind(this);\n    this.port.onmessage = this.handleWorkerResponse;\n  } // The sharedworker or pageworker sends messages of various types.\n  // Among them are responses received by the core.\n  //\n\n\n  _createClass(SharedWorkerChannel, [{\n    key: \"handleWorkerResponse\",\n    value: function handleWorkerResponse(e) {\n      if (e.data.error) {\n        // {corrId: i, error: s} where s is is a String, i an int.\n        // we just pass errors on.\n        this.valueReceivers[e.data.corrId](e.data);\n      } else if (e.data.result) {\n        // {corrId: i, result: s} where s is an Array of String, i an int.\n        // pass the result on\n        this.valueReceivers[e.data.corrId](e.data);\n      } // Then we have a category of incoming messages that originate in the service worker itself,\n      // often in response to a specific request sent by the proxy.\n      else if (e.data.serviceWorkerMessage) {\n          // {serviceWorkerMessage: m, <field>: <value>} where m is a string. The object may contain any number of other fields, depending on the type of message (i.e. the value of m).\n          switch (e.data.serviceWorkerMessage) {\n            case \"channelId\":\n              // This actually is a response that is not provoked by explicitly asking for it.\n              // As soon as the SharedWorker receives a port from this proxy, it will return the channels id.\n              // {serviceWorkerMessage: \"channelId\", channelId: i} where i is a multiple of a million.\n              // Handle the port identification message that is sent by the service worker.\n              this.channelIdResolver(e.data.channelId);\n              break;\n\n            case \"isUserLoggedIn\":\n              // {serviceWorkerMessage: \"isUserLoggedIn\", isUserLoggedIn, b} where b is a boolean.\n              this.valueReceivers.isUserLoggedIn(e.data.isUserLoggedIn);\n              break;\n\n            case \"resetAccount\":\n              // {serviceWorkerMessage: \"resetAccount\", resetSuccesful: b} where b is a boolean.\n              this.valueReceivers.resetAccount(e.data.resetSuccesful);\n              break;\n\n            case \"runPDR\":\n              // {serviceWorkerMessage: \"runPDR\", error: e }\n              this.valueReceivers.runPDR(e);\n              break;\n          }\n        }\n    } // Returns a promise for a boolean value, reflecting whether the end user has logged in before or not.\n\n  }, {\n    key: \"isUserLoggedIn\",\n    value: function isUserLoggedIn() {\n      var proxy = this;\n      var p = new Promise(function (resolver\n      /*, rejecter*/\n      ) {\n        proxy.valueReceivers.isUserLoggedIn = function (isLoggedIn) {\n          proxy.valueReceivers.isUserLoggedIn = undefined;\n          resolver(isLoggedIn);\n        };\n      });\n      proxy.channelId.then(function (channelId) {\n        return proxy.port.postMessage({\n          proxyRequest: \"isUserLoggedIn\",\n          channelId: channelId\n        });\n      });\n      return p;\n    } // runPDR :: UserName -> Password -> PouchdbUser -> Url -> Effect Unit\n    // Runs the PDR, if a value is returned it will be an error message.\n    // {serviceWorkerMessage: \"runPDR\", startSuccesful: success }\n    // {serviceWorkerMessage: \"runPDR\", error: e }\n\n  }, {\n    key: \"runPDR\",\n    value: function runPDR(username, password, pouchdbuser, publicrepo) {\n      var _this = this;\n\n      var proxy = this;\n      var p = new Promise(function (resolver, rejecter) {\n        proxy.valueReceivers.runPDR = function (e) {\n          proxy.valueReceivers.runPDR = undefined;\n\n          if (e.error) {\n            rejecter(e.errormessage);\n          } else {\n            resolver(e.startSuccesful);\n          }\n        };\n      });\n      proxy.channelId.then(function (channelId) {\n        return _this.port.postMessage({\n          proxyRequest: \"runPDR\",\n          username: username,\n          password: password,\n          pouchdbuser: pouchdbuser,\n          publicrepo: publicrepo,\n          channelId: channelId\n        });\n      });\n      return p;\n    }\n  }, {\n    key: \"resetAccount\",\n    value: function resetAccount(username, password, host, port, publicrepo) {\n      var _this2 = this;\n\n      var proxy = this;\n      var p = new Promise(function (resolver\n      /*, rejecter*/\n      ) {\n        proxy.valueReceivers.resetAccount = function (result) {\n          proxy.valueReceivers.resetAccount = undefined;\n          resolver(result);\n        };\n      });\n      proxy.channelId.then(function (channelId) {\n        return _this2.port.postMessage({\n          proxyRequest: \"resetAccount\",\n          username: username,\n          password: password,\n          host: host,\n          port: port,\n          channelId: channelId,\n          publicrepo: publicrepo\n        });\n      });\n      return p;\n    } // Inform the server that this client shuts down.\n    // No other requests may follow this message.\n\n  }, {\n    key: \"close\",\n    value: function close() {\n      // send a message that will make the internal channel in the Service Worker close.\n      this.port.postMessage({\n        proxyRequest: \"Close\"\n      });\n    }\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      // Send a message that will make the internal channel in the Service Worker close.\n      this.port.postMessage({\n        proxyRequest: \"unsubscribe\",\n        request: req\n      });\n    }\n  }, {\n    key: \"nextRequestId\",\n    value: function nextRequestId() {\n      var proxy = this;\n      return this.channelId.then(function (channelId) {\n        proxy.requestId = proxy.requestId + 1;\n        return proxy.requestId + channelId;\n      });\n    } // Returns a promise for unsuscriber information of the form: {subject: req.subject, corrId: req.corrId}\n\n  }, {\n    key: \"send\",\n    value: function send(req, fireAndForget) {\n      var proxy = this;\n      return this.nextRequestId().then(function (reqId) {\n        var setter = req.reactStateSetter; // Create a correlation identifier and store it in the request.\n\n        if (!req.corrId) {\n          req.corrId = reqId;\n        } // Store the valueReceiver.\n\n\n        if (fireAndForget) {\n          proxy.valueReceivers[req.corrId] = function (result) {\n            // Move all properties to the default request to ensure we send a complete request.\n            proxy.send(Object.assign(Object.assign({}, defaultRequest), {\n              request: \"Unsubscribe\",\n              subject: req.subject,\n              corrId: req.corrId\n            }));\n            setter(result);\n          };\n        } else {\n          proxy.valueReceivers[req.corrId] = setter;\n        } // cannot serialise a function, remove it from the request.\n\n\n        req.reactStateSetter = undefined; // console.log( req );\n        // send the request through the channel to the service worker.\n\n        proxy.port.postMessage(req); // return the elementary data for unsubscribing.\n\n        return {\n          subject: req.subject,\n          corrId: req.corrId\n        };\n      });\n    }\n  }]);\n\n  return SharedWorkerChannel;\n}(); ////////////////////////////////////////////////////////////////////////////////\n//// PERSPECTIVESPROXY\n////////////////////////////////////////////////////////////////////////////////\n\n\nvar PerspectivesProxy = /*#__PURE__*/function () {\n  function PerspectivesProxy(channel) {\n    _classCallCheck(this, PerspectivesProxy);\n\n    this.channel = channel;\n  } // Inform the server that this client shuts down.\n  // No other requests may follow this message.\n\n\n  _createClass(PerspectivesProxy, [{\n    key: \"close\",\n    value: function close() {\n      this.channel.close();\n    } // Returns a promise for unsuscriber information of the form: {subject: req.subject, corrId: req.corrId}\n    // that can be used by the caller to unsubscribe from the core dependency network.\n\n  }, {\n    key: \"send\",\n    value: function send(req, receiveValues, fireAndForget) {\n      // Handle errors here. Use `errorHandler` if provided by the PerspectivesProxy method, otherwise\n      // just log a warning on the console.\n      var handleErrors = function handleErrors(response) // response = PerspectivesApiTypes.ResponseRecord\n      {\n        if (response.error) {\n          console.warn(defaultRequest.request + \": \" + response.error);\n        } else {\n          receiveValues(response.result);\n        } // This is the Effect.\n\n\n        return function () {};\n      };\n\n      req.reactStateSetter = handleErrors; // Move all properties to the default request to ensure we send a complete request.\n\n      var fullRequest = Object.assign(Object.assign({}, defaultRequest), req); // DEVELOPMENT ONLY: warn if any value is undefined\n\n      if (Object.values(defaultRequest).includes(undefined)) {\n        console.warn(\"Request misses values: \" + JSON.stringify(defaultRequest));\n      }\n\n      return this.channel.send(fullRequest, fireAndForget);\n    } // unsubscribe from the channel.\n\n  }, {\n    key: \"unsubscribe\",\n    value: function unsubscribe(req) {\n      this.channel.unsubscribe(req);\n    } // getRolBinding (contextID, rolName, receiveValues)\n    // {\n    //   return this.send(\n    //     {request: \"GetRolBinding\", subject: contextID, predicate: rolName},\n    //     receiveValues);\n    // }\n\n  }, {\n    key: \"getRol\",\n    value: function getRol(contextID, rolName, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetRol\",\n        subject: contextID,\n        predicate: rolName\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getUnqualifiedRol\",\n    value: function getUnqualifiedRol(contextID, localRolName, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetUnqualifiedRol\",\n        subject: contextID,\n        predicate: localRolName\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getProperty\",\n    value: function getProperty(rolID, propertyName, roleType, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetProperty\",\n        subject: rolID,\n        predicate: propertyName,\n        object: roleType\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getPropertyFromLocalName\",\n    value: function getPropertyFromLocalName(rolID, propertyName, roleType, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetPropertyFromLocalName\",\n        subject: rolID,\n        predicate: propertyName,\n        object: roleType\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getBinding\",\n    value: function getBinding(rolID, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetBinding\",\n        subject: rolID,\n        predicate: \"\"\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getBindingType\",\n    value: function getBindingType(rolID, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetBindingType\",\n        subject: rolID,\n        predicate: \"\"\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getRoleBinders\",\n    value: function getRoleBinders(rolID, roleType, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetRoleBinders\",\n        subject: rolID,\n        predicate: roleType\n      }, receiveValues, fireAndForget);\n    } // getUnqualifiedRoleBinders (rolID, localRolName, receiveValues)\n    // {\n    //   return this.send(\n    //     {request: \"GetUnqualifiedRoleBinders\", subject: rolID, predicate: localRolName},\n    //     receiveValues);\n    // }\n\n  }, {\n    key: \"getViewProperties\",\n    value: function getViewProperties(rolType, viewName, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetViewProperties\",\n        subject: rolType,\n        predicate: viewName\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getRolContext\",\n    value: function getRolContext(rolID, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetRolContext\",\n        subject: rolID,\n        predicate: \"\"\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getContextType\",\n    value: function getContextType(contextID, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetContextType\",\n        subject: contextID,\n        predicate: \"\"\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getRolType\",\n    value: function getRolType(rolID, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetRolType\",\n        subject: rolID,\n        predicate: \"\"\n      }, receiveValues, fireAndForget);\n    } // RoleInContext | ContextRole | ExternalRole | UserRole | BotRole\n\n  }, {\n    key: \"getRoleKind\",\n    value: function getRoleKind(rolID, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetRoleKind\",\n        subject: rolID,\n        predicate: \"\"\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getUnqualifiedRolType\",\n    value: function getUnqualifiedRolType(contextType, localRolName, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetUnqualifiedRolType\",\n        subject: contextType,\n        predicate: localRolName\n      }, receiveValues, fireAndForget);\n    } // Returns an array of Role Types.\n\n  }, {\n    key: \"getMeForContext\",\n    value: function getMeForContext(externalRoleInstance, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetMeForContext\",\n        subject: externalRoleInstance\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getUserIdentifier\",\n    value: function getUserIdentifier(receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetUserIdentifier\"\n      }, receiveValues, fireAndForget);\n    }\n  }, {\n    key: \"getLocalRoleSpecialisation\",\n    value: function getLocalRoleSpecialisation(localAspectName, contextInstance, receiveValues, fireAndForget) {\n      return this.send({\n        request: \"GetLocalRoleSpecialisation\",\n        subject: contextInstance,\n        predicate: localAspectName\n      }, receiveValues, fireAndForget);\n    } // Create a context, bound to a new instance of <roleType> in <contextId>. <roleType> may be a local name.\n    // createContext( <contextDescription>, <roleType>, <contextId>, <EmbeddingContextType>, ...)\n    // Either throws an error, or returns an array with\n    //  - just a single string identifiying the external role of a DBQ role;\n    //  - that string and a second that identifies the new context role otherwise.\n    // So:  [<externalRoleId>(, <contextRoleId>)?]\n\n  }, {\n    key: \"createContext\",\n    value: function createContext(contextDescription, roleType, contextId, embeddingContextType, myroletype, receiveResponse) {\n      this.send({\n        request: \"CreateContext\",\n        subject: contextId,\n        predicate: roleType,\n        object: embeddingContextType,\n        contextDescription: contextDescription,\n        authoringRole: myroletype\n      }, function (r) {\n        receiveResponse(r);\n      });\n    } // Create a context, bound to the given role instance.\n    // createContext_( <contextDescription>, <roleinstance>, ...)\n    // Either throws an error, or returns an array with a context identifier.\n\n  }, {\n    key: \"createContext_\",\n    value: function createContext_(contextDescription, roleInstance, myroletype, receiveResponse) {\n      this.send({\n        request: \"CreateContext_\",\n        subject: roleInstance,\n        contextDescription: contextDescription,\n        authoringRole: myroletype\n      }, function (r) {\n        receiveResponse(r);\n      });\n    } // Either throws an error, or returns an array of context identifiers.\n\n  }, {\n    key: \"importContexts\",\n    value: function importContexts(contextDescription, receiveResponse) {\n      this.send({\n        request: \"ImportContexts\",\n        contextDescription: contextDescription\n      }, function (r) {\n        receiveResponse(r);\n      });\n    } // Either throws an error, or returns an empty array.\n    // Notice we re-use the contextDescription field.\n\n  }, {\n    key: \"importTransaction\",\n    value: function importTransaction(transaction, receiveResponse) {\n      this.send({\n        request: \"ImportTransaction\",\n        contextDescription: transaction\n      }, function (r) {\n        receiveResponse(r);\n      });\n    } // value is just a single string!\n\n  }, {\n    key: \"setProperty\",\n    value: function setProperty(rolID, propertyName, value, myroletype) {\n      this.send({\n        request: \"SetProperty\",\n        subject: rolID,\n        predicate: propertyName,\n        object: value,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"deleteProperty\",\n    value: function deleteProperty(rolID, propertyName, myroletype) {\n      this.send({\n        request: \"DeleteProperty\",\n        subject: rolID,\n        predicate: propertyName,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"removeBinding\",\n    value: function removeBinding(rolID, bindingID, myroletype) {\n      this.send({\n        request: \"RemoveBinding\",\n        subject: rolID,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"removeRol\",\n    value: function removeRol(contextType, rolName, rolID, myroletype) {\n      this.send({\n        request: \"RemoveRol\",\n        subject: rolID,\n        predicate: rolName,\n        object: contextType,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"deleteRole\",\n    value: function deleteRole(contextID, rolName, rolID, myroletype) {\n      this.send({\n        request: \"DeleteRole\",\n        subject: rolName,\n        predicate: contextID,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"bind\",\n    value: function bind(contextinstance, localRolName, contextType, rolDescription, myroletype\n    /*, receiveResponse*/\n    ) {\n      this.send({\n        request: \"Bind\",\n        subject: contextinstance,\n        predicate: localRolName,\n        object: contextType,\n        rolDescription: rolDescription,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"bind_\",\n    value: function bind_(binder, binding, myroletype) {\n      this.send({\n        request: \"Bind_\",\n        subject: binder,\n        object: binding,\n        authoringRole: myroletype\n      }, function () {});\n    } // checkBinding( <contexttype>, <localRolName>, <binding>, [() -> undefined] )\n\n  }, {\n    key: \"checkBinding\",\n    value: function checkBinding(contextType, localRolName, rolInstance, callback) {\n      this.send({\n        request: \"CheckBinding\",\n        subject: contextType,\n        predicate: localRolName,\n        object: rolInstance\n      }, callback);\n    } // We have room for checkBinding_( <binder>, <binding>, [() -> undefined] )\n\n  }, {\n    key: \"createRole\",\n    value: function createRole(contextinstance, rolType, myroletype\n    /*, receiveResponse*/\n    ) {\n      this.send({\n        request: \"CreateRol\",\n        subject: contextinstance,\n        predicate: rolType,\n        authoringRole: myroletype\n      }, function () {});\n    }\n  }, {\n    key: \"matchContextName\",\n    value: function matchContextName(name) {\n      var proxy = this;\n      return new Promise(function (resolver) {\n        proxy.send({\n          request: \"MatchContextName\",\n          subject: name\n        }, function (qualifiedNames) {\n          resolver(qualifiedNames);\n        });\n      });\n    }\n  }]);\n\n  return PerspectivesProxy;\n}();\n\nmodule.exports = {\n  PDRproxy: PDRproxy,\n  InternalChannelPromise: InternalChannelPromise,\n  SharedWorkerChannelPromise: SharedWorkerChannelPromise,\n  createRequestEmitterImpl: createRequestEmitterImpl,\n  // createTcpConnectionToPerspectives: createTcpConnectionToPerspectives,\n  // createServiceWorkerConnectionToPerspectives: createServiceWorkerConnectionToPerspectives,\n  configurePDRproxy: configurePDRproxy,\n  FIREANDFORGET: true\n}; ////////////////////////////////////////////////////////////////////////////////\n//// TCP CHANNEL\n////////////////////////////////////////////////////////////////////////////////\n// class TcpChannel\n// {\n//   constructor (options)\n//   {\n//     let connection;\n//     this.requestId = -1;\n//     const valueReceivers = {};\n//     // This creates a net.Socket (https://nodejs.org/api/net.html#net_net_createconnection).\n//     this.connection = require(\"net\").createConnection(\n//       options,\n//       // message will be in base64. Appending a string to it converts it to a new string.\n//       function ()\n//       {\n//         console.log(\"Connection made.\");\n//       });\n//     connection = this.connection;\n//     this.valueReceivers = valueReceivers;\n//\n//     // See: https://nodejs.org/api/net.html#net_class_net_socket\n//     connection.on('data',\n//       // message will be in base64. Appending a string to it converts it to a new string.\n//       function (message)\n//       {\n//         const messages = (message + \"\").split(\"\\n\");\n//         messages.forEach( function(m) // m :: PerspectivesApiTypes.ResponseRecord\n//         {\n//           if (m !== \"\")\n//           {\n//             try\n//             {\n//               const responseRecord = JSON.parse(m);\n//               valueReceivers[responseRecord.corrId](responseRecord);\n//             }\n//             catch(e)\n//             {\n//               console.log(e);\n//             }\n//           }\n//         });\n//       });\n//\n//     // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_error\n//     // Emitted when an error occurs. The 'close' event will be called\n//     // directly following this event.\n//     connection.on('error',\n//       function(error)\n//       {\n//         console.log( \"Error on the connection: \" + error );\n//         // Half-closes the socket. i.e., it sends a FIN packet.\n//         // It is possible the server will still send some data.\n//         connection.end();\n//       });\n//\n//     // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_close\n//     // Emitted once the socket is fully closed. The argument had_error is a boolean\n//     // which says if the socket was closed due to a transmission error.\n//     connection.on('close',\n//       function(had_error)\n//       {\n//         // No data will come anymore.\n//         if ( had_error )\n//         {\n//           console.log(\"The Perspectives Core has hung up because of an error.\");\n//         }\n//         else\n//         {\n//           console.log(\"The Perspectives Core has hung up.\");\n//         }\n//       });\n//\n//       // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_end\n//       // Emitted when the other end of the socket sends a FIN packet.\n//       // By default (allowHalfOpen == false) the socket will destroy its file\n//       // descriptor once it has written out its pending write queue.\n//       connection.on('end',\n//         function()\n//         {\n//           // This means the other side will no longer send data.\n//           console.log(\"The Perspectives Core has hung up.\");\n//         });\n//   }\n//\n//   nextRequestId ()\n//   {\n//     this.requestId = this.requestId + 1;\n//     return this.requestId.toString();\n//   }\n//\n//   // close will lead the messageProducer of the perspectives core to receive (Right unit).\n//   close()\n//   {\n//     // https://nodejs.org/api/net.html#net_socket_end_data_encoding_callback\n//     this.connection.end();\n//     this.send = function()\n//     {\n//       throw( \"This client has shut down!\");\n//     };\n//   }\n//\n//   // req has the following format (taken from: module Perspectives.Api)\n//   //   { request :: String\n//   //   , subject :: String\n//   //   , predicate :: String\n//   //   , setterId :: ReactStateSetterIdentifier}\n//   // type ReactStateSetterIdentifier = String\n//   // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.\n//   send(req, receiveValues)\n//   {\n//     req.corrId = this.nextRequestId();\n//     this.valueReceivers[ req.corrId ] = receiveValues;\n//     // https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback\n//     this.connection.write(JSON.stringify(req) + \"\\n\");\n//     // return the elementary data for unsubscribing.\n//     return {subject: req.subject, predicate: req.corrId};\n//   }\n//\n//   unsubscribe(req)\n//   {\n//     delete this.valueReceivers[req.setterId];\n//     // https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback\n//     this.connection.write(\n//       {request: \"Unsubscribe\", subject: req.subject, predicate: req.predicate, setterId: req.setterId}\n//     );\n//   }\n// }\n\n//# sourceURL=webpack://perspectives-proxy/./src/perspectivesApiProxy.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/perspectivesApiProxy.js");
/******/ })()
;
});