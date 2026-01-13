# SkillForge AI – Frontend Module

## Overview
The frontend module of SkillForge AI is responsible for delivering a clean, responsive, and user-centric interface for all three system roles — Learner, Admin, and Guardian. It focuses on usability, accessibility, and consistent visual design aligned with the project’s adaptive learning goals.

---

## Features Implemented
- Role-based login pages (Learner, Admin, Guardian)
- Learner dashboard with self-centric ranking and progress overview
- Admin dashboard UI skeleton for content and user management
- Guardian dashboard UI skeleton for monitoring ward performance
- Responsive layout with professional gradient-based theming
- Smooth navigation using React Router

---

## Technology Stack
- **Framework**: React (Vite)
- **Styling**: CSS3 (custom, gradient-based theme)
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **API Communication**: Axios / Fetch (integrated)

---

## Folder Structure
frontend/
│
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Role-based pages and dashboards
│ ├── services/ # API service handlers
│ ├── App.jsx
│ └── main.jsx
│
├── public/
├── package.json
└── README.md


---

## Design Principles
- Minimalistic and professional UI
- Self-centric data visibility (no peer ranking exposure)
- Adaptive learning-first layout
- Consistent color palette across all screens

---

## Current Status
The frontend module is fully functional in terms of UI/UX, routing, and backend API integration. It is designed to seamlessly support upcoming AI-driven features and database-backed content.

---

## Future Scope
- Dynamic content rendering from database
- AI chatbot UI integration
- Performance analytics visualization
- Accessibility enhancements

---

## Setup Instructions
```bash
npm install
npm run dev

