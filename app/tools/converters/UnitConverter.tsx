'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import convert from 'convert-units';
import Input from '@/components/ui/Input';

type Measure = convert.Measure; // 'length', 'mass', 'temperature', etc.
type Unit = convert.Unit; // 'm', 'kg', 'C', etc.

const measures = convert().measures();

export default function UnitConverter() {
    const [measure, setMeasure] = useState<Measure>('length');
    const [fromUnit, setFromUnit] = useState<Unit>('m');
    const [toUnit, setToUnit] = useState<Unit>('ft');
    const [inputValue, setInputValue] = useState<string>('1');
    const [outputValue, setOutputValue] = useState<string>('');
    const [error, setError] = useState('');

    const possibleUnits = useMemo(() => {
        try {
            return convert().list(measure);
        } catch {
            return []; // Should not happen with listed measures
        }
    }, [measure]);

    // Update units when measure changes
    useEffect(() => {
        if (possibleUnits.length > 0) {
            setFromUnit(possibleUnits[0].abbr);
            // Try to find a common counterpart or just the second unit
            const commonCounterparts: { [key: string]: Unit | undefined } = {
                m: 'ft',
                kg: 'lb',
                C: 'F',
                l: 'gal',
                s: 'min',
            };
            setToUnit(
                commonCounterparts[possibleUnits[0].abbr] ||
                    (possibleUnits.length > 1 ? possibleUnits[1].abbr : possibleUnits[0].abbr)
            );
        }
    }, [possibleUnits]);

    const performConversion = useCallback(() => {
        setError('');
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
            setError('Invalid input value.');
            setOutputValue('');
            return;
        }
        try {
            const result = convert(numValue).from(fromUnit).to(toUnit);
            // Format nicely, avoid excessive decimals for common cases
            setOutputValue(Number(result.toFixed(6)).toString()); // Convert back to number to remove trailing zeros
        } catch (e) {
            if (e instanceof Error) {
                setError(`Conversion failed: ${e.message}`);
            } else {
                setError(`Conversion failed: ${e}`);
            }
            console.error(`Conversion failed: ${e}`);
            setOutputValue('');
        }
    }, [inputValue, fromUnit, toUnit]);

    // Perform conversion whenever inputs change
    useEffect(() => {
        performConversion();
    }, [inputValue, fromUnit, toUnit, performConversion]);

    const handleMeasureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMeasure = e.target.value as Measure;
        setMeasure(newMeasure);
        // Reset units based on new measure (effect above will handle this)
    };

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <div>
                <label
                    htmlFor="measure-select"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Category:
                </label>
                <select
                    id="measure-select"
                    value={measure}
                    onChange={handleMeasureChange}
                    className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none capitalize"
                >
                    {measures.map((m) => (
                        <option key={m} value={m} className="capitalize">
                            {m}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-1">
                    <label
                        htmlFor="input-value"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Value:
                    </label>
                    <Input
                        id="input-value"
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        step="any"
                    />
                </div>
                <div className="sm:col-span-1">
                    <label
                        htmlFor="from-unit"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        From:
                    </label>
                    <select
                        id="from-unit"
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value as Unit)}
                        className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    >
                        {possibleUnits.map((u) => (
                            <option key={u.abbr} value={u.abbr}>
                                {u.plural} ({u.abbr})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="hidden sm:flex items-center justify-center pb-2 text-slate-400 text-xl">
                    =
                </div>
                <div className="sm:col-span-1">
                    <label
                        htmlFor="to-unit"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        To:
                    </label>
                    <select
                        id="to-unit"
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value as Unit)}
                        className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    >
                        {possibleUnits.map((u) => (
                            <option key={u.abbr} value={u.abbr}>
                                {u.plural} ({u.abbr})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="mt-4 text-center">
                <p className="text-slate-300 text-lg">Result:</p>
                <p className="text-3xl font-bold text-cyan-400 py-2 break-all">
                    {outputValue || '...'}
                </p>
                <p className="text-sm text-slate-400">
                    {possibleUnits.find((u) => u.abbr === toUnit)?.plural}
                </p>
            </div>
        </div>
    );
}
