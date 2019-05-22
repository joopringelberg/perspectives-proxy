let resolver, rejecter;

const Perspectives = new Promise(
  function (resolve, reject)
  {
    resolver = resolve;
    rejecter = reject;
  });

// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.
function createRequestEmitterImpl (emitStep, finishStep, emit)
{
  try
  {
    // Resolve the Perspectives promise made above for the proxy.
    const pp = new PerspectivesProxy(new InternalChannel(emitStep, finishStep, emit));
    resolver(pp);
    return Perspectives;
  }
  catch(e)
  {
    rejecter(e);
  }
}

// Top level entry function to set up a TCP channel with a Perspectives Core endpoint.
// From module Control.Aff.Sockets:
// type TCPOptions opts = {port :: Port, host :: Host, allowHalfOpen :: Boolean | opts}
// type Port = Int
// type Host = String
function createTcpConnectionToPerspectives (options)
{
  try
  {
    // Resolve the Perspectives promise made above for the proxy.
    resolver(new PerspectivesProxy(new TcpChannel(options)));
  }
  catch (e)
  {
    rejecter(e);
  }
}

class TcpChannel
{
  constructor (options)
  {
    let connection;
    this.requestId = -1;
    const valueReceivers = {};
    this.connection = require("net").createConnection(
      options,
      // message will be in base64. Appending a string to it converts it to a new string.
      function ()
      {
        console.log("Connection made.")
      });
    connection = this.connection;
    this.valueReceivers = valueReceivers;

    connection.on('data',
      // message will be in base64. Appending a string to it converts it to a new string.
      function (message)
      {
        const messages = (message + "").split("\n");
        messages.forEach( function(m) // m :: PerspectivesApiTypes.ResponseRecord
        {
          if (m !== "")
          {
            try
            {
              const responseRecord = JSON.parse(m);
              valueReceivers[responseRecord.corrId](responseRecord);
            }
            catch(e)
            {
              console.log(e);
            }
          }
        });
      });

    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_error
    // Emitted when an error occurs. The 'close' event will be called
    // directly following this event.
    connection.on('error',
      function(error)
      {
        console.log( "Error on the connection: " + error );
        // Half-closes the socket. i.e., it sends a FIN packet.
        // It is possible the server will still send some data.
        connection.end();
      });

    // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_close
    // Emitted once the socket is fully closed. The argument had_error is a boolean
    // which says if the socket was closed due to a transmission error.
    connection.on('close',
      function(had_error)
      {
        // No data will come anymore.
        if ( had_error )
        {
          console.log("The Perspectives Core has hung up because of an error.")
        }
        else
        {
          console.log("The Perspectives Core has hung up.")
        }
      });

      // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_end
      // Emitted when the other end of the socket sends a FIN packet.
      // By default (allowHalfOpen == false) the socket will destroy its file
      // descriptor once it has written out its pending write queue.
      connection.on('end',
        function()
        {
          // This means the other side will no longer send data.
          console.log("The Perspectives Core has hung up.")
        });
  }

  nextRequestId ()
  {
    this.requestId = this.requestId + 1;
    return this.requestId.toString();
  }

  // close will lead the messageProducer of the perspectives core to receive (Right unit).
  close()
  {
    this.connection.end();
    this.send = function()
    {
      throw( "This client has shut down!");
    };
  }

  // req has the following format (taken from: module Perspectives.Api)
  //   { request :: String
  //   , subject :: String
  //   , predicate :: String
  //   , setterId :: ReactStateSetterIdentifier}
  // type ReactStateSetterIdentifier = String
  send(req, receiveValues)
  {
    req.corrId = this.nextRequestId();
    this.valueReceivers[ req.setterId ] = receiveValues;
    this.connection.write(JSON.stringify(req) + "\n");
  }

  unsubscribe(req)
  {
    delete this.valueReceivers[req.setterId];
    this.connection.write(
      {request: "Unsubscribe", subject: req.subject, predicate: req.predicate, setterId: req.setterId}
    );
  }
}

class InternalChannel
{
  constructor (emitStep, finishStep, emit)
  {
    this.emitStep = emitStep;
    this.finishStep = finishStep;
    this.emit = emit;
    this.requestId = -1;
  }

  nextRequestId ()
  {
    this.requestId = this.requestId + 1;
    return this.requestId;
  }

  // Inform the server that this client shuts down.
  // No other requests may follow this message.
  close()
  {
    this.emit( this.finishStep({}) )();
    this.emit = function()
    {
      throw( "This client has shut down!");
    };
  }

  send ( req )
  {
    const proxy = this;
    // Create a correlation identifier and store it in the request.
    req.corrId = this.nextRequestId();
    this.emit( this.emitStep(req) )();
    // return the unsubscriber. TODO: is dit nog actueel?
    return function()
    {
      proxy.unsubscribe( req );
    };
  }

  unsubscribe(req)
  {
    this.send(
      {request: "Unsubscribe", subject: req.subject, predicate: req.predicate, setterId: req.setterId}
    );
  }

}

class PerspectivesProxy
{
  constructor (channel)
  {
    this.channel = channel;
  }

  // Inform the server that this client shuts down.
  // No other requests may follow this message.
  close()
  {
    this.channel.close();
  }

  send (req, receiveValues)
  {
    const defaultRequest =
      {
        request: "WrongRequest",
        subject: "The original request did not have a request type!",
        predicate: "",
        object: "",
        reactStateSetter: handleErrors,
        corrId: "",
        contextDescription: {}
      };
    // Handle errors here. TODO: pas aan op nieuw response format.
    const handleErrors = function(response) // response = PerspectivesApiTypes.ResponseRecord
    {
      if (response.error)
      {
        throw response.error;
      }
      else {
        receiveValues(response.result);
      }
      // This is the Effect.
      return function () {};
    }
    req.reactStateSetter = handleErrors;
    // Move all properties to the default request to ensure we send a complete request.
    Object.assign(defaultRequest,req)
    this.channel.send( defaultRequest );
  }

  unsubscribe (req)
  {
    this.channel.unsubscribe(req);
  }

  getRolBinding (contextID, rolName, receiveValues)
  {
    this.send(
      {request: "GetRolBinding", subject: contextID, predicate: rolName},
      receiveValues);
  }

  getRol (contextID, rolName, receiveValues)
  {
    this.send(
      {request: "GetRol", subject: contextID, predicate: rolName},
      receiveValues);
  }

  getProperty (rolID, propertyName, receiveValues)
  {
    this.send(
      {request: "GetProperty", subject: rolID, predicate: propertyName},
      receiveValues);
  }

  getBinding (rolID, receiveValues)
  {
    this.send(
      {request: "GetBinding", subject: rolID, predicate: ""},
      receiveValues);
  }

  getBindingType (rolID, receiveValues)
  {
    this.send(
      {request: "GetBindingType", subject: rolID, predicate: ""},
      receiveValues);
  }

  getViewProperties (viewName, receiveValues)
  {
    this.send(
      {request: "GetViewProperties", subject: viewName, predicate: ""},
      receiveValues);
  }

  getRolContext (rolID, receiveValues)
  {
    this.send(
      {request: "GetRolContext", subject: rolID, predicate: ""},
      receiveValues);
  }

  getContextType (contextID, receiveValues)
  {
    this.send(
      {request: "GetContextType", subject: contextID, predicate: ""},
      receiveValues);
  }

  getRolType (rolID, receiveValues)
  {
    this.send(
      {request: "GetRolType", subject: rolID, predicate: ""},
      receiveValues);
  }

  // Either throws an error, or returns an id.
  createContext (contextDescription, receiveResponse)
  {
    this.send(
      {request: "CreateContext", contextDescription: contextDescription},
      function(r)
      {
        receiveResponse( r );
      }
    )
  }

  // Either throws an error, or returns an id.
  deleteContext (id, receiveResponse)
  {
    this.send(
      {request: "DeleteContext", subject: id},
      function(r)
      {
        receiveResponse( r );
      }
    )
  }

  setProperty (rolID, propertyName, value)
  {
    this.send(
      {request: "SetProperty", subject: rolID, predicate: propertyName, object: value},
      function(r)
      {
        if ( r.indexOf["ok"] < 0)
        {
          throw "Property could not be set: " + r
        }
      }
    )
  }

  setBinding (rolID, bindingID)
  {
    this.send(
      {request: "SetBinding", subject: rolID, object: bindingID},
      function(r)
      {
        if ( r.indexOf["ok"] < 0)
        {
          throw "Binding could not be created: " + r
        }
      }
    );
  }

  createRol (contextinstance, rolType, rolDescription, receiveResponse)
  {
    this.send(
      {request: "CreateRol", subject: contextinstance, predicate: rolType, rolDescription: rolDescription },
      function(r)
      {
        if ( r.indexOf["ok"] < 0)
        {
          throw "Binding could not be created: " + r
        }
        receiveResponse(r);
      }
    );
  }

}

module.exports = {
  Perspectives: Perspectives,
  createRequestEmitterImpl: createRequestEmitterImpl,
  createTcpConnectionToPerspectives: createTcpConnectionToPerspectives
};
