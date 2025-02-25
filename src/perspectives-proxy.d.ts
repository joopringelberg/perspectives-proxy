// Declare the PDRproxy promise
export const PDRproxy: Promise<PerspectivesProxy>;

// Declare the InternalChannel promise
export const InternalChannelPromise: Promise<InternalChannel>;

export const SharedWorkerChannelPromise: Promise<SharedWorkerChannel>;

// Define the type for TCPOptions
interface TCPOptions {
  port: number;
  host: string;
  allowHalfOpen?: boolean;
}

// Define the type for the options parameter
type Options = TCPOptions | { pageHostingPDRPort: (pdr: any) => MessagePort } | {};

// Declare the configurePDRproxy function
export function configurePDRproxy(channeltype: "internalChannel" | "sharedWorkerChannel" | "hostPageChannel", options: Options): void;

// Declare the createRequestEmitterImpl function
export function createRequestEmitterImpl(emitStep: any, finishStep: any, emit: any): void;

// Declare the retrieveRequestEmitterImpl function
export function retrieveRequestEmitterImpl(emit: any): void;

interface DefaultRequest {
  request?: string;
  subject?: string;
  predicate?: string;
  object?: any;
  contextDescription?: any;
  authoringRole?: string;
  onlyOnce?: boolean;
  reactStateSetter?: (response: any) => void;
  corrId?: number;
}

// Declare the createServiceWorkerConnectionToPerspectives function
export function createServiceWorkerConnectionToPerspectives(options: any): Promise<PerspectivesProxy>;

// Declare the createTcpConnectionToPerspectives function
export function createTcpConnectionToPerspectives(options: any): Promise<PerspectivesProxy>;

// Declare the SharedWorkerChannel class
declare class SharedWorkerChannel {
  port: MessagePort;
  requestId: number;
  valueReceivers: { [key: string]: (data: any) => void };
  channelIdResolver: ((value: number | PromiseLike<number>) => void) | undefined;
  channelId: Promise<number>;

  constructor(port: MessagePort);

  handleWorkerResponse(e: MessageEvent): void;

  pdrStarted(): Promise<boolean>;
  isUserLoggedIn(): Promise<boolean>;
  runPDR(username: string, pouchdbuser: any, options: any): Promise<boolean>;
  createAccount(perspectivesUser: string, pouchdbuser: PouchdbUser, runtimeOptions: RuntimeOptions, optionalIdentityDocument?: any): Promise<boolean>;
  resetAccount(username: string, pouchdbuser: any, options: any): Promise<boolean>;
  reCreateInstances(pouchdbuser: any, options: any): Promise<boolean>;
  recompileLocalModels(pouchdbuser: any): Promise<boolean>;
  removeAccount(username: string, pouchdbuser: any): Promise<boolean>;
  close(): void;
  unsubscribe(req: any): void;
  nextRequestId(): Promise<number>;
  send(req: DefaultRequest): Promise<{ subject: string; corrId: string }>;
}

// Declare the InternalChannel class
declare class InternalChannel {
  constructor(emitStep: any, finishStep: any, emit: any);
  setEmit(emit: any): void;
  nextRequestId(): number;
  close(): void;
  send(req: DefaultRequest): Promise<{ subject: string; corrId: string }>;
  unsubscribe(req: any): void;
}

// Declare the PerspectivesProxy class
declare class PerspectivesProxy {
  constructor(channel: any);

  close(): void;
  send(req: any, receiveValues: (response: any) => void, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  unsubscribe(req: any): void;

  getRol(contextID: string, rolName: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getUnqualifiedRol(contextID: string, localRolName: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getProperty(rolID: string, propertyName: string, roleType: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getPropertyFromLocalName(rolID: string, propertyName: string, roleType: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getBinding(rolID: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getRoleBinders(rolID: string, contextType: string, roleType: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getMeForContext(externalRoleInstance: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getPerspectives(contextInstance: string, userRoleType: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getPerspective(roleInstanceOfContext: string, perspectiveObjectRoleType: string | undefined, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getScreen(userRoleType: string, contextInstance: string, contextType: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getTableForm(userRoleType: string, contextInstance: string, roleType: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getLocalRoleSpecialisation(localAspectName: string, contextInstance: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getRoleName(rid: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): void;
  getBindingType(rolID: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  matchContextName(name: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  getChatParticipants(rolID: string, propertyId: string, receiveValues: (response: any) => void, fireAndForget?: boolean, errorHandler?: (error: any) => void): Promise<{ subject: string; corrId: string }>;
  checkBindingP(roleName: string, rolInstance: string): Promise<boolean>;
  getCouchdbUrl(): Promise<string>;
  getContextActions(myRoleType: string, contextInstance: string): Promise<any>;
  getAllMyRoleTypes(externalRoleInstance: string): Promise<string[]>;
  getViewProperties(rolType: string, viewName: string): Promise<any>;
  getContextType(contextID: string): Promise<string>;
  getRolContext(rolID: string): Promise<string>;
  getRolType(rolID: string): Promise<string>;
  getRoleKind(rolID: string): Promise<string>;
  getUnqualifiedRolType(contextType: string, localRolName: string): Promise<string>;
  getFile(roleInstance: string, propertyName: string): Promise<File[]>;
  getPublicUrl(contextInstance: string): Promise<string>;
  getSystemIdentifier(): Promise<string>;
  getPerspectivesUser(): Promise<string>;
  getMeInContext(roleInstance: string): Promise<string>;
  getFileShareCredentials(): Promise<{ accountName: string; password: string; storageType: string; sharedStorageId: string }>;
  createContext(contextDescription: any, roleType: string, contextIdToAddRoleInstanceTo: string, myroletype: string): Promise<string[]>;
  createContext_(contextDescription: any, roleInstance: string, myroletype: string): Promise<string[]>;
  importContexts(contextDescription: any): Promise<string[]>;
  importTransaction(transaction: any): Promise<string[]>;
  setProperty(rolID: string, propertyName: string, value: string, myroletype: string): Promise<void>;
  addProperty(rolID: string, propertyName: string, value: string, myroletype: string): Promise<void>;
  saveFile(perspectivesFile: any, file: File, myroletype: string): Promise<void>;
  deleteProperty(rolID: string, propertyName: string, myroletype: string): Promise<void>;
  action(objectRoleInstance: string, contextInstance: string, perspectiveId: string, actionName: string, authoringRole: string): Promise<void>;
  contextAction(contextid: string, myRoleType: string, actionName: string): Promise<void>;
  removeBinding(rolID: string, myroletype: string): Promise<void>;
  removeRol(rolName: string, rolID: string, myroletype: string): Promise<void>;
  removeContext(rolID: string, rolName: string, myroletype: string): Promise<void>;
  deleteRole(contextID: string, rolName: string, myroletype: string): Promise<void>;
  bind(contextinstance: string, localRolName: string, contextType: string, rolDescription: any, myroletype: string): Promise<RoleInstance>;
  bind_(filledRole: string, filler: string, myroletype: string): Promise<void>;
  createRole(contextinstance: string, rolType: string, myroletype: string): Promise<void>;
  setPreferredUserRoleType(externalRoleId: string, userRoleName: string): Promise<void>;
  save(): Promise<void>;
  evaluateRoleState(rolinstance: string): Promise<void>;
}

type RoleInstance = string;

// Declare the FIREANDFORGET and CONTINUOUS constants
export const FIREANDFORGET: boolean;
export const CONTINUOUS: boolean;

/////////////////////////////////////////////////////////////////////////////////////////
// PDRTYPES
/////////////////////////////////////////////////////////////////////////////////////////
type RuntimeOptions = {
  // Default: true. Should be false when someone installs MyContexts on a second device.
  isFirstInstallation: boolean;
  // Default: null. Provide a value to test setup of an experimental new System version.
  useSystemVersion: string | null;
  // Default: the CryptoKey object that has been created on setting up the installation. This is not extractable.
  privateKey?: CryptoKey;
  // Default: the CryptoKey object that has been created on setting up the installation. This is extractable.
  publicKey?: CryptoKey;
  // Default: the package number taken from package.json
  myContextsVersion: string;
};

type PouchdbUser = {
  systemIdentifier: string;  // the schemaless string
  perspectivesUser: string;  // the schemaless string
  userName: string;          // this MAY be equal to perspectivesUser but it is not required.
  password?: string;         // Optional field
  couchdbUrl?: string;       // Optional field
};