'use client';

import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import TextareaInput from '@/components/ui/TextareaInput';

export default function MarkdownPreviewer() {
    const [markdownText, setMarkdownText] = useState(`# Markdown Preview

Type your **Markdown** text on the left, and see the *HTML preview* on the right.

- List item 1
- List item 2

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('Tulrex User');
\`\`\`
`);
    const [htmlOutput, setHtmlOutput] = useState('');

    // Configure marked (optional: add things like GFM, breaks)
    marked.setOptions({
        gfm: true, // Use GitHub Flavored Markdown
        breaks: true, // Convert single line breaks to <br>
        // mangle: false, // Don't obfuscate email addresses
        // headerIds: false, // Don't add IDs to headers
    });

    useEffect(() => {
        // Parse the markdown whenever the input text changes
        const parseMarkdown = async () => {
            const rawHtml = await marked.parse(markdownText);
            // Basic sanitization (replace with a proper sanitizer like DOMPurify if needed for untrusted input)
            // For a client-side tool where the user inputs their own markdown, this might be okay.
            // If security is paramount, add DOMPurify: pnpm add dompurify @types/dompurify
            // import DOMPurify from 'dompurify';
            // const cleanHtml = DOMPurify.sanitize(rawHtml);
            // setHtmlOutput(cleanHtml);
            setHtmlOutput(rawHtml);
        };
        parseMarkdown();
    }, [markdownText]);

    // Use useMemo to prevent re-creating the dangerouslySetInnerHTML object on every render
    const previewHtml = useMemo(() => ({ __html: htmlOutput }), [htmlOutput]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[60vh]">
            <div>
                <label
                    htmlFor="markdown-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Markdown Input:
                </label>
                <TextareaInput
                    id="markdown-input"
                    value={markdownText}
                    onChange={(e) => setMarkdownText(e.target.value)}
                    placeholder="Type Markdown here..."
                    className="h-full min-h-[50vh] font-mono" // Ensure consistent height
                    style={{ height: 'calc(100% - 2rem)' }} // Adjust height dynamically
                />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-300 mb-1">HTML Preview:</p>
                {/* Apply Tailwind typography styles */}
                <div
                    className="prose prose-invert max-w-none p-4 bg-slate-900 border border-slate-700 rounded-md h-full min-h-[50vh] overflow-y-auto"
                    style={{ height: 'calc(100% - 2rem)' }} // Adjust height dynamically
                    dangerouslySetInnerHTML={previewHtml}
                />
            </div>
        </div>
    );
}
