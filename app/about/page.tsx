import { githubRepoUrl } from '@/config';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About TulRex',
    description: 'Learn about the TulRex project, its purpose, and open-source nature.',
};

export default function AboutPage() {
    const repoUrl = githubRepoUrl;

    return (
        <div className="md:max-w-4xl mx-auto prose dark:prose-invert">
            <h1>About TulRex</h1>
            <p>
                TulRex is a collection of simple, free, client-side web tools designed for
                developers, content creators, and anyone who needs quick utilities without server
                interaction, ads or tracking.
            </p>
            <p>
                In fact, There’s no database behind this app, everything you see is pre-built and
                served as static content.
            </p>

            <p>
                TulRex is completely open source. You’re welcome to use the existing tools,
                contribute improvements, or even add entirely new ones. My hope is that together we
                can grow Tulrex into a reliable, extensible platform that provides a wide range of
                everyday utilities without compromising user privacy.
            </p>

            <p>
                We encourage contributions, bug reports, and suggestions! Check out the repository.
            </p>

            <h2>Key Principles:</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
                <li>
                    <strong className="text-cyan-400">Client-Side Only:</strong> All processing
                    happens directly in your browser. No data is sent to any server.
                </li>
                <li>
                    <strong className="text-cyan-400">Fast & Minimalist:</strong> Designed for quick
                    loading and ease of use with a clean interface.
                </li>
                <li>
                    <strong className="text-cyan-400">Privacy Focused:</strong> No tracking, no ads.
                </li>
                <li>
                    <strong className="text-cyan-400">Open Source:</strong> The entire codebase is
                    available on GitHub for transparency and community contribution.
                </li>
            </ul>

            <h2>Why?</h2>

            <p>
                I made TulRex because I use a lot of these tools every day, and I was always a bit
                hesitant to upload my documents or photos online since I wasn’t sure how they might
                be used. So I figured why not build my own instead.
            </p>

            <p>
                I’m a web developer, but I stayed away from React.js for a long time. It’s not
                exactly the most loved framework out there, but since it’s so widely used I thought
                it would be a good place to start a project. That’s how <strong>Tulrex</strong> came
                to life.
            </p>
            <p>
                This project was built using Next.js, TypeScript, and Tailwind CSS, focusing on
                creating a performant static site.
            </p>

            <h2>How TulRex Stays Free?</h2>

            <p>
                Now you may be wondering, how do I make money if everything is open-source? What's
                the business model?
            </p>
            <p>
                The truth is, there isn't one. I cover the server and domain costs out of my own
                pocket. Sponsors and donations help too. I want to keep this site free for everyone,
                so please contribute in any way you can to support it.
            </p>

            <p>
                <Link
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                >
                    TulRex on GitHub
                </Link>
            </p>
        </div>
    );
}
