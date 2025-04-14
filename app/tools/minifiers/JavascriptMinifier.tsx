'use client';
import { useState, useCallback } from 'react';
import { js_minify } from 'js-minify'; // Check if this import works directly
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

export default function JavascriptMinifier() {
    const [jsInput, setJsInput] = useState('');
    const [minifiedOutput, setMinifiedOutput] = useState('');
    const [error, setError] = useState('');
    const [copyStatus, copy] = useCopyToClipboard();

    const handleMinify = useCallback(() => {
        setError('');
        if (!jsInput.trim()) {
            setMinifiedOutput('');
            return;
        }
        try {
            // Note: js-minify might be basic or have limitations in browser
            const result = js_minify(jsInput);
            setMinifiedOutput(result);
        } catch (err: any) {
            setError(
                `Minification failed: ${err.message || 'Error during processing. May not support all JS features.'}`
            );
            console.error('JS Minify Error:', err);
            setMinifiedOutput('');
        }
    }, [jsInput]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <label
                    htmlFor="js-minify-input"
                    className="block text-sm font-medium text-slate-300"
                >
                    JavaScript Input:
                </label>
                <TextareaInput
                    id="js-minify-input"
                    value={jsInput}
                    onChange={(e) => setJsInput(e.target.value)}
                    placeholder="Paste JavaScript code here..."
                    rows={15}
                    className="font-mono text-xs"
                />
                <Button onClick={handleMinify}>Minify JavaScript</Button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <p className="text-xs text-slate-500">
                    Note: Uses a basic JS minifier. Complex code or modern syntax might cause
                    issues.
                </p>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="js-minify-output"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Minified Output:
                    </label>
                    <button
                        onClick={() => copy(minifiedOutput)}
                        disabled={!minifiedOutput}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        title="Copy Minified JS"
                        aria-label="Copy Minified JS"
                    >
                        <FaCopy className="w-4 h-4" />
                    </button>
                </div>
                <TextareaInput
                    id="js-minify-output"
                    value={minifiedOutput}
                    readOnly
                    rows={15}
                    placeholder="Minified JS will appear here..."
                    className="font-mono text-xs bg-slate-900 border-slate-700"
                />
                {copyStatus === 'copied' && (
                    <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
                )}
            </div>
        </div>
    );
}
