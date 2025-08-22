import Link from 'next/link';

export default function ClientSideInfoBlock() {
    return (
        <div className="mb-6 p-4  border border-slate-700 bg-slate-800/60 text-slate-200 text-md ">
            <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5" aria-hidden="true">
                    🔒
                </span>
                <div>
                    <strong className="font-semibold">100% Client-Side Processing</strong>
                    <p className="text-gray-300 leading-relaxed text-md mt-0.5">
                        Your files never leave your browser. All processing happens locally nothing
                        is uploaded or stored. We're fully open-source, ad-free, and privacy-focused
                        <Link
                            href="/about#privacy"
                            className="ml-1 text-green-400 hover:text-green-300 hover:underline whitespace-nowrap"
                        >
                            Learn how it works →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
