# 🔐 TradeVision Production Environment Variables

This document lists and explains all the environment variables required to run the **TradeVision** platform in a production environment. 

The application is split into two main components:
1. **Frontend (Next.js)** - Located in `frontend/`
2. **Backend (NestJS)** - Located in `backend/`

---

## 🌐 Frontend (Next.js) Environment Variables

Create a `.env` or `.env.production` file inside the `frontend/` directory, or set these variables directly in your hosting provider's dashboard (e.g., Vercel, AWS Amplify, Render, or Docker).

| Variable Name | Description | Example / Guidance |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | The public-facing canonical URL of the frontend app. | `https://tradevision.in` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID for Google Login. | `123456789-abc.apps.googleusercontent.com` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID. Required for production analytics tracking. | `G-XXXXXXXXXX` |
| `GOOGLE_SITE_VERIFICATION` | **Google Search Console verification token.** Extracts the content token from the GSC HTML tag verification method. | `google-site-verification=XYZ...` or just `XYZ...` (Next.js automatically compiles this into `<meta name="google-site-verification" content="..." />`) |
| `GEMINI_API_KEY` | Gemini API key for AI-assisted company and financial analysis. | Get from [Google AI Studio](https://aistudio.google.com) |
| `JWT_SECRET` | Secret key used to sign access tokens on client-facing helper routes. | Generate a 64-character hex string. |
| `JWT_REFRESH_SECRET` | Secret key used to sign refresh tokens. | Generate a 64-character hex string. |
| `MONGODB_URI` | MongoDB connection string. | `mongodb+srv://user:pass@cluster.mongodb.net/tradevision` |
| `FINNHUB_API_KEY` | Upstream stock market API key. | Get from [Finnhub.io](https://finnhub.io) |
| `SMTP_HOST` | Hostname of the SMTP server for emails. | `smtp.sendgrid.net` |
| `SMTP_PORT` | Port of the SMTP server. | `587` |
| `SMTP_USER` | SMTP username. | `apikey` |
| `SMTP_PASS` | SMTP password / API key. | `your_smtp_password` |
| `CONTACT_EMAIL` | Sender address for system emails. | `support@tradevision.in` |
| `UPSTASH_REDIS_REST_URL` | *(Optional)* Upstash Redis REST URL for API rate limiting. | `https://your-redis-url.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN`| *(Optional)* Upstash Redis REST Token. | `your_upstash_redis_token` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN key for error reporting. | `https://...` |
| `SENTRY_DSN` | Fallback backend Sentry DSN key. | `https://...` |
| `SENTRY_ORG` | Sentry Organization slug for source maps upload. | `tradevision` |
| `SENTRY_PROJECT` | Sentry Project slug for Next.js frontend. | `frontend` |

---

## ⚙️ Backend (NestJS) Environment Variables

Create a `.env` file in the `backend/` directory or inject these variables in your backend hosting environment (e.g., AWS EC2/ECS, PM2, or Heroku).

| Variable Name | Description | Example / Guidance |
| :--- | :--- | :--- |
| `PORT` | The port the NestJS server will listen on. | `3001` |
| `NODE_ENV` | Environment mode. | `production` |
| `CORS_ORIGINS` | Allowed origins for CORS, comma-separated. | `https://tradevision.in` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL for user redirects. | `https://tradevision.in` |
| `MONGODB_URI` | Production MongoDB connection string. | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key to verify JWT Access Tokens. | **Must match the frontend `JWT_SECRET`**. |
| `JWT_REFRESH_SECRET` | Secret key to verify JWT Refresh Tokens. | **Must match the frontend `JWT_REFRESH_SECRET`**. |
| `CSRF_SECRET` | Secret key used to sign/verify frontend CSRF cookies. | **Must match the frontend CSRF signing key**. |
| `FIELD_ENCRYPTION_KEY` | 32-byte hex string (64 characters) to encrypt sensitive DB fields. | `0000000000000000000000000000000000000000000000000000000000000000` |
| `PHONE_HMAC_SECRET` | HMAC secret for verifying mobile/phone verification hashes. | Generate a secure random string. |
| `FINNHUB_API_KEY` | Upstream stock market API key. | Get from [Finnhub.io](https://finnhub.io) |
| `ANTHROPIC_API_KEY` | Claude API key for AI assistant backend services. | Get from Anthropic Console. |
| `GOOGLE_CLIENT_ID` | Google Client ID for backend OAuth verification. | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Client Secret for backend OAuth verification. | Get from Google Cloud Console. |
| `REDIS_URL` | Standard Redis connection string. | `redis://localhost:6379` |
| `UPSTASH_REDIS_URL` | Upstash Redis connection string (if using serverless). | `https://your-upstash-redis-url.upstash.io` |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis API token. | `your_upstash_redis_token_here` |
| `AWS_REGION` | AWS Region for asset storage (S3). | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key. | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key. | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_S3_BUCKET` | AWS S3 Bucket Name for user avatars/assets. | `tradevision-production-assets` |
| `RAZORPAY_KEY_ID` | Razorpay payment API Key. | Get from Razorpay Dashboard. |
| `RAZORPAY_KEY_SECRET` | Razorpay payment Secret Key. | Get from Razorpay Dashboard. |
| `SMTP_HOST` | SMTP Server address for transactional emails. | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP Server port. | `587` |
| `SMTP_USER` | SMTP Username. | `apikey` |
| `SMTP_PASS` | SMTP Password. | `your_smtp_password` |
| `SMTP_FROM` | Transactional sender email. | `support@tradevision.in` |
| `ADMIN_EMAIL` | Administrator support contact email. | `admin@tradevision.in` |
| `SENTRY_DSN` | Sentry DSN key for NestJS backend error capturing. | `https://...` |
| `SENTRY_ORG` | Sentry Organization slug. | `tradevision` |
| `SENTRY_PROJECT` | Sentry Project slug for NestJS backend. | `backend` |

---

## 🔑 Generating Secure Keys

For variables like `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET`, and `FIELD_ENCRYPTION_KEY`, you must generate cryptographically secure keys. Run this command in your terminal to generate a secure random hex string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
