import React from 'react';

type TextareaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaInput: React.FC<TextareaInputProps> = ({ className = '', ...props }) => {
    return (
        <textarea
            className={`w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400  outline-none resize-y ${className}`}
            {...props}
        />
    );
};

export default TextareaInput;
