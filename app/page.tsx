import { sortedTools as tools } from './lib/tools';
import ToolCard from './components/ui/ToolCard';

// Static Metadata for the Home page
// export const metadata: Metadata = {
//     title: 'TulRex - Simple Client-Side Developer Tools', // Overrides default title
// };

export default function HomePage() {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-2 mt-8 text-center text-slate-100">
                Welcome to TulRex
            </h1>
            <p className="text-center text-slate-400 mb-8">
                Simple, Fast, and Open-Source Tools in Your Browser
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
        </div>
    );
}
