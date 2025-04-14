import Link from 'next/link';

export default function ClientSideInfoBlock() {
    return (
        <div className="mb-6 p-3 border border-blue-800 bg-blue-900/30 rounded-lg text-blue-200 text-sm">
            <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5" aria-hidden="true">
                    🔒
                </span>
                <div>
                    <strong className="font-semibold">100% Client-Side Processing</strong>
                    <p className="text-blue-300/80 text-xs mt-0.5">
                        Your files never leave your browser. All processing happens locally —
                        nothing is uploaded or stored. We're fully open-source, ad-free, and
                        privacy-focused.
                        <Link
                            href="/about#privacy"
                            className="ml-1 text-cyan-400 hover:text-cyan-300 hover:underline whitespace-nowrap"
                        >
                            Learn how it works →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
