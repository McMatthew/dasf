import CodeMirror from '@uiw/react-codemirror';
import type {FC} from 'react';
import { createTheme } from '@uiw/codemirror-themes';
import { json } from '@codemirror/lang-json';
import { tags as t } from '@lezer/highlight';

interface DasfEditorProps {
    value: string;
    onChange: (value: string) => void;
}
const myTheme = createTheme({
    theme: 'dark',
    settings: {
        background: '#221f23',
        backgroundImage: '',
        foreground: '#ffffff',
        caret: '#8126d9',
        selection: '#46216a',
        selectionMatch: '#842886',
        gutterBackground: '#2c1b3c',
        gutterForeground: '#665478',
        gutterBorder: '#dddddd',
        gutterActiveForeground: '',
        lineHighlight: '#46216a',
    },
    styles: [
        { tag: t.comment, color: '#787b80' },
        { tag: t.lineComment, color: '#828282' },
        { tag: t.definition(t.typeName), color: '#194a7b' },
        { tag: t.typeName, color: '#194a7b' },
        { tag: t.tagName, color: '#6c7cfe' },
        { tag: t.variableName, color: '#6b7cff' },
        { tag: t.propertyName, color: '#b66cfe' },
        { tag: t.string, color: '#42aea1' },
        { tag: t.number, color: '#2460ff' },
    ],
});


const DasfEditor: FC<DasfEditorProps> = ({ value, onChange }) => {
    return (
        <CodeMirror
            theme={myTheme}
            extensions={[json()]}
            value={value}
            height="100vh"
            onChange={onChange}
        />
    );
};

export default DasfEditor;
