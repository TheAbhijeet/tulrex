'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Expand, CircleX } from 'lucide-react';

interface FullScreenWrapperProps {
    /** The content to be displayed inside the wrapper */
    children: ReactNode;
    /** Custom Tailwind classes to apply to the wrapper in its normal (non-fullscreen) state. E.g., 'h-72 w-full' */
    className?: string;
    /** Background color class for fullscreen mode */
    fullScreenBgClass?: string;
}

export default function FullScreenWrapper({
    children,
    className = 'relative h-64 w-full', // A sensible default size
    fullScreenBgClass = 'bg-gray-900/95 backdrop-blur-sm',
}: FullScreenWrapperProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Effect to handle the 'Escape' key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsFullScreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Effect to prevent body scrolling when in fullscreen
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        if (isFullScreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow;
        }
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isFullScreen]);

    return (
        <div
            className={`
        transition-all duration-300 ease-in-out
        ${
            isFullScreen
                ? `fixed inset-0 z-50 flex flex-col p-4 sm:p-6 ${fullScreenBgClass}` // Fullscreen state
                : `relative ${className}` // Normal state
        }
      `}
        >
            <div
                className={`
          w-full overflow-hidden rounded-md border
          ${
              isFullScreen
                  ? 'border-gray-600 flex-grow' // Fullscreen inner container
                  : 'border-gray-700 bg-gray-800 h-full' // Normal inner container
          }
        `}
            >
                {/* The action button to toggle fullscreen */}
                <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="absolute top-4 right-6 z-10 p-2  bg-gray-600 text-gray-100 rounded-md hover:bg-gray-900 hover:text-white transition-colors"
                    title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
                >
                    {isFullScreen ? (
                        <CircleX className="h-6 w-6" />
                    ) : (
                        <Expand className="h-4 w-4" />
                    )}
                </button>

                {/* This is where the wrapped content will be rendered */}
                {children}
            </div>
        </div>
    );
}
