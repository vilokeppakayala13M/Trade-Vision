// eslint-disable-next-line @typescript-eslint/no-require-imports
const yahooFinanceModule = require('yahoo-finance2');
console.log('Module keys:', Object.keys(yahooFinanceModule));
const yahooFinance = yahooFinanceModule.default || yahooFinanceModule;
console.log('yahooFinance type:', typeof yahooFinance);
console.log('yahooFinance keys:', Object.keys(yahooFinance));

async function test() {
    try {
        console.log("Testing single symbol...");
        const single = await yahooFinance.quote('RELIANCE.NS');
        console.log("Single success:", single.symbol);

        console.log("Testing array of symbols...");
        const multiple = await yahooFinance.quote(['RELIANCE.NS', 'TCS.NS']);
        console.log("Array success, count:", multiple.length);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.errors) {
            console.error("Detailed errors:", JSON.stringify(e.errors, null, 2));
        }
    }
}

test();
