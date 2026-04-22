const pkg = require('yahoo-finance2');

console.log('--- Debugging yahoo-finance2 Import ---');
console.log('Type of package:', typeof pkg);
console.log('Keys in package:', Object.keys(pkg));
if (pkg.default) {
    console.log('pkg.default type:', typeof pkg.default);
    console.log('pkg.default prototype methods:', Object.getOwnPropertyNames(pkg.default.prototype || {}));
}

let yf;
const candidate = pkg.default || pkg;

if (typeof candidate === 'function') { // Class or Function
    // Check if it looks like a class (has prototype methods we expect) or if it's the module function?
    console.log('Candidate is a function/class. Instantiating...');
    try {
        yf = new candidate();
    } catch (e) {
        console.error('Instantiation failed:', e.message);
        yf = candidate; // Maybe it was a function instance?
    }
} else {
    console.log('Candidate is an object/instance.');
    yf = candidate;
}

console.log('Final yf object keys:', Object.keys(yf || {}));
console.log('Has name?', yf && yf.name);
console.log('Has quote?', typeof yf.quote);

if (yf && typeof yf.quote === 'function') {
    console.log('--- Running Request ---');
    // yf.suppressNotices(['yahooSurvey']);

    // Set User Agent
    if (typeof yf.setGlobalConfig === 'function') {
        yf.setGlobalConfig({
            fetchOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });
    }

    const symbols = ['RELIANCE.NS'];
    yf.quote(symbols)
        .then(res => {
            console.log('SUCCESS:', res.length, 'results');
            if (res.length > 0) {
                console.log('First Quote Data:', JSON.stringify(res[0], null, 2));
            }
        })
        .catch(err => console.error('FAILURE:', err));
} else {
    console.error('CRITICAL: yf is not ready');
}
