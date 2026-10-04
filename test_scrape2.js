const cheerio = require('cheerio');

async function scrapeChittorgarh() {
    try {
        console.log("Fetching Chittorgarh...");
        const res = await fetch('https://www.chittorgarh.com/report/ipo-in-india-list-main-board-sme/82/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        console.log("Title:", $('title').text());
        
        let ipos = [];
        // Chittorgarh uses tables
        $('table').each((i, table) => {
            $(table).find('tr').each((j, el) => {
                if (j > 0 && j < 10) {
                    const cols = $(el).find('td');
                    if (cols.length >= 5) {
                         const company = $(cols[0]).text().trim();
                         const openDate = $(cols[1]).text().trim();
                         const closeDate = $(cols[2]).text().trim();
                         const status = $(cols[6]).text().trim(); // sometimes status
                         ipos.push({company, openDate, closeDate, status});
                    }
                }
            });
        });
        console.log("Found IPOs:", ipos.slice(0, 5));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
scrapeChittorgarh();
