import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    ref?: React.Ref<HTMLInputElement>;
}
const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
    return (
        <input
            className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${className}`}
            {...props}
        />
    );
};
export default Input;
