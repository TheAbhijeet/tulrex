import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Base64Coder from '@/tools/encoders/Base64Coder';

// Mock btoa and atob if running in an environment where they aren't defined (jsdom usually provides them)
// global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
// global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');

describe('Base64Coder Component', () => {
    it('renders correctly initially', () => {
        render(<Base64Coder />);
        expect(screen.getByLabelText(/Input Text \/ Base64/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Encode to Base64/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Decode from Base64/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
        expect(screen.queryByLabelText(/Output:/i)).not.toBeInTheDocument();
    });

    it('encodes text to Base64 correctly', async () => {
        const user = userEvent.setup();
        render(<Base64Coder />);
        const inputArea = screen.getByLabelText(/Input Text \/ Base64/i);
        const encodeButton = screen.getByRole('button', { name: /Encode to Base64/i });
        const inputText = 'Toolzen is cool!';
        const expectedOutput = btoa(unescape(encodeURIComponent(inputText))); // Match component logic

        await user.type(inputArea, inputText);
        await user.click(encodeButton);

        const outputArea = screen.getByLabelText(/Output:/i);
        expect(outputArea).toBeInTheDocument();
        expect(outputArea).toHaveValue(expectedOutput);
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('decodes Base64 to text correctly (including UTF-8)', async () => {
        const user = userEvent.setup();
        render(<Base64Coder />);
        const inputArea = screen.getByLabelText(/Input Text \/ Base64/i);
        const decodeButton = screen.getByRole('button', { name: /Decode from Base64/i });
        const inputText = 'VG9vbHplbiBpcyBjb29sISDwn5iC'; // "Toolzen is cool! 👍" in Base64
        const expectedOutput = decodeURIComponent(escape(atob(inputText))); // Match component logic

        await user.type(inputArea, inputText);
        await user.click(decodeButton);

        const outputArea = screen.getByLabelText(/Output:/i);
        expect(outputArea).toBeInTheDocument();
        expect(outputArea).toHaveValue(expectedOutput);
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('shows an error for invalid Base64 input on decode', async () => {
        const user = userEvent.setup();
        render(<Base64Coder />);
        const inputArea = screen.getByLabelText(/Input Text \/ Base64/i);
        const decodeButton = screen.getByRole('button', { name: /Decode from Base64/i });
        const invalidInput = 'this is not base64!';

        await user.type(inputArea, invalidInput);
        await user.click(decodeButton);

        expect(screen.getByText(/Invalid Base64 string/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/Output:/i)).not.toBeInTheDocument();
    });

    it('clears input, output and error on clear button click', async () => {
        const user = userEvent.setup();
        render(<Base64Coder />);
        const inputArea = screen.getByLabelText(/Input Text \/ Base64/i);
        const decodeButton = screen.getByRole('button', { name: /Decode from Base64/i });
        const clearButton = screen.getByRole('button', { name: /Clear/i });
        const invalidInput = '!!!';

        // Create error state
        await user.type(inputArea, invalidInput);
        await user.click(decodeButton);
        expect(screen.getByText(/Invalid Base64 string/i)).toBeInTheDocument();

        // Click clear
        await user.click(clearButton);

        expect(inputArea).toHaveValue('');
        expect(screen.queryByLabelText(/Output:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid Base64 string/i)).not.toBeInTheDocument();
    });
});
