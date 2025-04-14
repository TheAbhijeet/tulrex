import React from 'react';

interface DataTableProps {
    headers: string[];
    data: (string | number | boolean | null)[][]; // Expects array of arrays for simplicity here
    maxHeight?: string; // e.g., '400px'
}

export default function DataTable({ headers, data, maxHeight = '60vh' }: DataTableProps) {
    if (!data || data.length === 0) {
        return <p className="text-center text-slate-400 italic">No data to display.</p>;
    }

    return (
        <div
            className="overflow-auto border border-slate-700 rounded-md bg-slate-900"
            style={{ maxHeight }}
        >
            <table className="min-w-full divide-y divide-slate-700 text-xs">
                <thead className="bg-slate-800 sticky top-0 z-10">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-700/50">
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-3 py-1.5 text-slate-200 whitespace-nowrap"
                                >
                                    {/* Render basic types cleanly */}
                                    {cell === null || cell === undefined ? (
                                        <span className="italic text-slate-500">null</span>
                                    ) : (
                                        String(cell)
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
