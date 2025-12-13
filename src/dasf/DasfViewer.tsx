// src/dasf/DasfViewer.tsx
import React from 'react';
import type {
    DasfDocument,
    DasfEndpoint,
    DasfParameter,
    DasfPayload,
    DasfBinaryBodyItem,
    DasfJsonPayloadProperty,
    DasfJsonPayloadItems
} from './types';

const ParametersView: React.FC<{ params: { [key: string]: DasfParameter } }> = ({ params }) => (
    <div className="endpoint-section">
        <h4>Query Parameters</h4>
        <table>
            <thead>
                <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(params).map(([name, param]) => (
                    <tr key={name}>
                        <td><code>{name}</code></td>
                        <td><code>{param.type}</code></td>
                        <td>{param.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const BinaryPayloadView: React.FC<{ body: DasfBinaryBodyItem[] }> = ({ body }) => (
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
                    <td><code>{item.fieldName}</code></td>
                    <td><code>{item.dataType}</code></td>
                    <td>{item.length ?? 'N/A'}</td>
                    <td>{item.encoding ?? 'N/A'}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const JsonPayloadView: React.FC<{ data: { [key: string]: DasfJsonPayloadProperty } | DasfJsonPayloadItems, level?: number }> = ({ data, level = 0 }) => {
    const renderProperties = (props: { [key: string]: DasfJsonPayloadProperty } | DasfJsonPayloadItems) => {
        if ('type' in props && typeof props.type !== "object") { // It's a DasfJsonPayloadItems
            return <div style={{ paddingLeft: `${level * 20}px` }}>Items: <code>{props.type}</code></div>;
        }

        return (
            <ul style={{ paddingLeft: `${level * 20}px`, listStyle: 'none' }}>
                {Object.entries(props).map(([key, prop]) => (
                    <li key={key}>
                        <code>{key}</code>: <strong>{prop.type}</strong>
                        {prop.properties && <JsonPayloadView data={prop.properties} level={level + 1} />}
                        {prop.items && <JsonPayloadView data={prop.items} level={level + 1} />}
                    </li>
                ))}
            </ul>
        );
    };

    return renderProperties(data);
};


const PayloadView: React.FC<{ title: string, payload: DasfPayload }> = ({ title, payload }) => (
    <div className="endpoint-section">
        <h4>{title}</h4>
        <p><strong>Type:</strong> <code>{payload.type}</code></p>
        {payload.endianness && <p><strong>Endianness:</strong> <code>{payload.endianness}</code></p>}
        
        {payload.body && (
            <>
                <h5>Body</h5>
                {payload.type === 'binary' && <BinaryPayloadView body={payload.body as DasfBinaryBodyItem[]} />}
                {payload.type === 'json' && <JsonPayloadView data={payload.body as { [key: string]: DasfJsonPayloadProperty }} />}
                {payload.type === 'text' && <p>Text-based payload (no specific body structure).</p>}
            </>
        )}

        {payload.example && (
            <>
                <h5>Example</h5>
                <pre><code>{payload.example}</code></pre>
            </>
        )}
    </div>
);

const EndpointView: React.FC<{ path: string, endpoint: DasfEndpoint }> = ({ path, endpoint }) => {
    return (
        <article className="endpoint-view">
            <h3><code>{path}</code></h3>
            <p>{endpoint.description}</p>
            <div className="ports-info">
                <span><strong>Takeoff Port (Client):</strong> {endpoint.takeoffPort}</span>
                <span><strong>Landing Port (Server):</strong> {endpoint.landingPort}</span>
            </div>

            {endpoint.parameters && <ParametersView params={endpoint.parameters} />}
            {endpoint.sentPayload && <PayloadView title="Sent Payload" payload={endpoint.sentPayload} />}
            {endpoint.receivedPayload && <PayloadView title="Received Payload" payload={endpoint.receivedPayload} />}
        </article>
    );
};

const DasfViewer: React.FC<{ doc: DasfDocument, title: string }> = ({ doc, title }) => {
    return (
        <main className="dasf-viewer">
            <h2>{title ?? "DASF Documentation"}</h2>
            {Object.entries(doc).map(([path, endpoint]) => (
                <EndpointView key={path} path={path} endpoint={endpoint} />
            ))}
        </main>
    );
};

export default DasfViewer;
