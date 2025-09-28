import React from 'react';

export interface KeyValueItem {
    id: number;
    key: string;
    value: string;
    enabled: boolean;
}

interface KeyValueEditorProps {
    items: KeyValueItem[];
    onItemChange: (id: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
    onAddItem: () => void;
    onRemoveItem: (id: number) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
    items,
    onItemChange,
    onAddItem,
    onRemoveItem,
    keyPlaceholder = 'Key',
    valuePlaceholder = 'Value',
}) => {
    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(e) => onItemChange(item.id, 'enabled', e.target.checked)}
                        className="form-checkbox h-4 w-4 rounded bg-slate-600 border-slate-500 text-cyan-600 focus:ring-cyan-500 shrink-0"
                        aria-label="Enable/Disable item"
                    />
                    <input
                        type="text"
                        value={item.key}
                        onChange={(e) => onItemChange(item.id, 'key', e.target.value)}
                        placeholder={keyPlaceholder}
                        className="flex-grow p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                    />
                    <input
                        type="text"
                        value={item.value}
                        onChange={(e) => onItemChange(item.id, 'value', e.target.value)}
                        placeholder={valuePlaceholder}
                        className="flex-grow p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                    />
                    <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors shrink-0"
                        aria-label="Remove item"
                    >
                        &#x2715; {/* Cross character */}
                    </button>
                </div>
            ))}
            <button onClick={onAddItem} className="text-sm text-cyan-400 hover:text-cyan-300">
                + Add Row
            </button>
        </div>
    );
};
