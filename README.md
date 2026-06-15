# Life4U - Blood Bank Management System (BBMS) 🩸

A full-stack, comprehensive Blood Bank Management System built using the PERN/SERN stack (PostgreSQL, Express.js, React.js, Node.js + Sequelize ORM) and styled beautifully with Tailwind CSS and custom UI animations.

This application connects Blood Banks with Donors and Patients, facilitating immediate requests, advanced donor history analytics, and secure administrative oversight.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router v7, Tailwind CSS, Axios, Recharts
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

---

## 🚀 Getting Started

Follow these steps precisely to launch both local development environments concurrently.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- Git

---

### 1. Database Setup

1. Start your PostgreSQL service.
2. Create a new database named `blood_bank_db`:
   ```sql
   CREATE DATABASE blood_bank_db;
   ```

---

### 2. Backend Setup (Server)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy the `.env.example` template or create a `.env` file:
     ```env
     PORT=5000
     DB_NAME=blood_bank_db
     DB_USER=your_postgres_username
     DB_PASSWORD=your_postgres_password
     DB_HOST=localhost
     DB_PORT=5432
     JWT_SECRET=bloodbankmanagementsystemsupersecretkey123
     NODE_ENV=development
     ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
     ```
4. Seed the database with dummy/mock data:
   ```bash
   node seed.js
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   _The server should establish a successful PostgreSQL connection via Sequelize and boot up on port 5000._

---

### 3. Frontend Setup (React/Vite)

1. Open a **new** terminal alongside your backend terminal and navigate to the frontend directory:
   ```bash
   cd frontend-react
   ```
2. Install the React application dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api
     ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   _The site will launch at `http://localhost:5174/` (or `http://localhost:5173/`)._

---

## 🧪 Default Test Accounts

After running `node seed.js`, the following test accounts are populated in your database:

- **Admin**: `admin@life4u.in`
- **Donor**: `rahul.donor@example.com` or `priya.donor@example.com`
- **Patient**: `amit.recipient@example.com`
- **Universal Testing Password**: `password123`
   
---

## ✨ Features Profile

- **Global Unified Dashboards**: Role-based access and redirect pipelines (`/admin-dashboard`, `/patient-dashboard`, `/donor-dashboard`, `/hospital-dashboard`).
- **Full-Screen Layouts**: Responsive dashboards that dynamically resize to fill the viewport seamlessly.
- **Color Theme**: Visually striking primary red/pink color palette aligned with the web brand.
- **Cryptographic Security**: Implementation of server-side global route guard interceptors protecting UI rendering.
- **Auto-Logout JWT Pipeline**: Realtime token expiry capturing automatically resets clients without crashing DOM boundaries.
- **Actionable Global UI Toasts**: Full displacement of `alert()` popups with CSS-animated interactive React context overlays.
- **Data Persistence Architecture**: Comprehensive SQL schema mappings updating inventory metrics seamlessly when donations occur.

---

_Created and maintained as a specialized portfolio initiative bridging bleeding-edge frontend UI design with secure architectural backends._