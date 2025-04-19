import React from 'react';

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextareaInput: React.FC<TextareaInputProps> = ({ className = '', ...props }) => {
    return (
        <textarea
            className={`w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-y ${className}`}
            {...props}
        />
    );
};

export default TextareaInput;
