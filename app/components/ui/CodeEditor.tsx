import Prism from 'prismjs';
import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';

const themeColors = {
    input: {
        bg: '#1e293b',
        border: '#334155',
        text: '#e2e8f0',
    },
    output: {
        bg: '#0f172a',
        border: '#334155',
        text: '#e2e8f0',
    },
};

export interface CodeEditorProps {
    initialValue?: string;
    language?: string;
    onChange?: (code: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    isOutput?: boolean;
    className?: string;
    minHeight?: string;
    'aria-label'?: string;
    id?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    initialValue = '',
    language = 'typescript',
    onChange,
    placeholder,
    readOnly = false,
    isOutput = false,
    className = '',
    minHeight = '24rem',
    'aria-label': ariaLabel,
    id,
}) => {
    const [code, setCode] = useState(initialValue);

    const handleChange = (newCode: string) => {
        setCode(newCode);
        if (onChange) onChange(newCode);
    };

    const highlight = (code: string) => {
        if (!Prism.languages[language]) {
            console.warn(`Language "${language}" not supported for highlighting`);
            return code;
        }
        return Prism.highlight(code, Prism.languages[language], language);
    };

    const baseStyle = {
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: '0.8125rem',
        minHeight: minHeight,
        outline: 0,
        border: `1px solid ${themeColors.input.border}`,
        borderRadius: '0.375rem',
        caretColor: themeColors.input.text,
        backgroundColor: isOutput ? themeColors.output.bg : themeColors.input.bg,
        overflow: 'auto',
    };

    return (
        <Editor
            value={code}
            onValueChange={handleChange}
            highlight={highlight}
            padding={10}
            style={baseStyle}
            textareaId={id}
            aria-label={ariaLabel || `${language} Code Editor`}
            className={`code-editor ${isOutput ? 'code-editor-output' : 'code-editor-input'} ${className}`}
            readOnly={readOnly}
            placeholder={placeholder}
        />
    );
};

export default CodeEditor;
