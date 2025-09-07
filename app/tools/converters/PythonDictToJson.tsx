'use client';

import { useState } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';
import { FaCopy } from 'react-icons/fa';

/**
 * Attempts to convert a Python dictionary string into a valid JSON string.
 * This is a best-effort conversion that handles common Python syntax differences.
 * @param pythonDictString The input string resembling a Python dictionary.
 * @returns A formatted JSON string.
 * @throws An error if the string cannot be safely converted and parsed.
 */
function convertPythonDictStringToJson(pythonDictString: string): string {
    if (!pythonDictString.trim()) {
        throw new Error('Input is empty.');
    }

    // A series of transformations to make the string JSON-compatible
    const jsonString = pythonDictString
        // 1. Remove Python comments
        .replace(/#.*$/gm, '')
        // 2. Replace Python boolean/null keywords with JSON equivalents
        // Using word boundaries (\b) is crucial to avoid replacing these words inside strings
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        // 3. Replace single quotes with double quotes. This is a common case.
        // Note: This is a simplification and might fail with escaped single quotes within strings.
        // For this tool's purpose, it covers the vast majority of simple dict literals.
        .replace(/'/g, '"')
        // 4. Remove trailing commas before closing braces `}` or brackets `]`
        .replace(/,\s*([}\]])/g, '$1');

    // 5. Attempt to parse the transformed string to validate it's now valid JSON
    const parsedObject = JSON.parse(jsonString);

    // 6. Re-stringify for consistent, pretty formatting
    return JSON.stringify(parsedObject, null, 2);
}

export default function PythonDictToJson() {
    const [inputPython, setInputPython] = useState(
        "{ 'name': 'Toolzen', 'is_awesome': True, 'version': None, }"
    );
    const [outputJson, setOutputJson] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleConvert = () => {
        if (!inputPython.trim()) {
            setError('Input is empty.');
            setOutputJson('');
            return;
        }

        try {
            const jsonString = convertPythonDictStringToJson(inputPython);
            setOutputJson(jsonString);
            setError(null);
        } catch (e) {
            if (e instanceof Error) {
                setError(
                    `Conversion Error: Invalid Python Dict or unsupported syntax. ${e.message}`
                );
            }
            setOutputJson('');
        }
    };

    const handleClear = () => {
        setInputPython('');
        setOutputJson('');
        setError(null);
    };

    return (
        <div className="space-y-4">
            {/* Input and Output Section */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                {/* Input Pane */}
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="python-input"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Input Python Dict:
                    </label>
                    <TextareaInput
                        id="python-input"
                        value={inputPython}
                        onChange={(e) => setInputPython(e.target.value)}
                        placeholder="{ 'name': 'Toolzen', 'is_awesome': True, 'version': None, }"
                        rows={15}
                        className="h-64 md:h-80 min-h-[10rem] font-mono"
                        aria-label="Python Dictionary Input"
                    />
                </div>

                {/* Output Pane */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="json-output"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Output JSON:
                        </label>
                        {outputJson && !error && (
                            <button
                                onClick={() => copyToClipboard(outputJson)}
                                disabled={!outputJson}
                                className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                title="Copy Output"
                                aria-label="Copy  output"
                            >
                                <FaCopy className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <TextareaInput
                        id="json-output"
                        value={outputJson}
                        readOnly
                        placeholder="Valid JSON will appear here..."
                        rows={15}
                        className="h-64 md:h-80 min-h-[10rem] bg-slate-900 border-slate-700 text-green-300 font-mono"
                        aria-label="JSON Output"
                    />
                </div>
            </div>

            {/* Actions and Error Display */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleConvert}>Convert to JSON</Button>
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
