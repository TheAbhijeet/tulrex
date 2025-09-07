'use client';

import { useState } from 'react';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';

export default function Base64Coder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleEncode = () => {
        try {
            if (typeof window !== 'undefined') {
                // Ensure running client-side
                const encoded = window.btoa(unescape(encodeURIComponent(inputText))); // Handle UTF-8 correctly
                setOutputText(encoded);
                setError(null);
            } else {
                setError('Cannot encode on the server.');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(`Encoding error: ${e.message}`);
            } else {
                setError(`Encoding error: ${e}`);
            }
            setOutputText('');
        }
    };

    const handleDecode = () => {
        try {
            if (typeof window !== 'undefined') {
                // Ensure running client-side
                const decoded = decodeURIComponent(escape(window.atob(inputText))); // Handle UTF-8 correctly
                setOutputText(decoded);
                setError(null);
            } else {
                setError('Cannot decode on the server.');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(`Invalid Base64 string or decoding error: ${e.message}`);
            } else {
                setError(`Invalid Base64 string or decoding error: ${e}`);
            }
            setOutputText('');
        }
    };

    const handleClear = () => {
        setInputText('');
        setOutputText('');
        setError(null);
    };

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="base64-input"
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    Input Text / Base64:
                </label>
                {error && (
                    <div
                        id="error"
                        className="p-3 py-10 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                    >
                        {error}
                    </div>
                )}
                <TextareaInput
                    id="base64-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to encode or Base64 to decode..."
                    rows={8}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleEncode}>Encode to Base64</Button>
                <Button onClick={handleDecode}>Decode from Base64</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {outputText && !error && (
                <div>
                    <label
                        htmlFor="base64-output"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Output:
                    </label>
                    <TextareaInput
                        id="base64-output"
                        value={outputText}
                        readOnly
                        rows={8}
                        className="bg-gray-900 border-gray-700 text-gray-200 focus:ring-cyan-500 focus:border-cyan-500" // Slightly different style for readonly output
                    />
                </div>
            )}
        </div>
    );
}
