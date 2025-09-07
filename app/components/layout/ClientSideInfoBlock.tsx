'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function ClientSideInfoBlock() {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <div className="mb-6 py-2 px-4 mt-0 relative  border border-gray-700 bg-gray-800/60 text-gray-200  ">
            <div className="flex items-start gap-3">
                <div>
                    <button
                        onClick={() => setVisible(false)}
                        className="absolute top-1 right-2 text-gray-200 hover:text-gray-400"
                    >
                        ✕
                    </button>
                    <strong className="font-semibold text-sm">
                        🔒 All Processing Happens On Your Browser – Private, Secure, Fast, and Open
                        Source
                    </strong>
                    <p className="text-gray-300 leading-relaxed text-sm mt-0.5">
                        Your files never leave your browser. All processing happens locally nothing
                        is uploaded or stored. We're fully open-source, ad-free, and privacy-focused
                        <Link
                            href="/about#privacy"
                            className="ml-1 text-green-400 hover:text-green-300 hover:underline whitespace-nowrap"
                        >
                            Read more →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
