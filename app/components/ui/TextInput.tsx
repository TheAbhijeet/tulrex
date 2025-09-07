import React from 'react';

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const TextInput: React.FC<TextInputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${className}`}
            {...props}
        />
    );
};

export default TextInput;
