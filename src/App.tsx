import {useMemo} from 'react';
import DasfEditor from './dasf/DasfEditor';
import DasfViewer from './dasf/DasfViewer';
import {DASFParser} from './dasf/parser';
import type {DasfDocument} from './dasf/types';
import lettering from './assets/lettering.svg';
import './App.css';
import {Button, FileButton, Flex, Stack} from "@mantine/core";
import {getHotkeyHandler, useDebouncedValue, useLocalStorage} from "@mantine/hooks";

function App() {
    const [rawText, setRawText] = useLocalStorage<string>({
        key: 'dasf-rawText',
        defaultValue: '',
    });
    const [debouncedText] = useDebouncedValue(rawText, 500);

    const { parsedDoc, error } = useMemo(() => {
        if (!debouncedText) {
            return { parsedDoc: { doc: null, title: null } as { doc: DasfDocument | null; title: string | null }, error: null as string | null };
        }
        try {
            const parser = new DASFParser();
            const result = parser.parse(debouncedText);
            return { parsedDoc: result, error: null as string | null };
        } catch (err: unknown) {
            let message = 'Unknown error';
            if (typeof err === 'string') {
                message = err;
            } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
                message = err.message;
            } else {
                try {
                    message = String(err);
                } catch {
                    message = 'Unknown error';
                }
            }
            return { parsedDoc: { doc: null, title: null }, error: message };
        }
    }, [debouncedText]);

    const handleFileChange = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setRawText(text);
            };
            reader.readAsText(file);
        }
    };

    const handleDownload = () => {
        const nameBase = (parsedDoc.title || 'document').replace(/[^\w-]+/g, '_');
        const filename = `${nameBase}.dasf`;
        const content = rawText || '';
        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    return (
        <div onKeyDown={getHotkeyHandler([
            ['ctrl + S', () => {
                handleDownload()
            }, {preventDefault: true}]
        ])} className="app-container">
            <Stack gap={0} className="editor-pane">
                <Flex justify={"space-between"} p={10}>
                    <FileButton onChange={handleFileChange} accept=".dasf">
                        {(props) => <Button {...props}>Upload .dasf</Button>}
                    </FileButton>
                    <Button disabled={!rawText} onClick={handleDownload} variant={'subtle'}>
                        Download
                    </Button>
                </Flex>
                <DasfEditor value={rawText} onChange={setRawText}/>
            </Stack>
            <div className="viewer-pane">
                {error && <div className="error-message">{error}</div>}
                {parsedDoc.doc ? <DasfViewer doc={parsedDoc.doc} title={parsedDoc.title || 'DASF Document'}/> :
                    <div className={'center'}>
                        <div>
                            <img alt={'Logo DASF'} src={lettering}/>
                            <div className={'courtesy-message'}>Apri un file per iniziare</div>
                        </div>
                    </div>}
            </div>
        </div>
    );
}

export default App;