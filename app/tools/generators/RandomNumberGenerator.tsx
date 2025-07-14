'use client';
import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RandomNumberGenerator() {
    const [min, setMin] = useState<number>(1);
    const [max, setMax] = useState<number>(100);
    const [result, setResult] = useState<number | string>('');
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(() => {
        setError('');
        const minVal = Number(min);
        const maxVal = Number(max);

        if (isNaN(minVal) || isNaN(maxVal)) {
            setError('Please enter valid numbers for Min and Max.');
            setResult('');
            return;
        }
        if (minVal > maxVal) {
            setError('Min value cannot be greater than Max value.');
            setResult('');
            return;
        }
        const randomInt = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        setResult(randomInt);
    }, [min, max]);

    return (
        <div className="space-y-4 max-w-md mx-auto">
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label
                        htmlFor="min-num"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Min:
                    </label>
                    <Input
                        id="min-num"
                        type="number"
                        value={min}
                        onChange={(e) => setMin(Number(e.target.value))}
                    />
                </div>
                <div className="flex-1">
                    <label
                        htmlFor="max-num"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Max:
                    </label>
                    <Input
                        id="max-num"
                        type="number"
                        value={max}
                        onChange={(e) => setMax(Number(e.target.value))}
                    />
                </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button onClick={handleGenerate} className="w-full">
                Generate Number
            </Button>
            {result !== '' && (
                <div className="mt-4 text-center">
                    <p className="text-slate-300">Result:</p>
                    <p className="text-4xl font-bold text-cyan-400 py-2">{result}</p>
                </div>
            )}
        </div>
    );
}
