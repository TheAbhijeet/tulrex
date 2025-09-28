import React, { ButtonHTMLAttributes } from 'react';

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isActive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    children,
    isActive,
    className,
    ...props
}) => {
    const baseClasses =
        'p-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800';
    const activeClasses = isActive
        ? 'bg-cyan-600 text-white'
        : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100';

    return (
        <button className={`${baseClasses} ${activeClasses} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default ToolbarButton;
