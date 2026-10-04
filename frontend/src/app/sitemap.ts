import type { MetadataRoute } from 'next';

// All tracked NSE symbols for dynamic sitemap entries
const NSE_SYMBOLS = [
    'reliance', 'tcs', 'hdfcbank', 'infy', 'icicibank', 'hindunilvr', 'sbin', 'bajfinance',
    'bhartiartl', 'kotakbank', 'ltim', 'itc', 'axisbank', 'asianpaint', 'maruti', 'titan',
    'sunpharma', 'ultracemco', 'nestleind', 'tatamotors', 'wipro', 'hcltech', 'ongc',
    'ntpc', 'powergrid', 'coalindia', 'adanient', 'adaniports', 'jswsteel', 'tatasteel',
    'hindalco', 'techm', 'lt', 'drreddy', 'cipla', 'bpcl', 'ioc', 'grasim', 'divislab',
    'shreecem', 'bajajfinsv', 'indusindbk', 'upl', 'apollohosp', 'britannia', 'eichermot',
    'heromotoco', 'sbilife', 'hdfclife', 'm&m', 'vedl', 'siemens', 'ambujacem', 'acc',
    'dmart', 'bankbaroda', 'canbk', 'pfc', 'recltd', 'irctc', 'pidilitind', 'mcdowell-n',
    'trent', 'zomato', 'paytm', 'nykaa', 'policybzr', 'freshworks', 'delhivery', 'abb',
    'havells', 'voltas', 'bergepaint', 'kansaipaint', 'pageind', 'muthootfin', 'cholamandalam',
    'bajaj-auto', 'tvsmotor', 'exideind', 'boschltd', 'mrf', 'apollotyre', 'balkrisind',
    'colpal', 'dabur', 'marico', 'emamiltd', 'godrejcp', 'pidilite', 'relaxo', 'bataindia',
    'vbl', 'hul', 'tatachem', 'tatapower', 'tatacomm', 'sail', 'nmdc', 'nationalum', 'hindzinc'
];

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tradevision.in';

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/ipos`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/news`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/futures`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/tools`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/watchlist`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: '2025-01-01',
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: '2025-01-01',
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: '2025-01-01',
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: '2025-01-01',
            changeFrequency: 'yearly',
            priority: 0.1,
        },
        {
            url: `${BASE_URL}/disclaimer`,
            lastModified: '2025-01-01',
            changeFrequency: 'yearly',
            priority: 0.1,
        },
    ];

    const companyRoutes: MetadataRoute.Sitemap = NSE_SYMBOLS.map((symbol) => ({
        url: `${BASE_URL}/company/${symbol}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...companyRoutes];
}
