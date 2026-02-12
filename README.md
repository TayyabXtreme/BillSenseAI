<div align="center">

# ⚡ Utility Bill Analyzer

### AI-Powered Smart Utility Bill Management & Savings Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Convex](https://img.shields.io/badge/Convex-1.31.7-FF6B6B?style=for-the-badge)](https://convex.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

*Upload your utility bill or enter details manually — get AI-powered explanations, personalized savings tips, budget tracking, payment management, and multi-language support all in one place.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Screenshots](#-screenshots)

---

## 🎯 Overview

**Utility Bill Analyzer** is a full-stack web application that helps users understand, track, and reduce their utility bills (Electricity, Gas, Water). It uses **Google Gemini AI** to analyze bills, explain charges in simple language, and generate personalized savings tips — all available in **English, Urdu (اردو), and Hindi (हिंदी)**.

### The Problem
- Utility bills are confusing with complex tariff structures, hidden charges, and technical jargon
- Most people don't know how much they should be spending or how to reduce their bills
- No single platform combines bill tracking, AI analysis, budget management, and payment reminders

### Our Solution
An intelligent platform that reads your bill (via OCR or manual input), breaks down every charge, explains it using AI, suggests practical saving tips, tracks your budgets, and reminds you of upcoming payments.

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🧾 **Bill Input** | Upload bill images (OCR via Gemini Vision API) or enter details manually |
| 🤖 **AI Bill Explanation** | Gemini AI analyzes and explains your bill in plain language |
| 💡 **AI Savings Tips** | Personalized, actionable tips to reduce your bills |
| 📊 **Interactive Dashboard** | 4 analytics charts — spending trends, units consumed, cost breakdown, bill type distribution |
| 🔍 **Bill Detail Page** | Pie chart breakdown, comparison charts, savings simulator with appliance toggles |
| 📈 **Savings Simulator** | Slider + appliance toggles to see potential savings in real-time |
| 🌙 **Dark / Light Mode** | Full theme support across the entire app |

### Advanced Features
| Feature | Description |
|---------|-------------|
| 💰 **Budget Goals & Alerts** | Set monthly spending limits per bill type with progress bars (green/yellow/red thresholds) |
| 📅 **Payment Tracking** | Mark bills as paid/unpaid, set due dates, overdue alerts |
| ⏰ **Bill Payment Reminders** | Convex cron job checks daily for bills due within 3 days |
| 📋 **Payment Todo (Sidebar)** | Live sidebar section showing overdue, upcoming, and paid bills |
| 📊 **Monthly Comparison** | This month vs. last month spending with percentage change |
| 🌐 **Multi-Language AI** | AI explanations & tips in English, Urdu (اردو), and Hindi (हिंदी) |
| 📱 **WhatsApp Sharing** | Share bill analysis via WhatsApp with optional phone number |
| 📥 **PDF & Excel Export** | Download detailed bill reports with AI analysis included |
| ✏️ **Bill Management** | Rename, edit, and delete bills |
| 🎨 **Onboarding Wizard** | Guided setup for new users (location, avg bill, preferred type) |
| 🔐 **Authentication** | Clerk-powered sign-in/sign-up with Google OAuth support |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16.1.6** | React framework with App Router & Turbopack |
| **React 19.2.3** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling with glassmorphism design system |
| **shadcn/ui + Radix** | Accessible component library |
| **Recharts** | Interactive charts (Area, Bar, Pie) |
| **Lucide React** | Icon system |
| **next-themes** | Dark/Light mode |
| **react-markdown** | Markdown rendering for AI responses |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Convex** | Real-time database, mutations, queries, cron jobs |
| **Clerk** | Authentication & user management |
| **Google Gemini AI** | Bill analysis, OCR, explanations, savings tips |

### Utilities
| Technology | Purpose |
|-----------|---------|
| **jsPDF + autoTable** | PDF report generation |
| **xlsx + file-saver** | Excel export |
| **Sonner** | Toast notifications |
| **Zod** | Schema validation |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Landing  │  │Dashboard │  │ Bill Detail Page   │  │
│  │  Page    │  │ + Charts │  │ + AI + Simulator   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │Onboarding│  │ Sidebar  │  │  Auth (Clerk)     │  │
│  │ Wizard   │  │ + Todos  │  │  Sign-in/Sign-up  │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Convex   │ │ Gemini   │ │    Clerk     │
│ Database │ │ AI API   │ │    Auth      │
│ + Crons  │ │ (Vision  │ │  (OAuth +   │
│          │ │  + Text) │ │   Webhook)  │
└──────────┘ └──────────┘ └──────────────┘
```

### AI Model Fallback Chain
```
gemini-2.5-flash → gemini-2.0-flash → gemini-2.0-flash-lite
```
Automatic retry with fallback models if the primary model fails.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Convex** account ([convex.dev](https://convex.dev))
- **Clerk** account ([clerk.com](https://clerk.com))
- **Google AI** API key ([ai.google.dev](https://ai.google.dev))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/utility-bill-analyzer.git
cd utility-bill-analyzer

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Start Convex development server (in a separate terminal)
npx convex dev

# 5. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
```

---

## 📁 Project Structure

```
utilitybill/
├── convex/                     # Backend (Convex)
│   ├── schema.ts               # Database schema (users, bills, budgets, reminders)
│   ├── bills.ts                # Bill CRUD, payment tracking, reminders
│   ├── budgets.ts              # Budget goals (set, get, delete)
│   ├── users.ts                # User management
│   ├── crons.ts                # Daily cron job for payment reminders
│   └── _generated/             # Auto-generated Convex types
│
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout (Clerk + Convex + Themes)
│   │   ├── globals.css         # Theme variables + glassmorphism styles
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # Dashboard (charts, budgets, payments, bills)
│   │   │   └── [billId]/
│   │   │       └── page.tsx    # Bill detail (breakdown, AI, simulator, export)
│   │   ├── onboarding/
│   │   │   └── page.tsx        # New user onboarding wizard
│   │   ├── sign-in/            # Clerk sign-in page
│   │   ├── sign-up/            # Clerk sign-up page
│   │   └── api/ai/
│   │       ├── explain/route.ts   # AI bill explanation endpoint
│   │       ├── tips/route.ts      # AI savings tips endpoint
│   │       └── parse-bill/route.ts # OCR bill parsing endpoint
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── app-sidebar.tsx    # Sidebar (nav, bill input, payment todos)
│   │   │   └── bill-input.tsx     # Bill upload/manual entry form
│   │   └── ui/                    # shadcn/ui components
│   │
│   ├── hooks/
│   │   └── use-mobile.ts         # Mobile detection hook
│   └── lib/
│       └── utils.ts              # Utility functions (cn, etc.)
│
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 🗃 Database Schema

### `users` table
| Field | Type | Description |
|-------|------|-------------|
| clerkId | string | Clerk authentication ID |
| email | string | User email |
| name | string | Display name |
| onboarded | boolean | Has completed onboarding |
| location | string? | User's city |
| avgMonthlyBill | number? | Expected monthly bill |
| preferredBillType | string? | electricity / gas / water |
| whatsappNumber | string? | For WhatsApp sharing |
| preferredLanguage | string? | english / urdu / hindi |

### `bills` table
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Owner's Clerk ID |
| name | string? | Custom bill name |
| billType | string | electricity / gas / water |
| unitsConsumed | number | Units used |
| tariffRate | number | Rate per unit (PKR) |
| totalAmount | number | Final bill amount (PKR) |
| aiExplanation | string? | AI-generated explanation |
| aiTips | string[]? | AI saving tips |
| dueDate | string? | Payment due date |
| isPaid | boolean? | Payment status |
| ocrRawText | string? | Raw OCR extracted text |

### `budgets` table
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Owner's Clerk ID |
| billType | string | electricity / gas / water |
| monthlyLimit | number | Budget cap in PKR |

### `reminders` table
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Owner's Clerk ID |
| billId | Id | Reference to bills table |
| message | string | Reminder text |
| reminderDate | string | When to remind |
| isTriggered | boolean | Has been sent |

---

## 🤖 AI Integration

### How It Works

1. **Bill Parsing (OCR)** — Upload a bill photo → Gemini Vision API extracts all fields (units, tariff, charges, amounts)
2. **Bill Explanation** — Gemini analyzes the bill data and explains each charge in simple language
3. **Savings Tips** — Based on usage patterns, Gemini generates actionable tips specific to the bill type
4. **Multi-Language** — All AI responses can be generated in English, Urdu, or Hindi

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/parse-bill` | POST | OCR: Extract bill data from image |
| `/api/ai/explain` | POST | Generate AI explanation for a bill |
| `/api/ai/tips` | POST | Generate personalized savings tips |

### Cron Jobs

| Job | Interval | Description |
|-----|----------|-------------|
| Check Due Reminders | Every 24 hours | Finds bills due within 3 days and creates reminder entries |

---

## 🎨 Design System

The app uses a custom **glassmorphism** design language with CSS variables for seamless dark/light mode:

- `bg-glass` — Frosted glass background
- `bg-glass-strong` — Higher opacity glass
- `border-glass-border` — Subtle glass borders
- `usage-low / usage-medium / usage-high` — Color-coded usage level indicators

---

## 📸 Screenshots

> Add screenshots of your application here:
> - Landing Page (Dark + Light)
> - Dashboard with Charts
> - Bill Detail with AI Analysis
> - Savings Simulator
> - Budget Goals
> - Multi-Language AI (Urdu/Hindi)
> - PDF/Excel Export

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is built for the **IndusAI Hackathon**.

---

<div align="center">

**Built with ❤️ using Next.js, Convex, Clerk & Gemini AI**

</div>
