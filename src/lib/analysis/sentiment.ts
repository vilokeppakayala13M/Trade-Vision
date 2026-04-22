/**
 * Dictionary-based Sentiment Analysis
 * Calculates Polarity (-1 to 1) and Subjectivity (0 to 1)
 */

// A simple dictionary of sentiment words
// In a real production app, this would be a comprehensive library like AFINN or VADER
const SENTIMENT_DICTIONARY: Record<string, number> = {
    // Positive (Business/Finance context)
    "growth": 2, "profit": 3, "record": 2, "jump": 2, "rise": 1, "bullish": 3,
    "exceed": 2, "beat": 2, "surge": 3, "gain": 2, "positive": 2, "buy": 2,
    "strong": 2, "upgrade": 3, "dividend": 1, "bonus": 2, "acquisition": 1,
    "partnership": 1, "launch": 1, "success": 3, "win": 2, "high": 1,
    "outperform": 3, "rally": 2, "soar": 3, "boom": 3, "expansion": 2,

    // Negative
    "loss": -3, "fall": -2, "drop": -2, "decline": -2, "bearish": -3,
    "miss": -2, "fail": -3, "tank": -3, "crash": -4, "negative": -2,
    "sell": -2, "weak": -2, "downgrade": -3, "risk": -1, "debt": -2,
    "scandal": -4, "lawsuit": -3, "penalty": -3, "ban": -3, "shutdown": -3,
    "low": -1, "underperform": -2, "plunge": -3, "slump": -2, "recession": -3
};

const SUBJECTIVE_WORDS: Set<string> = new Set([
    "feel", "believe", "think", "opinion", "seem", "appear", "suggest",
    "amazing", "incredible", "awful", "terrible", "beautiful", "ugly",
    "good", "bad", "best", "worst", "expert", "analyst", "predict",
    "rumor", "speculation", "fear", "hope"
]);

export interface SentimentResult {
    score: number;      // Raw score sum
    polarity: number;   // Normalized -1 to 1
    subjectivity: number; // Normalized 0 to 1
    positive: number;   // 0 to 1
    negative: number;   // 0 to 1
    neutral: number;    // 0 to 1
    tokens: string[];
    details: { word: string, score: number }[];
}

export function analyzeSentiment(text: string): SentimentResult {
    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    let subjectiveCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    const details: { word: string, score: number }[] = [];

    tokens.forEach(token => {
        // Polarity
        if (SENTIMENT_DICTIONARY[token]) {
            const val = SENTIMENT_DICTIONARY[token];
            score += val;
            details.push({ word: token, score: val });

            if (val > 0) positiveCount++;
            else if (val < 0) negativeCount++;
        }
        // Subjectivity
        if (SUBJECTIVE_WORDS.has(token)) {
            subjectiveCount++;
        }
    });

    const totalWords = Math.max(tokens.length, 1);

    // Normalize Polarity (-1 to 1)
    const maxPossScore = totalWords * 1.5; // Approximation
    const polarity = Math.max(-1, Math.min(1, score / maxPossScore));

    // Normalize Subjectivity (0 to 1)
    const subjectivity = Math.min(1, subjectiveCount / totalWords);

    // Calculate ratios
    const positive = positiveCount / totalWords;
    const negative = negativeCount / totalWords;
    const neutral = (totalWords - positiveCount - negativeCount) / totalWords;

    return {
        score,
        polarity,
        subjectivity,
        positive,
        negative,
        neutral,
        tokens,
        details
    };
}

export function analyzeBatch(texts: string[]): SentimentResult {
    const combinedText = texts.join(' ');
    // Simple average approach or concatenate text? 
    // Concatenating text gives a better 'global' context for document-level sentiment
    return analyzeSentiment(combinedText);
}
