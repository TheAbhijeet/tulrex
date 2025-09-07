import Link from 'next/link';
import { Layers3 } from 'lucide-react';

export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 group" aria-label="TulRex Home">
            <div className="p-2 bg-gray-800  rounded-lg ">
                <Layers3 className="bg-gray-800/90  transition-colors duration-200" size={24} />
            </div>
            <span className=" text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 group-hover:from-gray-50 group-hover:to-gray-200 transition-all duration-300">
                TulRex
            </span>
        </Link>
    );
}
