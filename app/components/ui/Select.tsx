import React from 'react';

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
    className = '',
    children,
    ...props
}) => (
    <select
        className={`block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none appearance-none ${className}`}
        {...props}
    >
        {children}
    </select>
);

export default Select;
