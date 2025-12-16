// src/dasf/types.ts

// Defines a parameter for an endpoint
export interface DasfParameter {
  type: 'string' | 'number' | 'boolean';
  description: string;
}

// For binary payload body items
export interface DasfBinaryBodyItem {
  fieldName: string;
  dataType: 'uint8' | 'int16' | 'float32' | 'string';
  length?: number; // Only for string
  encoding?: string; // Only for string
}
export interface DasfInterface {
    [key: string]: DasfJsonPayloadProperty | DasfInterface;
}
// For JSON payload body items
export interface DasfJsonPayloadProperty {
  type: string;
  items?: DasfJsonPayloadItems;
  properties?: { [key: string]: DasfJsonPayloadProperty };
  description?: string; // As seen in parameters, probably useful here too
}

export interface DasfJsonPayloadItems {
    type: string;
    items?: DasfJsonPayloadItems;
    properties?: { [key: string]: DasfJsonPayloadProperty };
}

// Represents the payload (sent or received)
export interface DasfPayload {
  type: 'json' | 'binary' | 'text';
  endianness?: 'big-endian' | 'little-endian' | 'middle-endian';
  body?: DasfBinaryBodyItem[] | { [key: string]: DasfJsonPayloadProperty } | null;
  example?: string;
}

// Represents a single documented UDP endpoint
export interface DasfEndpoint {
  description: string;
  takeoffPort: number;
  landingPort: number;
  parameters?: { [key: string]: DasfParameter };
  sentPayload?: DasfPayload;
  receivedPayload?: DasfPayload;
}

// Represents the entire DASF document, mapping paths to endpoints
export interface DasfDocument {
  $interfaces?: {
    [name: string]: DasfInterface
  }
  [path: string]: DasfEndpoint | any;
}
