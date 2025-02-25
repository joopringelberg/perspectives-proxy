export declare const PDRproxy: Promise<PerspectivesProxy>;
type Options = {
    pageHostingPDRPort: (pdr: any) => MessagePort;
};
export declare function configurePDRproxy(channeltype: "internalChannel" | "sharedWorkerChannel" | "hostPageChannel", options: Options): void;
interface RequestRecord {
    request?: string;
    subject?: string;
    predicate?: string;
    object?: any;
    contextDescription?: any;
    rolDescription?: any;
    authoringRole?: string;
    onlyOnce?: boolean;
    reactStateSetter?: (response: any) => void;
    corrId?: number;
}
type RuntimeOptions = {
    isFirstInstallation: boolean;
    useSystemVersion: string | null;
    privateKey?: CryptoKey;
    publicKey?: CryptoKey;
    myContextsVersion: string;
};
type PouchdbUser = {
    systemIdentifier: string;
    perspectivesUser: string;
    userName: string;
    password?: string;
    couchdbUrl?: string;
};
type Response = ErrorResponse | ResultResponse | WorkerResponse;
type ErrorResponse = {
    responseType: "APIerror";
    corrId: number;
    error: string;
};
type ResultResponse = {
    responseType: "APIresult";
    corrId: number;
    result: string[];
};
type WorkerResponse = {
    responseType: "WorkerResponse";
    serviceWorkerMessage: "channelId" | "pdrStarted" | "isUserLoggedIn" | "runPDR" | "createAccount" | "resetAccount" | "reCreateInstances" | "recompileLocalModels" | "removeAccount";
    channelId: number;
    pdrStarted: boolean;
    isUserLoggedIn: boolean;
    createSuccesful: boolean;
    resetSuccesful: boolean;
    reCreateSuccesful: boolean;
    recompileSuccesful: boolean;
    removeSuccesful: boolean;
};
declare class SharedWorkerChannel {
    port: MessagePort;
    requestId: number;
    valueReceivers: {
        [key: string]: ((data: any) => void) | undefined;
    };
    channelIdResolver: ((value: number | PromiseLike<number>) => void) | undefined;
    channelId: Promise<number>;
    constructor(port: MessagePort);
    handleWorkerResponse(e: MessageEvent<Response>): void;
    pdrStarted(): Promise<boolean>;
    isUserLoggedIn(): Promise<boolean>;
    runPDR(username: string, pouchdbuser: PouchdbUser, options: RuntimeOptions): Promise<boolean>;
    createAccount(perspectivesUser: string, pouchdbuser: PouchdbUser, runtimeOptions: RuntimeOptions, optionalIdentityDocument: any): Promise<boolean>;
    resetAccount(username: string, pouchdbuser: PouchdbUser, options: RuntimeOptions): Promise<boolean>;
    reCreateInstances(pouchdbuser: PouchdbUser, options: RuntimeOptions): Promise<boolean>;
    recompileLocalModels(pouchdbuser: PouchdbUser): Promise<boolean>;
    removeAccount(username: string, pouchdbuser: PouchdbUser): Promise<boolean>;
    close(): void;
    unsubscribe(req: RequestRecord): void;
    nextRequestId(): Promise<number>;
    send(req: RequestRecord): Promise<Unsubscriber>;
}
type Unsubscriber = {
    subject: string;
    corrId: string;
};
export declare const SharedWorkerChannelPromise: Promise<SharedWorkerChannel>;
declare class PerspectivesProxy {
    channel: SharedWorkerChannel;
    cursor: Cursor;
    constructor(channel: SharedWorkerChannel);
    close(): void;
    send(req: RequestRecord, receiveValues: valueReceiver, errorHandler: errorHandler): Promise<Unsubscriber>;
    unsubscribe(req: RequestRecord): void;
    getRol(contextID: ContextID, rolName: RolName, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getUnqualifiedRol(contextID: ContextID, localRolName: RolName, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getProperty(rolID: RoleInstance, propertyName: PropertyType, roleType: RoleType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getPropertyFromLocalName(rolID: RoleInstance, propertyName: PropertyType, roleType: RoleType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getBinding(rolID: RoleInstance, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getRoleBinders(rolID: RoleInstance, contextType: ContextType, roleType: RoleType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getMeForContext(externalRoleInstance: RoleInstance, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getPerspectives(contextInstance: ContextInstance, userRoleType: UserRoleType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getPerspective(roleInstanceOfContext: RoleInstance, perspectiveObjectRoleType: RoleType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getScreen(userRoleType: UserRoleType, contextInstance: ContextInstance, contextType: ContextType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getTableForm(userRoleType: UserRoleType, contextInstance: ContextInstance, roleType: RoleType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getLocalRoleSpecialisation(localAspectName: string, contextInstance: ContextInstance, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getRoleName(rid: RoleInstance, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): void;
    getBindingType(rolID: RoleInstance, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    matchContextName(name: string, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    getChatParticipants(rolID: RoleInstance, propertyId: PropertyType, receiveValues: valueReceiver, fireAndForget: SubscriptionType, errorHandler: errorHandler): Promise<Unsubscriber>;
    checkBindingP(roleName: RoleType, rolInstance: RoleInstance): Promise<unknown>;
    getCouchdbUrl(): Promise<unknown>;
    getContextActions(myRoleType: UserRoleType, contextInstance: ContextInstance): Promise<unknown>;
    getAllMyRoleTypes(externalRoleInstance: RoleInstance): Promise<unknown>;
    getViewProperties(rolType: RoleType, viewName: string): Promise<unknown>;
    getContextType(contextID: ContextID): Promise<unknown>;
    getRolContext(rolID: RoleInstance): Promise<unknown>;
    getRolType(rolID: RoleInstance): Promise<unknown>;
    getRoleKind(rolID: RoleInstance): Promise<unknown>;
    getUnqualifiedRolType(contextType: ContextType, localRolName: string): Promise<unknown>;
    getFile(roleInstance: RoleInstance, propertyName: PropertyType): Promise<unknown>;
    getPublicUrl(contextInstance: ContextInstance): Promise<unknown>;
    getSystemIdentifier(): Promise<unknown>;
    getPerspectivesUser(): Promise<unknown>;
    getMeInContext(roleInstance: RoleInstance): Promise<unknown>;
    getFileShareCredentials(): Promise<unknown>;
    createContext(contextDescription: ContextSerializationRecord, roleType: RoleType, contextIdToAddRoleInstanceTo: ContextInstance, myroletype: UserRoleType): Promise<unknown>;
    createContext_(contextDescription: ContextSerializationRecord, roleInstance: RoleInstance, myroletype: UserRoleType): Promise<unknown>;
    importContexts(contextDescription: ContextSerializationRecord): Promise<unknown>;
    importTransaction(transaction: any): Promise<unknown>;
    setProperty(rolID: RoleInstance, propertyName: PropertyType, value: Value, myroletype: UserRoleType): Promise<unknown>;
    addProperty(rolID: RoleInstance, propertyName: PropertyType, value: Value, myroletype: UserRoleType): Promise<unknown>;
    saveFile(perspectivesFile: PerspectivesFile, file: File, myroletype: UserRoleType): Promise<unknown>;
    deleteProperty(rolID: RoleInstance, propertyName: PropertyType, myroletype: UserRoleType): Promise<unknown>;
    action(objectRoleInstance: RoleInstance, contextInstance: ContextID, perspectiveId: string, actionName: string, authoringRole: string): Promise<unknown>;
    contextAction(contextid: ContextInstance, myRoleType: UserRoleType, actionName: string): Promise<unknown>;
    removeBinding(rolID: RoleInstance, myroletype: UserRoleType): Promise<unknown>;
    removeRol(rolName: RolName, rolID: RoleInstance, myroletype: UserRoleType): Promise<unknown>;
    removeContext(rolID: RoleInstance, rolName: RolName, myroletype: UserRoleType): Promise<unknown>;
    deleteRole(contextID: ContextID, rolName: RolName, myroletype: UserRoleType): Promise<unknown>;
    bind(contextinstance: ContextInstance, localRolName: RolName, contextType: ContextType, rolDescription: RolSerialization, myroletype: UserRoleType): Promise<unknown>;
    bind_(filledRole: RoleInstance, filler: RoleInstance, myroletype: UserRoleType): Promise<unknown>;
    createRole(contextinstance: ContextInstance, rolType: RoleType, myroletype: UserRoleType): Promise<unknown>;
    setPreferredUserRoleType(externalRoleId: ExternalRoleType, userRoleName: UserRoleType): Promise<unknown>;
    save(): Promise<unknown>;
    evaluateRoleState(rolinstance: RoleInstance): Promise<unknown>;
}
export declare const FIREANDFORGET = true;
export declare const CONTINUOUS = false;
type SubscriptionType = boolean;
type valueReceiver = (value: any) => void;
type errorHandler = (error: string) => void;
type ContextID = string;
type RolName = string;
type ContextType = string;
type RoleType = string;
type RoleInstance = string;
type ContextInstance = string;
type UserRoleType = string;
type ExternalRoleType = string;
type PropertyType = string;
type Value = string;
type ContextSerializationRecord = {
    id?: string;
    prototype?: ContextID;
    ctype: ContextType;
    rollen: Record<RoleInstance, RolSerialization>;
    externeProperties: PropertySerialization;
};
type RolSerialization = {
    id?: string;
    properties: PropertySerialization;
    binding?: string;
};
type PropertySerialization = {
    [key: string]: Value[];
};
export type PerspectivesFile = {
    fileName: string;
    propertyType: string;
    mimeType: string;
    database?: string;
    roleFileName: string;
};
declare class Cursor {
    wait(): void;
    restore(): void;
}
export {};
