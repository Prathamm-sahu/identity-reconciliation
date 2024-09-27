# Identity Reconciliation

Deployed link - https://identity-reconciliation-r0zu.onrender.com/

## Exposed Endpoints
- POST ``` /identitfy ```

## How to setup project locally

### Prerequisites

- Node.js (v20+)
- PostgreSQL (Ensure it's installed and running)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Prathamm-sahu/identity-reconciliation.git
   cd Breadit
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Setup:**

   - Rename `.env.example` to `.env`.
   - Configure your database connection and authentication keys in the `.env` file.

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🗃️ Database Setup

Identity Reconciliation uses **PostgreSQL** as its primary database and **Prisma ORM** for database schema management and queries. To set up the database:

1. Ensure PostgreSQL is running.
2. Run the following Prisma commands to migrate your database:

   ```bash
   npx prisma migrate dev
   ```

---