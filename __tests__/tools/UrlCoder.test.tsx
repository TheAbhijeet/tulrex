// src/components/tools/UrlCoder.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlCoder from '@/tools/UrlCoder';

describe('UrlCoder Component', () => {
    it('renders correctly initially', () => {
        render(<UrlCoder />);
        expect(screen.getByLabelText(/Input Text \/ URL Component/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Encode URI Component/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Decode URI Component/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/Output:/i)).not.toBeInTheDocument();
    });

    it('encodes text using encodeURIComponent correctly', async () => {
        const user = userEvent.setup();
        render(<UrlCoder />);
        const inputArea = screen.getByLabelText(/Input Text \/ URL Component/i);
        const encodeButton = screen.getByRole('button', { name: /Encode URI Component/i });
        const inputText = 'a file name?.js';
        const expectedOutput = encodeURIComponent(inputText);

        await user.type(inputArea, inputText);
        await user.click(encodeButton);

        const outputArea = screen.getByLabelText(/Output:/i);
        expect(outputArea).toHaveValue(expectedOutput);
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('decodes text using decodeURIComponent correctly', async () => {
        const user = userEvent.setup();
        render(<UrlCoder />);
        const inputArea = screen.getByLabelText(/Input Text \/ URL Component/i);
        const decodeButton = screen.getByRole('button', { name: /Decode URI Component/i });
        const inputText = 'a%20file%20name%3F.js'; // Encoded 'a file name?.js'
        const expectedOutput = decodeURIComponent(inputText);

        await user.type(inputArea, inputText);
        await user.click(decodeButton);

        const outputArea = screen.getByLabelText(/Output:/i);
        expect(outputArea).toHaveValue(expectedOutput);
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('shows an error for invalid URI component on decode', async () => {
        const user = userEvent.setup();
        render(<UrlCoder />);
        const inputArea = screen.getByLabelText(/Input Text \/ URL Component/i);
        const decodeButton = screen.getByRole('button', { name: /Decode URI Component/i });
        const invalidInput = '%E0%A4%A'; // Incomplete UTF-8 sequence

        await user.type(inputArea, invalidInput);
        await user.click(decodeButton);

        expect(screen.getByText(/Decoding error/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Output:/i)).not.toBeInTheDocument();
    });

    it('clears input, output and error on clear button click', async () => {
        const user = userEvent.setup();
        render(<UrlCoder />);
        const inputArea = screen.getByLabelText(/Input Text \/ URL Component/i);
        const decodeButton = screen.getByRole('button', { name: /Decode URI Component/i });
        const clearButton = screen.getByRole('button', { name: /Clear/i });
        const invalidInput = '%';

        // Create error state
        await user.type(inputArea, invalidInput);
        await user.click(decodeButton);
        expect(screen.getByText(/Decoding error/i)).toBeInTheDocument();

        // Click clear
        await user.click(clearButton);

        expect(inputArea).toHaveValue('');
        expect(screen.queryByLabelText(/Output:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Decoding error/i)).not.toBeInTheDocument();
    });

    // Optional: Test the copy button functionality if the hook is simple enough
    it('copies output to clipboard when copy button clicked', async () => {
        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }, // Mock success
        });

        const user = userEvent.setup();
        render(<UrlCoder />);
        const inputArea = screen.getByLabelText(/Input Text \/ URL Component/i);
        const encodeButton = screen.getByRole('button', { name: /Encode URI Component/i });

        await user.type(inputArea, 'test');
        await user.click(encodeButton);

        const outputArea = screen.getByLabelText(/Output:/i);
        const copyButton = screen.getByRole('button', { name: /copy output to clipboard/i }); // Use aria-label

        await user.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(outputArea.value);

        // Check for temporary "Copied!" message
        expect(await screen.findByText('Copied!')).toBeInTheDocument();
        // Wait for message to disappear (depends on timeout in useCopyToClipboard)
        // await new Promise(r => setTimeout(r, 2100)); // Wait slightly longer than timeout
        // expect(screen.queryByText('Copied!')).not.toBeInTheDocument(); // Difficult to test disappearance reliably without fake timers
    });
});
