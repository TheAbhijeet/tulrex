'use client';

import { useState } from 'react';
import { Copy as FaCopy } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';

export default function UrlCoder() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, copy] = useCopyToClipboard(); // Use the hook

    const handleEncode = () => {
        try {
            setOutputText(encodeURIComponent(inputText));
            setError(null);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Encoding error: ${e.message}`);
            } else {
                setError(`Encoding error: ${e}`);
            }
            console.error(`Encoding error: ${e}`);
            setOutputText('');
        }
    };

    const handleDecode = () => {
        try {
            setOutputText(decodeURIComponent(inputText));
            setError(null);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Decoding error: ${e.message}`);
            } else {
                setError(`Decoding error: ${e}`);
            }
            console.error(`Encoding error: ${e}`);
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
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-300 mb-1">
                    Input Text / URL Component:
                </label>
                <TextareaInput
                    id="url-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text or paste URL component..."
                    rows={6}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleEncode}>Encode URI Component</Button>
                <Button onClick={handleDecode}>Decode URI Component</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {outputText && !error && (
                <div>
                    <label
                        htmlFor="url-output"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Output:
                    </label>
                    <div className="relative">
                        <TextareaInput
                            id="url-output"
                            value={outputText}
                            readOnly
                            rows={6}
                            className="bg-gray-900 border-gray-700 text-gray-200 pr-10" // Add padding for the button
                        />
                        <button
                            onClick={() => copy(outputText)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                            title="Copy to Clipboard"
                            aria-label="Copy output to clipboard"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                    </div>
                    {copyStatus === 'copied' && (
                        <p className="text-xs text-green-400 mt-1">Copied!</p>
                    )}
                    {copyStatus === 'error' && (
                        <p className="text-xs text-red-400 mt-1">Copy failed!</p>
                    )}
                </div>
            )}
        </div>
    );
}
