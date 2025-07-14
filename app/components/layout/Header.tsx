import Link from 'next/link';
import Search from './Search';

export default function Header() {
    return (
        <header className="bg-slate-800 shadow-md sticky top-0 z-20">
            <nav className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                {/* Left Side: App Name */}
                <Link
                    href="/"
                    className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0"
                >
                    Tulrex
                </Link>

                {/* Right Side: Search Bar */}
                {/* Allow search to take space but not push out title on small screens */}
                <div className="flex-grow sm:flex-grow-0 min-w-0">
                    {' '}
                    <Search />
                </div>
            </nav>
        </header>
    );
}
