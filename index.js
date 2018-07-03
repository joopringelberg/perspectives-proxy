"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var resolver = void 0,
    rejecter = void 0;

var Perspectives = new Promise(function (resolve, reject) {
  resolver = resolve;
  rejecter = reject;
});

// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.
function createRequestEmitterImpl(left, right, emit) {
  try {
    // Resolve the Perspectives promise made above for the proxy.
    resolver(new PerspectivesProxy(new InternalChannel(left, right, emit)));
  } catch (e) {
    rejecter(e);
  }
}

// Top level entry function to set up a TCP channel with a Perspectives Core endpoint.
// From module Control.Aff.Sockets:
// type TCPOptions opts = {port :: Port, host :: Host, allowHalfOpen :: Boolean | opts}
// type Port = Int
// type Host = String
function createTcpConnectionToPerspectives(options) {
  try {
    // Resolve the Perspectives promise made above for the proxy.
    resolver(new PerspectivesProxy(new TcpChannel(options)));
  } catch (e) {
    rejecter(e);
  }
}

var TcpChannel = function () {
  function TcpChannel(options) {
    _classCallCheck(this, TcpChannel);

    var connection = void 0;
    this.requestId = -1;
    var valueReceivers = {};
    this.connection = require("net").createConnection(options,
    // message will be in base64. Appending a string to it converts it to a new string.
    function () {
      console.log("Connection made.");
    });
    connection = this.connection;
    this.valueReceivers = valueReceivers;

    connection.on('data',
    // message will be in base64. Appending a string to it converts it to a new string.
    function (message) {
      var messages = (message + "").split("\n");
      messages.forEach(function (m) {
        if (m !== "") {
          try {
            var _JSON$parse = JSON.parse(m),
                setterId = _JSON$parse.setterId,
                objects = _JSON$parse.objects;

            valueReceivers[setterId](objects);
          } catch (e) {
            console.log(e);
          }
        }
      });
    });

    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_error
    // Emitted when an error occurs. The 'close' event will be called
    // directly following this event.
    connection.on('error', function (error) {
      console.log("Error on the connection: " + error);
      // Half-closes the socket. i.e., it sends a FIN packet.
      // It is possible the server will still send some data.
      connection.end();
    });

    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_close
    // Emitted once the socket is fully closed. The argument had_error is a boolean
    // which says if the socket was closed due to a transmission error.
    connection.on('close', function (had_error) {
      // No data will come anymore.
      if (had_error) {
        console.log("The Perspectives Core has hung up because of an error.");
      } else {
        console.log("The Perspectives Core has hung up.");
      }
    });

    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_end
    // Emitted when the other end of the socket sends a FIN packet.
    // By default (allowHalfOpen == false) the socket will destroy its file
    // descriptor once it has written out its pending write queue.
    connection.on('end', function () {
      // This means the other side will no longer send data.
      console.log("The Perspectives Core has hung up.");
    });
  }

  _createClass(TcpChannel, [{
    key: "nextRequestId",
    value: function nextRequestId() {
      this.requestId = this.requestId + 1;
      return this.requestId.toString();
    }

    // close will lead the messageProducer of the perspectives core to receive (Right unit).

  }, {
    key: "close",
    value: function close() {
      this.connection.end();
      this.send = function () {
        throw "This client has shut down!";
      };
    }

    // req has the following format (taken from: module Perspectives.Api)
    //   { request :: String
    //   , subject :: String
    //   , predicate :: String
    //   , setterId :: ReactStateSetterIdentifier}
    // type ReactStateSetterIdentifier = String

  }, {
    key: "send",
    value: function send(req, receiveValues) {
      req.setterId = this.nextRequestId();
      this.valueReceivers[req.setterId] = receiveValues;
      this.connection.write(JSON.stringify(req) + "\n");
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(req) {
      delete this.valueReceivers[req.setterId];
      this.connection.write({ request: "Unsubscribe", subject: req.subject, predicate: req.predicate, setterId: req.setterId });
    }
  }]);

  return TcpChannel;
}();

var InternalChannel = function () {
  function InternalChannel(left, right, emit) {
    _classCallCheck(this, InternalChannel);

    this.left = left;
    this.right = right;
    this.emit = emit;
    this.requestId = -1;
  }

  _createClass(InternalChannel, [{
    key: "nextRequestId",
    value: function nextRequestId() {
      this.requestId = this.requestId + 1;
      return this.requestId;
    }

    // Inform the server that this client shuts down.
    // No other requests may follow this message.

  }, {
    key: "close",
    value: function close() {
      this.emit(this.right({}))();
      this.emit = function () {
        throw "This client has shut down!";
      };
    }
  }, {
    key: "send",
    value: function send(req, receiveValues) {
      var proxy = this;
      // Create a correlation identifier and store 'receiveValues' with it.
      // Send the correlation identifier instead of reactStateSetter.
      req.reactStateSetter = function (arrString) {
        receiveValues(arrString);
        return function () {};
      };
      req.setterId = this.nextRequestId();
      this.emit(this.left(req))();
      // return the unsubscriber.
      return function () {
        proxy.unsubscribe(req);
      };
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(req) {
      this.send({ request: "Unsubscribe", subject: req.subject, predicate: req.predicate, setterId: req.setterId });
    }
  }]);

  return InternalChannel;
}();

var PerspectivesProxy = function () {
  function PerspectivesProxy(channel) {
    _classCallCheck(this, PerspectivesProxy);

    this.channel = channel;
  }

  // Inform the server that this client shuts down.
  // No other requests may follow this message.


  _createClass(PerspectivesProxy, [{
    key: "close",
    value: function close() {
      this.channel.close();
    }
  }, {
    key: "send",
    value: function send(req, receiveValues) {
      this.channel.send(req, receiveValues);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(req) {
      this.channel.unsubscribe(req);
    }
  }, {
    key: "getRolBinding",
    value: function getRolBinding(contextID, rolName, receiveValues) {
      this.send({ request: "GetRolBinding", subject: contextID, predicate: rolName }, receiveValues);
    }
  }, {
    key: "getRol",
    value: function getRol(contextID, rolName, receiveValues) {
      this.send({ request: "GetRol", subject: contextID, predicate: rolName }, receiveValues);
    }
  }, {
    key: "getProperty",
    value: function getProperty(rolID, propertyName, receiveValues) {
      this.send({ request: "GetProperty", subject: rolID, predicate: propertyName }, receiveValues);
    }
  }, {
    key: "getBinding",
    value: function getBinding(rolID, receiveValues) {
      this.send({ request: "GetBinding", subject: rolID, predicate: "" }, receiveValues);
    }
  }, {
    key: "getBindingType",
    value: function getBindingType(rolID, receiveValues) {
      this.send({ request: "GetBindingType", subject: rolID, predicate: "" }, receiveValues);
    }
  }, {
    key: "getViewProperties",
    value: function getViewProperties(viewName, receiveValues) {
      this.send({ request: "GetViewProperties", subject: viewName, predicate: "" }, receiveValues);
    }
  }, {
    key: "getRolContext",
    value: function getRolContext(rolID, receiveValues) {
      this.send({ request: "GetRolContext", subject: rolID, predicate: "" }, receiveValues);
    }
  }, {
    key: "getContextType",
    value: function getContextType(contextID, receiveValues) {
      this.send({ request: "GetContextType", subject: contextID, predicate: "" }, receiveValues);
    }
  }]);

  return PerspectivesProxy;
}();

module.exports = {
  Perspectives: Perspectives,
  createRequestEmitterImpl: createRequestEmitterImpl,
  createTcpConnectionToPerspectives: createTcpConnectionToPerspectives
};

