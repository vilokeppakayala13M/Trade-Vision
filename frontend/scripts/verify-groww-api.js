async function testOne(name, url) {
    try {
        console.log(`Testing ${name}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        console.log(`  Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`  Success! Data count: ${Array.isArray(data) ? data.length : (data.data?.length || 'object')}`);
            console.log(`  Snippet: ${JSON.stringify(data).substring(0, 100)}...`);
        } else {
            console.log(`  Failed: ${response.statusText}`);
        }
    } catch (e) {
        console.log(`  Error: ${e.message}`);
    }
    console.log('-------------------');
}

async function run() {
    console.log('--- Testing Groww API Variants ---');
    const bases = ['https://groww.in', 'https://api.groww.in'];
    const paths = [
        '/v1/api/stocks_data/v1/ipo/all',
        '/v1/api/stocks_ipo/v1/ipo/all',
        '/v1/api/stocks_data/v1/ipo/active',
        '/v1/api/stocks_ipo/v1/ipo/active',
        '/v1/api/stocks_data/v1/ipo/browse',
        '/v1/api/stocks_ipo/v1/ipo/browse'
    ];

    for (const base of bases) {
        for (const path of paths) {
            await testOne(`${base}${path}`, `${base}${path}`);
        }
    }
}

run();
