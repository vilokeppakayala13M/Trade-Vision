
const yahooFinance = require('yahoo-finance2').default;
console.log('Type of default export:', typeof yahooFinance);
console.log('Is instance?', yahooFinance && typeof yahooFinance.quote === 'function');
console.log('Is constructor?', typeof yahooFinance === 'function');

try {
    const yf = new yahooFinance();
    console.log('Successfully created instance with new');
} catch (e) {
    console.log('Failed to create instance with new:', e.message);
}

try {
    import('react-virtualized-auto-sizer').then(mod => {
        console.log('react-virtualized-auto-sizer default export:', mod.default);
        console.log('react-virtualized-auto-sizer module:', mod);
    }).catch(e => console.log('Error importing sizer:', e.message));
} catch (e) {
    // ignore dynamic import syntax error in CJS context if node version old, but this file is .js so it might work if type=module in package.json... 
    // actually just require it
}

try {
    const AutoSizer = require('react-virtualized-auto-sizer');
    console.log('Required AutoSizer type:', typeof AutoSizer);
    console.log('AutoSizer default:', AutoSizer.default);
} catch (e) {
    console.log('Error requiring sizer:', e.message);
}
