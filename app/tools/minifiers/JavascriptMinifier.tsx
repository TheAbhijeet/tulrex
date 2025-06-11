'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';

import { minify as terserMinify } from 'terser';

const exampleJsCode = `// Paste your JavaScript code here

function greet(name) {
  // This is a comment that will be removed
  const message = "Hello, " + name + "!";
  console.log(message); // This console.log might be kept or removed based on options
  return message;
}

const longVariableName = "This is a very long variable name";
const anotherLongVariable = "This will also be mangled";

if (true) {
    console.log(longVariableName, anotherLongVariable);
}

greet("World");`;

export default function JavascriptMinifierReactCM() {
    const [inputCode, setInputCode] = useState(exampleJsCode);
    const [outputCode, setOutputCode] = useState('');
    const [error, setError] = useState<string | null>(null); // No type for error
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [dropConsole, setDropConsole] = useState(false);

    const handleMinify = useCallback(async () => {
        if (!inputCode.trim()) {
            setError('Input JavaScript is empty.');
            setOutputCode('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputCode('');
        setCopied(false);

        try {
            const result = await terserMinify(inputCode, {
                mangle: {
                    toplevel: true,
                },
                compress: {
                    drop_console: dropConsole,
                    passes: 2,
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                },
                format: {
                    comments: false,
                },
                sourceMap: false,
            });

            if (typeof result.code === 'string') {
                setOutputCode(result.code);
            } else {
                setError('Minification failed to produce code.');
                setOutputCode('');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(`Minification failed: ${e.message}`);
            }
            console.error('Minification Exception:', e);
            setOutputCode('');
        } finally {
            setIsLoading(false);
        }
    }, [inputCode, dropConsole]);

    const handleClear = () => {
        setInputCode('');
        setOutputCode('');
        setError(null);
        setCopied(false);
    };

    const handleCopyToClipboard = async () => {
        if (!outputCode) return;
        try {
            await navigator.clipboard.writeText(outputCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy minified code. See console for details.');
        }
    };

    const onInputChange = useCallback((value: string) => {
        setInputCode(value);
    }, []);

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Options */}
            <div className="p-3 border border-slate-700 rounded-md bg-slate-800/50">
                <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dropConsole}
                        onChange={(e) => setDropConsole(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-cyan-600 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                    />
                    <span>Remove `console.*` calls</span>
                </label>
            </div>

            {/* Editor and Output Panes */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 h-[calc(100vh-350px)] md:h-[60vh] min-h-[400px] md:min-h-[450px]">
                {/* Input Pane (CodeMirror) */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <label
                        htmlFor="js-input-cm"
                        className="block text-sm font-medium text-slate-300 mb-1 select-none"
                    >
                        Input JavaScript:
                    </label>
                    <div className="flex-grow relative border border-slate-700 rounded-md overflow-hidden bg-[#282a36]">
                        <CodeMirror
                            id="js-input-cm"
                            value={inputCode}
                            height="100%" // Takes height of its parent
                            extensions={[javascript({ jsx: true, typescript: false })]}
                            theme={dracula}
                            onChange={onInputChange}
                            basicSetup={{
                                lineNumbers: true,
                                foldGutter: true,
                                highlightActiveLineGutter: true,
                                autocompletion: true,
                                highlightActiveLine: true,
                                highlightSelectionMatches: true,
                                closeBrackets: true,
                                syntaxHighlighting: true,
                            }}
                            style={{ fontSize: '0.825rem' }} // Tailwind text-sm is 0.875rem, this is a bit smaller
                        />
                    </div>
                </div>

                {/* Output Pane (Readonly Textarea) */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="js-output"
                            className="block text-sm font-medium text-slate-300 select-none"
                        >
                            Minified JavaScript:
                        </label>
                        {outputCode && !error && (
                            <Button
                                onClick={handleCopyToClipboard}
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </div>
                    <textarea
                        id="js-output"
                        value={outputCode}
                        readOnly
                        placeholder="Minified JavaScript will appear here..."
                        className="w-full flex-grow p-2.5 border border-slate-600 rounded-md bg-slate-900 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none font-mono text-xs leading-relaxed"
                        aria-label="Minified JavaScript Output"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleMinify} disabled={isLoading || !inputCode.trim()}>
                    {isLoading ? 'Minifying...' : 'Minify JavaScript'}
                </Button>
                <Button onClick={handleClear} variant="secondary" disabled={isLoading}>
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
