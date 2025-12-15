import CodeMirror from '@uiw/react-codemirror';
import type {FC} from 'react';
import { createTheme } from '@uiw/codemirror-themes';
import { json } from '@codemirror/lang-json';
import { tags as t } from '@lezer/highlight';
import {Box} from "@mantine/core";

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
        caret: 'var(--mantine-color-iris-6)',
        gutterBackground: 'var(--mantine-color-dark-9)',
        gutterForeground: 'var(--mantine-color-gray-6)',
        gutterBorder: '#dddddd',
        gutterActiveForeground: '',
        lineHighlight: 'var(--mantine-color-iris-10)',
    },
    styles: [
        { tag: t.comment, color: '#787b80' },
        { tag: t.lineComment, color: '#828282' },
        { tag: t.definition(t.typeName), color: 'var(--mantine-color-cobalt-9)' },
        { tag: t.typeName, color: 'var(--mantine-color-cobalt-9)' },
        { tag: t.tagName, color: 'var(--mantine-color-cobalt-3)' },
        { tag: t.variableName, color: 'var(--mantine-color-cobalt-4)' },
        { tag: t.propertyName, color: 'var(--mantine-color-iris-4)' },
        { tag: t.string, color: 'var(--mantine-color-teal-6)' },
        { tag: t.number, color: 'var(--mantine-color-cobalt-5)' },
    ],
});


const DasfEditor: FC<DasfEditorProps> = ({ value, onChange }) => {
    return (
        <Box style={{overflow: 'auto'}} flex={1}>
            <CodeMirror
                theme={myTheme}
                extensions={[json()]}
                value={value}
                height={'100%'}
                style={{
                    height: '100%',
                }}
                onChange={onChange}
            />
        </Box>
    );
};

export default DasfEditor;
