'use client';

import { useState } from 'react';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';
import parseJson from 'json-parse-even-better-errors';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { CopyButton } from '@/components/ui/CopyButton';

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
            const parsed = parseJson(inputJson);
            const formatted = JSON.stringify(parsed, null, 2);
            setOutputJson(formatted);
            setError(null);
        } catch (e) {
            if (e instanceof Error) {
                setError(
                    `Invalid JSON at line ${e.lineNumber}, column ${e.columnNumber}: ${e.message}`
                );
            } else {
                setError(`Invalid JSON: ${e}`);
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
                    <div className="p-3 my-5 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm">
                        {error}
                    </div>
                )}
                <TextareaInput
                    id="json-input"
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
                <Button onClick={handleFormat}>Format & Validate</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {outputJson && (
                <div>
                    <div className="my-5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-300 mb-1">Formatted JSON:</h2>
                        <CopyButton text={outputJson} />
                    </div>
                    <SyntaxHighlighter language="json" style={dracula}>
                        {outputJson}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
}
