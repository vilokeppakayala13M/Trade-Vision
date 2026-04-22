async function testQuotes() {
    const symbols = 'RELIANCE.NS,SBIN.NS';
    const url = `http://localhost:3005/api/quotes?symbols=${symbols}`;

    console.log(`Fetching from: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testQuotes();
