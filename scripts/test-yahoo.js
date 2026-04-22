const yahooFinance = require('yahoo-finance2').default;

async function test() {
    try {
        console.log('Fetching quote for RELIANCE.NS...');
        const result = await yahooFinance.quote('RELIANCE.NS');
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
