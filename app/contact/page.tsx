import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | TulRex',
    description: 'Get in touch with us for any inquiries or feedback.',
};

export default function ContactPage() {
    return (
        <div className=" md:max-w-4xl mx-auto prose dark:prose-invert">
            <h1 className="">Contact TulRex</h1>
            <p>Got some feedback or a new idea? Want to know more about us?</p>
            <h2>How to Reach Us</h2>
            <p>Email: contact@tulrex.com</p>
            <p>Twitter: @TulRex</p>
            <p>GitHub: Open an issue on our repository with details.</p>

            <h2>What to Include</h2>
            <p>Please share:</p>
            <p>- The tool you used</p>
            <p>- Your browser and operating system</p>
            <p>- The exact input and expected vs. actual result</p>

            <h2>Our Promise</h2>
            <p>
                Your privacy matters. TulRex is fully client-side, we don’t track or store your
                data. Your email will only be used to reply to you.
            </p>

            <h2>Support the Project</h2>
            <p>
                TulRex is open-source and free. If you find it useful, consider supporting through
                donations or sponsorships to keep the project alive.
            </p>
        </div>
    );
}
