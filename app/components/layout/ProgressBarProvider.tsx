'use client';

import React from 'react';
import NextTopLoader from 'nextjs-toploader';

export default function ProgressBarProvider({ children }: { children: React.ReactNode }) {
    return (
        <>
            <NextTopLoader
                color="#22d3ee"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #22d3ee, 0 0 5px #22d3ee"
            />
            {children}
        </>
    );
}
