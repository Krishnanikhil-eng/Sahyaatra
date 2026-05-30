# 🛠️ Technologies & APIs used in Smart-BU (Sahyaatra)

This document provides a comprehensive overview of the tech stack and third-party services integrated into the Sahyaatra platform.

---

## 🏛️ Core Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Building the interactive user interface. |
| **Build Tool** | [Vite](https://vitejs.dev/) | Fast development server and optimized production builds. |
| **Backend & Database** | [Convex](https://www.convex.dev/) | Real-time backend, database, and serverless functions. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development across the stack. |
| **Authentication** | [Clerk](https://clerk.com/) | Secure user authentication and management. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS for rapid UI development. |

---

## 🔌 Third-Party APIs & Services

The application leverages several powerful APIs to provide a rich, data-driven experience.

### 🤖 Artificial Intelligence
- **Google Gemini API**: The primary AI engine used for:
    - **Itinerary Generation**: Creating detailed, day-by-day travel plans for Indian destinations.
    - **AI Travel Assistant**: Providing 24/7 chat support for travel planning and local tips.
    - **Destination Insights**: Summarizing attractions, best times to visit, and budget estimates.
- **OpenAI API**: (Integrated/Dependency) Used for advanced NLP tasks and intelligent travel recommendations.

### 🖼️ Visual Content & Images
- **Unsplash API**: Primary source for high-quality, landscape-oriented travel and location images.
- **Pexels API**: Secondary fallback for diverse image discovery.
- **Wikipedia (MediaWiki) API**: Used to fetch geographically accurate thumbnails and specific place descriptions to ensure high relevance.

### 🌦️ Environment & Weather
- **OpenWeatherMap API**: Providing real-time weather updates (Temperature, Humidity, Wind speed, etc.) for locations across India.

### 📧 Communication
- **Resend API**: Handles transactional emails, service notifications, and user communications.

---

## 🎨 UI & UX Libraries

| Library | Usage |
| :--- | :--- |
| **Framer Motion** | implementing smooth transitions and micro-animations. |
| **Radix UI** | Accessible primitive components (Select, Slot, Toast, etc.). |
| **Lucide React** | A clean and consistent icon set used throughout the app. |
| **Sonner** | Modern toast notifications for user feedback. |
| **i18next** | Internationalization support for multi-language travel experiences. |

---

## 🗺️ Mapping & Data
- **India Map Libraries**: `@svg-maps/india`, `@vishalvoid/react-india-map`, and `india-map-svg` for interactive State and City selection.
- **Local Datasets**: CSV-based state and place data for offline-first discovery.

---

## 🚀 Deployment & Infrastructure
- **Vercel**: Primary hosting for the frontend application.
- **Netlify**: Alternative deployment target with automated CI/CD.
- **Ngrok**: Used for local development tunneling and testing webhooks.
