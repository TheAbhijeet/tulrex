import { useState } from 'react';
import Button from '@/components/ui/Button';

interface CopyButtonProps {
    text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Button onClick={handleCopy} variant="secondary">
            {copied ? 'Copied!' : 'Copy'}
        </Button>
    );
};
