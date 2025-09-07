'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Copy as FaCopy, RefreshCw as FaSync } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

const Checkbox = ({
    id,
    label,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div className="flex items-center">
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-800"
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-300">
            {label}
        </label>
    </div>
);

export default function PasswordGenerator() {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePassword = useCallback(() => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let charPool = '';
        if (includeUppercase) charPool += upper;
        if (includeLowercase) charPool += lower;
        if (includeNumbers) charPool += numbers;
        if (includeSymbols) charPool += symbols;

        if (charPool.length === 0) {
            setError('Please select at least one character type.');
            setPassword('');
            return;
        }
        setError(null);

        let generated = '';
        // Prefer crypto API for better randomness
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const randomValues = new Uint32Array(length);
            window.crypto.getRandomValues(randomValues);
            for (let i = 0; i < length; i++) {
                generated += charPool[randomValues[i] % charPool.length];
            }
        } else {
            // Fallback to Math.random (less secure)
            console.warn('Crypto API not available, using Math.random for password generation.');
            for (let i = 0; i < length; i++) {
                generated += charPool[Math.floor(Math.random() * charPool.length)];
            }
        }

        setPassword(generated);
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

    return (
        <div className="space-y-5">
            <div>
                <label
                    htmlFor="password-output"
                    className="block text-sm font-medium text-gray-300 mb-1"
                >
                    Generated Password:
                </label>
                <div className="relative">
                    <Input
                        id="password-output"
                        type="text" // Use text to make it easily visible/selectable
                        value={password}
                        readOnly
                        placeholder="Click Generate..."
                        className="font-mono text-lg pr-20" // Make space for buttons
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                        <button
                            onClick={generatePassword}
                            className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            title="Generate New Password"
                            aria-label="Generate new password"
                        >
                            <FaSync className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => copyToClipboard(password)}
                            disabled={!password}
                            className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            title="Copy to Clipboard"
                            aria-label="Copy password to clipboard"
                        >
                            <FaCopy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3 border border-gray-700 p-4 rounded-md">
                <h3 className="text-base font-medium text-gray-200 mb-3">Options:</h3>
                <div className="flex items-center space-x-4">
                    <label
                        htmlFor="length"
                        className="text-sm font-medium text-gray-300 whitespace-nowrap"
                    >
                        Length: {length}
                    </label>
                    <input
                        id="length"
                        type="range"
                        min="6"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <Checkbox
                        id="uppercase"
                        label="Uppercase (A-Z)"
                        checked={includeUppercase}
                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                    />
                    <Checkbox
                        id="lowercase"
                        label="Lowercase (a-z)"
                        checked={includeLowercase}
                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                    />
                    <Checkbox
                        id="numbers"
                        label="Numbers (0-9)"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                    />
                    <Checkbox
                        id="symbols"
                        label="Symbols (!@#...)"
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                    />
                </div>
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>

            <Button onClick={generatePassword} className="w-full sm:w-auto">
                Generate Password
            </Button>
        </div>
    );
}
