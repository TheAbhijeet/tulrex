import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClientSideInfoBlock from './components/layout/ClientSideInfoBlock';
import SponsorBlock from './components/layout/SponsorBlock';
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
        title: 'TulRex - Simple Client-Side Developer Tools',
        description:
            'Fast, free, client-side developer tools. JSON Formatter, Base64, Regex Tester, and more.',
        url: 'https://tulrex.com',
        siteName: 'TulRex',
        // images: [ // Add an OG image later
        //   {
        //     url: '/og-image.png', // Place in /public
        //     width: 1200,
        //     height: 630,
        //   },
        // ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TulRex - Simple Client-Side Developer Tools',
        description:
            'Fast, free, client-side developer tools. JSON Formatter, Base64, Regex Tester, and more.',
        // images: ['/og-image.png'], // Add the same image
        // site: '@yourtwitterhandle', // Optional
        // creator: '@yourtwitterhandle', // Optional
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
    // Add other meta tags as needed: icons, manifest (for PWA)
    // icons: {
    //  icon: '/favicon.ico',
    //  apple: '/apple-touch-icon.png',
    // },
    // manifest: '/site.webmanifest',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.className}  bg-slate-900 text-slate-200 min-h-screen flex flex-col`}
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
                <SponsorBlock />
                <Toaster theme="light" position="top-center" />

                <Footer />
            </body>
        </html>
    );
}
