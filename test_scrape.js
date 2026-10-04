const cheerio = require('cheerio');

async function scrapeInvestorgain() {
    try {
        console.log("Fetching investorgain.com...");
        const res = await fetch('https://www.investorgain.com/report/live-ipo-gmp/331/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let ipos = [];
        // The table is usually #mainTable or similar
        $('table tbody tr').each((i, el) => {
            if (i < 10) {
                const cols = $(el).find('td');
                if (cols.length >= 6) {
                    const company = $(cols[0]).text().trim();
                    const price = $(cols[1]).text().trim();
                    const gmp = $(cols[2]).text().trim();
                    const estListing = $(cols[3]).text().trim();
                    const fireRating = $(cols[4]).text().trim();
                    const ipoDate = $(cols[6]).text().trim();
                    
                    if (company) {
                         ipos.push({company, price, gmp, estListing, ipoDate});
                    }
                }
            }
        });
        console.log(ipos);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
scrapeInvestorgain();
