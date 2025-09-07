'use client';
import { useState, useCallback } from 'react';
import * as csso from 'csso';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { FaCopy } from 'react-icons/fa';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { copyToClipboard } from '@/lib/utils';

export default function CssMinifier() {
    const [cssInput, setCssInput] = useState('');
    const [minifiedOutput, setMinifiedOutput] = useState('');
    const [error, setError] = useState('');

    const handleMinify = useCallback(() => {
        setError('');
        if (!cssInput.trim()) {
            setMinifiedOutput('');
            return;
        }
        try {
            const result = csso.minify(cssInput);
            console.log(result);
            setMinifiedOutput(result.css);
            if (result.css === '') {
                setError('Invalid Input failed to minify CSS');
                setMinifiedOutput(cssInput);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(`Minification failed: ${err.message}`);
            } else {
                setError(`Minification failed: ${err}`);
            }
            console.error('CSSO Error:', err);
            setMinifiedOutput('');
        }
    }, [cssInput]);

    const handleClear = () => {
        setMinifiedOutput('');
        setCssInput('');
        setError('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-md">
            <div className="space-y-3">
                <label
                    htmlFor="css-minify-input"
                    className="block text-sm font-medium text-gray-300"
                >
                    CSS Input:
                </label>

                <CodeMirror
                    value={cssInput}
                    height="330px"
                    id="css-minify-input"
                    extensions={[css()]}
                    className="text-md"
                    onChange={(value) => setCssInput(value)}
                    theme={tokyoNight}
                    basicSetup={{
                        lineNumbers: true,
                    }}
                />
                {error && <p className="text-red-400 text-lg mt-2">{error}</p>}

                <Button onClick={handleMinify}>Minify CSS</Button>
                <Button className="ml-3" variant="secondary" onClick={handleClear}>
                    Clear
                </Button>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="css-minify-output"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Minified Output:
                    </label>
                    <button
                        onClick={() => copyToClipboard(minifiedOutput)}
                        disabled={!minifiedOutput}
                        className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                    className="font-mono text-sm bg-gray-900 border-gray-700 text-md"
                />
            </div>
        </div>
    );
}
