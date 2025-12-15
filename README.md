### 📄 DASF: Open Markup for Documenting UDP Requests
**DASF** (Datagram Specification Format) is an open, lightweight markup language specifically designed to standardize documentation of interactions that use the User Datagram Protocol (UDP).

Unlike a simple JSON extension, DASF defines a proprietary file format (.dasf) that combines a version header with a hierarchical documentation structure, making it ideal for defining APIs and services based on datagrams.

#### 💾 DASF File Structure (.dasf)
A DASF file must strictly follow the structure below:

1. Version Header
   The first line of the document must contain the format identifier and version:
   ```
   DASF-01
   ```
   1. `DASF-`: Fixed format identifier.
   2. `01`: Current version (V01).
2. Request Block Structure
      From the second line onward, the file consists of a sequence of blocks, where each top-level key represents the path of a documented UDP request.

    Note: The whole document is NOT wrapped in JSON braces ({}). Request paths start directly as top-level properties.
   ```YAML
   DASF-01
   path/of/first/request:
   ... properties ...
   path/of/second/request:
   ... properties ...
   ```

#### 📑 Documentation Properties

Each path block uses the following structure to document the UDP request:

| Property        | Type    | Description                                                               |
|:----------------|:--------|:--------------------------------------------------------------------------|
| description     | string  | A human-readable description of the request's purpose.                    |
| takeoffPort     | integer | The source (sender) UDP port.                                             |
| landingPort     | integer | The destination (receiver) UDP port.                                      |
| parameters      | object  | (Nullable) Structure to define query parameters associated with the path. |
| sentPayload     | object  | (Nullable) Definition of the sent datagram content.                       |
| receivedPayload | object  | (Nullable) Definition of the received datagram content.                   |

### 🔍 Details of Complex Properties

A. parameters
Defines the request parameters (query params). The key is the parameter name.

```YAML
parameters:
    client_id:
        type: string
        description: The unique ID of the client sending the request.
    timeout_sec:
        type: number
        description: Requested timeout in seconds.
```

B. `sentPayload` / `receivedPayload`

Defines the structure of the exchanged payload (datagram).

| Property   | Description                                                                                  |
|:-----------|:---------------------------------------------------------------------------------------------|
| type       | Payload type (json, binary, text).                                                           |
| endianness | (Required if type: binary) Byte order (big-endian, little-endian, middle-endian).            |
| body       | Structure of the payload body (schema definition).                                           |
| example    | (Nullable) A string containing a payload example.                                            |

Payload body structure (Payload Schema)

| Payload type | Body structure     | Notes                                                    |
|:-------------|:-------------------|:---------------------------------------------------------|
| **text**     | (Nullable)         | Assumes a simple string. Body is null.                   |
| **binary**   | Array of objects   | Each object defines a sequential binary field.           |
| **json**     | Object schema      | Defines the JSON structure (see below).                  |

Binary body details: an array where items are objects with:

- `fieldName`: `string`
- `dataType`: `uint8`, `int16`, `float32`, `string`
- `length`: (if `string`) length as integer
- `encoding`: (if `string`) e.g. "utf-8"

JSON `body` details: Recursive object where keys are property names:

- `type`: `string`, `number`, `boolean`, `array`, `json`
- `items`: (if array) item definition object.
- `properties`: (if json) nested properties definition object.
