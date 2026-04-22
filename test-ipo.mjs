import yahooFinance from 'yahoo-finance2';

async function testIPO() {
    try {
        // Try to fetch IPO calendar or trending
        // Note: yahoo-finance2 might not have a direct 'ipo' method documented clearly in all versions, 
        // but let's try 'dailyGainers' or see if we can find a symbol for an upcoming IPO.
        // Actually, let's try to search for a known recent IPO symbol.

        const result = await yahooFinance.search('IPO');
        console.log('Search result for IPO:', JSON.stringify(result, null, 2));

        // There isn't a direct "get upcoming IPOs" method in the standard public modules of yf2 
        // without authentication cookies sometimes.
        // Let's try to see if we can get trending which might have IPOs.
        const trending = await yahooFinance.trending('IN');
        console.log('Trending in IN:', JSON.stringify(trending, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testIPO();
