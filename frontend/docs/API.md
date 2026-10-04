# TradeVision Frontend Proxy API Reference

This document provides a comprehensive reference for the Next.js API Routes (BFF proxy layer) under `frontend/src/app/api/`. These endpoints handle user sessions, request rate limiting, CSRF protection, and proxy downstream requests to MongoDB and third-party financial APIs (Yahoo Finance, Finnhub, Google Gemini).

---

## 1. Authentication & Session APIs

### GET `/api/auth/csrf`
- **Description:** Generates a signed HMAC double-submit CSRF token and sets the base secret in a secure `httpOnly` cookie.
- **Authentication:** Public
- **Rate Limit:** None
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "csrfToken": "string"
    }
    ```

### POST `/api/auth/login`
- **Description:** Authenticates a user with email and password, signing a short-lived access JWT and setting a long-lived refresh JWT cookie.
- **Authentication:** Public (CSRF exempt)
- **Rate Limit:** 10 requests per 15 minutes per IP
- **Request Body:**
  ```typescript
  {
    "email": "user@example.com",
    "password": "user_password"
  }
  ```
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d0fe...",
        "name": "Jane Doe",
        "email": "user@example.com",
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```
  - **Status 401 (Unauthorized):** Invalid credentials.
  - **Status 403 (Forbidden):** Email verification required (returns `needsVerification: true`).
  - **Status 429 (Too Many Requests):** Rate limit exceeded.

### POST `/api/auth/register`
- **Description:** Creates a new user record in the database and dispatches a verification email.
- **Authentication:** Public (CSRF exempt)
- **Rate Limit:** 5 requests per hour per IP
- **Request Body:**
  ```typescript
  {
    "email": "user@example.com",
    "name": "Jane Doe",
    "password": "secure_password",
    "phone": "9876543210" // Optional
  }
  ```
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "message": "Please check your email to verify your account."
    }
    ```
  - **Status 400 (Bad Request):** Validation failed / User already exists.
  - **Status 429 (Too Many Requests):** Rate limit exceeded.

### GET `/api/auth/me`
- **Description:** Fetches the logged-in user profile, excluding passwords and internal tokens.
- **Authentication:** Access Token required (Bearer Header)
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d0fe...",
        "name": "Jane Doe",
        "email": "user@example.com",
        "phone": "9876543210",
        "emailVerified": true
      }
    }
    ```
  - **Status 401 (Unauthorized):** Missing or expired token.

### POST `/api/auth/refresh`
- **Description:** Verifies the httpOnly refresh token cookie and issues a fresh client access token.
- **Authentication:** Refresh Token Cookie required
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "data": {
        "_id": "60d0fe...",
        "name": "Jane Doe",
        "email": "user@example.com",
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```
  - **Status 401 (Unauthorized):** Missing or invalid refresh token.

### POST `/api/auth/forgot-password`
- **Description:** Initiates the password recovery flow and sends a recovery link.
- **Authentication:** Public
- **Rate Limit:** 3 requests per hour per IP
- **Request Body:**
  ```typescript
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "message": "If that email is registered, we have sent a password reset link."
    }
    ```

### POST `/api/auth/reset-password`
- **Description:** Verifies a password reset token and saves a new hashed password.
- **Authentication:** Public
- **Rate Limit:** 5 requests per 15 minutes per IP
- **Request Body:**
  ```typescript
  {
    "token": "sha256_reset_token_hex",
    "email": "user@example.com",
    "password": "new_secure_password"
  }
  ```
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "message": "Password reset successful."
    }
    ```
  - **Status 400 (Bad Request):** Invalid or expired token.

### POST `/api/auth/resend-verification`
- **Description:** Resends a registration verification email.
- **Authentication:** Public
- **Rate Limit:** 3 requests per hour per Target Email
- **Request Body:**
  ```typescript
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "message": "Verification email resent successfully."
    }
    ```
  - **Status 400 (Bad Request):** User is already verified or not registered.

### GET `/api/auth/verify-email`
- **Description:** Verifies registration using a hash token.
- **Authentication:** Public
- **Query Parameters:**
  - `token` (string, required)
  - `email` (string, required)
- **Response:** Redirects to `/login?verified=true` on success, or `/login?error=invalid` on failure.

### POST `/api/auth/google`
- **Description:** Authenticates or registers users via Google OAuth JWT assertion credentials.
- **Authentication:** Public (CSRF exempt)
- **Request Body:**
  ```typescript
  {
    "credential": "google_jwt_credential_string"
  }
  ```
- **Response:**
  - **Status 200 (Success):** Matches the `/login` success structure.

### DELETE `/api/auth/delete-account`
- **Description:** Completely deletes user record and clears cookies.
- **Authentication:** Access Token required
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "success": true,
      "message": "Account deleted successfully."
    }
    ```

---

## 2. Market & Stock Data APIs

### GET `/api/quote`
- **Description:** Proxies individual stock quotes from Yahoo Finance.
- **Authentication:** Public
- **Query Parameters:**
  - `symbol` (string, required): e.g., `RELIANCE.NS`
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "c": 2950.50,
      "d": 15.20,
      "dp": 0.52,
      "h": 2960.00,
      "l": 2930.00,
      "o": 2935.00,
      "pc": 2935.30
    }
    ```

### POST `/api/quotes`
- **Description:** Fetches quotes for an array of stock symbols in one batch.
- **Authentication:** Public (CSRF exempt)
- **Request Body:**
  ```typescript
  {
    "symbols": ["RELIANCE.NS", "TCS.NS"]
  }
  ```
- **Response:**
  - **Status 200 (Success):**
    ```json
    [
      {
        "symbol": "RELIANCE.NS",
        "c": 2950.50,
        "d": 15.20,
        "dp": 0.52,
        "h": 2960.00,
        "l": 2930.00,
        "o": 2935.00,
        "pc": 2935.30
      }
    ]
    ```

### GET `/api/chart`
- **Description:** Proxies historical and intraday candle chart data from Yahoo Finance.
- **Authentication:** Public
- **Query Parameters:**
  - `symbol` (string, required): e.g., `RELIANCE.NS`
  - `range` (string, optional): e.g., `1mo` (defaults to `1d`)
  - `interval` (string, optional): e.g., `1d` (defaults to `5m`)
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "symbol": "RELIANCE.NS",
      "range": "1mo",
      "interval": "1d",
      "data": [
        {
          "time": "Feb 28",
          "timestamp": 1709145000,
          "price": 2950.50,
          "open": 2935.00,
          "high": 2960.00,
          "low": 2930.00,
          "close": 2950.50,
          "volume": 4500000
        }
      ],
      "meta": { ... }
    }
    ```

### GET `/api/news`
- **Description:** Fetches general market news from Finnhub API.
- **Authentication:** Public
- **Response:**
  - **Status 200 (Success):** Array of news objects containing `id`, `headline`, `summary`, `url`, `source`, `datetime`, and `image`.

### GET `/api/search`
- **Description:** Searches for matching ticker symbols on Yahoo Finance.
- **Authentication:** Public
- **Query Parameters:**
  - `q` (string, required): e.g., `TATA`
- **Response:**
  - **Status 200 (Success):**
    ```json
    [
      {
        "symbol": "TATAMOTORS.NS",
        "shortname": "Tata Motors Limited",
        "exchange": "NSI",
        "typeDisp": "Equity"
      }
    ]
    ```

### GET `/api/profile`
- **Description:** Fetches company metadata Profile from Yahoo Finance quoteSummary modules.
- **Authentication:** Public
- **Query Parameters:**
  - `symbol` (string, required): e.g., `TCS.NS`
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "name": "Tata Consultancy Services Limited",
      "ticker": "TCS.NS",
      "logo": "",
      "weburl": "https://www.tcs.com",
      "finnhubIndustry": "Information Technology Services",
      "currency": "INR"
    }
    ```

### GET `/api/features`
- **Description:** Aggregates real-time price feeds, Twitter sentiment polarity, and trend forecasts to yield a combined recommendation verdict.
- **Authentication:** Public
- **Query Parameters:**
  - `id` (string, required): lowercase symbol base (e.g. `reliance`)
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "symbol": "RELIANCE.NS",
      "price": 2950.50,
      "volume": 4500000,
      "open": 2935.00,
      "high": 2960.00,
      "low": 2930.00,
      "close": 2935.30,
      "sentiment": {
        "score": 0.45,
        "polarity": 0.15,
        "subjectivity": 0.35,
        "positive": 0.35,
        "negative": 0.10,
        "neutral": 0.55
      },
      "verdict": "BUY",
      "verdictReason": "Consistent upward price action combined with positive social sentiment."
    }
    ```

### GET `/api/ipos`
- **Description:** Aggregates live open issues from the NSE API alongside historical Listed/Closed IPO lists.
- **Authentication:** Public
- **Response:**
  - **Status 200 (Success):** `{ open: [], closed: [], listed: [], upcoming: [] }` containing IPO details.

---

## 3. Paper Trading APIs

### GET `/api/paper-trading/portfolio`
- **Description:** Retrieves the authenticated user's portfolio holding values enriched with live market pricing.
- **Authentication:** Access Token required
- **Response:**
  - **Status 200 (Success):**
    ```json
    {
      "portfolio": {
        "_id": "60d0fe...",
        "userId": "60d0fe...",
        "cashBalance": 950000.00,
        "startingBalance": 1000000.00,
        "totalDeposited": 1000000.00,
        "holdings": [
          {
            "symbol": "RELIANCE.NS",
            "displaySymbol": "RELIANCE",
            "companyName": "Reliance Industries Ltd",
            "quantity": 10,
            "avgBuyPrice": 2450.00,
            "totalInvested": 24500.00,
            "currentPrice": 2950.00,
            "currentValue": 29500.00,
            "unrealizedPnL": 5000.00,
            "unrealizedPnLPercent": 20.41,
            "dayChange": 15.00,
            "dayChangePercent": 0.51
          }
        ],
        "totalHoldingsValue": 29500.00,
        "totalPortfolioValue": 979500.00,
        "totalInvestedValue": 24500.00,
        "totalUnrealizedPnL": -20500.00,
        "totalReturnPercent": -2.05,
        "dayPnL": 150.00
      }
    }
    ```

### POST `/api/paper-trading/portfolio`
- **Description:** Resets the paper trading account back to a default cash balance of ₹1,000,000 and wipes all trades.
- **Authentication:** Access Token required
- **Rate Limit:** Once every 24 hours per User
- **Request Body:**
  ```json
  {
    "action": "RESET",
    "confirm": true
  }
  ```
- **Response:**
  - **Status 200 (Success):** `{ "success": true, "message": "Portfolio has been reset successfully." }`
  - **Status 429 (Too Many Requests):** Reset limit reached.

### POST `/api/paper-trading/trade`
- **Description:** Executes a simulated buy or sell transaction against the paper trading account.
- **Authentication:** Access Token required
- **Request Body:**
  ```typescript
  {
    "symbol": "RELIANCE",
    "action": "BUY", // or "SELL"
    "quantity": 10,
    "notes": "Optional short note explaining trade premise."
  }
  ```
- **Response:**
  - **Status 200 (Success):** `{ "success": true, "trade": { ...TradeRecord } }`
  - **Status 400 (Bad Request):** Insufficient cash, lack of holding quantity, or validation errors.

### GET `/api/paper-trading/history`
- **Description:** Fetches paginated transaction histories with filtering capabilities.
- **Authentication:** Access Token required
- **Query Parameters:**
  - `page` (optional, default `1`)
  - `limit` (optional, default `20`)
  - `symbol` (optional)
  - `action` (optional, `BUY` / `SELL`)
  - `from` (optional date string, `YYYY-MM-DD`)
  - `to` (optional date string, `YYYY-MM-DD`)
- **Response:** `{ trades: [], pagination: {}, summary: {} }`

### GET `/api/paper-trading/analytics`
- **Description:** Aggregates win rates, best/worst trade performance, and sector exposures.
- **Authentication:** Access Token required
- **Response:** `{ winRate: 65.5, bestTrade: {}, worstTrade: {}, sectorPerformance: [] }`

### GET `/api/paper-trading/leaderboard`
- **Description:** Fetches rankings of users ordered by net worth returns.
- **Authentication:** Access Token required
- **Response:** `{ leaderboard: [] }`

---

## 4. Calendar APIs

### GET `/api/calendar/fii-dii`
- **Description:** Sourced from NSE to fetch Net and Gross buying/selling values for Foreign Institutional Investors and Domestic Institutional Investors.
- **Authentication:** Public
- **Query Parameters:**
  - `days` (optional, defaults to `30`)
- **Response:** `{ data: [], lastUpdated: "..." }`

### GET `/api/calendar/earnings`
- **Description:** Sourced from Finnhub to fetch upcoming earnings events within a date range.
- **Authentication:** Public
- **Query Parameters:**
  - `from` (string, required): `YYYY-MM-DD`
  - `to` (string, required): `YYYY-MM-DD`
- **Response:** `{ earningsCalendar: [] }`

### GET `/api/calendar/corporate`
- **Description:** Fetches corporate dividends and stock splits calendars.
- **Authentication:** Public
- **Query Parameters:**
  - `from` (string, required): `YYYY-MM-DD`
  - `to` (string, required): `YYYY-MM-DD`
- **Response:** `{ dividends: [], splits: [] }`

---

## 5. Other Client Support APIs

### POST `/api/contact`
- **Description:** Dispatches a support request message to `support@tradevision.in` via SMTP.
- **Authentication:** Public
- **Request Body:** `{ name: "John", email: "john@example.com", subject: "Inquiry", message: "Help!" }`
- **Response:** `{ "message": "Email sent successfully!" }`

### GET `/api/chat/suggestions`
- **Description:** Returns sample prompt chips for the AI system.
- **Authentication:** Public
- **Query Parameters:**
  - `symbol` (optional)
- **Response:** `{ "suggestions": ["Should I buy RELIANCE?", "What is an SIP?"] }`

### POST `/api/chat`
- **Description:** Feeds messages to Google Gemini with context values and streams the answer chunks.
- **Authentication:** Public
- **Request Body:** `{ message: "Should I invest in TCS?", symbol: "TCS", history: [] }`
- **Response:** Text/Stream response.

### GET `/api/security`
- **Description:** Plain-text route serving `/public/.well-known/security.txt`.
- **Authentication:** Public
- **Response:** `Contact: support@tradevision.in\n...`
