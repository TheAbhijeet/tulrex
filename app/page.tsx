import Link from 'next/link';
import { Metadata } from 'next';
import { sortedTools as tools } from './lib/tools';
import { slugify } from './lib/utils';

// Static Metadata for the Home page
export const metadata: Metadata = {
    title: 'TulRex - Simple Client-Side Developer Tools', // Overrides default title
    description:
        'A collection of fast, free, client-side only tools for developers and content creators. JSON, Base64, Regex, URL Encode/Decode, and more.',
};

function ToolCard({ tool }: { tool: (typeof tools)[0] }) {
    const categorySlug = slugify(tool.category);

    // return (
    //     <Link
    //         href={`/tools/${tool.slug}`}
    //         className="block p-6 bg-slate-800 rounded-lg shadow hover:bg-slate-700 transition-colors h-full border border-slate-700 hover:border-cyan-600"
    //     >
    //         <div className="flex items-center mb-2">
    //             {tool.icon && <span className="text-2xl mr-3">{tool.icon}</span>}
    //             <h2 className="text-lg font-semibold text-slate-100">{tool.title}</h2>
    //         </div>
    //         <p className="text-sm text-slate-400">{tool.description}</p>
    //     </Link>
    // );
    return (
        <div className="flex flex-col h-full">
            {' '}
            {/* Ensure card takes full height */}
            <Link
                href={`/tools/${tool.slug}`}
                className="flex-grow block p-6 bg-slate-800 rounded-t-lg shadow hover:bg-slate-700 transition-colors border border-b-0 border-slate-700 hover:border-cyan-600 group"
                aria-label={`Go to ${tool.title} tool`}
            >
                <div className="flex items-center mb-2">
                    {tool.icon && <span className="text-2xl mr-3">{tool.icon}</span>}
                    <h2 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {tool.title}
                    </h2>
                </div>
                <p className="text-sm text-slate-400 flex-grow">{tool.description}</p>
            </Link>
            {/* Category Link Footer */}
            <div className="bg-slate-800 rounded-b-lg border border-t-0 border-slate-700 px-4 py-1.5 group-hover:border-cyan-600 transition-colors">
                <Link
                    href={`/category/${categorySlug}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 -mx-1"
                    //  onClick={(e) => e.stopPropagation()} // Prevent card link trigger
                    aria-label={`View all tools in the ${tool.category} category`}
                >
                    {tool.category}
                </Link>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2 text-center text-slate-100">
                Welcome to TulRex
            </h1>
            <p className="text-center text-slate-400 mb-8">
                Your collection of simple, fast, client-side utilities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                ))}
                {/* Add placeholders if needed */}
                {Array.from({ length: 6 - tools.length }).map((_, i) => (
                    <div
                        key={`placeholder-${i}`}
                        className="p-6 bg-slate-800 rounded-lg shadow border border-slate-700 opacity-50"
                    >
                        <div className="h-8 bg-slate-700 rounded w-3/4 mb-3 animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
