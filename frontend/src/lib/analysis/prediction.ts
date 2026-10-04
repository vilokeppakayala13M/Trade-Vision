/**
 * Simple Linear Regression and Trend Projection for Stock Prediction
 */

// Basic Point interface
export interface Point {
    x: number; // Time (timestamp or simple index)
    y: number; // Price
}

export interface PredictionResult {
    slope: number;
    intercept: number;
    forecast: Point[];
    metrics: {
        rmse: number;
        mae: number;
        mape: number;
    };
}

/**
 * Calculates the best-fit line (y = mx + b) for a given set of points
 * and projects it into the future.
 */
export function calculateTrend(data: number[], futureSteps: number = 7): PredictionResult {
    const n = data.length;
    if (n === 0) return { slope: 0, intercept: 0, forecast: [], metrics: { rmse: 0, mae: 0, mape: 0 } };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    // Use indices 0 to n-1 as X values
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: Point[] = [];
    let sumSquaredError = 0;
    let sumAbsoluteError = 0;
    let sumAbsolutePercentageError = 0;

    // Calculate In-Sample Errors (accuracy on training data)
    for (let i = 0; i < n; i++) {
        const actualY = data[i];
        const predictedY = slope * i + intercept;

        const error = actualY - predictedY;
        sumSquaredError += error * error;
        sumAbsoluteError += Math.abs(error);
        if (actualY !== 0) {
            sumAbsolutePercentageError += Math.abs(error / actualY);
        }
    }

    const rmse = Math.sqrt(sumSquaredError / n);
    const mae = sumAbsoluteError / n;
    const mape = (sumAbsolutePercentageError / n) * 100;

    // Generate prediction points strictly for the future steps
    // Starting from n (the next immediate point)
    for (let i = 1; i <= futureSteps; i++) {
        const nextX = n - 1 + i; // Continue index sequence
        const nextY = slope * nextX + intercept;
        forecast.push({ x: nextX, y: nextY });
    }

    return {
        slope,
        intercept,
        forecast,
        metrics: {
            rmse,
            mae,
            mape
        }
    };
}
