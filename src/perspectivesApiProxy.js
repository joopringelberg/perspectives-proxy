let resolver, rejecter;

// This promise will resolve to an instance of PerspectivesProxy, with an InternalChannel.
// The proxy uses the channel to actually send requests to the core. These requests will
// turn up as 'output' of a Producer, ready to be consumed by some process.
// The channel uses the emit function as a callback: when it has a request to send, it calls 'emit'
// after wrapping the request in the appropriate constructor (usually the emitStep).
const Perspectives = new Promise(
  function (resolve, reject)
  {
    resolver = resolve;
    rejecter = reject;
  });

// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.
// emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.
function createRequestEmitterImpl (emitStep, finishStep, emit)
{
  try
  {
    // Resolve the Perspectives promise made above for the proxy.
    const pp = new PerspectivesProxy(new InternalChannel(emitStep, finishStep, emit));
    resolver(pp);
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
  // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.
  send(req, receiveValues)
  {
    req.corrId = this.nextRequestId();
    this.valueReceivers[ req.setterId ] = receiveValues;
    this.connection.write(JSON.stringify(req) + "\n");
    // return the elementary data for unsubscribing.
    return {subject: req.subject, predicate: req.corrId};
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
  // emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.
  // emit must be bound to an Effect producing function.
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

  // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.
  send ( req )
  {
    const proxy = this;
    // Create a correlation identifier and store it in the request.
    if ( !req.corrId )
    {
      req.corrId = this.nextRequestId();
    }
    // console.log( req );
    this.emit( this.emitStep(req) )();
    // return the elementary data for unsubscribing.
    return {subject: req.subject, corrId: req.corrId};
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

  // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.
  send (req, receiveValues, errorHandler)
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

    // Handle errors here. Use `errorHandler` if provided by the PerspectivesProxy method, otherwise
    // just log a warning on the console.
    const handleErrors = function(response) // response = PerspectivesApiTypes.ResponseRecord
    {
      if (response.error)
      {
        if (errorHandler)
        {
          errorHandler( response.error );
        }
        else
        {
          console.warn( defaultRequest.request + ": " + response.error );
        }
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
    return this.channel.send( defaultRequest );
  }

  // unsubscribe from the channel.
  unsubscribe (req)
  {
    this.channel.unsubscribe(req);
  }

  getRolBinding (contextID, rolName, receiveValues)
  {
    return this.send(
      {request: "GetRolBinding", subject: contextID, predicate: rolName},
      receiveValues);
  }

  getRol (contextID, rolName, receiveValues)
  {
    return this.send(
      {request: "GetRol", subject: contextID, predicate: rolName},
      receiveValues);
  }

  getUnqualifiedRol (contextID, localRolName, receiveValues)
  {
    return this.send(
      {request: "GetUnqualifiedRol", subject: contextID, predicate: localRolName},
      receiveValues);
  }

  getProperty (rolID, propertyName, roleType, receiveValues)
  {
    return this.send(
      {request: "GetProperty", subject: rolID, predicate: propertyName, object: roleType},
      receiveValues);
  }

  getBinding (rolID, receiveValues)
  {
    return this.send(
      {request: "GetBinding", subject: rolID, predicate: ""},
      receiveValues);
  }

  getBindingType (rolID, receiveValues)
  {
    return this.send(
      {request: "GetBindingType", subject: rolID, predicate: ""},
      receiveValues);
  }

  getRoleBinders (rolID, roleType, receiveValues)
  {
    return this.send(
      {request: "GetRoleBinders", subject: rolID, predicate: roleType},
      receiveValues);
  }

  getUnqualifiedRoleBinders (rolID, localRolName, receiveValues)
  {
    return this.send(
      {request: "GetUnqualifiedRoleBinders", subject: rolID, predicate: localRolName},
      receiveValues);
  }

  getViewProperties (rolType, viewName, receiveValues)
  {
    return this.send(
      {request: "GetViewProperties", subject: rolType, predicate: viewName},
      receiveValues);
  }

  getRolContext (rolID, receiveValues)
  {
    return this.send(
      {request: "GetRolContext", subject: rolID, predicate: ""},
      receiveValues);
  }

  getContextType (contextID, receiveValues)
  {
    return this.send(
      {request: "GetContextType", subject: contextID, predicate: ""},
      receiveValues);
  }

  getRolType (rolID, receiveValues)
  {
    return this.send(
      {request: "GetRolType", subject: rolID, predicate: ""},
      receiveValues);
  }

  getUnqualifiedRolType (contextType, localRolName, receiveValues)
  {
    return this.send(
      {request: "GetUnqualifiedRolType", subject: contextType, predicate: localRolName},
      receiveValues);
  }

  // Returns an array of Role Types.
  getMeForContext (externalRoleInstance, receiveValues)
  {
    return this.send(
      {request: "GetMeForContext", subject: externalRoleInstance},
      receiveValues
    )
  }

  getUserIdentifier (receiveValues)
  {
    return this.send(
      {request: "GetUserIdentifier"},
      receiveValues
    )
  }

  // Create a context, bound to a new instance of <roleType> in <contextId>. <roleType> may be a local name.
  // createContext( <contextDescription>, <roleType>, <contextId>, <EmbeddingContextType>, ...)
  // Either throws an error, or returns an array with a context identifier.
  createContext (contextDescription, roleType, contextId, embeddingContextType, myroletype, receiveResponse)
  {
    this.send(
      {request: "CreateContext", subject: contextId, predicate: roleType, object: embeddingContextType, contextDescription: contextDescription, authoringRole: myroletype},
      function(r)
      {
        receiveResponse( r );
      }
    )
  }

  // Create a context, bound to the given role instance.
  // createContext_( <contextDescription>, <roleinstance>, ...)
  // Either throws an error, or returns an array with a context identifier.
  createContext_ (contextDescription, roleInstance, myroletype, receiveResponse)
  {
    this.send(
      {request: "CreateContext_", subject: roleInstance, contextDescription: contextDescription, authoringRole: myroletype},
      function(r)
      {
        receiveResponse( r );
      }
    )
  }

  // Either throws an error, or returns an array of context identifiers.
  importContexts (contextDescription, receiveResponse)
  {
    this.send(
      {request: "ImportContexts", contextDescription: contextDescription},
      function(r)
      {
        receiveResponse( r );
      }
    )
  }

  // Either throws an error, or returns an empty array.
  // Notice we re-use the contextDescription field.
  importTransaction (transaction, receiveResponse)
  {
    this.send(
      {request: "ImportTransaction", contextDescription: transaction},
      function(r)
      {
        receiveResponse( r );
      }
    )
  }

  // value is just a single string!
  setProperty (rolID, propertyName, value, myroletype)
  {
    this.send(
      {request: "SetProperty", subject: rolID, predicate: propertyName, object: value, authoringRole: myroletype},
      function(r) {}
    )
  }

  deleteProperty (rolID, propertyName, myroletype)
  {
    this.send(
      {request: "DeleteProperty", subject: rolID, predicate: propertyName, authoringRole: myroletype},
      function(r) {}
    );
  }

  removeBinding (rolID, bindingID, myroletype)
  {
    this.send(
      {request: "RemoveBinding", subject: rolID, authoringRole: myroletype},
      function(r) {}
    );
  }

  removeRol (contextType, rolName, rolID, myroletype)
  {
    this.send(
      {request: "RemoveRol", subject: rolID, predicate: rolName, object: contextType, authoringRole: myroletype},
      function(r) {}
    );
  }

  deleteRole (contextID, rolName, rolID, myroletype)
  {
    this.send(
      {request: "DeleteRole", subject: rolName, predicate: contextID, authoringRole: myroletype},
      function(r) {}
    );
  }


  bind (contextinstance, localRolName, contextType, rolDescription, myroletype, receiveResponse)
  {
    this.send(
      {request: "Bind", subject: contextinstance, predicate: localRolName, object: contextType, rolDescription: rolDescription, authoringRole: myroletype },
      function(r) {}
    );
  }

  bind_ (binder, binding, myroletype)
  {
    this.send(
      {request: "Bind_", subject: binder, object: binding, authoringRole: myroletype},
      function(r) {}
    );
  }

  // checkBinding( <contexttype>, <localRolName>, <binding>, [() -> undefined] )
  checkBinding (contextType, localRolName, rolInstance, callback)
  {
    this.send(
      {request: "CheckBinding", subject: contextType, predicate: localRolName, object: rolInstance}
      , callback
    );
  }

  // We have room for checkBinding_( <binder>, <binding>, [() -> undefined] )

  createRole (contextinstance, rolType, myroletype, receiveResponse)
  {
    this.send(
      {request: "CreateRol", subject: contextinstance, predicate: rolType, authoringRole: myroletype },
      function(r) {}
    );
  }

}

module.exports = {
  Perspectives: Perspectives,
  createRequestEmitterImpl: createRequestEmitterImpl,
  createTcpConnectionToPerspectives: createTcpConnectionToPerspectives
};
