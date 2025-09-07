'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Info } from 'lucide-react';
import Logo from './Logo';
import { FaGithub } from 'react-icons/fa';
import Search from './Search';

const repoUrl = 'https://github.com/your-username/TulRex'; // <-- CHANGE THIS

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky md:px-2 top-0 z-40 w-full bg-gray-900/70 backdrop-blur-sm border-b border-gray-800">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Left Side: Logo */}
                <div className="flex-shrink-0">
                    <Logo />
                </div>

                {/* Center: Search (Desktop) */}
                <div className="hidden md:flex flex-1 justify-center px-8">
                    <Search />
                </div>

                {/* Right Side: Links & Mobile Menu Toggle */}
                <div className="flex items-center justify-end flex-shrink-0">
                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/about"
                            className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            About
                        </Link>
                        <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="GitHub Repository"
                        >
                            <FaGithub size={20} />
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-gray-900 border-b border-gray-800 shadow-lg">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        <div className="px-2">
                            <Search />
                        </div>
                        <Link
                            href="/about"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <Info size={20} />
                            About
                        </Link>
                        <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <FaGithub size={20} />
                            View on GitHub
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
