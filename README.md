# LCMS — Law Case Management System

A modern, secure, and responsive web application designed for legal practices, law firms, and judicial teams. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and an **Express / Vite** full-stack architecture.

---

## 🌐 Live Application URLs

- **Shared Production Preview URL:** [https://ais-pre-jrdgzipqo45db6gjgcmp6s-849377203018.asia-east1.run.app](https://ais-pre-jrdgzipqo45db6gjgcmp6s-849377203018.asia-east1.run.app)
- **Development App URL:** [https://ais-dev-jrdgzipqo45db6gjgcmp6s-849377203018.asia-east1.run.app](https://ais-dev-jrdgzipqo45db6gjgcmp6s-849377203018.asia-east1.run.app)

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Node 20+ recommended)
- **npm** or **yarn** / **pnpm**

### 2. Installation
Open your terminal in the project root directory and run:

```bash
# Install all package dependencies
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create your `.env`:

```bash
cp .env.example .env
```

Set the environment variables as required:
```env
# Optional Gemini API Key for server-side AI Case Strategy analysis
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"
```

### 4. Start the Development Server
```bash
npm run dev
```

The application will start on **`http://localhost:3000`**.

### 5. Production Build & Execution
To create an optimized production bundle and run the server:

```bash
# Build frontend assets
npm run build

# Start production server
npm start
```

---

## 👥 How to Use: Core User Roles & Workflows

### 1. Quick Testing with Role Switcher Banner
At the very top of the interface is the **LCMS Role Testing Bar**:
- **Admin (Jonathan - Managing Partner)**: Full control over firm cases, lawyers, clients, CMS settings, and audit logs.
- **Lawyer (Sophia - IP Counsel / Evelyn - Corporate Counsel)**: Manage assigned dockets, client updates, hearings, tasks, and confidential work-product notes.
- **Client (Alexander - Corp / Sarah - Trust)**: Submit case applications, track timeline events, review public case notes, and view hearing dates.
- **Reset to Defaults**: Resets localStorage to seed mock data at any time.

---

### 2. User Registration (Client vs. Lawyer)
Click **Register** in the top navigation bar or from the public firm landing page:
1. **Client Account**:
   - Fill in Legal Name, Email, Phone, Mailing Address, and Password.
   - Instantly creates a client profile and opens the Client Case Portal.
2. **Lawyer Account**:
   - Select the **Lawyer / Counsel** option.
   - Fill in personal credentials.
   - **Bar License Number** *(Required)*: Enter your official state/court registration number (e.g., `CA-BAR-298412` or `NY-592810`).
   - **License Document Upload** *(Required)*: Upload a copy of your State Bar Card or Certificate of Good Standing (PDF, PNG, JPG).
   - Enter Practice Specialization, Years of Experience, and check the **Bar Standing Affirmation**.
   - Submits your account with **Pending Lawyer Verification** status.
   - Firm administrators can inspect the document and approve credentials in the Admin Dashboard.

---

### 3. Admin Command Center
Navigate to the **Admin Dashboard**:
- **Overview**: High-level practice KPIs, pending intake alerts, active dockets, and audit stream.
- **All Cases**: View, filter, and reassign counsel on any docket.
- **Applications**: Review prospective client submissions, approve matters into active cases, or record declinations.
- **Attorneys**: Manage the firm roster, inspect pending attorney registrations, view uploaded license documents, and click **Verify & Approve Licensure**.
- **Audit Logs**:
  - Full compliance tracking of all actions, operator names, roles, IPs, and timestamps.
  - Search by action keyword, user, or docket reference.
  - Filter by date range (Presets: *Today*, *Past 7 Days*, *Past 30 Days*, *Year to Date*, or custom date boundaries).
  - **Export Filtered CSV**: Download regulatory compliance reports matching the filtered view.
- **Website CMS**: Live editing of firm hero text, contact information, practice areas, announcements, and FAQs.

---

### 4. Client Case Portal
- **My Cases**: Filter active and closed cases, inspect hearings, view filed pleadings, and check timeline history.
- **Apply For Case**: 3-step intake wizard to submit claims, incident dates, jurisdiction, and supporting exhibits.
- **Application Status Tracker**: Real-time progress tracker (*Submitted → Under Review → Approved / Assigned*).

---

### 5. Attorney Workspace
- **Assigned Matters**: Direct access to assigned dockets.
- **Case Docket Workspace**:
  - Update case status (*Active, Hearing Scheduled, Won, Closed*).
  - Add client-visible updates and confidential work-product notes.
  - Interactive court calendar: schedule courtroom hearings with judge, bench, and agenda notes.
  - Task and deadline management.
  - Document repository: upload exhibits and pleadings with confidentiality tags.
  - **AI Case Strategy Analysis**: In-depth statutory analysis and litigation strategy breakdown.

---

## 🛠️ Tech Stack & Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs backend Express server with Vite middleware on port 3000 |
| `npm run build` | Compiles TypeScript and builds production frontend bundle |
| `npm start` | Runs Express server in production mode |
| `npm run lint` | Runs `tsc --noEmit` to validate all TypeScript code |
