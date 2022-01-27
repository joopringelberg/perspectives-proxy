// BEGIN LICENSE
// Perspectives Distributed Runtime
// Copyright (C) 2019 Joop Ringelberg (joopringelberg@perspect.it), Cor Baars
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
// Full text of this license can be found in the LICENSE file in the projects root.
// END LICENSE

/*
This module is imported both by the core and by clients and bridges the gap between the two. It supports several architectures:
  1 with core and client in the same javascript process;
  2 with core and client in different javascript processes, connected by the Channel Messaging API
    https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API
  3 with core and client in different processes, connected by TCP. OBSOLETE!! We have commented the code out. It will serve as an example when we develop the Language Server. See the design text "TCP architecture.txt".
The core resolves two promises:
  - one called PDRproxy, resolving to an instance of PerspectivesProxy with an InternalChannel, to be used in the first architecture by direct import;
  - one called InternalChannel, resolving to an instance of InternalChannel, to be used in the second architecture, used by the Service Worker by direct import;
Then there are two functions to be used by clients, that both resolve the PDRproxy promise.
  - createServiceWorkerConnectionToPerspectives, for the second architecture. It resolves the PDRproxy promise with an instance of SharedWorkerChannel, that *uses* the InternalChannel to communicate with the core;
  - createTcpConnectionToPerspectives, for the third architecture. It resolves the PDRproxy promise with an instance of TcpChannel.
The PDRproxy promise is imported by all of the modules in perspectives-react that must connect to the core.
*/

////////////////////////////////////////////////////////////////////////////////
//// CLIENT SIDE PROMISES
////////////////////////////////////////////////////////////////////////////////

let pdrProxyResolver/*, pdrProxyRejecter*/;
let internalChannelResolver, internalChannelRejecter;
let sharedWorkerChannelResolver/*, sharedWorkerChannelRejecter*/;

// This promise will resolve to an instance of PerspectivesProxy, with an InternalChannel.
// The proxy uses the channel to actually send requests to the core. These requests will
// turn up as 'output' of a Producer, ready to be consumed by some process.
// The channel uses the emit function as a callback: when it has a request to send, it calls 'emit'
// after wrapping the request in the appropriate constructor (usually the emitStep).
const PDRproxy = new Promise(
  function (resolve/*, reject*/)
  {
    pdrProxyResolver = resolve;
    //pdrProxyRejecter = reject;
  });

// This promise will resolve to an instance of the InternalChannel.
// It is used by a ServiceWorker that runs in the same javascript process as the core.
const InternalChannelPromise = new Promise(
  function (resolve, reject)
  {
    internalChannelResolver = resolve;
    internalChannelRejecter = reject;
  });

// This promise will resolve to an instance of the the SharedWorkerChannel.
// It is used by InPlace, running in the same javascript process as this proxy.
const SharedWorkerChannelPromise = new Promise(
  function (resolve/*, reject*/)
  {
    sharedWorkerChannelResolver = resolve;
    // sharedWorkerChannelRejecter = reject;
  });

////////////////////////////////////////////////////////////////////////////////
//// RESOLVE AND CONFIGURE PDRPROXY WITH A CHANNEL
////////////////////////////////////////////////////////////////////////////////
// Creates an instance of PerspectivesProxy with a selected type of channel and
// fullfills the PDRproxy with it.
// Options as described in the module Control.Aff.Sockets:
// type TCPOptions opts = {port :: Port, host :: Host, allowHalfOpen :: Boolean | opts}
// type Port = Int
// type Host = String
function configurePDRproxy (channeltype, options)
{
  let sharedWorkerChannel;
  switch( channeltype )
  {
    case "internalChannel":
      InternalChannelPromise.then(
        function( ic )
        {
          pdrProxyResolver( new PerspectivesProxy( ic ) );
        }
      );
      break;
    // case "tcpChannel":
    //   pdrProxyResolver( new PerspectivesProxy( new TcpChannel( options ) ) );
    //   break;
    case "sharedWorkerChannel":
       sharedWorkerChannel = new SharedWorkerChannel( sharedWorkerHostingPDRPort() );
       sharedWorkerChannelResolver( sharedWorkerChannel );
       pdrProxyResolver( new PerspectivesProxy( sharedWorkerChannel ) );
       break;
     case "hostPageChannel":
        sharedWorkerChannel = new SharedWorkerChannel( options.pageHostingPDRPort() );
        sharedWorkerChannelResolver( sharedWorkerChannel );
        pdrProxyResolver( new PerspectivesProxy( sharedWorkerChannel ) );
        break;
  }
}

////////////////////////////////////////////////////////////////////////////////
//// PORT TO SHARED WORKER THAT HOSTS PDR
////////////////////////////////////////////////////////////////////////////////
function sharedWorkerHostingPDRPort()
{
  return new SharedWorker('perspectives-sharedworker.js').port;
}

////////////////////////////////////////////////////////////////////////////////
//// SERVER SIDE RESOLVER TO INTERNAL CHANNEL
////////////////////////////////////////////////////////////////////////////////

// This function will be called from Perspectives Core if it want to set up an internal channel to a GUI.
// emitStep will be bound to the constructor Emit, finishStep will be the constructor Finish.
function createRequestEmitterImpl (emitStep, finishStep, emit)
{
  try
  {
    // Resolve InternalChannelPromise made above.
    const icp = new InternalChannel(emitStep, finishStep, emit);
    internalChannelResolver (icp);
  }
  catch(e)
  {
    internalChannelRejecter(e);
  }
}

////////////////////////////////////////////////////////////////////////////////
//// REQUEST STRUCTURE
////////////////////////////////////////////////////////////////////////////////
const defaultRequest =
  {
    request: "WrongRequest",
    subject: "The original request did not have a request type!",
    predicate: "",
    object: "",
    reactStateSetter: function(){},
    corrId: "",
    contextDescription: {}
  };


////////////////////////////////////////////////////////////////////////////////
//// INTERNAL CHANNEL
////////////////////////////////////////////////////////////////////////////////
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

  // Returns a promise for unsubscriber information of the form: {subject: req.subject, corrId: req.corrId}
  send ( req, fireAndForget )
  {
    const proxy = this;
    const setter = req.reactStateSetter;
    // Create a correlation identifier and store it in the request.
    if ( !req.corrId )
    {
      req.corrId = this.nextRequestId();
    }
    // console.log( req );
    if (fireAndForget)
    {
      req.reactStateSetter = function( result )
        {
          // Move all properties to the default request to ensure we send a complete request.
          proxy.send(
            Object.assign(
              Object.assign({}, defaultRequest),
              { request: "Unsubscribe"
              , subject: req.subject
              , corrId: req.corrId}) );
          setter( result );
        };
    }
    this.emit( this.emitStep(req) )();
    // return a promise for the elementary data for unsubscribing.
    return new Promise( function( resolver /*.rejecter*/)
      {
        resolver( {subject: req.subject, corrId: req.corrId} );
      } );

  }

  unsubscribe(req)
  {
    this.send(
      {request: "Unsubscribe", subject: req.subject, predicate: req.predicate, setterId: req.setterId}
    );
  }

}

////////////////////////////////////////////////////////////////////////////////
//// SHARED WORKER CHANNEL
//// This code will be executed by the client!
//// The SharedWorkerChannel is a proxy for the ServiceWorker for the client.
////////////////////////////////////////////////////////////////////////////////
class SharedWorkerChannel
{
  constructor( port )
  {
    const serviceWorkerChannel = this;
    this.requestId = -1;
    this.valueReceivers = {};
    this.channelIdResolver = undefined;
    this.channelId = new Promise(
      function (resolve/*, reject*/)
      {
        serviceWorkerChannel.channelIdResolver = resolve;
      });
    this.port = port;

    this.handleWorkerResponse = this.handleWorkerResponse.bind(this);
    this.port.onmessage = this.handleWorkerResponse;

  }

  // The sharedworker or pageworker sends messages of various types.
  // Among them are responses received by the core.
  //
  handleWorkerResponse (e)
  {
    if (e.data.error)
    {
      // {corrId: i, error: s} where s is is a String, i an int.
      // we just pass errors on.
      this.valueReceivers[ e.data.corrId ]( e.data );
    }
    else if ( e.data.result )
    {
      // {corrId: i, result: s} where s is an Array of String, i an int.
      // pass the result on
      this.valueReceivers[ e.data.corrId ]( e.data );
    }
    // Then we have a category of incoming messages that originate in the service worker itself,
    // often in response to a specific request sent by the proxy.
    else if ( e.data.serviceWorkerMessage )
    {
      // {serviceWorkerMessage: m, <field>: <value>} where m is a string. The object may contain any number of other fields, depending on the type of message (i.e. the value of m).
      switch( e.data.serviceWorkerMessage )
      {
        case "channelId":
          // This actually is a response that is not provoked by explicitly asking for it.
          // As soon as the SharedWorker receives a port from this proxy, it will return the channels id.
          // {serviceWorkerMessage: "channelId", channelId: i} where i is a multiple of a million.
          // Handle the port identification message that is sent by the service worker.
          this.channelIdResolver( e.data.channelId );
          break;
        case "isUserLoggedIn":
          // {serviceWorkerMessage: "isUserLoggedIn", isUserLoggedIn: b} where b is a boolean.
          this.valueReceivers.isUserLoggedIn( e.data.isUserLoggedIn );
          break;
        case "resetAccount":
          // {serviceWorkerMessage: "resetAccount", resetSuccesful: b} where b is a boolean.
          this.valueReceivers.resetAccount( e.data.resetSuccesful );
          break;
        case "recompileBasicModels":
          // {serviceWorkerMessage: "recompileBasicModels", recompileSuccesful: b} where b is a boolean.
          this.valueReceivers.recompileBasicModels( e.data.recompileSuccesful );
          break;
        case "removeAccount":
          // {serviceWorkerMessage: "removeAccount", removeSuccesful: b} where b is a boolean.
          this.valueReceivers.removeAccount( e.data.removeSuccesful );
          break;
        case "runPDR":
          // {serviceWorkerMessage: "runPDR", error: e }
          this.valueReceivers.runPDR( e );
          break;
        case "createAccount":
          // {serviceWorkerMessage: "createAccount", createSuccesful: b} where b is a boolean.
          this.valueReceivers.createAccount( e.data.createSuccesful );
          break;
      }
    }
  }

  // Returns a promise for a boolean value, reflecting whether the end user has logged in before or not.
  isUserLoggedIn ()
  {
    const proxy = this;
    const p = new Promise(
      function(resolver/*, rejecter*/)
      {
        proxy.valueReceivers.isUserLoggedIn = function(isLoggedIn)
          {
            proxy.valueReceivers.isUserLoggedIn = undefined;
            resolver( isLoggedIn );
          };
      }
    );
    proxy.channelId.then( channelId => proxy.port.postMessage( {proxyRequest: "isUserLoggedIn", channelId } ) );
    return p;
  }

  // runPDR :: UserName -> Password -> PouchdbUser -> Url -> Effect Unit
  // Runs the PDR, if a value is returned it will be an error message.
  // {serviceWorkerMessage: "runPDR", startSuccesful: success }
  // {serviceWorkerMessage: "runPDR", error: e }
  runPDR (username, pouchdbuser, publicrepo)
  {
    const proxy = this;
    const p = new Promise(
      function(resolver, rejecter)
      {
        proxy.valueReceivers.runPDR = function( e )
          {
            proxy.valueReceivers.runPDR = undefined;
            if (e.error)
            {
              rejecter( e.errormessage );
            }
            else
            {
              resolver( e.startSuccesful );
            }
          };
      }
    );
    proxy.channelId.then( channelId => this.port.postMessage({proxyRequest: "runPDR", username, pouchdbuser, publicrepo, channelId }));
    return p;
  }

  createUser (username, pouchdbuser, publicrepo)
  {
    const proxy = this;
    const p = new Promise(
      function(resolver/*, rejecter*/)
      {
        proxy.valueReceivers.createAccount = function(result)
          {
            proxy.valueReceivers.createAccount = undefined;
            resolver( result );
          };
      }
    );
    proxy.channelId.then( channelId => this.port.postMessage( {proxyRequest: "createAccount", username, pouchdbuser, publicrepo, channelId } ) );
    return p;
  }

  resetAccount (username, pouchdbuser, publicrepo)
  {
    const proxy = this;
    const p = new Promise(
      function(resolver/*, rejecter*/)
      {
        proxy.valueReceivers.resetAccount = function(result)
          {
            proxy.valueReceivers.resetAccount = undefined;
            resolver( result );
          };
      }
    );
    proxy.channelId.then( channelId => this.port.postMessage( {proxyRequest: "resetAccount", username, pouchdbuser, publicrepo, channelId } ) );
    return p;
  }

  recompileBasicModels (pouchdbuser, publicrepo)
  {
    const proxy = this;
    const p = new Promise(
      function(resolver/*, rejecter*/)
      {
        proxy.valueReceivers.recompileBasicModels = function(result)
          {
            proxy.valueReceivers.recompileBasicModels = undefined;
            resolver( result );
          };
      }
    );
    proxy.channelId.then( channelId => this.port.postMessage( {proxyRequest: "recompileBasicModels", pouchdbuser, publicrepo, channelId } ) );
    return p;
  }

  removeAccount (username, pouchdbuser, publicrepo)
  {
    const proxy = this;
    const p = new Promise(
      function(resolver/*, rejecter*/)
      {
        proxy.valueReceivers.removeAccount = function(result)
          {
            proxy.valueReceivers.removeAccount = undefined;
            resolver( result );
          };
      }
    );
    proxy.channelId.then( channelId => this.port.postMessage( {proxyRequest: "removeAccount", username, pouchdbuser, publicrepo, channelId } ) );
    return p;
  }

  // Inform the server that this client shuts down.
  // No other requests may follow this message.
  close()
  {
    // send a message that will make the internal channel in the Service Worker close.
    this.port.postMessage({proxyRequest: "Close"});
  }

  unsubscribe(req)
  {
    // Send a message that will make the internal channel in the Service Worker close.
    this.port.postMessage( {proxyRequest: "unsubscribe", request: req } );
  }

  nextRequestId ()
  {
    const proxy = this;
    return this.channelId.then(
      function( channelId )
      {
          proxy.requestId = proxy.requestId + 1;
          return proxy.requestId + channelId;
      }
    );
  }

  // Returns a promise for unsuscriber information of the form: {subject: req.subject, corrId: req.corrId}
  send ( req, fireAndForget )
  {
    const proxy = this;
    return this.nextRequestId().then(
      function( reqId )
      {
        const setter = req.reactStateSetter;
        // Create a correlation identifier and store it in the request.
        if ( !req.corrId )
        {
          req.corrId = reqId;
        }
        // Store the valueReceiver.
        if (fireAndForget)
        {
          proxy.valueReceivers[ req.corrId ] = function( result )
            {
              // Move all properties to the default request to ensure we send a complete request.
              proxy.send(
                Object.assign(
                  Object.assign({}, defaultRequest),
                  { request: "Unsubscribe"
                  , subject: req.subject
                  , corrId: req.corrId}) );
              setter( result );
            };
        }
        else
        {
          proxy.valueReceivers[ req.corrId ] = setter;
        }
        // cannot serialise a function, remove it from the request.
        req.reactStateSetter = undefined;
        // console.log( req );
        // send the request through the channel to the service worker.
        proxy.port.postMessage( req );
        // return the elementary data for unsubscribing.
        return {subject: req.subject, corrId: req.corrId};
      }
    );
  }

}
////////////////////////////////////////////////////////////////////////////////
//// PERSPECTIVESPROXY
////////////////////////////////////////////////////////////////////////////////
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

  // Returns a promise for unsuscriber information of the form: {subject: req.subject, corrId: req.corrId}
  // that can be used by the caller to unsubscribe from the core dependency network.
  send (req, receiveValues, fireAndForget)
  {
    // Handle errors here. Use `errorHandler` if provided by the PerspectivesProxy method, otherwise
    // just log a warning on the console.
    const handleErrors = function(response) // response = PerspectivesApiTypes.ResponseRecord
    {
      if (response.error)
      {
        console.warn( defaultRequest.request + ": " + response.error );
      }
      else {
        receiveValues(response.result);
      }
      // This is the Effect.
      return function () {};
    };
    req.reactStateSetter = handleErrors;
    // Move all properties to the default request to ensure we send a complete request.
    const fullRequest = Object.assign( Object.assign({}, defaultRequest), req);

    // DEVELOPMENT ONLY: warn if any value is undefined
    if ( Object.values(defaultRequest).includes( undefined ) )
    {
      console.warn( "Request misses values: " + JSON.stringify(defaultRequest) );
    }

    return this.channel.send( fullRequest, fireAndForget );
  }

  // unsubscribe from the channel.
  unsubscribe (req)
  {
    this.channel.unsubscribe(req);
  }

  // getRolBinding (contextID, rolName, receiveValues)
  // {
  //   return this.send(
  //     {request: "GetRolBinding", subject: contextID, predicate: rolName},
  //     receiveValues);
  // }
  // rolName must be qualified but may use default prefixes.
  getRol (contextID, rolName, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetRol", subject: contextID, predicate: rolName},
      receiveValues,
      fireAndForget);
  }

  getUnqualifiedRol (contextID, localRolName, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetUnqualifiedRol", subject: contextID, predicate: localRolName},
      receiveValues,
      fireAndForget);
  }

  getProperty (rolID, propertyName, roleType, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetProperty", subject: rolID, predicate: propertyName, object: roleType},
      receiveValues,
      fireAndForget);
  }

  getPropertyFromLocalName (rolID, propertyName, roleType, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetPropertyFromLocalName", subject: rolID, predicate: propertyName, object: roleType},
      receiveValues,
      fireAndForget
    );
  }

  getBinding (rolID, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetBinding", subject: rolID, predicate: ""},
      receiveValues,
      fireAndForget);
  }

  getBindingType (rolID, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetBindingType", subject: rolID, predicate: ""},
      receiveValues,
      fireAndForget);
  }

  getRoleBinders (rolID, roleType, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetRoleBinders", subject: rolID, predicate: roleType},
      receiveValues,
      fireAndForget);
  }

  // getUnqualifiedRoleBinders (rolID, localRolName, receiveValues)
  // {
  //   return this.send(
  //     {request: "GetUnqualifiedRoleBinders", subject: rolID, predicate: localRolName},
  //     receiveValues);
  // }

  getViewProperties (rolType, viewName, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetViewProperties", subject: rolType, predicate: viewName},
      receiveValues,
      fireAndForget);
  }

  getRolContext (rolID, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetRolContext", subject: rolID, predicate: ""},
      receiveValues,
      fireAndForget);
  }

  getContextType (contextID, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetContextType", subject: contextID, predicate: ""},
      receiveValues,
      fireAndForget);
  }

  getRolType (rolID, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetRolType", subject: rolID, predicate: ""},
      receiveValues,
      fireAndForget);
  }

  // RoleInContext | ContextRole | ExternalRole | UserRole | BotRole
  getRoleKind (rolID, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetRoleKind", subject: rolID, predicate: ""},
      receiveValues,
      fireAndForget);
  }

  getUnqualifiedRolType (contextType, localRolName, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetUnqualifiedRolType", subject: contextType, predicate: localRolName},
      receiveValues,
      fireAndForget);
  }

  // Returns an array of Role Types.
  getMeForContext (externalRoleInstance, receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetMeForContext", subject: externalRoleInstance},
      receiveValues,
      fireAndForget
    );
  }

  // NOTE: it is not possible to subscribe to update events on this query.
  getAllMyRoleTypes(externalRoleInstance, receiveValues)
  {
    return this.send(
      {request: "GetAllMyRoleTypes", subject: externalRoleInstance},
      receiveValues,
      true
    );
  }

  // The instance of model:System$PerspectivesSystem$User that represents the user operating this PDR.
  getUserIdentifier (receiveValues, fireAndForget)
  {
    return this.send(
      {request: "GetUserIdentifier"},
      receiveValues,
      fireAndForget
    );
  }

  getPerspectives (contextInstance, userRoleType, receiveValues, fireAndForget)
  {
    return this.send(
      { request: "GetPerspectives"
      , subject: userRoleType
      , object: contextInstance
      },
      function (perspectiveStrings)
      {
        return receiveValues(perspectiveStrings.map( JSON.parse ));
      },
      fireAndForget
    );
  }

  // { request: "GetPerspective", subject: UserRoleType OPTIONAL, predicate: RoleInstance, object: ContextInstance OPTIONAL }
  getPerspective (contextInstance/*optional*/, userRoleType/*optional*/, roleInstance, receiveValues, fireAndForget)
  {
    return this.send(
      { request: "GetPerspective"
      , subject: userRoleType
      , predicate: roleInstance
      , object: contextInstance
      },
      function (perspectiveStrings)
      {
        return receiveValues(perspectiveStrings.map( JSON.parse ));
      },
      fireAndForget
    );
  }

  getRolesWithProperties (contextInstance, roleType, receiveValues, fireAndForget)
  {
    return this.send(
      { request: "GetRolesWithProperties"
      , object: contextInstance
      , predicate: roleType },
      function (roleWithPropertiesStrings)
      {
        return receiveValues( roleWithPropertiesStrings.map (JSON.parse ) );
      },
      fireAndForget
    );
  }

  getLocalRoleSpecialisation( localAspectName, contextInstance, receiveValues, fireAndForget )
  {
    return this.send(
      { request: "GetLocalRoleSpecialisation"
      , subject: contextInstance
      , predicate: localAspectName},
      receiveValues,
      fireAndForget
    );
  }

  // Create a context, bound to a new instance of <roleType> in <contextId>. <roleType> may be a local name.
  // The ctype in the contextDescription must be qualified, but it may use a default prefix.
  // createContext( <contextDescription>, <roleType>, <contextId>, <EmbeddingContextType>, <myRoleType> ...)
  // roleType may be a name local to the EmbeddingContextType.
  // EmbeddingContextType must be fully qualified.
  // contextId must be a valid identifier for the context to create. Default namespaces will be expanded (e.g. usr:)
  // Either throws an error, or returns an array with
  //  - just a single string identifiying the external role of a DBQ role;
  //  - that string and a second that identifies the new context role otherwise.
  // So:  [<externalRoleId>(, <contextRoleId>)?]
  createContext (contextDescription, roleType, contextId, embeddingContextType, myroletype, receiveResponse)
  {
    this.send(
      {request: "CreateContext", subject: contextId, predicate: roleType, object: embeddingContextType, contextDescription: contextDescription, authoringRole: myroletype},
      function(r)
      {
        receiveResponse( r );
      }
    );
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
    );
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
    );
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
    );
  }

  // value is just a single string!
  setProperty (rolID, propertyName, value, myroletype)
  {
    this.send(
      {request: "SetProperty", subject: rolID, predicate: propertyName, object: value, authoringRole: myroletype},
      function() {}
    );
  }

  deleteProperty (rolID, propertyName, myroletype)
  {
    this.send(
      {request: "DeleteProperty", subject: rolID, predicate: propertyName, authoringRole: myroletype},
      function() {}
    );
  }

  // { request: Action
  //   , predicate: <object of perspective role instance>
  //   , object: <context instance>
  //   , contextDescription:
  //   	  { perspectiveId:
  //   	  , actionName:
  //   	  }
  //   , authoringRole
  //   ...}
  action (objectRoleInstance, contextInstance, perspectiveId, actionName, authoringRole)
  {
    const req = { request: "Action"
      , predicate: objectRoleInstance
      , object: contextInstance
      , contextDescription: { perspectiveId, actionName }
      , authoringRole
      };
    if (objectRoleInstance)
    {
      req.predicate = objectRoleInstance;
    }
    this.send( req );
  }

  // { request: ContextAction
  // , subject: RoleType // the user role type
  // , predicate: String // action identifier
  // , object: ContextId
  // }
  contextAction( contextid, myRoleType, actionName)
  {
    this.send({request: "ContextAction", subject: myRoleType, predicate: actionName, object: contextid });
  }

  // { request: GetContextActions
  // , subject: RoleType // the user role type
  // , object: ContextInstance
  // }
  getContextActions(myRoleType, contextInstance, receiveValues)
  {
    this.send({ request: "GetContextActions", subject: myRoleType, object: contextInstance }, receiveValues);
  }

  removeBinding (rolID, bindingID, myroletype)
  {
    this.send(
      {request: "RemoveBinding", subject: rolID, authoringRole: myroletype},
      function() {}
    );
  }

  removeRol (rolName, rolID, myroletype, callback)
  {
    this.send(
      {request: "RemoveRol", subject: rolID, predicate: rolName, authoringRole: myroletype},
      (callback ? callback : function(){})
    );
  }

  //{request: "RemoveContext", subject: rolID, predicate: rolName, authoringRole: myroletype}
  // rolName must be qualified.
  removeContext (rolID, rolName, myroletype, callback)
  {
    this.send(
      {request: "RemoveContext", subject: rolID, predicate: rolName, authoringRole: myroletype},
      (callback ? callback : function(){})
    );
  }

  deleteRole (contextID, rolName, rolID, myroletype)
  {
    this.send(
      {request: "DeleteRole", subject: rolName, predicate: contextID, authoringRole: myroletype},
      function() {}
    );
  }


  bind (contextinstance, localRolName, contextType, rolDescription, myroletype/*, receiveResponse*/)
  {
    this.send(
      {request: "Bind", subject: contextinstance, predicate: localRolName, object: contextType, rolDescription: rolDescription, authoringRole: myroletype },
      function() {}
    );
  }

  bind_ (binder, binding, myroletype)
  {
    this.send(
      {request: "Bind_", subject: binder, object: binding, authoringRole: myroletype},
      function() {}
    );
  }

  // checkBinding( <contexttype>, <(local)RolName>, <binding>, [() -> undefined] )
  // Where (local)RolName identifies the role in <contexttype> whose binding specification we want to compare with <binding>.
  checkBinding (contextType, localRolName, rolInstance, callback)
  {
    this.send(
      {request: "CheckBinding", subject: contextType, predicate: localRolName, object: rolInstance}
      , callback
    );
  }

  // We have room for checkBinding_( <binder>, <binding>, [() -> undefined] )

  createRole (contextinstance, rolType, myroletype/*, receiveResponse*/)
  {
    this.send(
      {request: "CreateRol", subject: contextinstance, predicate: rolType, authoringRole: myroletype },
      function() {}
    );
  }

  setPreferredUserRoleType( externalRoleId, userRoleName )
  {
    this.send(
      {request: "SetPreferredUserRoleType", subject: externalRoleId, object: userRoleName},
      function(){}
    );
  }

  // NOTE: this function returns a promise and does not take a callback!
  matchContextName( name )
  {
    const proxy = this;
    return new Promise(function(resolver)
      {
        proxy.send(
          {request: "MatchContextName", subject: name},
          function(qualifiedNames)
          {
            resolver( qualifiedNames );
          }
        );
      });
  }

  // NOTE: this function returns a promise and does not take a callback!
  getCouchdbUrl()
  {
    const proxy = this;
    return new Promise(function (resolver)
      {
        proxy.send(
          { request: "GetCouchdbUrl" },
          function( url )
          {
            resolver( url );
          }
        );
      });
  }

  getRoleName( rid, receiveValues )
  {
    this.send(
      { request: "GetRoleName"
      , object: rid
      }
      , receiveValues
    );
  }

}

module.exports = {
  PDRproxy: PDRproxy,
  InternalChannelPromise: InternalChannelPromise,
  SharedWorkerChannelPromise: SharedWorkerChannelPromise,
  createRequestEmitterImpl: createRequestEmitterImpl,
  // createTcpConnectionToPerspectives: createTcpConnectionToPerspectives,
  // createServiceWorkerConnectionToPerspectives: createServiceWorkerConnectionToPerspectives,
  configurePDRproxy: configurePDRproxy,
  FIREANDFORGET: true
};

////////////////////////////////////////////////////////////////////////////////
//// TCP CHANNEL
////////////////////////////////////////////////////////////////////////////////
// class TcpChannel
// {
//   constructor (options)
//   {
//     let connection;
//     this.requestId = -1;
//     const valueReceivers = {};
//     // This creates a net.Socket (https://nodejs.org/api/net.html#net_net_createconnection).
//     this.connection = require("net").createConnection(
//       options,
//       // message will be in base64. Appending a string to it converts it to a new string.
//       function ()
//       {
//         console.log("Connection made.");
//       });
//     connection = this.connection;
//     this.valueReceivers = valueReceivers;
//
//     // See: https://nodejs.org/api/net.html#net_class_net_socket
//     connection.on('data',
//       // message will be in base64. Appending a string to it converts it to a new string.
//       function (message)
//       {
//         const messages = (message + "").split("\n");
//         messages.forEach( function(m) // m :: PerspectivesApiTypes.ResponseRecord
//         {
//           if (m !== "")
//           {
//             try
//             {
//               const responseRecord = JSON.parse(m);
//               valueReceivers[responseRecord.corrId](responseRecord);
//             }
//             catch(e)
//             {
//               console.log(e);
//             }
//           }
//         });
//       });
//
//     // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_error
//     // Emitted when an error occurs. The 'close' event will be called
//     // directly following this event.
//     connection.on('error',
//       function(error)
//       {
//         console.log( "Error on the connection: " + error );
//         // Half-closes the socket. i.e., it sends a FIN packet.
//         // It is possible the server will still send some data.
//         connection.end();
//       });
//
//     // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_close
//     // Emitted once the socket is fully closed. The argument had_error is a boolean
//     // which says if the socket was closed due to a transmission error.
//     connection.on('close',
//       function(had_error)
//       {
//         // No data will come anymore.
//         if ( had_error )
//         {
//           console.log("The Perspectives Core has hung up because of an error.");
//         }
//         else
//         {
//           console.log("The Perspectives Core has hung up.");
//         }
//       });
//
//       // https://nodejs.org/docs/latest-v6.x/api/net.html#net_event_end
//       // Emitted when the other end of the socket sends a FIN packet.
//       // By default (allowHalfOpen == false) the socket will destroy its file
//       // descriptor once it has written out its pending write queue.
//       connection.on('end',
//         function()
//         {
//           // This means the other side will no longer send data.
//           console.log("The Perspectives Core has hung up.");
//         });
//   }
//
//   nextRequestId ()
//   {
//     this.requestId = this.requestId + 1;
//     return this.requestId.toString();
//   }
//
//   // close will lead the messageProducer of the perspectives core to receive (Right unit).
//   close()
//   {
//     // https://nodejs.org/api/net.html#net_socket_end_data_encoding_callback
//     this.connection.end();
//     this.send = function()
//     {
//       throw( "This client has shut down!");
//     };
//   }
//
//   // req has the following format (taken from: module Perspectives.Api)
//   //   { request :: String
//   //   , subject :: String
//   //   , predicate :: String
//   //   , setterId :: ReactStateSetterIdentifier}
//   // type ReactStateSetterIdentifier = String
//   // Returns a structure that can be used by the caller to unsubscribe from the core dependency network.
//   send(req, receiveValues)
//   {
//     req.corrId = this.nextRequestId();
//     this.valueReceivers[ req.corrId ] = receiveValues;
//     // https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback
//     this.connection.write(JSON.stringify(req) + "\n");
//     // return the elementary data for unsubscribing.
//     return {subject: req.subject, predicate: req.corrId};
//   }
//
//   unsubscribe(req)
//   {
//     delete this.valueReceivers[req.setterId];
//     // https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback
//     this.connection.write(
//       {request: "Unsubscribe", subject: req.subject, predicate: req.predicate, setterId: req.setterId}
//     );
//   }
// }
