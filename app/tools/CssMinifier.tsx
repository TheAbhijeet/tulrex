'use client';
import { useState, useCallback } from 'react';
import * as csso from 'csso'; // Check browser compatibility
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

export default function CssMinifier() {
    const [cssInput, setCssInput] = useState('');
    const [minifiedOutput, setMinifiedOutput] = useState('');
    const [error, setError] = useState('');
    const [copyStatus, copy] = useCopyToClipboard();

    const handleMinify = useCallback(() => {
        setError('');
        if (!cssInput.trim()) {
            setMinifiedOutput('');
            return;
        }
        try {
            // Using csso library
            const result = csso.minify(cssInput);
            setMinifiedOutput(result.css);
        } catch (err: any) {
            setError(`Minification failed: ${err.message || 'Invalid CSS?'}`);
            console.error('CSSO Error:', err);
            setMinifiedOutput('');
        }
    }, [cssInput]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <label
                    htmlFor="css-minify-input"
                    className="block text-sm font-medium text-slate-300"
                >
                    CSS Input:
                </label>
                <TextareaInput
                    id="css-minify-input"
                    value={cssInput}
                    onChange={(e) => setCssInput(e.target.value)}
                    placeholder="Paste CSS code here..."
                    rows={15}
                    className="font-mono text-xs"
                />
                <Button onClick={handleMinify}>Minify CSS</Button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="css-minify-output"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Minified Output:
                    </label>
                    <button
                        onClick={() => copy(minifiedOutput)}
                        disabled={!minifiedOutput}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        title="Copy Minified CSS"
                        aria-label="Copy Minified CSS"
                    >
                        <FaCopy className="w-4 h-4" />
                    </button>
                </div>
                <TextareaInput
                    id="css-minify-output"
                    value={minifiedOutput}
                    readOnly
                    rows={15}
                    placeholder="Minified CSS will appear here..."
                    className="font-mono text-xs bg-slate-900 border-slate-700"
                />
                {copyStatus === 'copied' && (
                    <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
                )}
            </div>
        </div>
    );
}
