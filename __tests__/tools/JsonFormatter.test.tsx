import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonFormatter from '@/tools/JsonFormatter';

// Mock reusable components if they interfere or aren't needed for the unit logic
// Or just let them render if they are simple enough
// jest.mock('@/components/ui/TextareaInput', () => (props: any) => <textarea data-testid="textarea-input" {...props} />);
// jest.mock('@/components/ui/Button', () => (props: any) => <button {...props} />);

describe('JsonFormatter Component', () => {
    it('renders correctly initially', () => {
        render(<JsonFormatter />);
        expect(screen.getByLabelText(/Input JSON/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Format & Validate/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
        // Initially no output or error
        expect(screen.queryByText(/Formatted JSON/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // Assuming errors have role="alert" or similar
    });

    it('formats valid JSON input correctly', async () => {
        const user = userEvent.setup();
        render(<JsonFormatter />);
        const inputArea = screen.getByLabelText(/Input JSON/i);
        const formatButton = screen.getByRole('button', { name: /Format & Validate/i });
        const validInput = '{"name": "Toolzen", "version": 1}';
        const expectedOutput = JSON.stringify(JSON.parse(validInput), null, 2);

        await user.type(inputArea, validInput);
        await user.click(formatButton);

        // Use querySelector for <pre><code> as it might not have an implicit role
        const outputPre = screen.getByText(/Formatted JSON/i).nextElementSibling; // Find pre sibling
        expect(outputPre).toBeInTheDocument();
        expect(outputPre?.tagName).toBe('PRE');
        expect(outputPre).toHaveTextContent(expectedOutput);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows an error for invalid JSON input', async () => {
        const user = userEvent.setup();
        render(<JsonFormatter />);
        const inputArea = screen.getByLabelText(/Input JSON/i);
        const formatButton = screen.getByRole('button', { name: /Format & Validate/i });
        const invalidInput = '{"name": "Toolzen", "version": 1, }'; // Trailing comma

        await user.type(inputArea, invalidInput);
        await user.click(formatButton);

        // Expect an error message (assuming it's rendered within a div)
        const errorDiv = screen.getByText(/Invalid JSON/i); // Find based on text content
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv).toHaveClass('bg-red-900'); // Check styling indicative of error
        expect(screen.queryByText(/Formatted JSON/i)).not.toBeInTheDocument();
    });

    it('shows an error for empty JSON input on format', async () => {
        const user = userEvent.setup();
        render(<JsonFormatter />);
        const formatButton = screen.getByRole('button', { name: /Format & Validate/i });

        await user.click(formatButton);

        const errorDiv = screen.getByText(/Input JSON is empty/i);
        expect(errorDiv).toBeInTheDocument();
        expect(screen.queryByText(/Formatted JSON/i)).not.toBeInTheDocument();
    });

    it('clears input, output, and error on clear button click', async () => {
        const user = userEvent.setup();
        render(<JsonFormatter />);
        const inputArea = screen.getByLabelText(/Input JSON/i);
        const formatButton = screen.getByRole('button', { name: /Format & Validate/i });
        const clearButton = screen.getByRole('button', { name: /Clear/i });
        const invalidInput = '{"a":}';

        // Create an error state
        await user.type(inputArea, invalidInput);
        await user.click(formatButton);
        expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument(); // Error exists

        // Click clear
        await user.click(clearButton);

        expect(inputArea).toHaveValue('');
        expect(screen.queryByText(/Formatted JSON/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Invalid JSON/i)).not.toBeInTheDocument(); // Error cleared
    });
});
