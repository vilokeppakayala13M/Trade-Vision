import * as yf from 'yahoo-finance2';

console.log('Has YahooFinance export:', 'YahooFinance' in yf);
if (yf.default) {
    console.log('Has YahooFinance in default:', 'YahooFinance' in yf.default);
    console.log('Type of default:', typeof yf.default);
    // Check if default is the class itself
    try {
        new yf.default();
        console.log('default is a class');
    } catch (e) {
        console.log('default is NOT a class:', e.message);
    }
}
