const yahooFinance = require('yahoo-finance2').default;

// Suppress notices
yahooFinance.suppressNotices(['yahooSurvey']);

// Set User Agent
if (typeof yahooFinance.setGlobalConfig === 'function') {
    yahooFinance.setGlobalConfig({
        fetchOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }
    });
}

const symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS'];

async function testFetch() {
    console.log('Fetching symbols:', symbols);
    try {
        const results = await yahooFinance.quote(symbols, { validateResult: false });
        console.log('Success! Count:', results.length);
        console.log('First result:', results[0]);
    } catch (error) {
        console.error('FAILED:');
        console.error(error.message);
        console.error(JSON.stringify(error, null, 2));
    }
}

testFetch();
