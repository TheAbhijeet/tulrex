import React from 'react';

interface DataTableProps {
    headers: string[];
    data: (string | number | boolean | null)[][];
    maxHeight?: string;
}

export default function DataTable({ headers, data, maxHeight = '60vh' }: DataTableProps) {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-400 italic">No data to display.</p>;
    }

    return (
        <div
            className="overflow-auto border border-gray-700 rounded-md bg-gray-900"
            style={{ maxHeight }}
        >
            <table className="min-w-full divide-y divide-gray-700 text-xs">
                <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                scope="col"
                                className="px-3 py-2 text-left font-medium text-gray-300 whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 bg-gray-800/30">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-700/50">
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-3 py-1.5 text-gray-200 whitespace-nowrap"
                                >
                                    {/* Render basic types cleanly */}
                                    {cell === null || cell === undefined ? (
                                        <span className="italic text-gray-500">null</span>
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
