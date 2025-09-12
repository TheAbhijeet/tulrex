'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { Github } from 'lucide-react';
import Search from './Search';
import { REPO_URL } from '@/lib/constants';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky  top-0 z-40 w-full bg-gray-900/70 backdrop-blur-sm border-b border-gray-800">
            <div className=" mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-4">
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
                    <div className="hidden md:flex items-center border border-gray-700 rounded-full gap-4">
                        <a
                            href={REPO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="GitHub Repository"
                        >
                            <Github size={20} />
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

                        <a
                            href={REPO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <Github size={20} />
                            View on GitHub
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
