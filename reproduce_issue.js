
const yahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log('Class type:', typeof yahooFinance);

    try {
        console.log('--- Attempt 1: Constructor with options ---');
        const yf1 = new yahooFinance({ suppressNotices: ['yahooSurvey'] });
        console.log('Instance 1 created');
        console.log('Has quote?', typeof yf1.quote === 'function');
    } catch (e) {
        console.log('Instance 1 failed:', e.message);
    }

    try {
        console.log('--- Attempt 2: Constructor without options ---');
        const yf2 = new yahooFinance();
        console.log('Instance 2 created');
        console.log('Has quote?', typeof yf2.quote === 'function');

        if (typeof yf2.quote === 'function') {
            try {
                // Try a dummy quote to see if it works (might fail network but shouldn't crash)
                // We won't actually await it to avoid hanging, just check if it returns a promise
                const p = yf2.quote('AAPL');
                console.log('Quote returned promise?', p instanceof Promise);
                p.catch(e => console.log('Quote fetch error (expected):', e.message));
            } catch (e) {
                console.log('Quote execution error:', e.message);
            }
        }
    } catch (e) {
        console.log('Instance 2 failed:', e.message);
    }
}

test();
