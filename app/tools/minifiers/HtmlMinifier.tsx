'use client';
import { useState, useCallback } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { Copy as FaCopy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

const basicMinifyHtml = (html: string): string => {
    return (
        html
            // remove HTML comments but keep IE conditional comments
            .replace(/<!--(?!\[if|\<!\[endif)(.|\s)*?-->/g, '')
            // collapse multiple spaces/tabs/newlines into one
            .replace(/\s{2,}/g, ' ')
            // remove spaces between tags
            .replace(/>\s+</g, '><')
            // trim leading/trailing whitespace
            .trim()
            // remove spaces around attribute equals
            .replace(/\s*=\s*(['"]?)(.*?)\1/g, '="$2"')
            // remove empty attributes (e.g. class="", id="")
            .replace(/\s+\w+=""/g, '')
            // remove optional closing tags (safe in HTML5)
            .replace(/<\/(li|tr|th|td|p|option)>/gi, '')
    );
};

export default function HtmlMinifier() {
    const [htmlInput, setHtmlInput] = useState('');
    const [minifiedOutput, setMinifiedOutput] = useState('');
    const [error, setError] = useState('');

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
                    className="block text-sm font-medium text-gray-300"
                >
                    HTML Input:
                </label>
                <TextareaInput
                    id="html-minify-input"
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="Paste HTML code here..."
                    rows={15}
                    className=" text-sm"
                />
                <Button onClick={handleMinify}>Minify HTML</Button>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="html-minify-output"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Minified Output:
                    </label>
                    <button
                        onClick={() => copyToClipboard(minifiedOutput)}
                        disabled={!minifiedOutput}
                        className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                    className=" text-sm bg-gray-800 border-gray-700"
                />
            </div>
        </div>
    );
}
