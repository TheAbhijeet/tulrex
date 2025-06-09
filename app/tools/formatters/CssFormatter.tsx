'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

interface CssFormatOptions {
    tabWidth: number;
    useTabs: boolean;
}

const initialOptions: CssFormatOptions = {
    tabWidth: 2,
    useTabs: false,
};

export default function CssFormatter() {
    const [inputCss, setInputCss] = useState<string>('');
    const [outputCss, setOutputCss] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formatOptions, setFormatOptions] = useState<CssFormatOptions>(initialOptions);
    const [copied, setCopied] = useState(false);

    const handleOptionChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormatOptions((prevOptions) => ({
            ...prevOptions,
            [name]:
                type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : name === 'tabWidth'
                      ? parseInt(value, 10)
                      : value,
        }));
    };

    const handleFormat = useCallback(async () => {
        if (!inputCss.trim()) {
            setError('Input CSS is empty.');
            setOutputCss('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputCss('');
        setCopied(false);

        try {
            const prettier = await import('prettier/standalone');
            const parserCss = await import('prettier/parser-postcss');

            const formatted = await prettier.format(inputCss, {
                parser: 'css',
                plugins: [parserCss],
                ...formatOptions,
            });
            setOutputCss(formatted);
        } catch (e) {
            if (e instanceof Error) {
                console.error('Formatting error:', e);
                setError(`Invalid CSS or formatting error: ${e.message || 'Unknown error'}`);
            }
            setOutputCss('');
        } finally {
            setIsLoading(false);
        }
    }, [inputCss, formatOptions]);

    const handleClear = () => {
        setInputCss('');
        setOutputCss('');
        setError(null);
        setCopied(false);
    };

    const handleCopyToClipboard = async () => {
        if (!outputCss) return;
        try {
            await navigator.clipboard.writeText(outputCss);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy CSS. See console for details.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Options Section */}
            <details className="p-4 border border-slate-700 rounded-md bg-slate-800/50 group">
                <summary className="text-sm font-medium text-slate-300 cursor-pointer list-none flex justify-between items-center">
                    Formatting Options
                    <span className="text-cyan-400 group-open:rotate-180 transition-transform duration-200">
                        ▼
                    </span>
                </summary>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="tabWidth"
                            className="block text-xs font-medium text-slate-400 mb-1"
                        >
                            Tab Width:
                        </label>
                        <Select
                            id="tabWidth"
                            name="tabWidth"
                            value={formatOptions.tabWidth.toString()}
                            onChange={handleOptionChange}
                            className="w-full text-sm"
                        >
                            <option value="2">2 Spaces</option>
                            <option value="4">4 Spaces</option>
                        </Select>
                    </div>
                    <div className="flex items-end pb-1">
                        <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                name="useTabs"
                                checked={formatOptions.useTabs}
                                onChange={handleOptionChange}
                                className="form-checkbox h-4 w-4 text-cyan-600 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                            />
                            <span>Use Tabs</span>
                        </label>
                    </div>
                </div>
            </details>

            {/* Input and Output Section */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                {/* Input Pane */}
                <div className="flex-1 min-w-0">
                    {' '}
                    {/* min-w-0 helps flexbox correctly size children */}
                    <label
                        htmlFor="css-input"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Input CSS:
                    </label>
                    <TextareaInput
                        id="css-input"
                        value={inputCss}
                        onChange={(e) => setInputCss(e.target.value)}
                        placeholder="Paste your CSS code here..."
                        rows={15}
                        className="h-64 md:h-96 min-h-[10rem]" // Responsive height
                        aria-label="CSS Input"
                    />
                </div>

                {/* Output Pane */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="css-output"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Formatted CSS:
                        </label>
                        {outputCss && !error && (
                            <Button
                                onClick={handleCopyToClipboard}
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        )}
                    </div>
                    <TextareaInput
                        id="css-output"
                        value={outputCss}
                        readOnly
                        placeholder="Formatted CSS will appear here..."
                        rows={15}
                        className={`h-64 md:h-96 min-h-[10rem] bg-slate-900 border-slate-700 focus:ring-cyan-500 focus:border-cyan-500 ${outputCss && !error ? 'text-green-300' : 'text-slate-400'}`}
                        aria-label="Formatted CSS Output"
                    />
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat} disabled={isLoading || !inputCss.trim()}>
                    {isLoading ? 'Formatting...' : 'Format CSS'}
                </Button>
                <Button onClick={handleClear} variant="secondary" disabled={isLoading}>
                    Clear
                </Button>
            </div>

            {/* Error Display */}
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
