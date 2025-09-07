import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions | TulRex',
    description: 'Terms and Conditions for TulRex',
};

export default function TermsPage() {
    return (
        <div className=" md:max-w-4xl mx-auto prose dark:prose-invert">
            <h1>Terms &amp; Conditions</h1>
            <p>
                <strong>Effective date:</strong> 1st January 2025
            </p>
            <p>
                Welcome to <strong>TulRex</strong> ("we", "us", "our"). These Terms &amp; Conditions
                ("Terms") govern your access to and use of the TulRex website and tools at{' '}
                <a href="https://tulrex.com/" rel="noopener">
                    tulrex.com
                </a>{' '}
                (the "Service"). By using the Service, you agree to these Terms.
            </p>

            <h2>1. Who may use TulRex</h2>
            <p>
                You must be able to form a binding contract under applicable law. If you use the
                Service on behalf of an entity, you represent that you are authorized to accept
                these Terms for that entity.
            </p>

            <h2>2. Nature of the Service</h2>
            <ul>
                <li>
                    TulRex offers client‑side utilities (e.g., formatters, converters, validators).
                    Wherever stated, processing happens in your browser and your data is not
                    uploaded to our servers.
                </li>
                <li>
                    Some features may call third‑party APIs or our APIs (e.g., for updates,
                    telemetry-free health checks, or optional online features). Such usage will be
                    disclosed in the tool description.
                </li>
            </ul>

            <h2>3. Your Content</h2>
            <ul>
                <li>You retain all rights to content you input or upload.</li>
                <li>You are responsible for the legality and backups of your content.</li>
                <li>
                    Do not submit content that is illegal, harmful, infringes others’ rights, or
                    contains malware.
                </li>
            </ul>

            <h2>4. Open‑Source &amp; Third‑Party Software</h2>
            <p>
                Some parts of the Service use open‑source components. Those components are licensed
                under their own licenses. Where there is a conflict between these Terms and an
                open‑source license for a component, that component’s license will govern its use.
            </p>

            <h2>5. Accounts &amp; Access</h2>
            <p>If any feature requires an account:</p>
            <ul>
                <li>Keep your credentials confidential and restrict access to your device.</li>
                <li>You are responsible for all activities under your account.</li>
            </ul>

            <h2>6. Acceptable Use</h2>
            <ul>
                <li>
                    Do not misuse the Service, interfere with its operation, or access it using
                    methods other than the interface and instructions we provide.
                </li>
                <li>
                    Do not attempt to reverse engineer, decompile, or circumvent security or rate
                    limits, except where permitted by law.
                </li>
            </ul>

            <h2>7. Privacy</h2>
            <p>
                Your use of the Service is also governed by our Privacy Policy. Where tools process
                data entirely in your browser, we do not receive that data. Where network calls
                occur, we aim to minimize data collection to what is necessary to operate the
                feature. Review the Privacy Policy for details.
            </p>

            <h2>8. Donations &amp; Sponsors</h2>
            <p>
                TulRex may accept donations or sponsorships. Payments are handled by third‑party
                processors (e.g., Stripe, GitHub Sponsors) and subject to their terms and fees. Any
                contribution is voluntary and non‑refundable unless required by law.
            </p>

            <h2>9. Intellectual Property</h2>
            <p>
                The Service, including logos, branding, and site content (excluding your content and
                open‑source components), is owned by TulRex or its licensors and is protected by
                intellectual property laws. You may not use our marks without prior written
                permission.
            </p>

            <h2>10. Changes to the Service</h2>
            <p>
                We may modify, suspend, or discontinue features at any time. We strive to maintain
                availability but do not guarantee uninterrupted operation.
            </p>

            <h2>11. Warranties &amp; Disclaimers</h2>
            <p>
                The Service is provided on an <strong>“AS IS” and “AS AVAILABLE”</strong> basis
                without warranties of any kind, express or implied, including fitness for a
                particular purpose, non‑infringement, and accuracy. Tools may have limitations or
                bugs; validate outputs before relying on them.
            </p>

            <h2>12. Limitation of Liability</h2>
            <p>
                To the maximum extent permitted by law, TulRex will not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of data,
                profits, revenue, or business, arising from or related to your use of the Service.
            </p>

            <h2>13. Indemnity</h2>
            <p>
                You agree to indemnify and hold harmless TulRex and its maintainers from any claims,
                liabilities, damages, losses, and expenses (including legal fees) arising from your
                use of the Service or violation of these Terms.
            </p>

            <h2>14. Third‑Party Links</h2>
            <p>
                The Service may link to third‑party sites or services. We are not responsible for
                their content, policies, or practices. Use them at your own risk.
            </p>

            <h2>15. Updates to These Terms</h2>
            <p>
                We may update these Terms from time to time. Changes will be effective when posted
                on this page with the “Effective date” updated. Continued use of the Service after
                changes means you accept the updated Terms.
            </p>

            <h2>16. Contact</h2>
            <p>Questions about these Terms? Contact us via the contact page.</p>
        </div>
    );
}
