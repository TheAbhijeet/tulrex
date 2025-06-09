'use client';
import { useState, useCallback } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

const basicMinifyHtml = (html: string): string => {
    return html
        .replace(/<!--.*?-->/gs, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/> </g, '><') // Remove space between tags
        .trim();
};

export default function HtmlMinifier() {
    const [htmlInput, setHtmlInput] = useState('');
    const [minifiedOutput, setMinifiedOutput] = useState('');
    const [error, setError] = useState('');
    const [copyStatus, copy] = useCopyToClipboard();

    const handleMinify = useCallback(() => {
        setError('');
        if (!htmlInput.trim()) {
            setMinifiedOutput('');
            return;
        }
        try {
            const result = basicMinifyHtml(htmlInput);
            setMinifiedOutput(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Minification failed: ${err.message}`);
            } else {
                setError(`Minification failed: ${err}`);
            }
            setMinifiedOutput('');
        }
    }, [htmlInput]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
                <label
                    htmlFor="html-minify-input"
                    className="block text-sm font-medium text-slate-300"
                >
                    HTML Input:
                </label>
                <TextareaInput
                    id="html-minify-input"
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="Paste HTML code here..."
                    rows={15}
                    className="font-mono text-xs"
                />
                <Button onClick={handleMinify}>Minify HTML</Button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="html-minify-output"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Minified Output:
                    </label>
                    <button
                        onClick={() => copy(minifiedOutput)}
                        disabled={!minifiedOutput}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        title="Copy Minified HTML"
                        aria-label="Copy Minified HTML"
                    >
                        <FaCopy className="w-4 h-4" />
                    </button>
                </div>
                <TextareaInput
                    id="html-minify-output"
                    value={minifiedOutput}
                    readOnly
                    rows={15}
                    placeholder="Minified HTML will appear here..."
                    className="font-mono text-xs bg-slate-900 border-slate-700"
                />
                {copyStatus === 'copied' && (
                    <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
                )}
            </div>
        </div>
    );
}
