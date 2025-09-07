'use client';

import { useState } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { Copy as FaCopy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

/**
 * Converts a valid JSON string into a Python dictionary string.
 * This is a safe, client-side only transformation.
 * @param jsonString The input JSON string.
 * @returns A string formatted as a Python dictionary.
 */
function convertJsonToPythonDictString(jsonString: string): string {
    // First, parse and re-stringify to ensure it's valid and formatted consistently.
    const parsedObject = JSON.parse(jsonString);
    const formattedJsonString = JSON.stringify(parsedObject, null, 2); // 2-space indentation

    // Perform the direct string replacements for Python syntax.
    // Using word boundaries (\b) prevents replacing these words if they appear inside a string.
    return formattedJsonString
        .replace(/\btrue\b/g, 'True')
        .replace(/\bfalse\b/g, 'False')
        .replace(/\bnull\b/g, 'None');
}

export default function JsonToPythonDict() {
    const [inputJson, setInputJson] = useState(
        '{ "name": "Toolzen", "isAwesome": true, "version": 1 }'
    );
    const [outputPython, setOutputPython] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleConvert = () => {
        if (!inputJson.trim()) {
            setError('Input JSON is empty.');
            setOutputPython('');
            return;
        }

        try {
            const pythonDictString = convertJsonToPythonDictString(inputJson);
            setOutputPython(pythonDictString);
            setError(null);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Invalid JSON: ${e.message}`);
            }
            setOutputPython('');
        }
    };

    const handleClear = () => {
        setInputJson('');
        setOutputPython('');
        setError(null);
    };

    return (
        <div className="space-y-4">
            {/* Input and Output Section */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                {/* Input Pane */}
                <div className="flex-1 min-w-0">
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
                        placeholder='{ "name": "Toolzen", "isAwesome": true, "version": null }'
                        rows={15}
                        className="h-64 md:h-80 min-h-[10rem] font-mono"
                        aria-label="JSON Input"
                    />
                </div>

                {/* Output Pane */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="python-output"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Output Python Dict:
                        </label>
                        {outputPython && !error && (
                            <button
                                onClick={() => copyToClipboard(outputPython)}
                                disabled={!outputPython}
                                className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                title="Copy Output"
                                aria-label="Copy  output"
                            >
                                <FaCopy className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <TextareaInput
                        id="python-output"
                        value={outputPython}
                        readOnly
                        placeholder="Python dictionary will appear here..."
                        rows={15}
                        className="h-64 md:h-80 min-h-[10rem] bg-slate-900 border-slate-700 text-green-300 font-mono"
                        aria-label="Python Dictionary Output"
                    />
                </div>
            </div>

            {/* Actions and Error Display */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleConvert}>Convert to Python Dict</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {error && (
                <div
                    className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                    role="alert"
                >
                    {error}
                </div>
            )}
        </div>
    );
}
