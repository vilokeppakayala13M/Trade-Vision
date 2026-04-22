export interface Tweet {
    id: string;
    text: string;
    username: string;
    timestamp: number;
}

// Simulated financial tweets template
const TEMPLATES = [
    "Just bought more $SYM. Fundamentals looking strong! #investing",
    "$SYM reporting earnings next week. Expecting a big beat.",
    "Market sentiment for $SYM is shifting negative. Selling my position.",
    "Target price for $SYM raised to 2500 by top analyst.",
    "Huge volume on $SYM today! Something is brewing.",
    "$SYM down 2% on weak global cues. Opportunity to accumulate?",
    "Breaking: $SYM announces new partnership with tech giant.",
    "Why is $SYM falling? Any news?",
    "Bullish on $SYM long term. Short term volatility is noise.",
    "$SYM technicals showing a double bottom pattern. Reversal imminent."
];

/**
 * Simulates fetching tweets for a given stock symbol.
 * In a real app, this would call the Twitter API.
 */
export async function fetchCompanyTweets(symbol: string, count: number = 20): Promise<Tweet[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
    const tweets: Tweet[] = [];

    for (let i = 0; i < count; i++) {
        const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
        const text = template.replace(/\$SYM/g, cleanSymbol);

        tweets.push({
            id: Math.random().toString(36).substring(7),
            text,
            username: `user_${Math.floor(Math.random() * 1000)}`,
            timestamp: Date.now() - Math.floor(Math.random() * 86400000) // Random time in last 24h
        });
    }

    return tweets;
}
