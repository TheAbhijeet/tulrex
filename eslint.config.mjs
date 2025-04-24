import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
        rules: {
            'react/no-unescaped-entities': 'off',
            '@next/next/no-img-element': 'off',
        },
    }),
];

export default eslintConfig;
