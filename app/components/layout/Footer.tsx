import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-800 mt-auto py-4 text-center text-sm text-slate-400">
            <div className="container mx-auto px-4">
                <span>Tulrex - Open Source Project | </span>
                <Link
                    href="https://github.com/your-username/Tulrex" // <-- CHANGE THIS to your actual repo URL
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                    View on GitHub
                </Link>
            </div>
        </footer>
    );
}
