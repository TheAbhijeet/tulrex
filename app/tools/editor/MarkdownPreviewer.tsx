'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaInput from '@/components/ui/TextareaInput';

const MARKDOWN_GUIDE = [
    { label: 'Heading 1', syntax: '# Heading 1' },
    { label: 'Heading 2', syntax: '## Heading 2' },

    { label: 'Heading 6', syntax: '###### Heading 6' },

    { label: 'Bold', syntax: '**Bold Text**' },
    { label: 'Italic', syntax: '*Italic Text*' },
    { label: 'Bold + Italic', syntax: '***Bold Italic***' },
    { label: 'Strikethrough', syntax: '~~Strikethrough~~' },
    { label: 'Underline (HTML)', syntax: '<u>Underline</u>' },

    { label: 'Link', syntax: '[Title](url)' },
    { label: 'Image', syntax: '![Alt](url)' },

    { label: 'Inline Code', syntax: '`code`' },
    { label: 'Code Block', syntax: '```\nlanguage\ncode\n```' },

    { label: 'Blockquote', syntax: '> Quote' },
    { label: 'Nested Blockquote', syntax: '>> Nested Quote' },

    { label: 'Unordered List', syntax: '- Item' },
    { label: 'Ordered List', syntax: '1. Item' },
    { label: 'Task List', syntax: '- [ ] Task' },

    { label: 'Horizontal Line', syntax: '---' },

    { label: 'Table', syntax: '| H1 | H2 |\n|---|---|\n| C1 | C2 |' },

    { label: 'Inline HTML', syntax: '<span>HTML</span>' },

    { label: 'Footnote', syntax: 'Text[^1]\n\n[^1]: Footnote text' },

    { label: 'Emoji', syntax: ':smile:' },

    { label: 'Highlight (GFM)', syntax: '==highlight==' },

    { label: 'Definition List', syntax: 'Term\n: Definition' },

    {
        label: 'Details/Collapse',
        syntax: '<details>\n<summary>Title</summary>\nContent\n</details>',
    },

    { label: 'Math Inline (KaTeX/LaTeX)', syntax: '$x^2 + y^2$' },
    { label: 'Math Block', syntax: '$$\nx^2 + y^2\n$$' },
];

export default function MarkdownPreviewer() {
    const [markdown, setMarkdown] = useState<string>(`
# Markdown Guide Demo

Welcome to the **Tulrex Markdown Preview**!  
This is a sample document showing most features.

---

## Text Formatting

- **Bold Text**
- *Italic Text*
- ***Bold + Italic***
- ~~Strikethrough~~
- Normal text with **bold**, *italic*, and ~~strike~~ mixed.

---

## Lists

### Unordered
- Item One
- Item Two
  - Nested Item

### Ordered
1. First Step
2. Second Step
3. Third Step

### Task List
- [ ] Incomplete Task
- [x] Completed Task

---

## Links & Images

[Open Tulrex](https://tulrex.com)



---

## Quotes

> This is a quote.
>> This is a nested quote.

---

## Inline Code

Use \`npm install something\` to install packages.

---

## Code Blocks

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}\`;
}

console.log(greet("Bye bye"));
\`\`\`

\`\`\`python
def add(a, b):
    return a + b

print(add(5, 7))
\`\`\`

\`\`\`json
{
  "name": "example",
  "version": "1.0.0"
}
\`\`\`

---

## Tables

| Feature       | Supported |
|--------------|-----------|
| Bold         | Yes       |
| Italic       | Yes       |
| Code Blocks  | Yes       |
| Tables       | Yes       |

---


## Collapsible Section (HTML)

<details>
  <summary>Click to Expand</summary>
  Hidden extra information here.
</details>

---

## Math (If renderer supports it)

Inline: $a^2 + b^2 = c^2$  
Block:

$$
E = mc^2
$$

---

End of demo. 🎉
`);

    return (
        <div className=" flex flex-col xl:flex-row gap-4 max-h-[calc(100vh-200px)] min-h-[600px]">
            {/* Guide Sidebar */}
            <div className="xl:w-60 bg-slate-800 p-4 rounded-lg border border-slate-700 overflow-y-auto shrink-0">
                <h3 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-700 pb-2">
                    Cheatsheet
                </h3>
                <ul className="space-y-3 text-sm">
                    {MARKDOWN_GUIDE.map((item) => (
                        <li key={item.label}>
                            <div className="text-slate-400 font-medium">{item.label}</div>
                            <code className="block bg-slate-900 px-2 py-1 rounded text-cyan-400 mt-1 wrap-break-word font-mono text-xs">
                                {item.syntax}
                            </code>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Editor Pane */}
            <div className="flex-1 flex flex-col min-w-0">
                <label className="text-sm font-medium text-slate-300 mb-2">Input Markdown</label>
                <TextareaInput
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="flex-1 font-mono text-sm resize-none h-full"
                    placeholder="Type markdown here..."
                />
            </div>

            {/* Preview Pane */}
            <div className="flex-1 flex flex-col min-w-0">
                <label className="text-sm  font-medium text-slate-300 mb-2">Live Preview</label>
                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-md p-6 overflow-y-auto prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
