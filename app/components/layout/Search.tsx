'use client';

import { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    Combobox,
    Transition,
    ComboboxOptions,
    ComboboxOption,
    ComboboxInput,
    DialogPanel,
    TransitionChild,
} from '@headlessui/react';
import { Search as SearchIcon } from 'lucide-react';
import { tools } from '@/lib/tools';

export default function Search() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    const onSelect = useCallback(
        (slug: string) => {
            router.push(`/tools/${slug}`);
            setIsOpen(false);
        },
        [router]
    );

    const filteredTools =
        query === ''
            ? tools
            : tools.filter((tool) => {
                  return (
                      tool.title.toLowerCase().includes(query.toLowerCase()) ||
                      tool.description.toLowerCase().includes(query.toLowerCase())
                  );
              });

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full max-w-sm h-10 px-4 flex items-center justify-between text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <SearchIcon size={16} />
                    <span>Search tools...</span>
                </div>
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-sans border border-gray-600 bg-gray-800 rounded">
                    Ctrl K
                </kbd>
            </button>

            <Transition show={isOpen} as={Fragment} afterLeave={() => setQuery('')}>
                {/* 3. Pass the ref to the Dialog's initialFocus prop */}
                <Dialog onClose={setIsOpen} className="relative z-50" initialFocus={inputRef}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 p-4 pt-[25vh] overflow-y-auto">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-xl mx-auto rounded-xl bg-gray-800 border border-gray-700 shadow-2xl overflow-hidden">
                                <Combobox onChange={(slug: string) => onSelect(slug)}>
                                    <div className="flex items-center px-4 py-4 border-b border-gray-700">
                                        <ComboboxInput
                                            // 4. Attach the ref to the actual input element
                                            ref={inputRef}
                                            onChange={(event) => setQuery(event.target.value)}
                                            className="w-full bg-transparent p-4 border-0 text-gray-200 placeholder-gray-500 focus:ring-0"
                                            placeholder="Search for a tool..."
                                        />
                                    </div>

                                    {filteredTools.length > 0 && (
                                        <ComboboxOptions
                                            static
                                            className="max-h-72 overflow-y-auto"
                                        >
                                            {filteredTools.map((tool) => (
                                                <ComboboxOption key={tool.slug} value={tool.slug}>
                                                    {({ focus }) => (
                                                        <div
                                                            className={`px-4 py-3 flex items-center gap-3 cursor-pointer ${focus ? 'bg-cyan-600' : 'bg-gray-800'}`}
                                                        >
                                                            <div>
                                                                <p
                                                                    className={`font-medium ${focus ? 'text-white' : 'text-gray-200'}`}
                                                                >
                                                                    {tool.title}
                                                                </p>
                                                                <p
                                                                    className={`text-sm ${focus ? 'text-cyan-100' : 'text-gray-400'}`}
                                                                >
                                                                    {tool.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </ComboboxOption>
                                            ))}
                                        </ComboboxOptions>
                                    )}

                                    {query && filteredTools.length === 0 && (
                                        <p className="p-6 text-center text-gray-400">
                                            No results found.
                                        </p>
                                    )}
                                </Combobox>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
