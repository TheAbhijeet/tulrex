'use client';

import { useState } from 'react';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';

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
            const parsed = JSON.parse(inputJson);
            const formatted = JSON.stringify(parsed, null, 2); // 2 spaces indentation
            setOutputJson(formatted);
            setError(null); // Clear previous errors
        } catch (e: any) {
            setError(`Invalid JSON: ${e.message}`);
            setOutputJson(''); // Clear output on error
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
                <TextareaInput
                    id="json-input"
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    placeholder="Paste your JSON here..."
                    rows={10}
                />
            </div>

            <div className="flex space-x-2">
                <Button onClick={handleFormat}>Format & Validate</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {outputJson && !error && (
                <div>
                    <p className="text-sm font-medium text-slate-300 mb-1">Formatted JSON:</p>
                    <pre className="p-3 bg-slate-900 border border-slate-700 rounded-md overflow-x-auto text-sm text-green-300 whitespace-pre-wrap break-words">
                        <code>{outputJson}</code>
                    </pre>
                </div>
            )}
        </div>
    );
}
