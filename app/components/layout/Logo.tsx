import Link from 'next/link';
import { Layers3 } from 'lucide-react';

export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2 group" aria-label="TulRex Home">
            <div className="p-2 bg-slate-800  rounded-lg ">
                <Layers3 className="bg-slate-800/90  transition-colors duration-200" size={24} />
            </div>
            <span className=" text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 group-hover:from-slate-50 group-hover:to-slate-200 transition-all duration-300">
                TulRex
            </span>
        </Link>
    );
}
