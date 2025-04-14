'use client';
import { useState, useCallback, useEffect } from 'react';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { FaCopy } from 'react-icons/fa';

// Define supported languages and their parsers/plugins
type Language = 'javascript' | 'css'; // Add more like 'html', 'markdown', 'json' etc.
const langConfig: Record<Language, { parser: string; plugins: any[]; importName?: string }> = {
    javascript: { parser: 'babel', plugins: [], importName: 'prettierPluginBabel' },
    css: {
        parser: 'css',
        plugins: [],
        importName: 'prettierPluginEstree' /* CSS depends on estree? Check docs */,
    }, // Needs confirmation on exact plugin needed
    // html: { parser: 'html', plugins: [], importName: 'prettierPluginHtml' },
    // json: { parser: 'json', plugins: [], importName: 'prettierPluginEstree' }, // JSON often uses estree
};

// Store dynamically loaded modules
let prettier: any = null;
const loadedPlugins: Record<string, any> = {};

export default function CodeFormatter() {
    const [inputCode, setInputCode] = useState('');
    const [formattedCode, setFormattedCode] = useState('');
    const [selectedLang, setSelectedLang] = useState<Language>('javascript');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading prettier/plugins
    const [isFormatting, setIsFormatting] = useState(false);
    const [copyStatus, copy] = useCopyToClipboard();

    // Load prettier and necessary plugins on demand
    const loadPrettier = useCallback(
        async (lang: Language) => {
            if (isLoading) return;
            setIsLoading(true);
            setError('');
            try {
                if (!prettier) {
                    // Dynamically import prettier standalone
                    const prettierModule = await import('prettier/standalone');
                    prettier = prettierModule.default || prettierModule; // Handle ESM/CJS interop if needed
                }

                const config = langConfig[lang];
                const pluginImportName = config.importName;

                // Load parser plugin if not already loaded
                if (pluginImportName && !loadedPlugins[pluginImportName]) {
                    // Adjust path based on actual Prettier v3 structure for standalone plugins
                    const pluginModule = await import(
                        `prettier/plugins/${pluginImportName.replace('prettierPlugin', '').toLowerCase()}`
                    );
                    // Or potentially: await import(`prettier/parser-${config.parser}`); depending on structure
                    loadedPlugins[pluginImportName] = pluginModule.default || pluginModule; // Handle ESM/CJS
                }
                config.plugins = Object.values(loadedPlugins); // Pass all loaded plugins
            } catch (err: any) {
                console.error('Failed to load Prettier or plugins:', err);
                setError(`Failed to load formatter dependencies: ${err.message}`);
                prettier = null; // Reset if failed
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading]
    );

    // Load initial language
    useEffect(() => {
        loadPrettier(selectedLang);
    }, [selectedLang, loadPrettier]);

    const handleFormat = useCallback(async () => {
        setError('');
        if (!inputCode.trim()) {
            setFormattedCode('');
            return;
        }
        if (isLoading || !prettier) {
            setError('Formatter not ready yet.');
            return;
        }

        setIsFormatting(true);
        try {
            const config = langConfig[selectedLang];
            const result = await prettier.format(inputCode, {
                parser: config.parser,
                plugins: config.plugins,
                // Add prettier options if needed (e.g., semi: false, tabWidth: 4)
                semi: true,
                singleQuote: true,
                tabWidth: 2,
            });
            setFormattedCode(result);
        } catch (err: any) {
            setError(`Formatting failed: ${err.message}`);
            console.error('Prettier format error:', err);
            setFormattedCode(''); // Clear output on error
        } finally {
            setIsFormatting(false);
        }
    }, [inputCode, selectedLang, isLoading]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <label htmlFor="lang-select-format" className="text-sm font-medium text-slate-300">
                    Language:
                </label>
                <select
                    id="lang-select-format"
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value as Language)}
                    className="px-3 py-1 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm capitalize"
                    disabled={isLoading || isFormatting}
                >
                    {Object.keys(langConfig).map((lang) => (
                        <option key={lang} value={lang} className="capitalize">
                            {lang}
                        </option>
                    ))}
                </select>
                <Button
                    onClick={handleFormat}
                    disabled={isLoading || isFormatting || !inputCode.trim()}
                >
                    {isLoading ? 'Loading...' : isFormatting ? 'Formatting...' : 'Format Code'}
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label
                        htmlFor="code-format-input"
                        className="block text-sm font-medium text-slate-300"
                    >
                        Input Code:
                    </label>
                    <TextareaInput
                        id="code-format-input"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={`Paste ${selectedLang} code here...`}
                        rows={15}
                        className="font-mono text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label
                            htmlFor="code-format-output"
                            className="block text-sm font-medium text-slate-300"
                        >
                            Formatted Output:
                        </label>
                        <button
                            onClick={() => copy(formattedCode)}
                            disabled={!formattedCode}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Copy Formatted Code"
                            aria-label="Copy Formatted Code"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                    </div>
                    <TextareaInput
                        id="code-format-output"
                        value={formattedCode}
                        readOnly
                        rows={15}
                        placeholder="Formatted code will appear here..."
                        className="font-mono text-xs bg-slate-900 border-slate-700"
                    />
                    {copyStatus === 'copied' && (
                        <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
                    )}
                </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <p className="text-xs text-slate-500">
                Note: Uses Prettier for formatting. Loading may take a moment on first use.
            </p>
        </div>
    );
}
