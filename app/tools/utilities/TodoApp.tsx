'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import Button from '@/components/ui/Button';

// Define the structure of a single todo item
interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

// Define the available filter types
type FilterType = 'all' | 'active' | 'completed';

const LOCAL_STORAGE_KEY = 'toolzen-todos';

export default function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [isLoaded, setIsLoaded] = useState(false); // Prevents writing initial empty state to localStorage

    // Load todos from localStorage on initial component mount
    useEffect(() => {
        try {
            const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedTodos) {
                setTodos(JSON.parse(storedTodos));
            }
        } catch (error) {
            console.error('Failed to parse todos from localStorage', error);
        }
        setIsLoaded(true);
    }, []);

    // Save todos to localStorage whenever the list changes
    useEffect(() => {
        // Only save after the initial load to prevent overwriting stored data
        if (isLoaded) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

    const handleAddNewTodo = (e: FormEvent) => {
        e.preventDefault();
        if (!newTodoText.trim()) return;

        const newTodo: Todo = {
            id: Date.now(),
            text: newTodoText.trim(),
            completed: false,
        };

        setTodos([...todos, newTodo]);
        setNewTodoText('');
    };

    const handleToggleTodo = (id: number) => {
        setTodos(
            todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
        );
    };

    const handleDeleteTodo = (id: number) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const handleClearCompleted = () => {
        setTodos(todos.filter((todo) => !todo.completed));
    };

    // Memoize the filtered list to avoid re-computation on every render
    const filteredTodos = useMemo(() => {
        switch (filter) {
            case 'active':
                return todos.filter((todo) => !todo.completed);
            case 'completed':
                return todos.filter((todo) => todo.completed);
            default:
                return todos;
        }
    }, [todos, filter]);

    const activeTodosCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);
    const hasCompletedTodos = useMemo(() => todos.some((t) => t.completed), [todos]);

    return (
        <div className="max-w-xl mx-auto space-y-4">
            {/* Input Form */}
            <form onSubmit={handleAddNewTodo} className="flex space-x-2">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-grow p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <Button type="submit">Add Todo</Button>
            </form>

            {/* Main Content Area */}
            {todos.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-md">
                    {/* Todo List */}
                    <ul className="divide-y divide-slate-700">
                        {filteredTodos.map((todo) => (
                            <li key={todo.id} className="flex items-center p-3 space-x-3 group">
                                <button
                                    onClick={() => handleToggleTodo(todo.id)}
                                    className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        todo.completed
                                            ? 'border-cyan-500 bg-cyan-500'
                                            : 'border-slate-500 hover:border-cyan-500'
                                    }`}
                                    aria-label={
                                        todo.completed ? 'Mark as incomplete' : 'Mark as complete'
                                    }
                                >
                                    {todo.completed && <span className="text-white">✓</span>}
                                </button>
                                <span
                                    className={`flex-grow text-slate-300 ${todo.completed ? 'line-through text-slate-500' : ''}`}
                                >
                                    {todo.text}
                                </span>
                                <button
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Delete todo: ${todo.text}`}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                        {filteredTodos.length === 0 && (
                            <li className="p-4 text-center text-slate-500">
                                No todos in this view.
                            </li>
                        )}
                    </ul>

                    {/* Footer with Filters and Actions */}
                    <div className="flex flex-wrap items-center justify-between p-3 text-sm text-slate-400 border-t border-slate-700 gap-2">
                        <span>
                            {activeTodosCount} {activeTodosCount === 1 ? 'item' : 'items'} left
                        </span>

                        <div className="flex space-x-2">
                            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`capitalize px-2 py-1 rounded-md ${
                                        filter === f
                                            ? 'text-cyan-400 border border-cyan-500'
                                            : 'hover:text-slate-200'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleClearCompleted}
                            className={`hover:text-slate-200 ${!hasCompletedTodos ? 'invisible' : ''}`}
                        >
                            Clear Completed
                        </button>
                    </div>
                </div>
            )}

            {/* Placeholder when no todos exist */}
            {todos.length === 0 && isLoaded && (
                <div className="p-6 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-md">
                    <p>Your todo list is empty.</p>
                    <p>Add a task above to get started!</p>
                </div>
            )}

            <p className="text-sm text-gray-400 text-right">Auto-saved locally</p>
        </div>
    );
}
