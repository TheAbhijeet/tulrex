'use client';

import React, { useState, useReducer, useMemo } from 'react';
import axios, { AxiosError, AxiosHeaders, Method } from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { KeyValueEditor, KeyValueItem } from '@/components/ui/KeyValueEditor';
import Button from '@/components/ui/Button';
import TextareaInput from '@/components/ui/TextareaInput';

type RequestTab = 'params' | 'authorization' | 'headers' | 'body';
type ResponseTab = 'body' | 'headers' | 'raw';
type AuthType = 'none' | 'bearer';

interface RequestState {
    url: string;
    method: Method;
    queryParams: KeyValueItem[];
    headers: KeyValueItem[];
    body: string;
    auth: {
        type: AuthType;
        token: string;
    };
}

type RequestAction =
    | { type: 'SET_FIELD'; field: 'url' | 'method' | 'body' | 'authToken'; payload: string }
    | { type: 'SET_AUTH_TYPE'; payload: AuthType }
    | {
          type: 'UPDATE_ITEM';
          itemType: 'queryParams' | 'headers';
          id: number;
          field: 'key' | 'value' | 'enabled';
          payload: string | boolean;
      }
    | { type: 'ADD_ITEM'; itemType: 'queryParams' | 'headers' }
    | { type: 'REMOVE_ITEM'; itemType: 'queryParams' | 'headers'; id: number };

const initialRequestState: RequestState = {
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    queryParams: [{ id: Date.now(), key: '', value: '', enabled: true }],
    headers: [{ id: Date.now(), key: '', value: '', enabled: true }],
    body: '{\n  "key": "value"\n}',
    auth: {
        type: 'none',
        token: '',
    },
};

function requestReducer(state: RequestState, action: RequestAction): RequestState {
    switch (action.type) {
        case 'SET_FIELD':
            if (action.field === 'authToken') {
                return { ...state, auth: { ...state.auth, token: action.payload } };
            }
            return { ...state, [action.field]: action.payload };
        case 'SET_AUTH_TYPE':
            return { ...state, auth: { ...state.auth, type: action.payload } };
        case 'UPDATE_ITEM':
            return {
                ...state,
                [action.itemType]: state[action.itemType].map((item) =>
                    item.id === action.id ? { ...item, [action.field]: action.payload } : item
                ),
            };
        case 'ADD_ITEM':
            return {
                ...state,
                [action.itemType]: [
                    ...state[action.itemType],
                    { id: Date.now(), key: '', value: '', enabled: true },
                ],
            };
        case 'REMOVE_ITEM':
            if (state[action.itemType].length <= 1) return state;
            return {
                ...state,
                [action.itemType]: state[action.itemType].filter((item) => item.id !== action.id),
            };
        default:
            return state;
    }
}

interface ResponseState {
    status: number;
    statusText: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    headers: AxiosHeaders;
    time: number;
    size: string;
    requestHeaders: Record<string, string>;
}

const METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

export default function ApiRequester() {
    const [state, dispatch] = useReducer(requestReducer, initialRequestState);
    const [response, setResponse] = useState<ResponseState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeRequestTab, setActiveRequestTab] = useState<RequestTab>('params');
    const [activeResponseTab, setActiveResponseTab] = useState<ResponseTab>('body');
    const [copied, setCopied] = useState(false);

    // --- REQUEST LOGIC ---
    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse(null);
        setError(null);
        setCopied(false);
        const startTime = performance.now();

        // 1. Construct URL with query parameters
        const activeParams = state.queryParams.filter((p) => p.enabled && p.key);
        const params = new URLSearchParams(activeParams.map((p) => [p.key, p.value])).toString();
        const finalUrl = params ? `${state.url}?${params}` : state.url;

        // 2. Construct Headers (including Authorization)
        const manualHeaders = state.headers
            .filter((h) => h.enabled && h.key)
            .reduce(
                (acc, h) => ({ ...acc, [h.key.toLowerCase()]: h.value }),
                {} as Record<string, string>
            );

        if (state.auth.type === 'bearer' && state.auth.token) {
            // This will override any manual Authorization header, which is the desired behavior
            manualHeaders['authorization'] = `Bearer ${state.auth.token}`;
        }

        // 3. Construct Body
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let requestBody: any = null;
        if (['POST', 'PUT', 'PATCH'].includes(state.method.toUpperCase())) {
            try {
                // Only set body if it's not empty, otherwise some servers may reject
                if (state.body.trim()) {
                    requestBody = JSON.parse(state.body);
                }
            } catch (e) {
                setError('JSON body is invalid.');
                setIsLoading(false);
                console.log(e);
                return;
            }
        }

        try {
            const res = await axios({
                url: finalUrl,
                method: state.method,
                headers: manualHeaders,
                data: requestBody,
                validateStatus: () => true, // Handle all statuses manually
            });

            const endTime = performance.now();
            const responseSize = res.headers['content-length']
                ? parseInt(res.headers['content-length'], 10)
                : JSON.stringify(res.data).length;

            setResponse({
                status: res.status,
                statusText: res.statusText,
                data: res.data,
                headers: res.headers as AxiosHeaders,
                time: Math.round(endTime - startTime),
                size: (responseSize / 1024).toFixed(2) + ' KB',
                requestHeaders: res.config.headers as Record<string, string>, // Capture the final request headers
            });
            setActiveResponseTab('body'); // Default to body tab on new response
        } catch (err) {
            const endTime = performance.now();
            if (err instanceof AxiosError) {
                setError(err.message || 'An unknown network error occurred.');
                setResponse({
                    status: 0,
                    statusText: 'Network Error',
                    data: {
                        error: err.message,
                        note: "Could not connect. Check the URL, your network, or the remote server's CORS policy.",
                    },
                    headers: new AxiosHeaders(),
                    time: Math.round(endTime - startTime),
                    size: '0 KB',
                    requestHeaders: manualHeaders,
                });
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- UTILITY & RENDER HELPERS ---
    const handleCopyResponse = () => {
        if (!response) return;
        const contentToCopy =
            typeof response.data === 'object'
                ? JSON.stringify(response.data, null, 2)
                : String(response.data);
        navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'text-green-400';
        if (status >= 300 && status < 400) return 'text-yellow-400';
        if (status >= 400 && status < 500) return 'text-orange-400';
        if (status >= 500) return 'text-red-400';
        return 'text-slate-400';
    };

    const TabButton: React.FC<{ name: string; activeTab: string; onClick: () => void }> = ({
        name,
        activeTab,
        onClick,
    }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${activeTab === name.toLowerCase() ? 'text-cyan-400 border-cyan-400' : 'text-slate-400 border-transparent hover:bg-slate-700/50'}`}
        >
            {name}
        </button>
    );

    // --- MEMOIZED RAW VIEWS for performance ---
    const rawResponseView = useMemo(() => {
        if (!response) return '';
        const statusLine = `HTTP/1.1 ${response.status} ${response.statusText}`;
        // AxiosHeaders is a class, convert to plain object for display
        const headers = Object.entries(response.headers.toJSON())
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        const body =
            typeof response.data === 'object'
                ? JSON.stringify(response.data, null, 2)
                : String(response.data);
        return `${statusLine}\n${headers}\n\n${body}`;
    }, [response]);

    return (
        <div className="space-y-6">
            {/* Request URL Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    value={state.method}
                    onChange={(e) =>
                        dispatch({ type: 'SET_FIELD', field: 'method', payload: e.target.value })
                    }
                    className="p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                    {METHODS.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>
                <input
                    type="url"
                    value={state.url}
                    onChange={(e) =>
                        dispatch({ type: 'SET_FIELD', field: 'url', payload: e.target.value })
                    }
                    placeholder="https://api.example.com/data"
                    className="flex-grow p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <Button
                    onClick={handleSendRequest}
                    disabled={isLoading || !state.url}
                    className="w-full sm:w-auto"
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </Button>
            </div>

            {/* Request Config Section */}
            <div className="border border-slate-700 rounded-md">
                <div className="flex border-b border-slate-700 bg-slate-800/50 rounded-t-md px-2">
                    <TabButton
                        name="Params"
                        activeTab={activeRequestTab}
                        onClick={() => setActiveRequestTab('params')}
                    />
                    <TabButton
                        name="Authorization"
                        activeTab={activeRequestTab}
                        onClick={() => setActiveRequestTab('authorization')}
                    />
                    <TabButton
                        name="Headers"
                        activeTab={activeRequestTab}
                        onClick={() => setActiveRequestTab('headers')}
                    />
                    <TabButton
                        name="Body"
                        activeTab={activeRequestTab}
                        onClick={() => setActiveRequestTab('body')}
                    />
                </div>
                <div className="p-4 bg-slate-800 rounded-b-md">
                    {activeRequestTab === 'params' && (
                        <KeyValueEditor
                            items={state.queryParams}
                            onItemChange={(id, field, value) =>
                                dispatch({
                                    type: 'UPDATE_ITEM',
                                    itemType: 'queryParams',
                                    id,
                                    field,
                                    payload: value,
                                })
                            }
                            onAddItem={() =>
                                dispatch({ type: 'ADD_ITEM', itemType: 'queryParams' })
                            }
                            onRemoveItem={(id) =>
                                dispatch({ type: 'REMOVE_ITEM', itemType: 'queryParams', id })
                            }
                            keyPlaceholder="Query Key"
                            valuePlaceholder="Value"
                        />
                    )}
                    {activeRequestTab === 'authorization' && (
                        <div className="space-y-3">
                            <label
                                htmlFor="auth-type"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Auth Type
                            </label>
                            <select
                                id="auth-type"
                                value={state.auth.type}
                                onChange={(e) =>
                                    dispatch({
                                        type: 'SET_AUTH_TYPE',
                                        payload: e.target.value as AuthType,
                                    })
                                }
                                className="w-full sm:w-1/3 p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                            >
                                <option value="none">None</option>
                                <option value="bearer">Bearer Token</option>
                            </select>
                            {state.auth.type === 'bearer' && (
                                <div>
                                    <label
                                        htmlFor="bearer-token"
                                        className="block text-sm font-medium text-slate-300 mb-1"
                                    >
                                        Token
                                    </label>
                                    <TextareaInput
                                        id="bearer-token"
                                        value={state.auth.token}
                                        onChange={(e) =>
                                            dispatch({
                                                type: 'SET_FIELD',
                                                field: 'authToken',
                                                payload: e.target.value,
                                            })
                                        }
                                        placeholder="Paste your token here"
                                        rows={3}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {activeRequestTab === 'headers' && (
                        <KeyValueEditor
                            items={state.headers}
                            onItemChange={(id, field, value) =>
                                dispatch({
                                    type: 'UPDATE_ITEM',
                                    itemType: 'headers',
                                    id,
                                    field,
                                    payload: value,
                                })
                            }
                            onAddItem={() => dispatch({ type: 'ADD_ITEM', itemType: 'headers' })}
                            onRemoveItem={(id) =>
                                dispatch({ type: 'REMOVE_ITEM', itemType: 'headers', id })
                            }
                            keyPlaceholder="Header Name"
                            valuePlaceholder="Header Value"
                        />
                    )}
                    {activeRequestTab === 'body' && (
                        <TextareaInput
                            value={state.body}
                            onChange={(e) =>
                                dispatch({
                                    type: 'SET_FIELD',
                                    field: 'body',
                                    payload: e.target.value,
                                })
                            }
                            rows={8}
                            className="font-mono text-sm"
                            placeholder='{ "json": "body" }'
                        />
                    )}
                </div>
            </div>

            {/* Response Section */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Response</h2>
                <div className="bg-slate-800 rounded-md border border-slate-700 min-h-[200px] flex flex-col">
                    {!response && !isLoading && !error && (
                        <div className="text-slate-500 text-center p-10">
                            Click "Send" to make a request.
                        </div>
                    )}
                    {isLoading && (
                        <div className="text-slate-400 text-center p-10 animate-pulse">
                            Loading...
                        </div>
                    )}
                    {error && !response && (
                        <div className="text-red-400 text-center p-10">{error}</div>
                    )}

                    {response && (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3 border-b border-slate-700 text-sm">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="font-bold">
                                        Status:{' '}
                                        <span className={getStatusColor(response.status)}>
                                            {response.status} {response.statusText}
                                        </span>
                                    </span>
                                    <span className="font-bold">
                                        Time:{' '}
                                        <span className="text-cyan-400">{response.time} ms</span>
                                    </span>
                                    <span className="font-bold">
                                        Size: <span className="text-cyan-400">{response.size}</span>
                                    </span>
                                </div>
                                <Button
                                    onClick={handleCopyResponse}
                                    variant="secondary"
                                    className="px-3 py-1 text-xs"
                                >
                                    {copied ? 'Copied!' : 'Copy Body'}
                                </Button>
                            </div>
                            <div className="flex border-b border-slate-700 px-2">
                                <TabButton
                                    name="Body"
                                    activeTab={activeResponseTab}
                                    onClick={() => setActiveResponseTab('body')}
                                />
                                <TabButton
                                    name="Headers"
                                    activeTab={activeResponseTab}
                                    onClick={() => setActiveResponseTab('headers')}
                                />
                                <TabButton
                                    name="Raw"
                                    activeTab={activeResponseTab}
                                    onClick={() => setActiveResponseTab('raw')}
                                />
                            </div>
                            <div className="flex-grow overflow-auto text-sm">
                                {activeResponseTab === 'body' && (
                                    <SyntaxHighlighter
                                        language="json"
                                        style={atomDark}
                                        customStyle={{
                                            margin: 0,
                                            padding: '1rem',
                                            background: 'transparent',
                                        }}
                                        wrapLongLines
                                    >
                                        {typeof response.data === 'object'
                                            ? JSON.stringify(response.data, null, 2)
                                            : String(response.data)}
                                    </SyntaxHighlighter>
                                )}
                                {activeResponseTab === 'headers' && (
                                    <SyntaxHighlighter
                                        language="json"
                                        style={atomDark}
                                        customStyle={{
                                            margin: 0,
                                            padding: '1rem',
                                            background: 'transparent',
                                        }}
                                        wrapLongLines
                                    >
                                        {JSON.stringify(response.headers.toJSON(), null, 2)}
                                    </SyntaxHighlighter>
                                )}
                                {activeResponseTab === 'raw' && (
                                    <SyntaxHighlighter
                                        language="http"
                                        style={atomDark}
                                        customStyle={{
                                            margin: 0,
                                            padding: '1rem',
                                            background: 'transparent',
                                        }}
                                        wrapLongLines
                                    >
                                        {rawResponseView}
                                    </SyntaxHighlighter>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
