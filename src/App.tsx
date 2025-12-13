import {useState, useEffect} from 'react';
import DasfEditor from './dasf/DasfEditor';
import DasfViewer from './dasf/DasfViewer';
import {DASFParser} from './dasf/parser';
import type {DasfDocument} from './dasf/types';
import lettering from './assets/lettering.svg';
import './App.css';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function App() {
    const [rawText, setRawText] = useState<string>('');
    const [parsedDoc, setParsedDoc] = useState<{ doc: DasfDocument | null; title: string | null }>({
        doc: null,
        title: null
    });
    const [error, setError] = useState<string | null>(null);

    const debouncedText = useDebounce(rawText, 1000);

    useEffect(() => {
        if (debouncedText) {
            try {
                const parser = new DASFParser();
                const result = parser.parse(debouncedText);
                setParsedDoc(result);
                setError(null);
            } catch (e: any) {
                setError(e.message);
                setParsedDoc({doc: null, title: null});
            }
        } else {
            setParsedDoc({doc: null, title: null});
            setError(null);
        }
    }, [debouncedText]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setRawText(text);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="app-container">
            <div className="editor-pane">
                <div className="file-loader">
                    <input type="file" accept=".dasf" onChange={handleFileChange}/>
                </div>
                <DasfEditor value={rawText} onChange={setRawText}/>
            </div>
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