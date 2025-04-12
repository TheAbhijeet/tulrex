// src/components/tools/RegexTester.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegexTester from '@/tools/RegexTester';

describe('RegexTester Component', () => {
    it('renders correctly initially', () => {
        render(<RegexTester />);
        expect(screen.getByLabelText(/Regular Expression/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('flags (g, i, m)')).toBeInTheDocument();
        expect(screen.getByLabelText(/Test String/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Test Regex/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
        expect(screen.queryByText(/Highlighted Matches/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Found.*Matches/i)).not.toBeInTheDocument(); // Partial match for count
    });

    it('finds and highlights matches with global flag', async () => {
        const user = userEvent.setup();
        render(<RegexTester />);
        const regexInput = screen.getByLabelText(/Regular Expression/i);
        const flagsInput = screen.getByPlaceholderText('flags (g, i, m)');
        const testStringInput = screen.getByLabelText(/Test String/i);
        const testButton = screen.getByRole('button', { name: /Test Regex/i });

        await user.type(regexInput, 'a.'); // Match 'a' followed by any char
        await user.clear(flagsInput); // Clear default 'g' if needed, then type
        await user.type(flagsInput, 'g');
        await user.type(testStringInput, 'apple banana pear');
        await user.click(testButton);

        const highlightedOutput = screen.getByText(/Highlighted Matches/i).nextElementSibling;
        expect(highlightedOutput).toBeInTheDocument();
        // Check highlighted spans exist (content might be tricky with structure)
        expect(highlightedOutput?.querySelectorAll('span.bg-yellow-700').length).toBe(2); // 'ap', 'an'
        expect(highlightedOutput).toHaveTextContent('apple banana pear'); // Check full string is present

        const matchesList = screen.getByText(/Found 2 Matches/i).nextElementSibling;
        expect(matchesList).toBeInTheDocument();
        expect(matchesList).toHaveTextContent('ap');
        expect(matchesList).toHaveTextContent('an');
    });

    it('finds only the first match without global flag', async () => {
        const user = userEvent.setup();
        render(<RegexTester />);
        const regexInput = screen.getByLabelText(/Regular Expression/i);
        const flagsInput = screen.getByPlaceholderText('flags (g, i, m)');
        const testStringInput = screen.getByLabelText(/Test String/i);
        const testButton = screen.getByRole('button', { name: /Test Regex/i });

        await user.type(regexInput, 'a.');
        await user.clear(flagsInput); // Remove global flag
        await user.type(testStringInput, 'apple banana pear');
        await user.click(testButton);

        const highlightedOutput = screen.getByText(/Highlighted Matches/i).nextElementSibling;
        expect(highlightedOutput?.querySelectorAll('span.bg-yellow-700').length).toBe(1); // Only 'ap'

        const matchesList = screen.getByText(/Found 1 Match:/i).nextElementSibling; // Singular match
        expect(matchesList).toBeInTheDocument();
        expect(matchesList).toHaveTextContent('ap');
        expect(matchesList).not.toHaveTextContent('an');
    });

    it('shows "No matches found" message correctly', async () => {
        const user = userEvent.setup();
        render(<RegexTester />);
        const regexInput = screen.getByLabelText(/Regular Expression/i);
        const testStringInput = screen.getByLabelText(/Test String/i);
        const testButton = screen.getByRole('button', { name: /Test Regex/i });

        await user.type(regexInput, 'xyz');
        await user.type(testStringInput, 'apple banana pear');
        await user.click(testButton);

        const highlightedOutput = screen.getByText(/Highlighted Matches/i).nextElementSibling;
        // Check for the specific "No matches found" text within the highlighted area
        expect(highlightedOutput).toHaveTextContent(/No matches found/i);

        const matchesList = screen.getByText(/Found 0 Matches/i).nextElementSibling;
        expect(matchesList).toHaveTextContent(/No matches found/i);
    });

    it('shows an error for invalid regex pattern', async () => {
        const user = userEvent.setup();
        render(<RegexTester />);
        const regexInput = screen.getByLabelText(/Regular Expression/i);
        const testButton = screen.getByRole('button', { name: /Test Regex/i });

        await user.type(regexInput, '[a-'); // Invalid regex
        await user.click(testButton);

        expect(screen.getByText(/Invalid Regex or Flags/i)).toBeInTheDocument();
        expect(screen.queryByText(/Highlighted Matches/i)).not.toBeInTheDocument();
    });

    it('clears inputs and results on clear button click', async () => {
        const user = userEvent.setup();
        render(<RegexTester />);
        const regexInput = screen.getByLabelText(/Regular Expression/i);
        const flagsInput = screen.getByPlaceholderText('flags (g, i, m)');
        const testStringInput = screen.getByLabelText(/Test String/i);
        const testButton = screen.getByRole('button', { name: /Test Regex/i });
        const clearButton = screen.getByRole('button', { name: /Clear/i });

        // Generate some results
        await user.type(regexInput, 'a');
        await user.type(testStringInput, 'abc');
        await user.click(testButton);
        expect(screen.getByText(/Highlighted Matches/i)).toBeInTheDocument();

        // Click clear
        await user.click(clearButton);

        expect(regexInput).toHaveValue('');
        expect(flagsInput).toHaveValue('g'); // Resets to default 'g' in component
        expect(testStringInput).toHaveValue('');
        expect(screen.queryByText(/Highlighted Matches/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Found.*Matches/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid Regex/i)).not.toBeInTheDocument(); // Clear error too
    });
});
