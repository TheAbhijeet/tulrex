'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { copyToClipboard } from '@/lib/utils';
import { FaCopy } from 'react-icons/fa';

interface HtmlFormatOptions {
    tabWidth: number;
    printWidth: number;
    singleQuote: boolean;
}

const initialOptions: HtmlFormatOptions = {
    tabWidth: 2,
    printWidth: 80,
    singleQuote: false,
};

export default function HtmlFormatter() {
    const [inputHtml, setInputHtml] = useState<string>('');
    const [outputHtml, setOutputHtml] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formatOptions, setFormatOptions] = useState<HtmlFormatOptions>(initialOptions);

    const handleOptionChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormatOptions((prevOptions) => ({
            ...prevOptions,
            [name]:
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : parseInt(value, 10),
        }));
    };

    const handleFormat = useCallback(async () => {
        if (!inputHtml.trim()) {
            setError('Input HTML is empty.');
            setOutputHtml('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputHtml('');

        try {
            // Dynamically import Prettier to keep initial bundle size small
            const prettier = await import('prettier/standalone');
            const parserHtml = await import('prettier/parser-html');

            const formatted = await prettier.format(inputHtml, {
                parser: 'html',
                plugins: [parserHtml],
                ...formatOptions,
            });
            setOutputHtml(formatted);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Invalid HTML or formatting error: ${e.message}`);
            }
            setOutputHtml('');
        } finally {
            setIsLoading(false);
        }
    }, [inputHtml, formatOptions]);

    const handleClear = () => {
        setInputHtml('');
        setOutputHtml('');
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Options */}
            <details className="p-4 border border-slate-700 rounded-md bg-slate-800/50 group">
                <summary className="text-sm font-medium text-slate-300 cursor-pointer list-none flex justify-between items-center">
                    Formatting Options
                    <span className="text-cyan-400 group-open:rotate-180 transition-transform duration-200">
                        ▼
                    </span>
                </summary>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="tabWidth"
                            className="block text-xs font-medium text-slate-400 mb-1"
                        >
                            Tab Width
                        </label>
                        <Select
                            id="tabWidth"
                            name="tabWidth"
                            value={formatOptions.tabWidth.toString()}
                            onChange={handleOptionChange}
                        >
                            <option value="2">2</option>
                            <option value="4">4</option>
                        </Select>
                    </div>
                    <div>
                        <label
                            htmlFor="printWidth"
                            className="block text-xs font-medium text-slate-400 mb-1"
                        >
                            Print Width
                        </label>
                        <Select
                            id="printWidth"
                            name="printWidth"
                            value={formatOptions.printWidth.toString()}
                            onChange={handleOptionChange}
                        >
                            <option value="80">80</option>
                            <option value="100">100</option>
                            <option value="120">120</option>
                        </Select>
                    </div>
                    <div className="flex items-end pb-1">
                        <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                name="singleQuote"
                                checked={formatOptions.singleQuote}
                                onChange={handleOptionChange}
                                className="form-checkbox h-4 w-4 text-cyan-600 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                            />
                            <span>Use Single Quotes</span>
                        </label>
                    </div>
                </div>
            </details>

            {/* Input / Output Panes */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="html-input"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Input HTML
                    </label>
                    <TextareaInput
                        id="html-input"
                        value={inputHtml}
                        onChange={(e) => setInputHtml(e.target.value)}
                        placeholder="Paste your HTML code here..."
                        className="h-72 md:h-96 min-h-[12rem] font-mono text-sm"
                        aria-label="HTML Input"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="html-output"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Formatted HTML
                        </label>
                        {outputHtml && !error && (
                            <Button
                                onClick={() => copyToClipboard(outputHtml)}
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                            >
                                <FaCopy className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <div className="h-72 md:h-96 min-h-[12rem] w-full bg-slate-800 rounded-md border border-slate-700 overflow-hidden">
                        {outputHtml && !error ? (
                            <SyntaxHighlighter
                                language="html"
                                style={dracula}
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    height: '100%',
                                    fontSize: '0.875rem',
                                    backgroundColor: '#1e293b', // Tailwind slate-800
                                }}
                                codeTagProps={{
                                    style: {
                                        fontFamily: 'inherit',
                                    },
                                }}
                                showLineNumbers
                                wrapLines
                            >
                                {outputHtml}
                            </SyntaxHighlighter>
                        ) : (
                            <div className="p-4 text-slate-400 text-sm">
                                {error
                                    ? 'Could not format HTML.'
                                    : 'Formatted HTML will appear here.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions & Error */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat} disabled={isLoading || !inputHtml.trim()}>
                    {isLoading ? 'Formatting...' : 'Format HTML'}
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
