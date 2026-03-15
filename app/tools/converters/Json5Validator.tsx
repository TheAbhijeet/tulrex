'use client';

import { useState } from 'react';
import JSON5 from 'json5';
import TextareaInput from '@/components/ui/TextareaInput';
import Button from '@/components/ui/Button';

export default function Json5Validator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      // JSON5.parse handles comments, trailing commas, single quotes, etc.
      const parsed = JSON5.parse(input);
      // Output as standard, strict JSON
      const strictJson = JSON.stringify(parsed, null, 2);

      setOutput(strictJson);
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Invalid JSON5 or conversion error: ${e.message}`);
      } else {
        setError(`Invalid JSON5 or conversion error: ${e}`);
      }
      setOutput('');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-auto lg:h-[calc(100vh-200px)]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center bg-slate-800 p-3 rounded-md border border-slate-700 shrink-0">
        <Button onClick={handleConvert}>Convert to JSON</Button>
        <Button onClick={handleClear} variant="secondary">Clear</Button>
      </div>

      {/* Main Split Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-w-0">

        {/* Input Pane (JSON5) */}
        <div className="flex-1 flex flex-col min-w-0">
          <label className="text-sm font-medium text-slate-300 mb-2">
            Input JSON5 <span className="text-slate-500 text-xs">(Comments & trailing commas allowed)</span>
          </label>
          <TextareaInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 font-mono text-sm resize-none h-96 lg:h-full w-full"
            placeholder={`// This is JSON5 \n{\n  unquotedKey: 'single quotes',\n  trailingComma: true,\n}`}
            spellCheck={false}
          />
        </div>

        {/* Output Pane (Strict JSON) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-300">
              {error ? 'Error' : 'Output (Standard JSON)'}
            </label>
            {output && !error && (
              <Button onClick={handleCopy} variant="secondary" className="text-xs py-1 px-2 h-7">
                {copied ? 'Copied!' : 'Copy JSON'}
              </Button>
            )}
          </div>

          <div className={`flex-1 relative rounded-md overflow-hidden border ${error ? 'border-red-700 bg-red-900/20' : 'border-slate-700 bg-slate-900'} h-96 lg:h-full`}>
            {error ? (
              <div className="p-4 text-red-400 font-mono text-sm whitespace-pre-wrap h-full overflow-auto">
                {error}
              </div>
            ) : (
              <TextareaInput
                value={output}
                readOnly
                className="w-full h-full border-none bg-transparent focus:ring-0 resize-none text-green-300 font-mono text-sm p-4"
                placeholder="Standard JSON output will appear here..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}