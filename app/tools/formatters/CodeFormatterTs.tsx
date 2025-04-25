/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Fix linting issues while fixing this file
'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-okaidia.css';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

// Prettier loading setup (as fixed above)
let prettierInstance: any = null;
let babelPlugin: any = null;

export default function CodeFormatterTs() {
    const [inputCode, setInputCode] = useState('');
    const [formattedCode, setFormattedCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [copyStatus, copy] = useCopyToClipboard();
    const isMounted = useRef(true);

    // loadPrettier function (as fixed in step 1)
    const loadPrettier = useCallback(async () => {
        // Only need prettier and babel plugin now
        if (isLoading) return;
        const needsLoading = !prettierInstance || !babelPlugin;
        if (!needsLoading) return;

        setIsLoading(true);
        setError('');
        try {
            if (!prettierInstance) {
                const mod = await import('prettier/standalone');
                prettierInstance = mod.default || mod;
            }
            if (!babelPlugin) {
                const mod = await import('prettier/plugins/babel');
                babelPlugin = mod.default || mod;
            }
        } catch (err: any) {
            console.error('Failed to load Prettier/plugins:', err);
            if (isMounted.current) {
                setError(`Failed to load formatter dependencies: ${err.message}`);
                prettierInstance = null;
                babelPlugin = null;
            }
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [isLoading]);

    useEffect(() => {
        isMounted.current = true;
        loadPrettier();
        return () => {
            isMounted.current = false;
        };
    }, [loadPrettier]);

    const handleFormat = useCallback(async () => {
        setError('');
        if (!inputCode.trim()) {
            setFormattedCode('');
            return;
        }
        // Check only for prettier instance and babel plugin
        if (isLoading || isFormatting || !prettierInstance || !babelPlugin) {
            setError('Formatter not ready or busy.');
            if (!isLoading) loadPrettier();
            return;
        }

        setIsFormatting(true);
        try {
            const result = await prettierInstance.format(inputCode, {
                parser: 'babel-ts',
                plugins: [babelPlugin],
                semi: true,
                singleQuote: true,
                tabWidth: 2,
                trailingComma: 'es5',
            });
            if (isMounted.current) setFormattedCode(result);
        } catch (err) {
            console.error('Prettier format error:', err);
            if (isMounted.current) {
                if (err instanceof Error) {
                    setError(`Formatting failed: ${err.message}`);
                }
                setFormattedCode('');
            }
        } finally {
            if (isMounted.current) setIsFormatting(false);
        }
    }, [inputCode, isLoading, isFormatting, loadPrettier]);

    const editorStyle = {
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: '0.8125rem', // Corresponds roughly to text-xs
        minHeight: '24rem', // Adjust as needed (~rows=18)
        outline: 0,
        border: '1px solid #334155', // slate-700
        borderRadius: '0.375rem', // rounded-md
        backgroundColor: '#1e293b', // slate-800 (Input background)
        caretColor: '#e2e8f0', // slate-200 (Text color)
        overflow: 'auto', // Ensure scrollbars appear within the editor div
    };
    const outputEditorStyle = {
        ...editorStyle,
        backgroundColor: '#0f172a', // slate-900 (Output background)
    };

    // Highlighting function
    const highlight = (code: string) =>
        Prism.highlight(code, Prism.languages.typescript, 'typescript');

    return (
        <div className="space-y-4">
            <Button
                onClick={handleFormat}
                disabled={isLoading || isFormatting || !inputCode.trim()}
                className="w-full sm:w-auto"
            >
                {isLoading
                    ? 'Loading Formatter...'
                    : isFormatting
                      ? 'Formatting...'
                      : 'Format TypeScript'}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label
                        htmlFor="ts-format-input"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Input TypeScript:
                    </label>
                    {/* Use Editor component */}
                    <div className="relative overflow-hidden rounded-md border border-slate-700 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500">
                        <Editor
                            value={inputCode}
                            onValueChange={(code) => setInputCode(code)}
                            highlight={highlight}
                            padding={10}
                            style={editorStyle}
                            textareaId="ts-format-input"
                            aria-label="TypeScript Input"
                            className="code-editor-input" // Add class for potential specific styling
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label
                            htmlFor="ts-format-output"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Formatted Output:
                        </label>
                        <button
                            onClick={() => copy(formattedCode)}
                            disabled={!formattedCode || isLoading || isFormatting}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Copy Formatted Code"
                            aria-label="Copy Formatted Code"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Use Editor component for output */}
                    <div className="relative overflow-hidden rounded-md border border-slate-700">
                        <Editor
                            value={formattedCode}
                            onValueChange={() => {}} // Read-only, no update needed
                            highlight={highlight}
                            padding={10}
                            style={outputEditorStyle}
                            readOnly={true}
                            textareaId="ts-format-output"
                            aria-label="Formatted TypeScript Output"
                            className="code-editor-output" // Add class for potential specific styling
                        />
                    </div>
                    {copyStatus === 'copied' && (
                        <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
                    )}
                </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <p className="text-xs text-slate-500">
                Note: Uses Prettier for formatting. Initial load may take a moment.
            </p>
        </div>
    );
}
