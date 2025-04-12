// src/components/tools/CronParser.tsx
'use client';
import { useState, useMemo } from 'react';
import cronstrue from 'cronstrue';
import Input from '@/components/ui/Input';
// You might need a full cron parser library (like 'cron-parser') to get *next dates* accurately.
// 'cronstrue' is only for human-readable description.
// Let's stick to description for simplicity now. Add 'cron-parser' if next dates are needed.

export default function CronParser() {
    const [cronExpression, setCronExpression] = useState('*/5 * * * *'); // Default: Every 5 minutes
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useMemo(() => {
        setError('');
        setDescription('');
        if (!cronExpression) {
            return;
        }
        try {
            const desc = cronstrue.toString(cronExpression);
            setDescription(desc);
        } catch (e: any) {
            setError(e.message || 'Invalid Cron Expression');
        }
    }, [cronExpression]);

    return (
        <div className="space-y-4 max-w-xl mx-auto">
            <div>
                <label
                    htmlFor="cron-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Cron Expression:
                </label>
                <Input
                    id="cron-input"
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    placeholder="e.g., 0 18 * * MON-FRI"
                    className="font-mono"
                />
                <p className="text-xs text-slate-400 mt-1">
                    Format: Minute Hour DayOfMonth Month DayOfWeek
                </p>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {description && !error && (
                <div className="p-4 bg-slate-800 rounded border border-slate-700 text-center">
                    <p className="text-lg text-cyan-400">{description}</p>
                </div>
            )}
            {/* Placeholder for next dates if using 'cron-parser'
       <div>
           <h4 className="text-base font-medium text-slate-300 mb-1">Next 5 Scheduled Runs:</h4>
           <pre className="p-3 bg-slate-900 border border-slate-700 rounded text-sm">...</pre>
       </div>
       */}
        </div>
    );
}
