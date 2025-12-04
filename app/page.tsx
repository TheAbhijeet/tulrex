import { sortedTools as tools } from './lib/tools';
import ToolGrid from './components/layout/ToolGrid';

export default function HomePage() {
    const categoryCounts = tools.reduce(
        (acc, tool) => {
            if (tool.category) {
                acc[tool.category] = (acc[tool.category] || 0) + 1;
            }
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2 mt-8 text-center text-gray-100">
                Welcome to TulRex
            </h1>
            <p className="text-center text-gray-400 mb-8">
                Simple, Fast, and Open-Source Tools in Your Browser
            </p>

            <ToolGrid tools={tools} categories={categoryCounts} />
        </div>
    );
}
