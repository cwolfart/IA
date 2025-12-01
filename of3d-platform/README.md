# OF3D Platform

The global marketplace for high-end architectural visualization.

## 🚀 Project Status
**Current Phase:** UI Foundation Complete (Sprints 0-3)
**Next Phase:** Backend Integration (Auth & Database)

## 🛠️ Tech Stack
*   **Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS v4 + Glassmorphism
*   **Language:** TypeScript
*   **Database:** PostgreSQL (Schema Defined)
*   **ORM:** Prisma

## 🏁 Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Key Features Implemented

### 1. Identity & Onboarding
*   **Login Page:** `/login` - Glassmorphism UI.
*   **Concierge Wizard:** `/concierge` - 4-Step project creation flow.

### 2. Client Dashboard
*   **Dashboard:** `/dashboard` - Visual project management.
*   **Visual Timeline:** Custom component replacing generic progress bars.

### 3. Live Review Room
*   **Review Interface:** `/project/1/review` - Canvas-based image viewer.
*   **Pinpoint Comments:** Click-to-comment functionality (UI Mock).

## ⚠️ Configuration Required
To proceed with backend features, create a `.env` file with:
```env
DATABASE_URL="postgresql://user:password@host:5432/mydb?schema=public"
```
And configure `firebase.json` for Authentication.
