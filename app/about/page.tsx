import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Toolzen',
    description: 'Learn about the Toolzen project, its purpose, and open-source nature.',
};

export default function AboutPage() {
    const repoUrl = 'https://github.com/your-username/toolzen'; // <-- CHANGE THIS

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4 text-slate-100">About Toolzen</h1>
            <div className="space-y-4 text-slate-300">
                <p>
                    Toolzen is a collection of simple, free, client-side web tools designed for
                    developers, content creators, and anyone who needs quick utilities without
                    server interaction or tracking.
                </p>
                <p>
                    <strong>Key Principles:</strong>
                </p>
                <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>
                        <strong className="text-cyan-400">Client-Side Only:</strong> All processing
                        happens directly in your browser. No data is sent to any server.
                    </li>
                    <li>
                        <strong className="text-cyan-400">Fast & Minimalist:</strong> Designed for
                        quick loading and ease of use with a clean interface.
                    </li>
                    <li>
                        <strong className="text-cyan-400">Privacy Focused:</strong> No tracking, no
                        analytics (unless strictly privacy-safe and local/opt-in).
                    </li>
                    <li>
                        <strong className="text-cyan-400">Open Source:</strong> The entire codebase
                        is available on GitHub for transparency and community contribution.
                    </li>
                </ul>
                <p>
                    This project was built using modern web technologies like Next.js (App Router),
                    TypeScript, and Tailwind CSS, focusing on creating a performant static site.
                </p>
                <p>
                    We encourage contributions, bug reports, and suggestions! Check out the
                    repository:
                </p>
                <p>
                    <Link
                        href={repoUrl} // <-- Use the variable
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                    >
                        Toolzen on GitHub
                    </Link>
                </p>
            </div>
        </div>
    );
}
