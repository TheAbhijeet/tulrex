'use client';

import { useState, useCallback, ChangeEvent, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import type { JSBeautifyOptions } from 'js-beautify';

import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Copy as FaCopy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface FormatterOptions extends Omit<JSBeautifyOptions, 'indent_char' | 'indent_with_tabs'> {
    indent_style: 'space' | 'tab';
}

const initialOptions: FormatterOptions = {
    indent_style: 'space',
    indent_size: 2,
    eol: '\n', // Autodetect or specific: '\n' for LF, '\r\n' for CRLF
    end_with_newline: false,
    preserve_newlines: true,
    max_preserve_newlines: 10,
    space_in_paren: false,
    space_in_empty_paren: false,
    jslint_happy: false,
    space_after_anon_function: false,
    space_after_named_function: false,
    brace_style: 'collapse',
    unindent_chained_methods: false,
    break_chained_methods: false,
    keep_array_indentation: false,
    unescape_strings: false,
    wrap_line_length: 0,
    e4x: false,
    comma_first: false,
    operator_position: 'before-newline',
    indent_empty_lines: false,
};

export default function JavaScriptFormatter() {
    const [inputJs, setInputJs] = useState<string>('');
    const [outputJs, setOutputJs] = useState<string>('');
    const [options, setOptions] = useState<FormatterOptions>(initialOptions);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic import for js-beautify
    const [beautify, setBeautify] = useState<
        ((code: string, options: JSBeautifyOptions) => string) | null
    >(null);

    useEffect(() => {
        import('js-beautify')
            .then((module) => {
                setBeautify(() => module.js_beautify);
            })
            .catch((err) => {
                console.error('Failed to load js-beautify:', err);
                setError('Failed to load formatting library. Please refresh the page.');
            });
    }, []);

    const handleOptionChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number | boolean | string[] = value;

        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (
            type === 'number' ||
            name === 'indent_size' ||
            name === 'max_preserve_newlines' ||
            name === 'wrap_line_length'
        ) {
            processedValue = parseInt(value, 10);
            if (isNaN(processedValue as number)) {
                // Handle case where parsing might fail for empty string, default to 0 or a reasonable value.
                processedValue =
                    name === 'indent_size' || name === 'max_preserve_newlines'
                        ? 0
                        : initialOptions[name as keyof FormatterOptions] || 0;
            }
        }
        setOptions((prev) => ({ ...prev, [name]: processedValue }));
    };

    const onInputChange = useCallback((value: string) => {
        setInputJs(value);
    }, []);

    const handleFormat = useCallback(async () => {
        if (!beautify) {
            setError('Formatting library not loaded yet. Please wait a moment and try again.');
            return;
        }
        if (!inputJs.trim()) {
            setError('Input JavaScript is empty.');
            setOutputJs('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputJs('');

        // Convert FormatterOptions to JSBeautifyOptions
        const beautifyOpts: JSBeautifyOptions = {
            ...options,
            indent_char: options.indent_style === 'tab' ? '\t' : ' ',
            indent_with_tabs: options.indent_style === 'tab',
        };

        try {
            // Simulate async operation if beautify itself is not async, for consistency
            await new Promise((resolve) => setTimeout(resolve, 0));
            const formatted = beautify(inputJs, beautifyOpts);
            setOutputJs(formatted);
        } catch (e) {
            console.error('Formatting error:', e);
            if (e instanceof Error) {
                setError(`Invalid JavaScript or formatting error: ${e.message || 'Unknown error'}`);
            }
            setOutputJs('');
        } finally {
            setIsLoading(false);
        }
    }, [inputJs, options, beautify]);

    const handleClear = () => {
        setInputJs('');
        setOutputJs('');
        setError(null);
    };

    const editorExtensions = [javascript({ jsx: true, typescript: true })];
    const editorMinHeight = '300px';
    const editorMaxHeight = '60vh'; // Or fixed value like "500px"

    return (
        <div className="space-y-6">
            <details className="p-4 border border-gray-700 rounded-md bg-gray-800/50 group">
                <summary className="text-sm font-medium text-gray-300 cursor-pointer list-none flex justify-between items-center">
                    Formatting Options
                    <span className="text-cyan-400 group-open:rotate-180 transition-transform duration-200">
                        ▼
                    </span>
                </summary>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                    {/* Indentation */}
                    <div>
                        <label
                            htmlFor="indent_style"
                            className="block text-xs font-medium text-gray-400 mb-1"
                        >
                            Indent Style:
                        </label>
                        <Select
                            id="indent_style"
                            name="indent_style"
                            value={options.indent_style}
                            onChange={handleOptionChange}
                        >
                            <option value="space">Spaces</option>
                            <option value="tab">Tabs</option>
                        </Select>
                    </div>
                    <div>
                        <label
                            htmlFor="indent_size"
                            className="block text-xs font-medium text-gray-400 mb-1"
                        >
                            Indent Size:
                        </label>
                        <Input
                            type="number"
                            id="indent_size"
                            name="indent_size"
                            value={options.indent_size}
                            onChange={handleOptionChange}
                            min="0"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="eol"
                            className="block text-xs font-medium text-gray-400 mb-1"
                        >
                            EOL:
                        </label>
                        <Select
                            id="eol"
                            name="eol"
                            value={options.eol}
                            onChange={handleOptionChange}
                        >
                            <option value="\n">LF (Unix/macOS)</option>
                            <option value="\r\n">CRLF (Windows)</option>
                        </Select>
                    </div>

                    {/* Newlines */}
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="end_with_newline"
                            name="end_with_newline"
                            checked={options.end_with_newline}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="end_with_newline" className="text-sm text-gray-300">
                            End with Newline
                        </label>
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="preserve_newlines"
                            name="preserve_newlines"
                            checked={options.preserve_newlines}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="preserve_newlines" className="text-sm text-gray-300">
                            Preserve Newlines
                        </label>
                    </div>
                    <div>
                        <label
                            htmlFor="max_preserve_newlines"
                            className={`block text-xs font-medium text-gray-400 mb-1 ${!options.preserve_newlines ? 'opacity-50' : ''}`}
                        >
                            Max Preserve Newlines:
                        </label>
                        <Input
                            type="number"
                            id="max_preserve_newlines"
                            name="max_preserve_newlines"
                            value={options.max_preserve_newlines}
                            onChange={handleOptionChange}
                            min="0"
                            disabled={!options.preserve_newlines}
                            className={`${!options.preserve_newlines ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {/* Spacing */}
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="space_in_paren"
                            name="space_in_paren"
                            checked={options.space_in_paren}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="space_in_paren" className="text-sm text-gray-300">
                            Space in Parens
                        </label>
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="space_in_empty_paren"
                            name="space_in_empty_paren"
                            checked={options.space_in_empty_paren}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="space_in_empty_paren" className="text-sm text-gray-300">
                            Space in Empty Parens
                        </label>
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="space_after_anon_function"
                            name="space_after_anon_function"
                            checked={!!options.space_after_anon_function}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label
                            htmlFor="space_after_anon_function"
                            className="text-sm text-gray-300"
                        >
                            Space After Anon Func
                        </label>
                    </div>

                    {/* Brace Style */}
                    <div>
                        <label
                            htmlFor="brace_style"
                            className="block text-xs font-medium text-gray-400 mb-1"
                        >
                            Brace Style:
                        </label>
                        <Select
                            id="brace_style"
                            name="brace_style"
                            value={options.brace_style}
                            onChange={handleOptionChange}
                        >
                            <option value="collapse">Collapse</option>
                            <option value="expand">Expand</option>
                            <option value="end-expand">End-expand</option>
                            <option value="none">None</option>
                            <option value="collapse,preserve-inline">
                                Collapse, Preserve Inline
                            </option>
                        </Select>
                    </div>

                    {/* Chaining and Arrays */}
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="break_chained_methods"
                            name="break_chained_methods"
                            checked={!!options.break_chained_methods}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="break_chained_methods" className="text-sm text-gray-300">
                            Break Chained Methods
                        </label>
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="keep_array_indentation"
                            name="keep_array_indentation"
                            checked={options.keep_array_indentation}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="keep_array_indentation" className="text-sm text-gray-300">
                            Keep Array Indentation
                        </label>
                    </div>

                    {/* Misc */}
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="unescape_strings"
                            name="unescape_strings"
                            checked={options.unescape_strings}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="unescape_strings" className="text-sm text-gray-300">
                            Unescape Strings
                        </label>
                    </div>
                    <div>
                        <label
                            htmlFor="wrap_line_length"
                            className="block text-xs font-medium text-gray-400 mb-1"
                        >
                            Wrap Line Length (0 for none):
                        </label>
                        <Input
                            type="number"
                            id="wrap_line_length"
                            name="wrap_line_length"
                            value={options.wrap_line_length}
                            onChange={handleOptionChange}
                            min="0"
                        />
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="comma_first"
                            name="comma_first"
                            checked={!!options.comma_first}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="comma_first" className="text-sm text-gray-300">
                            Comma First
                        </label>
                    </div>
                    <div>
                        <label
                            htmlFor="operator_position"
                            className="block text-xs font-medium text-gray-400 mb-1"
                        >
                            Operator Position:
                        </label>
                        <Select
                            id="operator_position"
                            name="operator_position"
                            value={options.operator_position}
                            onChange={handleOptionChange}
                        >
                            <option value="before-newline">Before Newline</option>
                            <option value="after-newline">After Newline</option>
                            <option value="preserve-newline">Preserve Newline</option>
                        </Select>
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="indent_empty_lines"
                            name="indent_empty_lines"
                            checked={!!options.indent_empty_lines}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="indent_empty_lines" className="text-sm text-gray-300">
                            Indent Empty Lines
                        </label>
                    </div>
                    <div className="flex items-center pt-5">
                        <Input
                            type="checkbox"
                            id="jslint_happy"
                            name="jslint_happy"
                            checked={options.jslint_happy}
                            onChange={handleOptionChange}
                            className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500 mr-2"
                        />
                        <label htmlFor="jslint_happy" className="text-sm text-gray-300">
                            JSLint Happy
                        </label>
                    </div>
                </div>
            </details>

            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1 min-w-0">
                    <label
                        htmlFor="js-input-editor"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Input JavaScript:
                    </label>
                    <div className="border border-gray-700 rounded-md overflow-hidden">
                        <CodeMirror
                            id="js-input-editor"
                            value={inputJs}
                            height={editorMinHeight}
                            maxHeight={editorMaxHeight}
                            extensions={editorExtensions}
                            theme={dracula}
                            onChange={onInputChange}
                            basicSetup={{
                                foldGutter: true,
                                dropCursor: true,
                                allowMultipleSelections: true,
                                indentOnInput: true,
                                lineNumbers: true,
                                highlightActiveLine: true,
                                highlightActiveLineGutter: true,
                            }}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="js-output-editor"
                            className="block text-sm font-medium text-gray-300"
                        >
                            Formatted JavaScript:
                        </label>
                        {outputJs && !error && (
                            <Button
                                onClick={() => copyToClipboard(outputJs)}
                                variant="secondary"
                                className="px-2 py-1 text-xs"
                            >
                                <FaCopy className="w-4 h-4" />{' '}
                            </Button>
                        )}
                    </div>
                    <div className="border border-gray-700 rounded-md overflow-hidden">
                        <CodeMirror
                            id="js-output-editor"
                            value={outputJs}
                            height={editorMinHeight}
                            maxHeight={editorMaxHeight}
                            extensions={editorExtensions}
                            theme={dracula}
                            readOnly={true}
                            basicSetup={{
                                foldGutter: true,
                                lineNumbers: true,
                                highlightActiveLine: false, // Less distracting for readonly
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat} disabled={isLoading || !inputJs.trim() || !beautify}>
                    {isLoading
                        ? 'Formatting...'
                        : beautify
                          ? 'Format JavaScript'
                          : 'Loading Lib...'}
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
