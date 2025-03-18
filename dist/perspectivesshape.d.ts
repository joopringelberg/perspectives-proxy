
////////////////////////////////////////////
//// PERSPECTIVES TYPE- AND INSTANCE TYPES
////////////////////////////////////////////

// NOTE: RoleInstanceT is the typescript type of role instances. Don't confuse it with RoleType, which is the typescript type of role types.
export type RoleInstanceT = string & { readonly brand: unique symbol };
export type RoleReceiver = (roleInstance: RoleInstanceT[]) => void;
export type ContextInstanceT = string & { readonly brand: unique symbol };
export type ValueT = string & { readonly brand: unique symbol };
export type PropertyValueReceiver = (value: ValueT[]) => void;
export type RoleType = string & { readonly brand: unique symbol };
export type UserRoleType = RoleType
export type RoleTypeReceiver = (roleType: RoleType[]) => void;
export type PerspectivesReceiver = (perspectives: Perspective[]) => void;
export type ScreenReceiver = (screen: ScreenDefinition[]) => void;
export type TableFormReceiver = (tableForm: TableFormDef[]) => void;
export type PropertyType = string & { readonly brand: unique symbol };
export type ContextType = string & { readonly brand: unique symbol };
export type RoleKind = "RoleInContext" | "ContextRole" | "ExternalRole" | "UserRole" | "BotRole"
export type EnumeratedOrCalculatedProperty = {type: "ENP" | "CP", value: PropertyType}

export type ContextActions = Record<ModeledActionName, TranslatedActionName>;

export type FileShareCredentials = { accountName : string, password : string, storageType: PStorageType, sharedStorageId : RoleInstanceT };

export type PStorageType = "mega" | "ppstorage";

////////////////////////////////////////////
//// PSHAREDFILE
////////////////////////////////////////////
export interface PSharedFile {
  name: string;
  size: number;
  type: string;
  sharedStorageId: string;
  storageType: string;
  url: string;
}

////////////////////////////////////////////
//// PERSPECTIVESFILE
////////////////////////////////////////////
export type PerspectivesFile = {
  // The name associated with the file on creating or uploading it. Use only client side.
  fileName: string;
  // The identifier of the attachment of the role instance.
  propertyType: PropertyType;
  mimeType: string;
  // The database where the role instance is stored. (is Nothing for IndexedDB)
  database?: string;
  // The name of the role instance document
  roleFileName: string;
};

////////////////////////////////////////////
//// SERIALISED PERSPECTIVES
////////////////////////////////////////////
export type Perspective = {
  id: string;
  displayName: string;
  isFunctional: boolean;
  isMandatory: boolean;
  isCalculated: boolean;
  userRoleType: RoleType;
  roleType: RoleType;
  roleKind: RoleKind;
  contextType: ContextType;
  contextIdToAddRoleInstanceTo: ContextInstanceT;
  contextTypesToCreate: Record<string, ContextType>;
  identifyingProperty: PropertyType;
  contextInstance: ContextInstanceT;
  roleInstances: Record<string, Roleinstancewithprops>;
  verbs: string[];
  properties: Record<string, SerialisedProperty>;
  actions: Record<string, string>;
};

export type Roleinstancewithprops = {
  roleId: RoleInstanceT;
  objectStateBasedRoleVerbs: string[];
  propertyValues: Record<string, PropertyValues>;
  actions: Record<string, string>;
  objectStateBasedProperties: { type: string; value: PropertyType }[];
  publicUrl?: string;
  filler?: RoleInstanceT;
};

export type PropertyValues = {
  values: ValueT[];
  propertyVerbs: string[];
};

export type SerialisedProperty = {
  id: PropertyType;
  displayName: string;
  isFunctional: boolean;
  isMandatory: boolean;
  isCalculated: boolean;
  range: PRange;
  constrainingFacets: {
    minLength?: number;
    maxLength?: number;
    pattern?: {
      regex: string;
      label: string;
    };
    whiteSpace?: string;
    enumeration?: string[];
    maxInclusive?: string;
    maxExclusive?: string;
    minInclusive?: string;
    minExclusive?: string;
    totalDigits?: number;
    fractionDigits?: number;
  };
};

export type PRange = "PString" | "PBool" | "PDateTime" | "PDate" | "PTime" | "PNumber" | "PEmail" | "PFile" | "PMarkDown";

export type InputType = "text" | "checkbox" | "datetime-local" | "date" | "time" | "number" | "email" | "file" | "markdown"



////////////////////////////////////////////
//// SERIALISED SCREEN
////////////////////////////////////////////
export type ScreenDefinition = MainScreenElements & {
  title?: string;
  whoWhatWhereScreen?: WhoWhatWhereScreenDef;
};

export type MainScreenElements = {
  tabs?: TabDef[];
  rows?: ScreenElementDefTagged[];
  columns?: ScreenElementDefTagged[];
};

export type TabDef = {
  title: string;
  isDefault: boolean;
  elements: ScreenElementDefTagged[];
};

export type ScreenElementDefTagged = {
  elementType: "RowElementD" | "ColumnElementD" | "TableElementD" | "FormElementD" | "MarkDownElementD" | "ChatElementD";
  element: ScreenElementDef;
}

export type ScreenElementDef = RowElementDef | ColumnElementDef | TableElementDef | FormElementDef | MarkDownElementDef | ChatElementDef;

export type RowElementDef = {
  tag: "RowDef";
  elements: ScreenElementDefTagged[];
}

export type ColumnElementDef = {
  tag: "ColumnDef";
  elements: ScreenElementDefTagged[];
}

export type TableElementDef = {
  tag: "TableDef";
  fields: WidgetCommonFields;
}

export type FormElementDef = {
  tag: "FormDef";
  fields: WidgetCommonFields;
}

export type MarkDownElementDef = MarkDownConstant | MarkDownPerspective | MarkDownExpression;

export type MarkDownConstant = {
  tag: "MarkDownConstantDef";
  element: { text : string, condition?: string, domain: string };
}

export type MarkDownPerspective = {
  tag: "MarkDownPerspectiveDef";
  element: { widgetFields: WidgetCommonFields, conditionProperty: EnumeratedOrCalculatedProperty? };
}

export type MarkDownExpression = {
  tag: "MarkDownExpressionDef";
  element: {textQuery: string, condition? : string, text?: string};
}

export type ChatElementDef = {
  tag: "ChatDef";
  fields: {
    chatRole: RoleType;
    chatInstance?: RoleInstanceT;
    messageProperty: PropertyType;
    mediaProperty: PropertyType;
  };
}

export type WidgetCommonFields = {
  title: string;
  perspective: Perspective;
};

export type WhoWhatWhereScreenDef = {
  who: TableFormDef[];
  what: What;
  whereto: TableFormDef[];
};

export type TableFormDef = {
  table: TableElementDef;
  form: FormElementDef;
};

export type What = {tag: "TableForms", elements: TableFormDef[]} | {tag: "FreeFormScreen", elements: MainScreenElements}; 

/////////////////////////////////////////////////////////////////////////////////////////
// PDRTYPES
/////////////////////////////////////////////////////////////////////////////////////////
export type RuntimeOptions = {
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

export type PouchdbUser = {
  systemIdentifier: string;  // the schemaless string
  perspectivesUser: string;  // the schemaless string
  userName: string;          // this MAY be equal to perspectivesUser but it is not required.
  password?: string;         // Optional field
  couchdbUrl?: string;       // Optional field
};

export type Unsubscriber = { subject: string; corrId: number };

