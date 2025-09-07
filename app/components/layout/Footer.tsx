'use client';

import Link from 'next/link';

import { Heart, Bug, Lightbulb } from 'lucide-react';

import { REPO_URL } from '@/lib/constants';

const resourceLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/terms', label: 'Terms & Conditions' },
];

const communityLinks = [
    {
        href: `${REPO_URL}/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=`,
        icon: Lightbulb,
        label: 'Feature Request',
    },
    {
        href: `${REPO_URL}/issues/new?assignees=&labels=bug&template=bug_report.md&title=`,
        icon: Bug,
        label: 'Bug Report',
    },
];

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-400 mt-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: App Info */}
                    <div className="md:col-span-1">
                        <Link
                            href="/"
                            className="inline-block mb-2 text-xl font-bold text-gray-300  transition-colors"
                        >
                            TulRex
                        </Link>
                        <p className="text-sm">
                            A collection of fast, free, client-side developer tools. Built for
                            privacy and performance.
                        </p>
                    </div>

                    {/* Column 2: Resources */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                            Resources
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {resourceLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-base hover:text-cyan-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Community */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                            Community
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {communityLinks.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-base hover:text-cyan-400 transition-colors"
                                        aria-label={link.label}
                                    >
                                        <link.icon className="w-4 h-4 mr-2" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Sponsor */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                            Support
                        </h3>
                        <div className="mt-4">
                            <a
                                href={`${REPO_URL}/sponsors`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 transition-colors"
                            >
                                <Heart className="w-4 h-4 mr-2 fill-white" />
                                Star Project
                            </a>
                            <p className="text-xs mt-3">
                                Love TulRex? Help keep it free and open-source by becoming a sponsor
                                or maybe a contributor.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-center sm:text-left mb-4 sm:mb-0">
                        © {new Date().getUTCFullYear()} TulRex. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
