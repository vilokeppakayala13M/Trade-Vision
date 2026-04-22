import yahooFinance from 'yahoo-finance2';
import fs from 'fs';

async function test() {
    try {
        console.log("Type of yahooFinance:", typeof yahooFinance);
        console.log("Keys:", Object.keys(yahooFinance));

        console.log("Testing single symbol...");
        const single = await yahooFinance.quote('RELIANCE.NS');
        console.log("Single success:", single.symbol);

        console.log("Testing array of symbols...");
        const multiple = await yahooFinance.quote(['RELIANCE.NS', 'TCS.NS']);
        console.log("Array success, count:", multiple.length);
    } catch (e) {
        console.error("CAUGHT ERROR:");
        console.error(e.message);
        fs.writeFileSync('error.log', e.message + '\n' + e.stack);
    }
}

test();
