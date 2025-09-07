'use client';
import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FaCopy } from 'react-icons/fa';
import { copyToClipboard } from '@/lib/utils';

export default function EpochConverter() {
    const [timestamp, setTimestamp] = useState<number>(() => Math.floor(Date.now() / 1000));
    const [humanDate, setHumanDate] = useState<string>('');
    const [, setLocalTime] = useState<string>('');
    const [gmtTime, setGmtTime] = useState<string>('');
    const [relativeTime, setRelativeTime] = useState<string>('');
    const [timestampInput, setTimestampInput] = useState<string>(timestamp.toString());
    const [humanDateInput, setHumanDateInput] = useState<string>(() =>
        new Date().toISOString().slice(0, 16)
    ); // YYYY-MM-DDTHH:mm
    const [error, setError] = useState<string>('');

    const updateFromTimestamp = useCallback((ts: number | string) => {
        setError('');
        const numTs = Number(ts);
        if (isNaN(numTs)) {
            setError('Invalid timestamp format.');
            return;
        }
        try {
            const date = new Date(numTs * 1000);
            if (isNaN(date.getTime())) {
                setError('Invalid timestamp value.');
                return;
            }
            setTimestamp(numTs);
            setTimestampInput(numTs.toString());
            setHumanDate(date.toLocaleString());
            setLocalTime(date.toString());
            setGmtTime(date.toUTCString());
            setHumanDateInput(date.toISOString().slice(0, 16));

            // Calculate relative time
            const now = Date.now();
            const diffSeconds = Math.round((now - date.getTime()) / 1000);
            const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

            if (Math.abs(diffSeconds) < 60) setRelativeTime(rtf.format(-diffSeconds, 'second'));
            else if (Math.abs(diffSeconds) < 3600)
                setRelativeTime(rtf.format(-Math.round(diffSeconds / 60), 'minute'));
            else if (Math.abs(diffSeconds) < 86400)
                setRelativeTime(rtf.format(-Math.round(diffSeconds / 3600), 'hour'));
            else setRelativeTime(rtf.format(-Math.round(diffSeconds / 86400), 'day'));
        } catch (e) {
            if (e instanceof Error) {
                setError(`Failed to process timestamp: ${e.message}`);
            } else {
                setError(`Failed to process timestamp: ${e}`);
            }
            console.error(`Failed to process timestamp: ${e}`);
        }
    }, []);

    const updateFromHumanDate = useCallback(() => {
        setError('');
        try {
            const date = new Date(humanDateInput);
            if (isNaN(date.getTime())) {
                setError('Invalid date/time format. Use YYYY-MM-DDTHH:mm.');
                return;
            }
            const newTs = Math.floor(date.getTime() / 1000);
            updateFromTimestamp(newTs);
        } catch (e) {
            if (e instanceof Error) {
                setError(`Invalid date/time format: ${e.message}`);
            } else {
                setError(`Invalid date/time format: ${e}`);
            }
            console.error(`Invalid date/time format: ${e}`);
        }
    }, [humanDateInput, updateFromTimestamp]);

    useEffect(() => {
        updateFromTimestamp(timestamp);
    }, [timestamp, updateFromTimestamp]); // Only run once on mount essentially, unless timestamp changes externally

    const handleTsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTimestampInput(e.target.value);
        updateFromTimestamp(e.target.value); // Convert on type
    };

    const handleHumanDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHumanDateInput(e.target.value);
    };

    const setToCurrentTime = () => {
        const nowTs = Math.floor(Date.now() / 1000);
        updateFromTimestamp(nowTs);
    };

    return (
        <div className="space-y-5">
            <div className="text-center p-4 bg-gray-800 rounded border border-gray-700 relative">
                <p className="text-sm text-gray-400">Current Epoch Timestamp</p>
                <p className="text-3xl font-mono font-semibold text-cyan-400 break-all">
                    {timestamp}
                </p>
                <button
                    onClick={() => copyToClipboard(timestamp.toString())}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-cyan-400 bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    title="Copy Timestamp"
                    aria-label="Copy timestamp"
                >
                    <FaCopy className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label
                        htmlFor="timestamp-input"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Convert Timestamp:
                    </label>
                    <Input
                        id="timestamp-input"
                        type="number"
                        value={timestampInput}
                        onChange={handleTsInputChange}
                        placeholder="Enter Epoch timestamp"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="human-date-input"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Convert Date/Time:
                    </label>
                    <div className="flex gap-2">
                        <Input
                            id="human-date-input"
                            type="datetime-local"
                            value={humanDateInput}
                            onChange={handleHumanDateInputChange}
                            className="flex-grow"
                        />
                        <Button
                            onClick={updateFromHumanDate}
                            variant="secondary"
                            className="flex-shrink-0"
                        >
                            Go
                        </Button>
                    </div>
                </div>
            </div>

            {error && <p className="text-center text-red-400 text-sm">{error}</p>}

            <div className="p-4 bg-gray-800 rounded border border-gray-700 space-y-2">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2 text-center">
                    Converted Time
                </h3>
                <p>
                    <strong className="text-gray-300 w-24 inline-block">Relative:</strong>{' '}
                    {relativeTime}
                </p>
                <p>
                    <strong className="text-gray-300 w-24 inline-block">Local:</strong> {humanDate}
                </p>
                <p>
                    <strong className="text-gray-300 w-24 inline-block">GMT:</strong> {gmtTime}
                </p>
            </div>

            <Button onClick={setToCurrentTime} variant="primary" className="block mx-auto">
                Set to Current Time
            </Button>
        </div>
    );
}
