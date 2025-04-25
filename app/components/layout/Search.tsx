'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tools, Tool } from '@/lib/tools';

export default function Search() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1); // For keyboard navigation
    const router = useRouter();
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // --- Filtering Logic ---
    const updateFilteredTools = useCallback((term: string) => {
        if (term.trim() === '') {
            setFilteredTools([]);
            setIsDropdownVisible(false);
            setActiveIndex(-1);
        } else {
            const lowerCaseTerm = term.toLowerCase();
            const results = tools
                .filter(
                    (tool) =>
                        tool.title.toLowerCase().includes(lowerCaseTerm) ||
                        tool.description.toLowerCase().includes(lowerCaseTerm)
                )
                .slice(0, 7); // Limit results to avoid huge dropdown

            setFilteredTools(results);
            setIsDropdownVisible(results.length > 0);
            setActiveIndex(-1); // Reset keyboard selection on new search
        }
    }, []); // No dependencies as `tools` is static

    // --- Event Handlers ---
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        updateFilteredTools(newSearchTerm);
    };

    const handleSuggestionClick = (slug: string) => {
        setSearchTerm(''); // Clear input
        setFilteredTools([]); // Clear results
        setIsDropdownVisible(false); // Hide dropdown
        router.push(`/tools/${slug}`); // Navigate
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isDropdownVisible || filteredTools.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault(); // Prevent cursor move
                setActiveIndex((prevIndex) =>
                    prevIndex >= filteredTools.length - 1 ? 0 : prevIndex + 1
                );
                break;
            case 'ArrowUp':
                event.preventDefault(); // Prevent cursor move
                setActiveIndex((prevIndex) =>
                    prevIndex <= 0 ? filteredTools.length - 1 : prevIndex - 1
                );
                break;
            case 'Enter':
                event.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredTools.length) {
                    handleSuggestionClick(filteredTools[activeIndex].slug);
                } else if (filteredTools.length > 0) {
                    // Optionally navigate to first result if none selected
                    // handleSuggestionClick(filteredTools[0].slug);
                }
                break;
            case 'Escape':
                event.preventDefault();
                setSearchTerm('');
                setIsDropdownVisible(false);
                setFilteredTools([]);
                setActiveIndex(-1);
                inputRef.current?.blur(); // Unfocus input
                break;
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && isDropdownVisible) {
            const listElement = document.getElementById(`suggestion-${activeIndex}`);
            listElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex, isDropdownVisible]);

    // --- Click Outside Handler ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownVisible(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Empty dependency array means this runs once on mount

    // --- Render ---
    return (
        <div className="relative" ref={searchContainerRef}>
            <input
                ref={inputRef}
                type="search"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => updateFilteredTools(searchTerm)} // Show dropdown on focus if term exists
                onKeyDown={handleKeyDown} // Handle keyboard nav
                className="w-full sm:w-64 px-3 py-1.5 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                aria-label="Search tools"
                aria-haspopup="listbox"
                // aria-expanded={isDropdownVisible}
                aria-controls="search-suggestions"
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            />

            {isDropdownVisible && (
                <div
                    id="search-suggestions"
                    role="listbox"
                    className="absolute z-10 mt-1 w-full sm:w-64 max-h-60 overflow-y-auto rounded-md bg-slate-700 border border-slate-600 shadow-lg py-1 text-sm"
                >
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool, index) => (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                id={`suggestion-${index}`}
                                role="option"
                                aria-selected={index === activeIndex}
                                onClick={() => handleSuggestionClick(tool.slug)} // Ensure dropdown closes on click
                                className={`block px-4 py-2 text-slate-200 hover:bg-slate-600 cursor-pointer ${
                                    index === activeIndex ? 'bg-slate-600' : '' // Highlight active item
                                }`}
                                // Optional: Highlight match in title/desc (more complex)
                            >
                                {tool.title}
                            </Link>
                        ))
                    ) : (
                        // This case should ideally not be reached if isDropdownVisible is false when no results
                        // But kept as a fallback. The logic ensures dropdown hides if results are empty.
                        <div className="px-4 py-2 text-slate-400">No tools found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
