async function testOne(name, url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Referer': 'https://groww.in/'
            }
        });
        console.log(`${name}: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`  SUCCESS! Keys: ${Object.keys(data).slice(0, 5)}`);
            return true;
        }
    } catch (e) {
        console.log(`${name}: ERROR ${e.message}`);
    }
    return false;
}

async function run() {
    console.log('--- Testing Groww APIs ---');
    await testOne('Groww API Subdomain (all)', 'https://api.groww.in/v1/api/stocks_data/v1/ipo/all');
    await testOne('Groww API Subdomain (browse)', 'https://api.groww.in/v1/api/stocks_data/v1/ipo/browse');
    await testOne('Groww WWW (all)', 'https://www.groww.in/v1/api/stocks_data/v1/ipo/all');

    console.log('\n--- Testing IPO Alerts APIs ---');
    await testOne('IPO Alerts WWW', 'https://www.ipoalerts.in/v1/ipos');
    await testOne('IPO Alerts API subdomain', 'https://api.ipoalerts.in/v1/ipos');
}

run();
