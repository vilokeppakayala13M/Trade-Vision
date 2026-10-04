# 🚀 Trade Vision

A modern **Next.js application** for fetching and analyzing financial & stock market data using scalable API architecture.

---

## 📌 Overview

**Trade Vision** is designed to provide structured financial insights through custom API routes and a modular frontend architecture.
It focuses on clean code, scalability, and real-world development practices.

---

## ✨ Features

* 📊 Fetch stock & financial data via API routes
* ⚡ Built with Next.js App Router
* 🧩 Modular and scalable folder structure
* 🔐 Environment-based configuration
* 📁 Clean and production-ready codebase

---

## 🛠 Tech Stack

* **Frontend:** Next.js, TypeScript
* **Backend:** Next.js API Routes
* **Styling:** CSS / Tailwind (if used)
* **Tools:** ESLint, Git

---

## 📂 Project Structure

```
Trade-Vision/
│
├── src/
│   ├── app/
│   │   ├── api/        # API routes (finance, auth, etc.)
│   │   └── modules/    # Feature-based modules
│
├── scripts/            # Utility / helper scripts
├── public/             # Static assets
├── package.json
└── next.config.ts
```

---

## 🔌 API Architecture & Proxy Layer

TradeVision uses a hybrid Backend-for-Frontend (BFF) architecture consisting of a **Next.js App Router API proxy layer** and a separate **NestJS backend server**.

### 1. How the Next.js Proxy Works
Client-side pages and components do not make direct requests to external APIs or the database. Instead, they make request calls to `/api/*` routes hosted within the Next.js app. The Next.js API route handlers act as a middleware proxy:
- They authenticate requests using JWTs and check CSRF token headers.
- They fetch pricing, news, and profile data from third-party APIs (Yahoo Finance and Finnhub).
- They connect directly to the shared MongoDB database to perform CRUD operations (such as login registration, transaction execution, and portfolio resets).

### 2. Why it Exists
- **CORS Resolution:** Downstream providers like Yahoo Finance do not support client-side browser requests due to Cross-Origin Resource Sharing (CORS) restrictions. The proxy routes handle requests on the server side, bypassing CORS blocks.
- **Key Protection:** Private API keys (e.g. `FINNHUB_API_KEY`, `GEMINI_API_KEY`) and SMTP credentials are kept secure on the server. They are never exposed to the client browser bundle.
- **Rate Limiting & CSRF:** Enables token bucket IP and email-based rate limits and signed HMAC double-submit cookies verification before processing requests.

### 3. Communication with the NestJS Backend
The Next.js frontend proxy and NestJS backend run adjacent to each other:
- **Shared Database:** Both services connect to the same underlying **MongoDB** instance (`MONGODB_URI`). Changes written to MongoDB by the Next.js API routes (e.g., executing a paper trade transaction) are instantly readable by NestJS backend services.
- **Microservices & WebSockets:** The NestJS backend (listening on port `3001` with prefix `/api/v1`) hosts scheduled worker cron-jobs (powered by BullMQ/Redis), coordinates server-side WebSocket events, and serves back-office/admin queries.

### 4. Running Concurrently
You can start both the Next.js frontend (`localhost:3005`) and the NestJS backend (`localhost:3001`) concurrently using a single command in the root monorepo directory:

```bash
npm run dev
```

This runs `concurrently` underneath to initialize both developer servers simultaneously.

For details on all available endpoints, check out the [API Documentation](file:///c:/Users/vilok/Desktop/modified/stock-insights/frontend/docs/API.md).

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/vilokeppakayala13M/Trade-Vision.git
cd Trade-Vision
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the development server

```bash
npm run dev
```

👉 App will run at: **http://localhost:3000**

---

## 🔐 Environment Variables

For local development, create a `.env.local` file inside the `frontend/` and `backend/` directories by copying their respective `.env.example` files:

```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/.env.example backend/.env.local
```

For setting up the application in a production hosting environment, please refer to the detailed [Production Environment Variables Documentation](file:///c:/Users/vilok/Desktop/modified/stock-insights/PRODUCTION_ENV.md).




## 📈 Future Improvements

* 📊 Add charts & visualization
* 🔔 Real-time stock updates
* 🧠 AI-based financial insights
* 🌐 Deployment (Vercel / AWS)

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Author

**Vilok Eppakayala**
GitHub: https://github.com/vilokeppakayala13M

---

⭐ If you found this project useful, consider giving it a star!
