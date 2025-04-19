'use client';

import { useState, useCallback } from 'react';
import { githubDarkTheme, JsonEditor } from 'json-edit-react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';

const tryParseJson = (jsonString: string): { data: any; error: string | null } => {
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
    } catch (e: any) {
        return { data: null, error: `Invalid JSON: ${e.message}` };
    }
};

export default function JsonEditorTool() {
    const [rawInput, setRawInput] = useState<string>('');
    const [jsonData, setJsonData] = useState<object | any[] | null>(null); // State to hold the parsed data for the editor
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
    const handleEditorChange = useCallback((newData: any) => {
        // The library gives us the already parsed new data
        setJsonData(newData);
        // Optionally update the raw input as well, formatted
        try {
            setRawInput(JSON.stringify(newData, null, 2));
            setError(null); // Clear error if editing makes it valid
        } catch (e: any) {
            // Should not happen if editor provides valid data, but good practice
            setError(`Error stringifying editor data: ${e.message}`);
        }
    }, []); // No dependencies needed if only using setters

    return (
        <div className="space-y-4">
            {/* Input Area */}
            <div>
                <label
                    htmlFor="json-input-raw"
                    className="block text-sm font-medium text-slate-300 mb-1"
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
            {jsonData !== null && ( // Only render editor if data is loaded and valid
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Interactive Editor:
                    </label>
                    <div className="p-1 border border-slate-600 rounded-md bg-slate-800">
                        {/*
                Apply dark theme styles if needed. json-edit-react might pick up
                some base styles, but explicit theming might require custom CSS
                or checking library options. The wrapper div helps scope styles.
                The `key` prop is used to force a re-initialization when new
                data is loaded via the "Load" button.
              */}
                        <JsonEditor
                            data={jsonData}
                            key={editorKey} // Force re-render on load
                            setData={handleEditorChange}
                            theme={githubDarkTheme}
                        />
                    </div>
                </div>
            )}
            {jsonData === null && !error && (
                <div className="p-3 bg-slate-700 border border-slate-600 text-slate-400 rounded-md text-sm text-center">
                    Paste JSON above and click "Load into Editor" to begin.
                </div>
            )}
        </div>
    );
}
