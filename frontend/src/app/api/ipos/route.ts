import { NextResponse } from 'next/server';
import { openIPOs, closedIPOs, listedIPOs, upcomingIPOs } from '@/lib/ipoData';

export async function GET() {
    try {
        // Fetch Live Open IPOs from NSE API
        const response = await fetch('https://www.nseindia.com/api/ipo-current-issue', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            },
            next: { revalidate: 60 * 5 } // Cache for 5 minutes
        });

        let liveOpenIPOs = [];

        if (response.ok) {
            const data = await response.json();
            const totalRows = data.filter((row: any) => row.category === 'Total' || !row.category || row.category === '');
            
            liveOpenIPOs = totalRows.map((item: any, index: number) => {
                let subscription = '0.00x';
                if (item.noOfTime) {
                    subscription = parseFloat(item.noOfTime).toFixed(2) + 'x';
                }

                const dateRange = `${item.issueStartDate?.split('-')[0]} ${item.issueStartDate?.split('-')[1]} - ${item.issueEndDate?.split('-')[0]} ${item.issueEndDate?.split('-')[1]}`;

                return {
                    id: `live-${index}`,
                    company: item.companyName,
                    symbol: item.symbol,
                    category: item.series === 'SM' ? 'SME' : 'Mainboard',
                    date: dateRange,
                    subscription: subscription,
                    biddingDates: `${item.issueStartDate} - ${item.issueEndDate}`,
                    priceRange: item.issuePrice,
                    issueSize: item.issueSize ? `${(parseFloat(item.issueSize) / 10000000).toFixed(2)} Cr` : 'Unknown',
                    status: item.status
                };
            });
        }

        return NextResponse.json({
            open: liveOpenIPOs.length > 0 ? liveOpenIPOs : [],
            closed: closedIPOs,
            listed: listedIPOs,
            upcoming: upcomingIPOs
        });
    } catch (error) {
        console.error('Error fetching live IPOs:', error);
        return NextResponse.json({
            open: [],
            closed: closedIPOs,
            listed: listedIPOs,
            upcoming: upcomingIPOs
        });
    }
}
