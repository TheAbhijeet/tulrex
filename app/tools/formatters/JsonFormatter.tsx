'use client';

import { useState } from 'react';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { CopyButton } from '@/components/ui/CopyButton';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function JsonFormatter() {
    const [inputJson, setInputJson] = useState('');
    const [outputJson, setOutputJson] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleFormat = () => {
        if (!inputJson.trim()) {
            setError('Input JSON is empty.');
            setOutputJson('');
            return;
        }
        try {
            // const parsed = parseJson(inputJson);
            const parsed = JSON.parse(inputJson);
            const formatted = JSON.stringify(parsed, null, 2);
            setOutputJson(formatted);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                // setError(
                //     `Invalid JSON at line ${e.lineNumber}, column ${e.columnNumber}: ${e.message}`
                // );
                setError(`Invalid JSON: ${err.message}`);
            } else {
                setError(`Invalid JSON: ${err}`);
            }
            setOutputJson('');
        }
    };

    const handleClear = () => {
        setInputJson('');
        setOutputJson('');
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="json-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Input JSON:
                </label>
                {error && (
                    <div
                        id="error"
                        className="p-3 my-5 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                    >
                        {error}
                    </div>
                )}
                <TextareaInput
                    id="input"
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    placeholder="Paste your JSON here..."
                    rows={10}
                />
                {/* <CodeEditor
        initialValue={inputJson}
        language="json"
        onChange={(newValue) => setInputJson(newValue)}
        placeholder="Paste your JSON here..."
        aria-label="JSON editor"
        id="json-input"
      /> */}
            </div>

            <div className="flex space-x-2">
                <Button id="format" onClick={handleFormat}>
                    Format & Validate
                </Button>
                <Button id="clear" onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {outputJson && (
                <div>
                    <div className="my-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-300 mb-1">Formatted JSON:</h2>
                        <CopyButton text={outputJson} />
                    </div>
                    <SyntaxHighlighter id="output" language="json" style={dracula}>
                        {outputJson}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
}
