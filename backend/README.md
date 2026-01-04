# Starter Kit Node Nest React Antd Backend

This is the backend for the **Starter Kit Node Nest React Antd** application, built with NestJS.  
This README will guide you through setup, configuration, and running the application locally.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Project Overview
This repository contains the backend for the **Starter Kit Node Nest React Antd** application.  
It provides APIs for authentication, RBAC, file handling, and options management.

---

## Requirements
- Node.js v18+  
- npm v9+ or yarn  
- MongoDB running locally or remotely  

---

## Setup

1. **Clone the repository**
```bash
git clone https://github.com/khalidzaibi/nest-react-antd-boilerplate.git
cd nest-react-antd-boilerplate/backend
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
# or
yarn install --legacy-peer-deps
```

3. **Configure environment variables**
```bash
cp .env.example .env
```
copy the following content to the .env file
```bash
"PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/nest_pro
JWT_SECRET=super_long_random_secret
JWT_EXPIRES_IN=1d
FRONTEND_ORIGIN=http://localhost:5173" > .env
```

4. **Run the application**
```bash
npm run start:dev
```

5. **Seed the database**
```bash
npm run seed
```

# Environment Variables
| Variable                | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| `PORT`                  | Port where the backend will run (default: `3000`)                    |
| `MONGO_URI`             | MongoDB connection URI                                               |
| `JWT_SECRET`            | Secret key for JWT authentication                                    |
| `JWT_EXPIRES_IN`        | JWT expiration duration (e.g., `1d`)                                 |
| `FRONTEND_ORIGIN`       | Frontend URL for CORS in development                                 |
| `FRONTEND_ORIGIN_PROD`  | Frontend URL for CORS in production (optional)                       |
| `LOGIN_OTP_ENABLED`     | Toggle login OTP flow (`true`/`false`)                               |
| `LOGIN_OTP_TTL_MINUTES` | Minutes before a login OTP expires                                   |
| `APP_NAME`              | Application name used in emails and UI                               |
| `MAIL_FROM`             | Default sender email address                                         |
| `SMTP_HOST`             | SMTP host                                                            |
| `SMTP_PORT`             | SMTP port                                                            |
| `SMTP_USER`             | SMTP username                                                        |
| `SMTP_PASSWORD`         | SMTP password                                                        |
| `SMTP_SECURE`           | Whether to use secure SMTP (`true`/`false`)                          |
| `FILES_PUBLIC_ROOT`     | Filesystem path where uploaded files are stored                      |
| `FILES_SERVE_ROOT`      | Public URL prefix for served files                                   |
| `FILE_UPLOAD_MAX_MB`    | Max upload size per file in megabytes                                |

# Scripts
| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run start`     | Start the server                                       |
| `npm run start:dev` | Start the server in development mode (with hot reload) |
| `npm run build`     | Build the project                                      |
| `npm run seed`      | Seed the database                                      |

# Database
This project uses MongoDB.
Ensure MongoDB is running locally or update MONGO_URI for a remote database.

# Contribution Guidelines
Follow coding standards and best practices.
Write tests for new features
Submit pull requests for review
Ensure all tests pass before merging

# Contacts
- Starter Kit Node Nest React Antd Team (Author: Khalid Zaibi)

# License
This project is licensed under the [MIT License](LICENSE).
