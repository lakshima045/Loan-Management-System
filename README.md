<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=40,30,20,10,4&height=60&section=footer" width="100%" />
</p>

# LoanFlow LMS

A web-based Loan Management System built with React, TypeScript, Tailwind CSS, and an Express backend. It is designed around Sri Lankan Rupee (`Rs.` / LKR) loan workflows and covers both the customer side (loan discovery, calculation, application, and tracking) and the staff admin side (review, approval, disbursement, and repayments).

---

## Why I Built This

Most small lending workflows still rely on paper forms or disconnected spreadsheets. I wanted to put together one straightforward system where:
- A customer can check monthly payments first, fill out an application online in simple steps, and track their approval or balance using a Reference Number and OTP.
- Staff can review submitted documents, approve or decline applications with clear remarks, release funds, and record repayments in one place.

---

## Main Features

### Customer Portal
- **Loan Categories (`Rs.`)**: Supports Personal, Small Business, Education, Emergency Cash, Vehicle, and Small Shop & Trader loans, each with its own min/max limits, duration options, and interest rules.
- **Loan Calculator**: Calculates monthly installments, total interest, total payback, Debt-to-Income (DTI) ratio, and a month-by-month repayment schedule using either **Reducing Balance** or **Flat Rate** interest.
- **6-Step Online Application**: Collects personal details, contact information, job and income details, loan selection, document uploads (NIC & salary/income proof), and a final review screen before issuing a reference ID (`LN-2026-XXXXX`).
- **2-Step OTP Tracker & Payments**: Customers enter their Reference Number plus NIC/phone number, verify a 6-digit OTP, check live status (`Pending`, `Under Review`, `Approved`, `Disbursed`, `Rejected`, `Completed`), and make online repayments.

### Staff Admin Portal
- **Protected Login & Security**: Token-based session auth with failed-attempt lockout and password updates in Settings.
- **Application Review**: Inspect customer financial profiles, DTI risk level, duplicate NIC/phone alerts, and uploaded documents.
- **Approve / Reject Workflow**: Approve with custom principal, interest rate, tenure, and interest method—or record a rejection reason that reflects immediately in the customer tracker.
- **Disbursements, Repayments & Reports**: Manage fund release, log customer/counter installments with principal vs. interest split, handle contact inquiries, and export loan reports to CSV.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express
- **Build & Tooling**: Vite, `tsx`
- **Storage**: Local JSON file database (`data/loanflow_db.json`, auto-created on first run with sample Sri Lankan Rupee records)

---

## Running Locally

### Prerequisites
- Node.js (v18 or newer)
- npm

### Setup Steps

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd loanflow-lms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (runs both the Express API and Vite frontend on port `3000`):
   ```bash
   npm run dev
   ```

4. Open in your browser:
   ```text
   http://localhost:3000
   ```

### Other Scripts
- `npm run lint` — Run TypeScript type checking (`tsc --noEmit`)
- `npm run build` — Build frontend assets for production
- `npm start` — Run the server

---

## Default Test Accounts (Sample Data)

When the server starts for the first time, it generates sample loan records so you can test the whole flow right away:

- **Staff Portal Login**
  - Email: `admin@loanflow.lk`
  - Password: `admin` *(can be changed anytime under Admin Settings)*
- **Sample Application Reference IDs** (for Customer Tracker)
  - `LN-2026-48192` (Pending)
  - `LN-2026-77391` (Approved, awaiting disbursement)
  - `LN-2026-31890` (Disbursed with repayment history)
  - `LN-2026-55018` (Completed)

---

## Project Structure

```text
├── public/assets/services/   # Loan category images
├── src/
│   ├── components/
│   │   ├── admin/            # Admin dashboard, review modal, disbursements, repayments, reports
│   │   └── customer/         # Homepage, calculator, 6-step form, OTP tracker, FAQs, contact
│   ├── context/              # Global state & API sync (LoanContext)
│   ├── data/                 # Loan products, seed records, and image mappings
│   ├── types/                # TypeScript interfaces
│   └── utils/                # EMI, Flat Rate, amortization schedule, and DTI helpers
├── server.ts                 # Express API routes & Vite dev/prod server
├── index.html
└── package.json
```