import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-slate-800 shadow-md">
            <nav className="container mx-auto px-4 py-3">
                <Link
                    href="/"
                    className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    Toolzen
                </Link>
            </nav>
        </header>
    );
}
