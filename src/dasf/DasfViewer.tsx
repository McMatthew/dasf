// src/dasf/DasfViewer.tsx
import React from "react";
import type {
  DasfDocument,
  DasfEndpoint,
  DasfParameter,
  DasfPayload,
  DasfBinaryBodyItem,
  DasfJsonPayloadProperty,
  DasfJsonPayloadItems,
  DasfInterface,
} from "./types";

const ParametersView: React.FC<{
  params: { [key: string]: DasfParameter };
}> = ({ params }) => (
  <div className="endpoint-section">
    <h4>Query Parameters</h4>
    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Type</th>
          <th>Description</th>
          <th>Example</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(params).map(([name, param]) => (
          <tr key={name}>
            <td>
              <code>{name}</code>
            </td>
            <td>
              <code>{param.type}</code>
            </td>
            <td>{param.description}</td>
            <td>{param?.example ?? getExampleFromType(param.type)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

function getExampleFromType(type: string) {
  switch (type) {
    case "string":
      return "string";
    case "boolean":
      return "true";
    case "integer":
    case "number":
      return 0;
    default:
      return "-";
  }
}

const BinaryPayloadView: React.FC<{ body: DasfBinaryBodyItem[] }> = ({
  body,
}) => (
  <table>
    <thead>
      <tr>
        <th>Field Name</th>
        <th>Data Type</th>
        <th>Length</th>
        <th>Encoding</th>
      </tr>
    </thead>
    <tbody>
      {body.map((item, index) => (
        <tr key={index}>
          <td>
            <code>{item.fieldName}</code>
          </td>
          <td>
            <code>{item.dataType}</code>
          </td>
          <td>{item.length ?? "N/A"}</td>
          <td>{item.encoding ?? "N/A"}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const resolveInterface = (
  prop: DasfJsonPayloadProperty,
  doc: DasfDocument,
): DasfJsonPayloadProperty => {
  if (typeof prop.type === "string" && prop.type.startsWith("$interfaces.")) {
    const interfacePath = prop.type.split(".").slice(1);
    let resolved: DasfInterface | DasfJsonPayloadProperty | undefined =
      doc.$interfaces;
    for (const key of interfacePath) {
      if (!resolved || typeof resolved !== "object" || !(key in resolved)) {
        console.error(`Could not resolve interface: ${prop.type}`);
        return {
          type: "unresolved",
          description: `Error: Could not resolve ${prop.type}`,
        };
      }
      resolved = resolved[key] as DasfInterface | DasfJsonPayloadProperty;
    }
    return { ...prop, ...(resolved as object) };
  }
  return prop;
};

const JsonPayloadView: React.FC<{
  data: { [key: string]: DasfJsonPayloadProperty } | DasfJsonPayloadItems;
  doc: DasfDocument;
  level?: number;
  resolutionStack?: string[];
}> = ({ data, doc, level = 0, resolutionStack = [] }) => {
  const renderProperties = (
    props:
      | { [key: string]: DasfJsonPayloadProperty | any }
      | DasfJsonPayloadItems,
  ) => {
    // This condition distinguishes the 'items' part of an array from a regular object property map.
    if (
      "type" in props &&
      typeof props.type === "string" &&
      !Object.keys(props).some((k) =>
        ["description", "takeoffPort"].includes(k),
      )
    ) {
      const itemProp = props as DasfJsonPayloadProperty;

      if (
        itemProp.type.startsWith("$interfaces.") &&
        resolutionStack.includes(itemProp.type)
      ) {
        return (
          <div style={{ paddingLeft: `${level * 20}px` }}>
            Items: <code>{itemProp.type}</code>{" "}
            <em style={{ color: "red" }}>(Circular Reference)</em>
          </div>
        );
      }

      const resolvedItems = resolveInterface(itemProp, doc);
      const newStack = itemProp.type.startsWith("$interfaces.")
        ? [...resolutionStack, itemProp.type]
        : resolutionStack;
      // @ts-ignore
      const subProps = resolvedItems.properties || resolvedItems.body;

      return (
        <div style={{ paddingLeft: `${level * 20}px` }}>
          Items: <code>{resolvedItems.type}</code>
          {resolvedItems.description && <em> - {resolvedItems.description}</em>}
          {subProps && (
            <JsonPayloadView
              data={subProps}
              doc={doc}
              level={level + 1}
              resolutionStack={newStack}
            />
          )}
          {resolvedItems.items && (
            <JsonPayloadView
              data={resolvedItems.items}
              doc={doc}
              level={level + 1}
              resolutionStack={newStack}
            />
          )}
        </div>
      );
    }

    let propertiesToRender = { ...props };
    if ("$allOf" in propertiesToRender) {
      const { $allOf, ...rest } = propertiesToRender;
      let mergedProps: { [key: string]: DasfJsonPayloadProperty } = {};

      if (Array.isArray($allOf)) {
        $allOf.forEach((ref: string) => {
          if (typeof ref === "string" && ref.startsWith("$interfaces.")) {
            const interfacePath = ref.split(".").slice(1);
            let current: any = doc.$interfaces;
            for (const key of interfacePath) {
              if (current && typeof current === "object" && key in current) {
                current = current[key];
              } else {
                console.error(`Could not resolve interface for $allOf: ${ref}`);
                current = null;
                break;
              }
            }
            if (current && current.body && typeof current.body === "object") {
              mergedProps = { ...mergedProps, ...current.body };
            }
          }
        });
      }
      propertiesToRender = { ...mergedProps, ...rest };
    }

    return (
      <ul style={{ paddingLeft: `${level * 20}px`, listStyle: "none" }}>
        {Object.entries(propertiesToRender).map(([key, prop]) => {
          if (
            typeof prop.type === "string" &&
            prop.type.startsWith("$interfaces.") &&
            resolutionStack.includes(prop.type)
          ) {
            return (
              <li key={key}>
                <code>{key}</code>: <strong>{prop.type}</strong>
                <em style={{ color: "red" }}> - (Circular Reference)</em>
              </li>
            );
          }

          const resolvedProp = resolveInterface(prop, doc);
          // @ts-ignore
          const subProps = resolvedProp.properties || resolvedProp.body;
          const newStack =
            typeof prop.type === "string" &&
            prop.type.startsWith("$interfaces.")
              ? [...resolutionStack, prop.type]
              : resolutionStack;

          return (
            <li key={key}>
              <code>{key}</code>: <strong>{resolvedProp.type}</strong>
              {resolvedProp.description && (
                <em> - {resolvedProp.description}</em>
              )}
              {subProps && (
                <JsonPayloadView
                  data={subProps}
                  doc={doc}
                  level={level + 1}
                  resolutionStack={newStack}
                />
              )}
              {resolvedProp.items && (
                <JsonPayloadView
                  data={resolvedProp.items}
                  doc={doc}
                  level={level + 1}
                  resolutionStack={newStack}
                />
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return renderProperties(data);
};

const PayloadView: React.FC<{
  title: string;
  payload: DasfPayload;
  doc: DasfDocument;
}> = ({ title, payload, doc }) => (
  <div className="endpoint-section">
    <h4>{title}</h4>
    <p>
      <strong>Type:</strong> <code>{payload.type}</code>
    </p>
    {payload.endianness && (
      <p>
        <strong>Endianness:</strong> <code>{payload.endianness}</code>
      </p>
    )}

    {payload.body && (
      <>
        <h5>Body</h5>
        {payload.type === "binary" && (
          <BinaryPayloadView body={payload.body as DasfBinaryBodyItem[]} />
        )}
        {payload.type === "json" && (
          <JsonPayloadView
            data={payload.body as { [key: string]: DasfJsonPayloadProperty }}
            doc={doc}
          />
        )}
        {payload.type === "text" && (
          <p>Text-based payload (no specific body structure).</p>
        )}
      </>
    )}

    {payload.example && (
      <>
        <h5>Example</h5>
        <pre>
          <code>{payload.example}</code>
        </pre>
      </>
    )}
  </div>
);

const EndpointView: React.FC<{
  path: string;
  endpoint: DasfEndpoint;
  doc: DasfDocument;
}> = ({ path, endpoint, doc }) => {
  return (
    <article className="endpoint-view">
      <h3>
        <code>{path}</code>
      </h3>
      <p>{endpoint.description}</p>
      <div className="ports-info">
        <span>
          <strong>Takeoff Port (Client):</strong> {endpoint.takeoffPort}
        </span>
        <span>
          <strong>Landing Port (Server):</strong> {endpoint.landingPort}
        </span>
      </div>

      {endpoint.parameters && <ParametersView params={endpoint.parameters} />}
      {endpoint.sentPayload && (
        <PayloadView
          title="Sent Payload"
          payload={endpoint.sentPayload}
          doc={doc}
        />
      )}
      {endpoint.receivedPayload && (
        <PayloadView
          title="Received Payload"
          payload={endpoint.receivedPayload}
          doc={doc}
        />
      )}
    </article>
  );
};

const DasfViewer: React.FC<{ doc: DasfDocument; title: string }> = ({
  doc,
  title,
}) => {
  const endpoints = Object.entries(doc).filter(
    ([key]) => key !== "$interfaces",
  );

  return (
    <main className="dasf-viewer">
      <h2>{title ?? "DASF Documentation"}</h2>
      {endpoints.map(([path, endpoint]) => (
        <EndpointView key={path} path={path} endpoint={endpoint} doc={doc} />
      ))}
    </main>
  );
};

export default DasfViewer;
