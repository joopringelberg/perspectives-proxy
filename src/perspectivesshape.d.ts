
////////////////////////////////////////////
//// SERIALISED PERSPECTIVES

import { RoleInstance } from "perspectives-proxy";

////////////////////////////////////////////
export type Perspective = {
  id: string;
  displayName: string;
  isFunctional: boolean;
  isMandatory: boolean;
  isCalculated: boolean;
  userRoleType: string;
  roleType?: string;
  roleKind?: string;
  contextType: string;
  contextIdToAddRoleInstanceTo: string;
  contextTypesToCreate: Record<string, string>;
  identifyingProperty: string;
  contextInstance: string;
  roleInstances: Record<string, Roleinstancewithprops>;
  verbs?: string[];
  properties?: Record<string, SerialisedProperty>;
  actions?: Record<string, string>;
};

export type Roleinstancewithprops = {
  roleId?: string;
  objectStateBasedRoleVerbs?: string[];
  propertyValues?: Record<string, PropertyValues>;
  actions?: Record<string, string>;
  objectStateBasedProperties?: { type: string; value: string }[];
  publicUrl?: string;
  filler?: string;
};

export type PropertyValues = {
  values: string[];
  propertyVerbs: string[];
};

export type SerialisedProperty = {
  id: string;
  displayName: string;
  isFunctional: boolean;
  isMandatory: boolean;
  isCalculated: boolean;
  range: string;
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
  elementDef: ScreenElementDef;
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
  table: WidgetCommonFields;
}

export type FormElementDef = {
  tag: "FormDef";
  form: WidgetCommonFields;
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
  table: WidgetCommonFields;
  form: WidgetCommonFields;
};

export type What = {tag: "TableForms", elements: TableFormDef[]} | {tag: "FreeFormScreen", elements: MainScreenElements}; 