import React from 'react';
import { render, screen, act } from '@testing-library/react'; // 'act' might be needed if there are state updates on mount
import { getToolBySlug } from '@/lib/tools';
import ToolPage from '@/tools/[slug]/page';

// Mock next/navigation's notFound to prevent test runner errors if a slug *were* invalid
// Although our test provides valid slugs, it's good practice when testing pages.
jest.mock('next/navigation', () => ({
    ...jest.requireActual('next/navigation'), // Use actual implementation for other hooks if needed
    notFound: () => {
        // You could throw a specific error here to check if it gets called unexpectedly
        console.error('Mock notFound called!'); // Log if called during a valid test
    },
}));

// --- Define the tools/slugs you want to check ---
const toolsToTest = [
    {
        slug: 'json-formatter',
        // A unique element/text expected on this page besides the title
        expectedElementTestId: /json-input/i, // Matches the label htmlFor
    },
    {
        slug: 'regex-tester',
        expectedElementTestId: /regex-input/i, // Matches the label htmlFor
    },
    {
        slug: 'uuid-generator',
        expectedElementTestId: /uuid-output/i, // Matches the label htmlFor
    },
    // Add more tools here if needed
];

describe('Tool Page Rendering Integration', () => {
    // Use test.each to run the same test logic for multiple slugs
    test.each(toolsToTest)(
        'should render the $slug page successfully with the correct title',
        async ({ slug, expectedElementTestId }) => {
            // 1. Get expected data for the tool
            const toolInfo = await getToolBySlug(slug);
            expect(toolInfo).toBeDefined(); // Pre-check: Ensure the slug is valid in our tools list

            // 2. Render the ToolPage component with the specific slug parameter
            // Use act if the component performs state updates on mount/useEffect
            await act(async () => {
                render(<ToolPage params={{ slug }} />);
            });

            // 3. Assert: Check if the main H1 heading matches the tool's title
            // Use findByRole for potential async rendering, though likely not needed here
            const heading = await screen.findByRole('heading', {
                level: 1,
                name: toolInfo!.title, // Use the title from our tool data
            });
            expect(heading).toBeInTheDocument();

            // 4. Assert: Check if a key element specific to that tool's UI is present
            // This gives extra confidence the correct tool component was rendered.
            // Use findByLabelText, findByRole, etc. depending on the element.
            // Using findByLabelText here based on the expectedElementTestId regex.
            const specificElement = await screen.findByLabelText(expectedElementTestId);
            expect(specificElement).toBeInTheDocument();

            // 5. Implicitly: If render didn't throw an error and the elements are found,
            //    it means the page loaded without crashing, similar to a 200 OK.
        }
    );
});
