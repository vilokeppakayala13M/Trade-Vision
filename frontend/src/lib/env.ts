// Validates required server-side environment variables on application startup.
// Throws a clear Error if any critical variables are missing.

export function validateEnv() {
    // Skip validation during static build phase
    if (process.env.npm_lifecycle_event === 'build') {
        return;
    }
    const requiredServerVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'MONGODB_URI',
        'FINNHUB_API_KEY',
    ];

    const missingVars = requiredServerVars.filter(
        (envVar) => !process.env[envVar]
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}. \n` +
            `Please check your .env.local file or server configuration.`
        );
    }

    if (!process.env.SMTP_PASS) {
        console.warn('[Env Notice] SMTP_PASS is empty. Development fallback mode will log emails to terminal/UI.');
    }

    console.log('Environment variables validated successfully.');
}
