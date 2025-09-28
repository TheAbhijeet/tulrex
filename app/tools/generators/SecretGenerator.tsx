'use client';

import { useState, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

type CharsetKeys = keyof typeof CHARSETS;

export default function SecretGenerator() {
    const [secret, setSecret] = useState<string>('');
    const [length, setLength] = useState<number>(32);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [error, setError] = useState<string | null>(null);

    const handleOptionChange = (option: CharsetKeys) => {
        setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
    };

    const generateSecret = useCallback(() => {
        setError(null);

        let charset = '';
        if (options.uppercase) charset += CHARSETS.uppercase;
        if (options.lowercase) charset += CHARSETS.lowercase;
        if (options.numbers) charset += CHARSETS.numbers;
        if (options.symbols) charset += CHARSETS.symbols;

        if (charset.length === 0) {
            setError('Please select at least one character set.');
            setSecret('');
            return;
        }

        // Use window.crypto for secure random numbers
        if (
            typeof window.crypto === 'undefined' ||
            typeof window.crypto.getRandomValues === 'undefined'
        ) {
            setError(
                'Your browser does not support the required crypto APIs for secure generation.'
            );
            return;
        }

        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);

        let generatedSecret = '';
        for (let i = 0; i < length; i++) {
            generatedSecret += charset[randomValues[i] % charset.length];
        }

        setSecret(generatedSecret);
    }, [length, options]);

    // Generate a secret on initial load
    useEffect(() => {
        generateSecret();
    }, [generateSecret]);

    return (
        <div className="space-y-6">
            {/* Output Section */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                    Generated Secret
                </label>
                <div className="relative flex items-center">
                    <div className="flex-grow flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-md font-mono text-slate-200 text-sm break-all">
                        {secret || (
                            <span className="text-slate-500">
                                Click "Generate" to create a secret
                            </span>
                        )}
                        <button
                            onClick={() => copyToClipboard(secret)}
                            disabled={!secret}
                            className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            title="Copy to Clipboard"
                            aria-label="Copy password to clipboard"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Options Section */}
            <fieldset className="p-4 border border-slate-700 rounded-md">
                <legend className="text-sm font-medium text-slate-300 px-2">Options</legend>
                <div className="space-y-4">
                    {/* Length Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="length" className="text-sm text-slate-300">
                                Secret Length
                            </label>
                            <span className="px-2 py-1 text-xs font-mono bg-slate-600 rounded-md">
                                {length}
                            </span>
                        </div>
                        <input
                            id="length"
                            type="range"
                            min="8"
                            max="128"
                            step="1"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(Object.keys(options) as CharsetKeys[]).map((key) => (
                            <label
                                key={key}
                                className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer p-2 bg-slate-800 rounded-md hover:bg-slate-700/50 transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={options[key]}
                                    onChange={() => handleOptionChange(key)}
                                    className="form-checkbox h-4 w-4 text-cyan-600 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500"
                                />
                                <span className="capitalize">{key}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </fieldset>

            {/* Actions and Errors */}
            <div className="flex flex-col space-y-3">
                <Button onClick={generateSecret} className="w-full sm:w-auto">
                    Generate New Secret
                </Button>
                {error && (
                    <div
                        className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm"
                        role="alert"
                    >
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
