import type { GroupId } from "./i18n";
import type { BooleanKey, ListKey, NumberKey, StringKey } from "./options";
import { SOURCE_UNITS, UNIT_CHOICES } from "./options";

// A field that only works while another option is on names that option in `requires`
interface NumberField { kind: "number"; key: NumberKey; requires?: BooleanKey }
interface SwitchField { kind: "switch"; key: BooleanKey }
interface UnitField { kind: "unit"; key: StringKey; choices: readonly string[]; target: boolean; requires?: BooleanKey }
interface ListField { kind: "list"; key: ListKey }
interface TextField { kind: "text"; key: StringKey }
interface FileField { kind: "file" }

export type Field = NumberField | SwitchField | UnitField | ListField | TextField | FileField;

export interface FieldGroup {
  id: GroupId;
  fields: Field[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: "units",
    fields: [
      { kind: "unit", key: "unitType", choices: SOURCE_UNITS, target: false },
      { kind: "number", key: "viewportWidth" },
      { kind: "unit", key: "viewportUnit", choices: UNIT_CHOICES, target: true },
      { kind: "unit", key: "fontViewportUnit", choices: UNIT_CHOICES, target: true },
      { kind: "number", key: "rootValue" },
    ],
  },
  {
    id: "values",
    fields: [
      { kind: "number", key: "unitPrecision" },
      { kind: "number", key: "minPixelValue" },
      { kind: "switch", key: "replaceRules" },
    ],
  },
  {
    id: "filters",
    fields: [
      { kind: "list", key: "selectorBlacklist" },
      { kind: "list", key: "selectorWhitelist" },
      { kind: "list", key: "allowedProperties" },
      { kind: "list", key: "excludedProperties" },
    ],
  },
  {
    id: "media",
    fields: [
      { kind: "switch", key: "allowMediaQuery" },
      { kind: "switch", key: "enableLandscape" },
      { kind: "unit", key: "landscapeUnit", choices: UNIT_CHOICES, target: true, requires: "enableLandscape" },
      { kind: "number", key: "landscapeViewportWidth", requires: "enableLandscape" },
    ],
  },
  {
    id: "files",
    fields: [
      { kind: "file" },
      { kind: "list", key: "includeFiles" },
      { kind: "list", key: "excludeFiles" },
      { kind: "switch", key: "enablePerFileConfig" },
      { kind: "text", key: "viewportWidthComment" },
    ],
  },
];
