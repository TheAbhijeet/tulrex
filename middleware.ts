import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    if (
        process.env.MAINTENANCE_MODE === 'true' &&
        !req.nextUrl.pathname.startsWith('/maintenance.html')
    ) {
        const url = req.nextUrl.clone();
        url.pathname = '/maintenance.html';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
