import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { getToolBySlug, tools } from '@/lib/tools';

type Props = {
    params: Promise<{ slug: string }>;
};

//  Static Generation
// Tell Next.js which slugs to pre-render
export function generateStaticParams() {
    return tools.map((tool) => ({
        slug: tool.slug,
    }));
}

//  Dynamic Metadata
// Generate metadata for each tool page
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const tool = await getToolBySlug(resolvedParams.slug);

    if (!tool) {
        return {
            title: 'Tool Not Found', // Fallback title
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: tool.title, // Dynamic title based on the tool
        description: tool.description, // Dynamic description
        openGraph: {
            title: `${tool.title} | TulRex`,
            description: tool.description,
            url: `/tools/${tool.slug}`, // Relative URL is okay here if metadataBase is set
            images: previousImages, // Inherit images from parent layout
        },
        twitter: {
            title: `${tool.title} | TulRex`,
            description: tool.description,
        },
    };
}

//  Page Component
export default async function ToolPage({ params }: Props) {
    // First await the params object
    const resolvedParams = await params;

    // Now use the resolved slug
    const tool = await getToolBySlug(resolvedParams.slug);

    if (!tool) {
        notFound(); // Trigger the 404 page if slug is invalid
    }

    // Dynamically render the specific tool's component
    const ToolComponent = tool.component;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-2 text-slate-100">{tool.title}</h1>
            <p className="text-slate-400 mb-6">{tool.description}</p>

            <div className="bg-slate-800 p-4 sm:p-6 rounded-lg border border-slate-700">
                <ToolComponent />
            </div>
        </div>
    );
}
