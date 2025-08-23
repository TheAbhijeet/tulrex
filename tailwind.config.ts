import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
    content: [
        // ... other paths
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            typography: ({ theme }: { theme: (path: string) => string }) => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-body': theme('colors.slate[300]'),
                        '--tw-prose-headings': theme('colors.slate[100]'),
                        '--tw-prose-lead': theme('colors.slate[400]'),
                        '--tw-prose-links': theme('colors.cyan[400]'),
                        '--tw-prose-bold': theme('colors.slate[100]'),
                        '--tw-prose-counters': theme('colors.slate[400]'),
                        '--tw-prose-bullets': theme('colors.slate[600]'),
                        '--tw-prose-hr': theme('colors.slate[700]'),
                        '--tw-prose-quotes': theme('colors.slate[100]'),
                        '--tw-prose-quote-borders': theme('colors.slate[700]'),
                        '--tw-prose-captions': theme('colors.slate[400]'),
                        '--tw-prose-code': theme('colors.cyan[300]'),
                        '--tw-prose-pre-code': theme('colors.slate[300]'),
                        '--tw-prose-pre-bg': theme('colors.slate[800]'), // Code block background
                        '--tw-prose-th-borders': theme('colors.slate[600]'),
                        '--tw-prose-td-borders': theme('colors.slate[700]'),
                        '--tw-prose-invert-body': theme('colors.slate[300]'),
                    },
                },
            }),
        },
    },
    plugins: [typography],
};
export default config;
