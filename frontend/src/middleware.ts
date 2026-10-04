import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to generate HMAC SHA-256 signature in the Edge Runtime (Web Crypto API)
async function hmacSha256(secret: string, data: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const message = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        message
    );

    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const method = request.method;

    // 1. CSRF Protection for API Routes
    if (pathname.startsWith('/api/')) {
        const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        
        // Exempt the csrf route itself and webhooks
        const isExempt = 
            pathname === '/api/auth/csrf' || 
            pathname === '/api/quotes' ||
            pathname.startsWith('/api/quotes/') ||
            pathname.includes('/webhook') || 
            pathname.includes('/webhooks');

        if (isMutatingMethod && !isExempt) {
            const csrfSecretCookie = request.cookies.get('csrfSecret');
            const csrfSecret = csrfSecretCookie ? csrfSecretCookie.value : null;
            const csrfTokenHeader = request.headers.get('x-csrf-token');

            if (!csrfSecret || !csrfTokenHeader) {
                return NextResponse.json(
                    { error: 'CSRF validation failed: Missing token or cookie' },
                    { status: 403 }
                );
            }

            const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
            const expectedToken = await hmacSha256(jwtSecret, csrfSecret);

            if (csrfTokenHeader !== expectedToken) {
                return NextResponse.json(
                    { error: 'CSRF validation failed: Invalid token' },
                    { status: 403 }
                );
            }
        }

        return NextResponse.next();
    }

    // 2. CSP Protection for Web Pages
    // Generate a unique nonce for this request
    const nonce = btoa(crypto.randomUUID());

    // Clone the request headers and set the nonce header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    // Construct the Content-Security-Policy header
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https:;
        connect-src 'self' https://finnhub.io https://query1.finance.yahoo.com https://accounts.google.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    // Set the CSP header in the response and forward the custom request header
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set('Content-Security-Policy', cspHeader);

    return response;
}

// Match all routes except for static assets, next images, and favicon
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
