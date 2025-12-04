'use client';

import { useState } from 'react';
import yaml from 'js-yaml';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Copy } from 'lucide-react';

const SyntaxHighlighter = dynamic(() => import('react-syntax-highlighter').then((m) => m.Prism), {
    ssr: false,
});

export default function YamlValidator() {
    const [input, setInput] = useState(`app:
  name: Tulrex.com
  version: 1.0.0
  author:
    name: John Doe
    email: john@example.com

settings:
  theme: dark
  notifications: true
  limits:
    max_users: 100
    max_storage_mb: 2048

servers:
  - id: server-1
    host: api.sample.com
    port: 443
    secure: true
  - id: server-2
    host: backup.sample.com
    port: 8080
    secure: false

features:
  authentication:
    enabled: true
    methods:
      - password
      - oauth
  logging:
    level: info
    output: file

        `);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [indent, setIndent] = useState(2);
    const [mode, setMode] = useState<'yaml' | 'json'>('yaml');
    const [copyStatus, copy] = useCopyToClipboard(1000);

    const processYaml = (targetMode: 'yaml' | 'json') => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }

            const parsed = yaml.load(input);

            if (targetMode === 'json') {
                setOutput(JSON.stringify(parsed, null, indent));
            } else {
                setOutput(yaml.dump(parsed, { indent: indent }));
            }

            setError(null);
            setMode(targetMode);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
            setOutput('');
        }
    };

    return (
        <div className="space-y-4 h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
            {/* Options Toolbar */}
            <div className="flex flex-wrap gap-4 items-center bg-slate-800 p-3 rounded-md border border-slate-700">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-300">Indent:</span>
                    <select
                        value={indent}
                        onChange={(e) => setIndent(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:ring-cyan-500 outline-none"
                    >
                        <option value={2}>2 Spaces</option>
                        <option value={4}>4 Spaces</option>
                    </select>
                </div>

                <div className="h-6 w-px bg-slate-600 mx-2 hidden sm:block"></div>

                <div className="flex gap-2">
                    <Button onClick={() => processYaml('yaml')} className="text-sm py-1">
                        Format / Validate YAML
                    </Button>
                    <Button
                        onClick={() => processYaml('json')}
                        variant="secondary"
                        className="text-sm py-1"
                    >
                        Convert to JSON
                    </Button>
                </div>
            </div>

            {/* Main Split Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Input */}
                <div className="flex-1 flex flex-col min-w-0">
                    <label className="text-sm font-medium text-slate-300 mb-2">Input YAML</label>
                    <TextareaInput
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 font-mono text-sm resize-none h-full"
                        placeholder="paste: yaml_content\n  here: true"
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="flex-1 flex flex-col min-w-0">
                    <label className="text-sm font-medium text-slate-300 mb-2">
                        {error ? 'Error' : `Output (${mode.toUpperCase()})`}
                    </label>

                    <div className="flex-1 relative rounded-md overflow-hidden border border-slate-700 bg-[#282a36]">
                        {error ? (
                            <div className="p-4 text-red-400 font-mono text-sm whitespace-pre-wrap">
                                {error}
                            </div>
                        ) : (
                            <SyntaxHighlighter
                                language="yaml"
                                style={dracula}
                                customStyle={{ margin: 0, height: '100%', borderRadius: 0 }}
                                showLineNumbers
                            >
                                {output || '// Output will appear here'}
                            </SyntaxHighlighter>
                        )}
                        <button
                            onClick={() => copy(output)}
                            disabled={!output}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            title="Copy to Clipboard"
                            aria-label="Copy generated text"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        {copyStatus === 'copied' && (
                            <p className="text-xs text-green-400 mt-1 absolute bottom-1 right-2">
                                Copied!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
