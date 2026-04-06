# Academy Module

A standalone education-focused course discovery and learning module. Build and test Academy-specific features in isolation.

## 🏗️ Architecture Overview

This module is **technically independent**: it can run as a self-contained app or be integrated via the public `index.ts` exports.

### Key Features

- **`AcademyContext.tsx`** – Store resolution, data fetching (`get-all`), theme (light/dark), and currency. Wraps the app via `AcademyProvider`.
- **Localized config** – API base URL and endpoints live in `config/endpoints.ts` (e.g. `get-all`, resolve-shop, public courses, enroll, contact submit).
- **Standalone entry** – `App.tsx` and `main.tsx` run the module as its own Vite + React app with React Router.
- **Prop-driven design** – Components are portable and can be used in other host apps.

### Routes

| Path | Page |
|------|------|
| `/` | Redirects to `/academy` |
| `/academy` | Academy Home |
| `/academy/courses` | Course listing (with category filter) |
| `/academy/course/:courseId` | Course detail |
| `/academy/about` | About |
| `/academy/contact` | Contact form |
| `/academy/blog` | Redirects to `/academy/news` |
| `/academy/blog/:id` | Blog post detail |
| `/academy/news` | News listing |
| `/academy/news/:id` | News article detail |
| `/academy/events-gallery` | Events gallery |
| `/academy/event/:id` | Event detail |
| `/academy/trust-safety` | Trust & Safety |
| `/academy/terms-service` | Terms of Service |
| `/academy/privacy-and-policy` | Privacy & Policy |

## 📁 Folder Structure

```text
/
├── components/           # Academy UI components
│   ├── AcademyHeader.jsx
│   ├── AcademyHero.jsx
│   ├── BackToTopButton.jsx
│   ├── Breadcrumb.jsx
│   ├── CategoryFilterBar.jsx
│   ├── CourseCard.jsx
│   ├── CourseDetailHero.jsx
│   ├── CourseGrid.jsx
│   ├── CurriculumAccordion.jsx
│   ├── CTASection.jsx
│   ├── EnrollmentPopup.jsx
│   ├── FAQAccordion.jsx
│   ├── Footer.jsx
│   ├── InstructorSection.jsx
│   ├── ReviewsSection.jsx
│   ├── ScrollToTop.jsx
│   ├── ThemeToggle.jsx
│   ├── WhatsAppFloat.jsx
│   ├── AcademyPagination.jsx
│   └── index.ts          # Public component exports
├── config/
│   └── endpoints.ts      # API base URL and endpoint builders
├── context/
│   └── AcademyContext.tsx
├── hooks/
│   └── useCurrentShopType.ts
├── pages/
│   ├── AcademyHome.jsx
│   ├── AcademyAbout.jsx
│   ├── AcademyBlog.jsx
│   ├── AcademyContact.jsx
│   ├── AcademyCourses.jsx
│   ├── AcademyEvents.jsx
│   ├── AcademyNews.jsx
│   ├── AcademyPrivacyAndPolicy.jsx
│   ├── AcademyTermsService.jsx
│   ├── AcademyTrustSafety.jsx
│   ├── BlogDetail.jsx
│   ├── CourseDetail.jsx
│   ├── EventDetail.jsx
│   ├── NewsDetail.jsx
│   └── index.ts          # Public page exports
├── styles/
│   └── academy.css
├── utils/
│   └── academyUtils.ts
├── App.tsx               # Router + AcademyProvider + global UI (ScrollToTop, BackToTop, WhatsAppFloat)
├── main.tsx              # Vite entry (React root + BrowserRouter)
└── index.ts              # Public API for integration (components + pages)
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configuration**  
   Copy `.env.example` to `.env` and set:
   - `VITE_APP_STORE_ID` – your store id
   - `VITE_APP_API_BASE_URL` – API base (optional override: `VITE_APP_API_BASE_URL_AWS`)
   ```bash
   cp .env.example .env
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🔄 Development Workflow

- Commit and push changes in this repo.
- Keep path references relative so the module remains portable.
- Use the public exports from `index.ts` when integrating into a host application.
