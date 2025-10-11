'use client';

import { useRouter } from 'next/navigation';
import { tools } from '@/lib/tools';
import { Shuffle } from 'lucide-react';

export default function RandomToolButton() {
    const router = useRouter();

    const handleRandomTool = () => {
        // Guard against an empty tools array
        if (!tools || tools.length === 0) {
            console.warn('No tools available to select from.');
            return;
        }

        // 1. Get a random index from the tools array
        const randomIndex = Math.floor(Math.random() * tools.length);

        // 2. Get the tool at that index
        const randomTool = tools[randomIndex];

        // 3. Navigate to the tool's page using its slug
        router.push(`/tools/${randomTool.slug}`);
    };

    return (
        <button
            onClick={handleRandomTool}
            className="flex items-center space-x-2 px-3 mx-4 py-1.5 bg-slate-800 text-slate-200 rounded-md hover:bg-slate-600 focus:outline-none  transition-colors duration-150 text-sm font-medium"
            aria-label="Go to a random tool"
        >
            <Shuffle size={15} />

            <span>Random Tool</span>
        </button>
    );
}
