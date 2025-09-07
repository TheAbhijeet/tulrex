'use client';

import { useState, useCallback } from 'react';
import { githubDarkTheme, JsonEditor } from 'json-edit-react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { JSONValue } from '@/types/common';
import { isJsonValue } from '@/lib/utils';

const tryParseJson = (jsonString: string): { data: JSONValue; error: string | null } => {
    if (!jsonString.trim()) {
        return { data: {}, error: null }; // Allow empty input, default to empty object
    }
    try {
        const data = JSON.parse(jsonString);
        // Basic check if it's an object or array (most common root types)
        if (typeof data !== 'object' || data === null) {
            return { data: null, error: 'Input must be a valid JSON object or array.' };
        }
        return { data, error: null };
    } catch (e) {
        if (e instanceof Error) {
            return { data: null, error: `Invalid JSON: ${e.message}` };
        } else {
            return { data: null, error: `Invalid JSON: ${e}` };
        }
    }
};

export default function JsonEditorTool() {
    const [rawInput, setRawInput] = useState<string>('');
    const [jsonData, setJsonData] = useState<JSONValue | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editorKey, setEditorKey] = useState<number>(0); // Key to force re-render

    const handleLoadJson = () => {
        const { data, error: parseError } = tryParseJson(rawInput);
        if (parseError) {
            setError(parseError);
            setJsonData(null); // Clear editor data on error
        } else {
            setError(null);
            setJsonData(data);
            setEditorKey((prev) => prev + 1); // Change key to force editor update with new data
        }
    };

    const handleClear = () => {
        setRawInput('');
        setJsonData(null);
        setError(null);
        setEditorKey((prev) => prev + 1); // Reset editor view
    };

    // Callback from JsonEditor when data is changed internally
    const handleEditorChange = useCallback((newData: unknown) => {
        if (!isJsonValue(newData)) {
            return setError('Invalid JSON data');
        }

        // The library gives us the already parsed new data
        setJsonData(newData);
        try {
            setRawInput(JSON.stringify(newData, null, 2));
            setError(null); // Clear error if editing makes it valid
        } catch (e) {
            if (e instanceof Error) {
                setError(`Error stringifying editor data: ${e.message}`);
            } else {
                setError(`Error stringifying editor data: ${e}`);
            }
            console.error(e);
        }
    }, []);
    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="json-input-raw"
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    Paste JSON String Here:
                </label>
                <TextareaInput
                    id="json-input-raw"
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder='{ "key": "value", "number": 123 }'
                    rows={8}
                    aria-label="Raw JSON Input"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleLoadJson}>Load into Editor</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear All
                </Button>
            </div>

            {/* Error Display */}
            {error && (
                <div
                    className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {/* JSON Editor */}
            {jsonData !== null && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Interactive Editor:
                    </label>
                    <div className="p-1 border border-gray-600 rounded-md bg-gray-800">
                        <JsonEditor
                            data={jsonData}
                            key={editorKey}
                            setData={handleEditorChange}
                            theme={githubDarkTheme}
                        />
                    </div>
                </div>
            )}
            {jsonData === null && !error && (
                <div className="p-3 bg-gray-700 border border-gray-600 text-gray-400 rounded-md text-sm text-center">
                    Paste JSON above and click "Load into Editor" to begin.
                </div>
            )}
        </div>
    );
}
