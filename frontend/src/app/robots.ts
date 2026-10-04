import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/dashboard',
                    '/profile',
                    '/admin',
                    '/_next/',
                    '/settings',
                    '/login',
                    '/forgot-password',
                    '/reset-password',
                    '/verify-email',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
