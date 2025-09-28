import React, { useRef, useEffect } from 'react';

interface PopoverProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const Popover: React.FC<PopoverProps> = ({ isOpen, onClose, children, className }) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={popoverRef}
            className={`absolute z-10 p-2 bg-slate-700 border border-slate-600 rounded-lg shadow-lg ${className}`}
        >
            {children}
        </div>
    );
};

export default Popover;
