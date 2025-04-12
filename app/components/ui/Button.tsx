// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
    className = '',
    variant = 'primary',
    children,
    ...props
}) => {
    const baseStyle =
        'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    const primaryStyle = 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500';
    const secondaryStyle = 'bg-slate-600 text-slate-100 hover:bg-slate-500 focus:ring-slate-500';

    const variantStyle = variant === 'primary' ? primaryStyle : secondaryStyle;

    return (
        <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
