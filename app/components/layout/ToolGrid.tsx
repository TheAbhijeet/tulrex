'use client';

import { useState, useMemo } from 'react';
import { Tool } from '@/lib/tools';
import ToolCard from '../ui/ToolCard';

interface ToolGridProps {
    tools: Tool[];
    categories: Record<string, number>;
}

export default function ToolGrid({ tools, categories }: ToolGridProps) {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredTools = useMemo(() => {
        if (selectedCategory === 'All') {
            return tools;
        }
        return tools.filter((tool) => tool.category === selectedCategory);
    }, [selectedCategory, tools]);

    const categoryButtonClasses = (isActive: boolean) =>
        `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`;

    return (
        <div>
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <button
                    onClick={() => setSelectedCategory('All')}
                    className={categoryButtonClasses(selectedCategory === 'All')}
                >
                    All{' '}
                    <span className="ml-1.5 bg-slate-800/50 px-1.5 py-0.5 rounded-full text-xs">
                        {tools.length}
                    </span>
                </button>
                {Object.entries(categories)
                    .sort((a, b) => b[1] - a[1]) // sort by count desc
                    .map(([category, count]) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={categoryButtonClasses(selectedCategory === category)}
                        >
                            {category}
                            <span className="ml-1.5 bg-slate-800/50 px-1.5 py-0.5 rounded-full text-xs">
                                {count}
                            </span>
                        </button>
                    ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
        </div>
    );
}
