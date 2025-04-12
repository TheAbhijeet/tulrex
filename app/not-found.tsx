// src/app/not-found.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found | Toolzen',
    description: 'The page you were looking for could not be found.',
};

export default function NotFound() {
    return (
        <div className="text-center py-10">
            <h1 className="text-6xl font-bold text-cyan-500 mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4 text-slate-100">Page Not Found</h2>
            <p className="text-slate-400 mb-6">
                Oops! The page you are looking for does not exist or has been moved.
            </p>
            <Link
                href="/"
                className="inline-block px-6 py-2 bg-cyan-600 text-white font-medium rounded-md hover:bg-cyan-700 transition-colors"
            >
                Go Back Home
            </Link>
        </div>
    );
}
