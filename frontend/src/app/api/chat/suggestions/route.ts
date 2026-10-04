import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const symbol = req.nextUrl.searchParams.get('symbol');

    let suggestions: string[] = [];

    if (symbol) {
        suggestions = [
            "Should I buy or wait?",
            "What's driving today's movement?",
            "Key support and resistance levels",
            "How does it compare to sector peers?",
            "What are the biggest risks?",
            "Is it overvalued at this price?"
        ];
    } else {
        suggestions = [
            "Which large-cap stocks are worth watching?",
            "Explain SIP vs lumpsum investing",
            "What is F&O and how does it work?",
            "How do I build a diversified portfolio?",
            "What does the current Nifty PE ratio suggest?",
            "Explain LTCG tax on equity."
        ];
    }

    // Return 4 random suggestions
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    return Response.json({ suggestions: selected });
}
