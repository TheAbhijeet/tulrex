import { sortedTools as tools } from './lib/tools';
import ToolCard from './components/ui/ToolCard';

export default function HomePage() {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-2 mt-8 text-center text-gray-100">
                Welcome to TulRex
            </h1>
            <p className="text-center text-gray-400 mb-8">
                Simple, Fast, and Open-Source Tools in Your Browser
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                ))}
            </div>
        </div>
    );
}
