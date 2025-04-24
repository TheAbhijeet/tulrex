'use client';
import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface AgeResult {
    years: number;
    months: number;
    days: number;
    totalDays: number;
}

export default function AgeCalculator() {
    const [birthDate, setBirthDate] = useState('');
    const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]); // Today
    const [result, setResult] = useState<AgeResult | null>(null);
    const [error, setError] = useState<string>('');

    const calculateAge = useCallback(() => {
        setError('');
        setResult(null);
        if (!birthDate || !targetDate) {
            setError('Please select both Birth Date and Target Date.');
            return;
        }

        try {
            const startDate = new Date(birthDate);
            const endDate = new Date(targetDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                setError('Invalid date format.');
                return;
            }
            if (startDate > endDate) {
                setError('Birth Date cannot be after Target Date.');
                return;
            }

            let years = endDate.getFullYear() - startDate.getFullYear();
            let months = endDate.getMonth() - startDate.getMonth();
            let days = endDate.getDate() - startDate.getDate();

            if (days < 0) {
                months--;
                const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                days += prevMonth.getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }

            const totalDays = Math.floor(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            setResult({ years, months, days, totalDays });
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to calculate age: ${err.message}`);
            }
            console.error('Error calculating age:', err);
        }
    }, [birthDate, targetDate]);

    return (
        <div className="space-y-4 max-w-lg mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label
                        htmlFor="birth-date"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Birth Date:
                    </label>
                    <Input
                        id="birth-date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div>
                    <label
                        htmlFor="target-date"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Calculate Age As Of:
                    </label>
                    <Input
                        id="target-date"
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                    />
                </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button onClick={calculateAge} className="w-full">
                Calculate Age
            </Button>
            {result && (
                <div className="mt-4 p-4 bg-slate-800 border border-slate-700 rounded-md text-center">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Age Result</h3>
                    <p className="text-2xl text-slate-100">
                        {result.years} <span className="text-base text-slate-400">years</span>,{' '}
                        {result.months} <span className="text-base text-slate-400">months</span>,{' '}
                        {result.days} <span className="text-base text-slate-400">days</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                        Total Days: {result.totalDays.toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
}
