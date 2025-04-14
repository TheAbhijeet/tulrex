import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next';
import { getAllCategories, getToolsByCategory, getCategoryNameBySlug } from '@/lib/tools';
import type { Tool } from '@/lib/tools'; // Import Tool type if ToolCard needs it

// --- Tool Card Component (Can be moved to src/components/ToolCard.tsx) ---
// Updated to hide category link on category pages
function ToolCard({ tool, showCategoryLink = true }: { tool: Tool; showCategoryLink?: boolean }) {
    return (
        <Link
            href={`/tools/${tool.slug}`}
            className="block p-6 bg-slate-800 rounded-lg shadow hover:bg-slate-700 transition-colors h-full border border-slate-700 hover:border-cyan-600 group relative"
        >
            {/* Optional: Category tag only if showCategoryLink is true */}
            {showCategoryLink && (
                <span className="absolute top-2 right-2 text-xs bg-slate-600 text-cyan-300 px-1.5 py-0.5 rounded">
                    {tool.category}
                </span>
            )}
            <div className="flex items-center mb-2">
                {tool.icon && <span className="text-2xl mr-3">{tool.icon}</span>}
                <h2 className="text-lg font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {tool.title}
                </h2>
            </div>
            <p className="text-sm text-slate-400">{tool.description}</p>
        </Link>
    );
}
// --- End Tool Card ---

type Props = {
    params: { categorySlug: string };
};

// --- Static Generation ---
export function generateStaticParams() {
    const categories = getAllCategories();
    return categories.map((category) => ({
        categorySlug: category.slug,
    }));
}

// --- Dynamic Metadata ---
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedPramas = await params;
    const categoryName = getCategoryNameBySlug(resolvedPramas.categorySlug);

    if (!categoryName) {
        return { title: 'Category Not Found | Toolzen' };
    }

    const title = `${categoryName} Tools | Toolzen`;
    const description = `Collection of ${categoryName.toLowerCase()} tools available on Toolzen. Fast, free, client-side utilities.`;
    const previousImages = (await parent).openGraph?.images || []; // Inherit OG image

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `/category/${resolvedPramas.categorySlug}`,
            images: previousImages,
        },
        twitter: {
            title: title,
            description: description,
        },
    };
}

// --- Page Component ---
export default async function CategoryPage({ params }: Props) {
    const resolvedParams = await params;
    const { categorySlug } = resolvedParams;
    const categoryName = getCategoryNameBySlug(categorySlug);
    const tools = getToolsByCategory(categorySlug);

    if (!categoryName || tools.length === 0) {
        notFound(); // Trigger 404 if category doesn't exist or has no tools
    }

    return (
        <div>
            <nav aria-label="breadcrumb" className="mb-6 text-sm text-slate-400">
                <Link href="/" className="hover:text-cyan-400 hover:underline">
                    All Tools
                </Link>
                <span className="mx-2">»</span>
                <span>{categoryName}</span>
            </nav>

            <h1 className="text-3xl font-bold mb-6 text-slate-100">{categoryName} Tools</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                    // Pass full tool object, hide category link on category page
                    <ToolCard key={tool.slug} tool={tool} showCategoryLink={false} />
                ))}
            </div>
        </div>
    );
}
