'use client';

import { useState, useCallback } from 'react';

type CopyStatus = 'idle' | 'copied' | 'error';

export function useCopyToClipboard(timeout = 2000): [CopyStatus, (text: string) => void] {
    const [status, setStatus] = useState<CopyStatus>('idle');

    const copy = useCallback(
        (text: string) => {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    setStatus('copied');
                    const timer = setTimeout(() => setStatus('idle'), timeout);
                    return () => clearTimeout(timer);
                })
                .catch(() => {
                    setStatus('error');
                    const timer = setTimeout(() => setStatus('idle'), timeout);
                    return () => clearTimeout(timer);
                });
        },
        [timeout]
    );

    return [status, copy];
}
