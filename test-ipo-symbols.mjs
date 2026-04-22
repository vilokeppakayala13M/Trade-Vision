import yahooFinance from 'yahoo-finance2';

async function testRecentIPOs() {
    const symbols = [
        'SWIGGY.NS',
        'NTPCGREEN.NS',
        'ZINKA.NS', // BlackBuck
        'ACME.NS', // Acme Solar
        'SAGARDEEP.NS' // Random check
    ];

    try {
        const results = await yahooFinance.quote(symbols);
        console.log('Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testRecentIPOs();
