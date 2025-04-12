import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        template: '%s | Toolzen',
        default: 'Toolzen - Simple Client-Side Developer Tools',
    },
    description:
        'A collection of fast, free, client-side only tools for developers and content creators. No tracking, minimalist design.',
    metadataBase: new URL('https://your-toolzen-domain.com'), // Replace with your actual domain
    openGraph: {
        title: 'Toolzen - Simple Client-Side Developer Tools',
        description:
            'Fast, free, client-side developer tools. JSON Formatter, Base64, Regex Tester, and more.',
        url: 'https://your-toolzen-domain.com', // Replace with your actual domain
        siteName: 'Toolzen',
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
        title: 'Toolzen - Simple Client-Side Developer Tools',
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
                className={`${inter.className} bg-slate-900 text-slate-200 min-h-screen flex flex-col`}
            >
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
