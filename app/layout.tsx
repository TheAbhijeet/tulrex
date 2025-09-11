import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClientSideInfoBlock from './components/layout/ClientSideInfoBlock';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        template: '%s | TulRex',
        default: 'TulRex - Simple, Fast, and Open-Source Tools in Your Browser',
    },
    description:
        'A collection of fast, free, Open-Source and client-side only tools for developers and content creators. No tracking, minimalist design.',
    metadataBase: new URL('https://tulrex.com'),
    openGraph: {
        title: 'TulRex - Simple, Fast, and Open-Source Tools in Your Browser',
        description:
            'Simple, fast, and open-source web tools that run entirely in your browser — no servers, no ads, no tracking.',
        url: 'https://tulrex.com',
        siteName: 'TulRex',

        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TulRex - Simple, Fast, and Open-Source Tools in Your Browser',
        description:
            'Fast, free, client-side developer tools. JSON Formatter, Base64, Regex Tester, and more.',
    },
    robots: {
        // Good for SEO
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.className}  bg-gray-950 text-gray-200 min-h-screen flex flex-col`}
            >
                <Header />
                {/* Main content area */}
                <main className="flex-grow container mx-auto px-4 md:px-10 py-8">
                    {/* Place ClientSideInfoBlock just inside main, before page content */}
                    <ClientSideInfoBlock />

                    {/* Page specific content */}
                    {children}
                </main>

                {/* Place SponsorBlock between main content and footer */}
                {/* <SponsorBlock /> */}
                <Toaster theme="light" position="top-center" />

                <Footer />
            </body>
        </html>
    );
}
