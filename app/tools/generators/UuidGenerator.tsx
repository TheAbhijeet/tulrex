'use client';

import { useState, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaCopy, FaSync } from 'react-icons/fa';
import { copyToClipboard } from '@/lib/utils';

export default function UuidGenerator() {
    const [uuid, setUuid] = useState('');

    const generateUuid = useCallback(() => {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
            setUuid(window.crypto.randomUUID());
        } else {
            // Very basic fallback (not RFC4122 compliant, use for demo only if crypto missing)
            console.warn('crypto.randomUUID not available, using basic fallback.');
            let d = new Date().getTime();
            let d2 = (performance && performance.now && performance.now() * 1000) || 0;
            setUuid(
                'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    let r = Math.random() * 16;
                    if (d > 0) {
                        r = (d + r) % 16 | 0;
                        d = Math.floor(d / 16);
                    } else {
                        r = (d2 + r) % 16 | 0;
                        d2 = Math.floor(d2 / 16);
                    }
                    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
                })
            );
        }
    }, []);

    // Generate one on initial load
    useEffect(() => {
        generateUuid();
    }, [generateUuid]);

    return (
        <div className="space-y-4 max-w-xl mx-auto">
            <label
                htmlFor="uuid-output"
                className="block text-sm font-medium text-gray-300 mb-1 text-center"
            >
                Generated UUID (v4):
            </label>
            <div className="relative">
                <Input
                    id="uuid-output"
                    type="text"
                    value={uuid}
                    readOnly
                    placeholder="Click Generate..."
                    className="font-mono text-center text-base sm:text-lg pr-20" // Make space for buttons
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                    <button
                        onClick={generateUuid}
                        className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        title="Generate New UUID"
                        aria-label="Generate new UUID"
                    >
                        <FaSync className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => copyToClipboard(uuid)}
                        disabled={!uuid}
                        className="p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        title="Copy to Clipboard"
                        aria-label="Copy UUID to clipboard"
                    >
                        <FaCopy className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <Button onClick={generateUuid} className="w-full sm:w-auto block mx-auto mt-4">
                Generate New UUID
            </Button>
        </div>
    );
}
