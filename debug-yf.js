const pkg = require('yahoo-finance2');
console.log('Package Keys:', Object.keys(pkg));
if (pkg.YahooFinance) {
    console.log('pkg.YahooFinance exists, type:', typeof pkg.YahooFinance);
} else {
    console.log('pkg.YahooFinance MISSING');
}
console.log('pkg.default type:', typeof pkg.default);
