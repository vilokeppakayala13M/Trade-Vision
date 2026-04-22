const yf = require('yahoo-finance2');
console.log('Default export:', yf);
console.log('Keys:', Object.keys(yf));
try {
    const instance = new yf.YahooFinance();
    console.log('Instantiated successfully');
} catch (e) {
    console.log('Instantiation failed:', e.message);
}
