// src/components/tools/TextDiffViewer.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Diff from 'diff'; // Import the library used by the component
import TextDiffViewer from '@/tools/TextDiffViewer';

// We don't need to mock 'diff' as it's a core part of the functionality we want to test

describe('TextDiffViewer Component', () => {
    it('renders correctly initially', () => {
        render(<TextDiffViewer />);
        expect(screen.getByLabelText(/Original Text/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Modified Text/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Compare Texts/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
        expect(screen.queryByText(/Differences:/i)).not.toBeInTheDocument();
    });

    it('shows differences with added text', async () => {
        const user = userEvent.setup();
        render(<TextDiffViewer />);
        const originalInput = screen.getByLabelText(/Original Text/i);
        const modifiedInput = screen.getByLabelText(/Modified Text/i);
        const compareButton = screen.getByRole('button', { name: /Compare Texts/i });

        const textA = 'Hello';
        const textB = 'Hello World';

        await user.type(originalInput, textA);
        await user.type(modifiedInput, textB);
        await user.click(compareButton);

        const diffOutput = screen.getByText(/Differences:/i).nextElementSibling;
        expect(diffOutput).toBeInTheDocument();
        expect(diffOutput?.tagName).toBe('PRE');

        // Check for added part styling (using text content and class)
        const addedSpan = screen.getByText(' World'); // The added part
        expect(addedSpan).toHaveClass('bg-green-900'); // Check class indicating addition
        expect(screen.getByText('Hello')).not.toHaveClass('bg-green-900'); // Unchanged part
        expect(screen.getByText('Hello')).not.toHaveClass('bg-red-900'); // No removed parts
    });

    it('shows differences with removed text', async () => {
        const user = userEvent.setup();
        render(<TextDiffViewer />);
        const originalInput = screen.getByLabelText(/Original Text/i);
        const modifiedInput = screen.getByLabelText(/Modified Text/i);
        const compareButton = screen.getByRole('button', { name: /Compare Texts/i });

        const textA = 'Hello World';
        const textB = 'Hello';

        await user.type(originalInput, textA);
        await user.type(modifiedInput, textB);
        await user.click(compareButton);

        const removedSpan = screen.getByText(' World');
        expect(removedSpan).toHaveClass('bg-red-900'); // Check class indicating removal
        expect(removedSpan).toHaveClass('line-through'); // Check strikethrough
        expect(screen.getByText('Hello')).not.toHaveClass('bg-red-900');
        expect(screen.getByText('Hello')).not.toHaveClass('bg-green-900');
    });

    it('shows no specific diff styling for identical texts', async () => {
        const user = userEvent.setup();
        render(<TextDiffViewer />);
        const originalInput = screen.getByLabelText(/Original Text/i);
        const modifiedInput = screen.getByLabelText(/Modified Text/i);
        const compareButton = screen.getByRole('button', { name: /Compare Texts/i });

        const textA = 'Same Text';
        const textB = 'Same Text';

        await user.type(originalInput, textA);
        await user.type(modifiedInput, textB);
        await user.click(compareButton);

        const outputSpan = screen.getByText('Same Text');
        expect(outputSpan).toBeInTheDocument();
        // Check that it *doesn't* have added/removed classes
        expect(outputSpan).not.toHaveClass('bg-green-900');
        expect(outputSpan).not.toHaveClass('bg-red-900');
        expect(outputSpan).toHaveClass('text-slate-300'); // Default class
    });

    it('clears inputs and output on clear button click', async () => {
        const user = userEvent.setup();
        render(<TextDiffViewer />);
        const originalInput = screen.getByLabelText(/Original Text/i);
        const modifiedInput = screen.getByLabelText(/Modified Text/i);
        const compareButton = screen.getByRole('button', { name: /Compare Texts/i });
        const clearButton = screen.getByRole('button', { name: /Clear/i });

        // Generate some output
        await user.type(originalInput, 'abc');
        await user.type(modifiedInput, 'def');
        await user.click(compareButton);
        expect(screen.getByText(/Differences:/i)).toBeInTheDocument();

        // Click clear
        await user.click(clearButton);

        expect(originalInput).toHaveValue('');
        expect(modifiedInput).toHaveValue('');
        expect(screen.queryByText(/Differences:/i)).not.toBeInTheDocument();
    });
});
