import Link from 'next/link';
import Image from 'next/image';

export default function SponsorBlock() {
    const sponsorName = process.env.NEXT_PUBLIC_SPONSOR_NAME;
    const sponsorUrl = process.env.NEXT_PUBLIC_SPONSOR_URL;
    const sponsorLogoUrl = process.env.NEXT_PUBLIC_SPONSOR_LOGO_URL;
    const sponsorshipUrl = process.env.NEXT_PUBLIC_SPONSORSHIP_URL || '/about#sponsorship';

    const hasSponsor = !!sponsorName && !!sponsorUrl;

    return (
        <div className="mt-12 mb-6 text-center text-sm text-gray-400 px-4">
            <div className="max-w-2xl mx-auto p-4 border border-gray-700 bg-gray-800/50 rounded-lg">
                {hasSponsor ? (
                    <div>
                        <span className="text-base mr-2" aria-hidden="true">
                            🎉
                        </span>
                        <span>Today’s Sponsor: </span>
                        <a
                            href={sponsorUrl}
                            target="_blank"
                            rel="noopener sponsored"
                            className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5"
                        >
                            {sponsorLogoUrl && (
                                <Image
                                    src={sponsorLogoUrl}
                                    alt={`${sponsorName} Logo`}
                                    width={20}
                                    height={20}
                                    className="inline-block object-contain rounded-sm"
                                />
                            )}
                            {sponsorName}
                        </a>
                        <p className="text-xs text-gray-500 mt-1.5">
                            Thanks to our sponsors, this site remains free, private, and ad-free for
                            everyone.
                        </p>
                    </div>
                ) : (
                    <div>
                        <span className="text-base mr-2" aria-hidden="true">
                            🚫
                        </span>
                        <strong className="text-gray-300">No Sponsors Found</strong>
                        <p className="text-xs text-gray-500 mt-1.5">
                            Want to support a privacy-first, open-source tool?
                            <Link
                                href={sponsorshipUrl}
                                target={sponsorshipUrl.startsWith('http') ? '_blank' : '_self'}
                                rel={sponsorshipUrl.startsWith('http') ? 'noopener noreferrer' : ''}
                                className="ml-1 text-cyan-400 hover:text-cyan-300 hover:underline"
                            >
                                Sponsor Us →
                            </Link>{' '}
                            and keep the internet clean.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
