'use client';
import { useState, useMemo } from 'react';
import cronstrue from 'cronstrue';
import Input from '@/components/ui/Input';

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
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Invalid Cron Expression');
            }
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
        </div>
    );
}
