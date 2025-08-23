import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { tools } from '@/lib/tools';

export default function ToolCard({ tool }: { tool: (typeof tools)[0] }) {
    const categorySlug = slugify(tool.category);

    return (
        <div className="flex flex-col h-full">
            {/* Ensure card takes full height */}
            <Link
                href={`/tools/${tool.slug}`}
                className="flex-grow block p-6 bg-slate-800/60 rounded-t-lg shadow hover:bg-slate-800 transition-colors border border-b-0 border-slate-700 hover:border-cyan-600 group"
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
                    aria-label={`View all tools in the ${tool.category} category`}
                >
                    {tool.category}
                </Link>
            </div>
        </div>
    );
}
