# Starter Kit Node Nest React Antd Frontend

This is the frontend for the **Starter Kit Node Nest React Antd** application, built with **React**, **Vite**, **TailwindCSS**, and **TypeScript**.  
This README guides you through setup, configuration, and running the project locally.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Dependencies](#dependencies)
- [Contribution Guidelines](#contribution-guidelines)
- [Contacts](#contacts)

---

## Project Overview
The frontend provides the user interface for the **Starter Kit Node Nest React Antd** application.  
It interacts with the backend APIs and renders dashboards, forms, and visualizations.

---

## Requirements
- Node.js v18+  
- npm v9+ or yarn  
- Running backend API on `http://localhost:3000`

---

## Setup

Follow these steps to get the frontend running locally:

### 1️⃣ Clone the repository
```bash
git clone https://github.com/khalidzaibi/nest-react-antd-boilerplate.git
cd nest-react-antd-boilerplate/frontend
```

### 2️⃣ Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3️⃣ Create .env file
```bash
cp .env.example .env
```

### 4️⃣ Start the development server
```bash
npm run dev
```

### 5️⃣ Build for production
```bash
npm run build
```
The production-ready files will be in the dist/ folder.

### 6️⃣ Preview production build
```bash
npm run serve
```

# Environment Variables
| Variable           | Description                                      |
| ------------------ | ------------------------------------------------ |
| `VITE_APP_NAME`    | Application name (`Starter Kit Node Nest React Antd`) |
| `VITE_APP_VERSION` | Application version (`0.0.1`)                    |
| `VITE_API_URL`     | URL of backend API (`http://localhost:3000/api`) |
| `VITE_BASE_URL`    | Frontend base URL (`http://localhost:5173`)      |


# Scripts
| Command          | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start the development server                  |
| `npm run build`  | Build the project for production              |
| `npm run serve`  | Preview the production build                  |
| `npm run lint`   | Run ESLint checks                             |
| `npm run format` | Format code with Prettier and fix lint errors |

# Dependencies
| Package           | Version |
| ----------------- | ------- |
| `react`           | ^17.0.2 |
| `react-dom`       | ^17.0.2 |
| `react-router-dom | ^6.14.1 | 
| `react-intl`      | ^7.1.11 |
| `react-redux`     | ^7.2.9 |
| `redux`           | ^4.2.1 |
| `redux-thunk`     | ^2.4.2 |
| `@reduxjs/toolkit`| ^1.9.5 |
| `@tailwindcss/postcss`| ^4.1.13 |
| `tailwindcss`     | ^3.3.2 |
| `autoprefixer`    | ^10.4.15 |
| `postcss`         | ^8.4.29 |
| `eslint`          | ^8.47.0 |
| `eslint-config-prettier`| ^8.9.0 |
| `eslint-plugin-import`| ^2.28.1 |
| `eslint-plugin-prettier`| ^4.2.1 |
| `eslint-plugin-simple-import-sort`| ^11.0.0 |
| `prettier`        | ^3.0.0 |
| `typescript`      | ^4.9.5 |
| `vite`            | ^4.4.9 |

# Contribution Guidelines
To contribute to the project, please follow these guidelines:
- Fork the repository
- Create a new branch
- Make your changes
- Submit a pull request

# Contacts
If you have any questions or need further assistance, please contact:
- Starter Kit Node Nest React Antd Team (Author: Khalid Zaibi)

# License
This project is licensed under the [MIT License](LICENSE).

---
