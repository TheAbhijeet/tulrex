'use client';

import { useState, useMemo } from 'react';
import Input from '../../components/ui/Input';
import TextareaInput from '../../components/ui/TextareaInput';
import Button from '../../components/ui/Button';

export default function RegexTester() {
    const [regexString, setRegexString] = useState('');
    const [flags, setFlags] = useState('g'); // Default global flag
    const [testString, setTestString] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [matchResult, setMatchResult] = useState<{
        matches: string[];
        highlighted: React.ReactNode;
    } | null>(null);

    const testRegex = () => {
        if (!regexString) {
            setError('Regular expression cannot be empty.');
            setMatchResult(null);
            return;
        }

        try {
            const regex = new RegExp(regexString, flags);
            setError(null);

            const matches: string[] = [];
            let match;
            const parts: React.ReactNode[] = [];
            let lastIndex = 0;

            if (flags.includes('g')) {
                // Global flag: find all matches
                while ((match = regex.exec(testString)) !== null) {
                    matches.push(match[0]);
                    // Add text before the match
                    parts.push(testString.substring(lastIndex, match.index));
                    // Add the highlighted match
                    parts.push(
                        <span
                            key={`match-${match.index}`}
                            className="bg-yellow-700 bg-opacity-50 text-yellow-200 rounded px-0.5"
                        >
                            {match[0]}
                        </span>
                    );
                    lastIndex = regex.lastIndex;
                    // Avoid infinite loops with zero-width matches
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                }
            } else {
                // No global flag: find only the first match
                match = testString.match(regex);
                if (match) {
                    matches.push(match[0]);
                    parts.push(testString.substring(lastIndex, match.index!));
                    parts.push(
                        <span
                            key={`match-${match.index!}`}
                            className="bg-yellow-700 bg-opacity-50 text-yellow-200 rounded px-0.5"
                        >
                            {match[0]}
                        </span>
                    );
                    lastIndex = match.index! + match[0].length;
                }
            }

            // Add any remaining text after the last match
            parts.push(testString.substring(lastIndex));

            setMatchResult({ matches, highlighted: parts });
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(`Invalid Regex or Flags: ${e.message}`);
            } else {
                setError('Invalid Regex or Flags');
            }
            setMatchResult(null);
        }
    };

    const handleClear = () => {
        setRegexString('');
        setFlags('g');
        setTestString('');
        setError(null);
        setMatchResult(null);
    };

    // Use useMemo to avoid re-rendering the highlighted text unnecessarily
    const highlightedText = useMemo(() => {
        if (!matchResult || !matchResult.highlighted || matchResult.highlighted.length === 0) {
            return (
                <span className="text-slate-400 italic">No matches found or no text provided.</span>
            );
        }
        return <>{matchResult.highlighted}</>;
    }, [matchResult]);

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="regex-input"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Regular Expression:
                </label>
                <div className="flex items-center space-x-2">
                    <span className="text-slate-400">/</span>
                    <Input
                        id="regex-input"
                        type="text"
                        value={regexString}
                        onChange={(e) => setRegexString(e.target.value)}
                        placeholder="your-pattern"
                        className="flex-grow font-mono"
                    />
                    <span className="text-slate-400">/</span>
                    <Input
                        id="regex-flags"
                        type="text"
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                        placeholder="flags (g, i, m)"
                        className="w-20 font-mono"
                        maxLength={5} // Limit flag length
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="test-string"
                    className="block text-sm font-medium text-slate-300 mb-1"
                >
                    Test String:
                </label>
                <TextareaInput
                    id="test-string"
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Text to test the regex against..."
                    rows={8}
                    className="font-mono"
                />
            </div>

            <div className="flex space-x-2">
                <Button onClick={testRegex}>Test Regex</Button>
                <Button onClick={handleClear} variant="secondary">
                    Clear
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {matchResult && !error && (
                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-medium text-slate-300 mb-1">
                            Highlighted Matches:
                        </p>
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-md text-sm whitespace-pre-wrap break-words font-mono">
                            {highlightedText}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-300 mb-1">
                            Found {matchResult.matches.length} Match
                            {matchResult.matches.length !== 1 ? 'es' : ''}:
                        </p>
                        {matchResult.matches.length > 0 ? (
                            <pre className="p-3 bg-slate-900 border border-slate-700 rounded-md overflow-x-auto text-sm">
                                {matchResult.matches.map((m, i) => (
                                    <div key={i}>{m}</div>
                                ))}
                            </pre>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No matches found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
