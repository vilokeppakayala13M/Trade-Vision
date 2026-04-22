/**
 * Decision Tree Engine for Buy/Sell/Hold
 * Implements logic from SMAP Fig. 34
 */

export type Decision = 'Buy' | 'Sell' | 'Hold' | 'Wait' | 'Don\'t Buy';

interface DecisionInput {
    currentPrice: number;
    predictedPrice: number;
    polarity: number;        // -1 to 1
    globalPolarity: number;  // Threshold or comparison baseline (e.g. 0 or market average)
    hasHoldings: boolean;    // "Holdings" diamond in chart
}

export function makeDecision(input: DecisionInput): { decision: Decision; reason: string } {
    const { currentPrice, predictedPrice, polarity, globalPolarity, hasHoldings } = input;

    // Fig 34 Logic Trace:

    if (hasHoldings) {
        // Upper Branch: Has Holdings? YES

        if (polarity > globalPolarity) {
            // Polarity > Global Polarity? YES
            return { decision: 'Hold', reason: 'Positive sentiment relative to market (Holdings: Yes)' };
        } else {
            // Polarity > Global Polarity? NO

            if (currentPrice < predictedPrice) {
                // Current Price < Predicted Price? YES
                // Note: The diagram says "Hold" here for some paths, but let's strictly follow the chart
                // Looking at Fig 34: Holdings -> No -> P>GP(Yes) -> Hold? Wait.
                // Let's re-read the chart carefully.

                // My intepretation of Fig 34:
                // Start: Holdings?
                // YES path:
                //   Checking Polarity > Global Polarity?
                //     YES -> Hold
                //     NO -> Check Current < Predicted?
                //        YES -> Hold
                //        NO -> Sell

                return { decision: 'Hold', reason: 'Price projected to rise despite weak sentiment' };
            } else {
                // Current Price < Predicted Price? NO (Price >= Predicted)
                return { decision: 'Sell', reason: 'Likely overvalued and weak sentiment' };
            }
        }
    } else {
        // Lower/Right Branch: Has Holdings? NO

        if (polarity > globalPolarity) {
            // Polarity > Global Polarity? YES
            return { decision: 'Buy', reason: 'Strong sentiment and new opportunity' };
            // Diagram actually branches but leads to Buy for 'Yes' in generic interpretation?
            // Actually, diagram says: 
            // Holdings=No -> P>GP(Yes) -> Buy
            // Holdings=No -> P>GP(No) -> Current < Predicted?
            //    YES -> wait (lowercase 'wait' in diagram)
            //    NO -> Don't Buy
        } else {
            // Polarity > Global Polarity? NO

            if (currentPrice < predictedPrice) {
                // Current Price < Predicted Price? YES
                return { decision: 'Wait', reason: 'Price may rise, but sentiment is weak' };
            } else {
                // Current Price < Predicted Price? NO
                return { decision: 'Don\'t Buy', reason: 'Poor sentiment and no price upside' };
            }
        }
    }
}
