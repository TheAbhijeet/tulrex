'use client';

import React, { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import {
    generateUUID,
    generateFirstName,
    generateLastName,
    generateFullName,
    generateEmail,
    generateRandomNumber,
    generateRandomBoolean,
    generateRandomWords,
    generateImageUrl,
    generateRandomDate,
} from '@/lib/dataGenerators';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';

type FieldType =
    | 'uuid'
    | 'firstName'
    | 'lastName'
    | 'fullName'
    | 'email'
    | 'number'
    | 'boolean'
    | 'words'
    | 'imageUrl'
    | 'dateISO'
    | 'dateTimestamp';

const fieldTypeOptions: { value: FieldType; label: string }[] = [
    { value: 'uuid', label: 'UUID' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'fullName', label: 'Full Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'number', label: 'Number (Random)' },
    { value: 'boolean', label: 'Boolean (Random)' },
    { value: 'words', label: 'Words (Lorem Ipsum)' },
    { value: 'imageUrl', label: 'Image URL (Placeholder)' },
    { value: 'dateISO', label: 'Date (ISO String)' },
    { value: 'dateTimestamp', label: 'Date (Timestamp ms)' },
];

interface FieldDefinition {
    id: string;
    name: string;
    type: FieldType;
    min?: number;
    max?: number;
    wordCount?: number;
    imgWidth?: number;
    imgHeight?: number;
}

export default function JsonGenerator() {
    const [numRecords, setNumRecords] = useState<number>(5);
    const [fields, setFields] = useState<FieldDefinition[]>([
        // Default example fields
        { id: generateUUID(), name: 'id', type: 'uuid' },
        { id: generateUUID(), name: 'name', type: 'fullName' },
        { id: generateUUID(), name: 'email', type: 'email' },
        { id: generateUUID(), name: 'isActive', type: 'boolean' },
        { id: generateUUID(), name: 'registered', type: 'dateISO' },
    ]);
    const [outputJson, setOutputJson] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    const addField = () => {
        setFields([
            ...fields,
            { id: generateUUID(), name: '', type: 'firstName' }, // Default to firstName
        ]);
    };

    const removeField = (idToRemove: string) => {
        setFields(fields.filter((field) => field.id !== idToRemove));
    };

    // TODO: Handle this better
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateField = (idToUpdate: string, property: keyof FieldDefinition, value: any) => {
        setFields(
            fields.map((field) =>
                field.id === idToUpdate ? { ...field, [property]: value } : field
            )
        );
        // Reset options if type changes
        if (property === 'type') {
            setFields(
                fields.map((field) =>
                    field.id === idToUpdate
                        ? {
                              ...field,
                              type: value,
                              min: undefined,
                              max: undefined,
                              wordCount: undefined,
                              imgWidth: undefined,
                              imgHeight: undefined,
                          }
                        : field
                )
            );
        }
    };

    const generateFieldValue = (field: FieldDefinition): string | number | boolean => {
        switch (field.type) {
            case 'uuid':
                return generateUUID();
            case 'firstName':
                return generateFirstName();
            case 'lastName':
                return generateLastName();
            case 'fullName':
                return generateFullName();
            case 'email':
                return generateEmail();
            case 'number':
                return generateRandomNumber(field.min ?? 0, field.max ?? 1000);
            case 'boolean':
                return generateRandomBoolean();
            case 'words':
                return generateRandomWords(field.wordCount ?? 5);
            case 'imageUrl':
                return generateImageUrl(field.imgWidth ?? 300, field.imgHeight ?? 200);
            case 'dateISO':
                return generateRandomDate().toISOString();
            case 'dateTimestamp':
                return generateRandomDate().getTime();
        }
    };

    const handleGenerate = useCallback(() => {
        setError(null);
        setOutputJson('');
        setCopyStatus('idle');

        if (numRecords <= 0 || numRecords > 10000) {
            // Add a reasonable upper limit
            setError('Number of records must be between 1 and 10,000.');
            return;
        }
        if (fields.length === 0) {
            setError('Please define at least one field.');
            return;
        }
        if (fields.some((f) => !f.name.trim())) {
            setError('All fields must have a name.');
            return;
        }

        try {
            const results = Array.from({ length: numRecords }, () => {
                type FieldValueType = string | number | boolean | null;
                const record: Record<string, FieldValueType> = {};
                fields.forEach((field) => {
                    if (field.name.trim()) {
                        record[field.name.trim()] = generateFieldValue(field);
                    }
                });
                return record;
            });

            setOutputJson(JSON.stringify(results, null, 2)); // Pretty print with 2 spaces
        } catch (e) {
            if (e instanceof Error) {
                setError(`Error generating JSON: ${e.message}`);
            } else {
                setError(`Error generating JSON: ${e}`);
            }
            console.error('Generation Error:', e);
        }
    }, [numRecords, fields]); // Dependencies for useCallback

    const handleCopy = async () => {
        if (!outputJson || !navigator.clipboard) return;
        try {
            await navigator.clipboard.writeText(outputJson);
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 1500); // Reset after 1.5s
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setError('Failed to copy text to clipboard.');
        }
    };

    return (
        <div className="space-y-6">
            {/*  Configuration Section  */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                <div>
                    <label
                        htmlFor="num-records"
                        className="block text-sm font-medium text-slate-300 mb-1"
                    >
                        Number of Records
                    </label>
                    <Input
                        id="num-records"
                        type="number"
                        min="1"
                        max="10000" // Reasonable limit client-side
                        value={numRecords}
                        onChange={(e) =>
                            setNumRecords(Math.max(1, parseInt(e.target.value, 10) || 1))
                        }
                        className="w-full"
                        required
                    />
                </div>
                <div className="md:col-span-2 flex items-end justify-end space-x-2">
                    <Button onClick={addField} variant="secondary">
                        + Add Field
                    </Button>
                    <Button onClick={handleGenerate} disabled={fields.length === 0}>
                        Generate JSON
                    </Button>
                </div>
            </div>

            {/*  Field Definitions Section  */}
            <div className="space-y-3">
                <h3 className="text-lg font-medium text-slate-200 mb-2">Field Definitions</h3>
                {fields.map((field) => (
                    <div
                        key={field.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-3 bg-slate-800 rounded border border-slate-700"
                    >
                        {/* Field Name */}
                        <div className="sm:col-span-3">
                            <label htmlFor={`field-name-${field.id}`} className="sr-only">
                                Field Name
                            </label>
                            <Input
                                id={`field-name-${field.id}`}
                                type="text"
                                placeholder="Field Name"
                                value={field.name}
                                onChange={(e) => updateField(field.id, 'name', e.target.value)}
                                required
                                className="text-sm"
                            />
                        </div>

                        {/* Field Type */}
                        <div className="sm:col-span-3">
                            <label htmlFor={`field-type-${field.id}`} className="sr-only">
                                Field Type
                            </label>
                            <Select
                                id={`field-type-${field.id}`}
                                value={field.type}
                                onChange={(e) =>
                                    updateField(field.id, 'type', e.target.value as FieldType)
                                }
                                className="text-sm"
                            >
                                {fieldTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* Conditional Options */}
                        <div className="sm:col-span-5">
                            {field.type === 'number' && (
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="Min (0)"
                                        value={field.min ?? ''}
                                        onChange={(e) =>
                                            updateField(
                                                field.id,
                                                'min',
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined
                                            )
                                        }
                                        className="text-sm w-1/2"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max (1000)"
                                        value={field.max ?? ''}
                                        onChange={(e) =>
                                            updateField(
                                                field.id,
                                                'max',
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined
                                            )
                                        }
                                        className="text-sm w-1/2"
                                    />
                                </div>
                            )}
                            {field.type === 'words' && (
                                <Input
                                    type="number"
                                    placeholder="Word Count (5)"
                                    min="1"
                                    value={field.wordCount ?? ''}
                                    onChange={(e) =>
                                        updateField(
                                            field.id,
                                            'wordCount',
                                            e.target.value ? parseInt(e.target.value) : undefined
                                        )
                                    }
                                    className="text-sm w-full"
                                />
                            )}
                            {field.type === 'imageUrl' && (
                                <div className="flex space-x-2">
                                    <Input
                                        type="number"
                                        placeholder="Width (300)"
                                        min="10"
                                        value={field.imgWidth ?? ''}
                                        onChange={(e) =>
                                            updateField(
                                                field.id,
                                                'imgWidth',
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined
                                            )
                                        }
                                        className="text-sm w-1/2"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Height (200)"
                                        min="10"
                                        value={field.imgHeight ?? ''}
                                        onChange={(e) =>
                                            updateField(
                                                field.id,
                                                'imgHeight',
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined
                                            )
                                        }
                                        className="text-sm w-1/2"
                                    />
                                </div>
                            )}
                            {/* Add inputs for other options here if needed */}
                        </div>

                        {/* Remove Button */}
                        <div className="sm:col-span-1 flex justify-end">
                            <Button
                                onClick={() => removeField(field.id)}
                                variant="secondary"
                                className="px-2 py-1 text-xs bg-red-800 hover:bg-red-700"
                                title="Remove Field"
                            >
                                × {/* Or use an icon */}
                            </Button>
                        </div>
                    </div>
                ))}
                {fields.length === 0 && (
                    <p className="text-center text-slate-500 italic">
                        No fields defined. Click "+ Add Field" to start.
                    </p>
                )}
            </div>

            {/*  Error Display  */}
            {error && (
                <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/*  Output Section  */}
            {outputJson && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-slate-200">
                            Generated JSON Output
                        </h3>
                        <Button
                            onClick={handleCopy}
                            variant="secondary"
                            size="sm"
                            disabled={copyStatus === 'copied'}
                        >
                            {copyStatus === 'copied' ? 'Copied!' : 'Copy JSON'}
                        </Button>
                    </div>

                    <SyntaxHighlighter language="json" style={dracula}>
                        {outputJson}
                    </SyntaxHighlighter>
                </div>
            )}
        </div>
    );
}
