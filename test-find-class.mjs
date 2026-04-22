import * as yf from 'yahoo-finance2';

console.log('All exports:', Object.keys(yf));
if (yf.default) {
    console.log('default type:', typeof yf.default);
    console.log('default keys:', Object.keys(yf.default));
}
if (yf.YahooFinance) {
    console.log('YahooFinance export found');
}
