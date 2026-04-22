const https = require('https');

const url = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=RELIANCE.NS,TCS.NS';

console.log('Fetching:', url);

https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', data.substring(0, 500)); // Print first 500 chars
    });
}).on('error', (e) => {
    console.error('Error:', e);
});
