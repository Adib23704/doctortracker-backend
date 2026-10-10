# Doctor Tracker - Backend API

RESTful API service for Doctor Tracker, built with Node.js, Express, TypeScript, and MongoDB (Mongoose). Handles authentication, doctor and patient management, and real-time dashboard analytics.

- **Live Backend API:** https://doctortracker-api.adibdev.me/
- **Frontend GitHub Repo:** https://github.com/Adib23704/doctortracker-frontend/
- **Live Frontend App:** https://doctortracker.adibdev.me/

---

## Description

Doctor Tracker Backend is a standalone REST API service built for clinic coordinators to manage medical doctors and their assigned patients. It handles user authentication with JWT, provides paginated and filtered endpoints for doctor and patient records, and calculates real-time dashboard analytics (KPI totals, physician caseloads, admissions over time, and diagnosis breakdowns) using MongoDB aggregation pipelines.

---

## Setup Guide

### Prerequisites
- **Node.js**: v18.0 or newer (tested on Node 20 & 24)
- **npm**: v9.0 or newer
- **MongoDB**: A MongoDB Atlas connection string (recommended) or a local MongoDB instance

---

### Step-by-Step Installation

#### 1. Navigate to the backend directory
```bash
cd backend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Set up environment variables
Copy the provided `.env.example` file to create your `.env`:
```bash
cp .env.example .env
```

Open `.env` and configure your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/doctortracker?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```
> **Tip for MongoDB Atlas:** Ensure your current IP address is added to the Network Access whitelist in your MongoDB Atlas dashboard (or set to `0.0.0.0/0` during development).

#### 4. Seed the database
Populate the database with the default admin account, 12 doctors across 6 clinical specialties, and 38+ patient records:
```bash
npm run seed
```

**Default Admin Credentials:**
- **Email:** `admin@doctortracker.com`
- **Password:** `Admin@123456`

#### 5. Run the automated API verification test suite
Run the automated test runner to verify that route handling, auth guards, input validation, and error middlewares are functioning correctly:
```bash
npm run test:api
```

#### 6. Start the development server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`. You can verify it by checking the health endpoint:
```bash
curl http://localhost:5000/api/health
```

#### 7. Build for production (optional)
To compile TypeScript into the `/dist` directory and run the production build:
```bash
npm run build
npm start
```

#### 8. Linting & formatting (Biome)
Validate and format code using Biome:
```bash
npm run lint         # Verify code against Biome lint & style rules
npm run lint:fix     # Apply auto-fixes and organize imports
npm run format       # Format codebase
```


---

## System Architecture

The backend is organized using a layered architecture to keep business logic decoupled from HTTP transport:

```
backend/src/
├── config/             # MongoDB Mongoose connection and lifecycle
├── controllers/        # HTTP controllers (extract params, call services, return responses)
├── middlewares/        # JWT auth protection (protect) and centralized errorHandler
├── models/             # Mongoose schemas (User, Doctor, Patient) with compound indexes
├── routes/             # Express route definitions mounted under /api/*
├── services/           # Query filtering, business logic, and MongoDB aggregation pipelines
├── utils/              # AppError operational class and asyncHandler wrapper
├── validations/        # Zod input schemas for runtime validation
├── scripts/            # Database seeder (seed.ts) and test suite (test-api.ts)
└── server.ts           # Express application entrypoint
```

### Data Flow
1. **Request:** Incoming HTTP request hits Express security middleware (`helmet`, `cors`, `morgan`).
2. **Auth Guard:** Protected routes pass through `protect` middleware, which verifies the Bearer JWT and fetches the user object.
3. **Validation:** Request body is parsed against Zod schemas in `validations/`. Invalid inputs throw a 422 error immediately.
4. **Service:** Controller calls the appropriate service method, which builds filtered MongoDB queries using indexed fields.
5. **Database:** Query runs against MongoDB with `.lean()` projection for speed.
6. **Response:** A standardized JSON envelope is returned:
   ```json
   {
     "success": true,
     "data": [ ... ],
     "pagination": { "total": 38, "page": 1, "limit": 10, "totalPages": 4 }
   }
   ```

---

## Technical Decisions

### 1. Single MongoDB `$facet` Aggregation Pipeline vs. Multiple Endpoint Calls
**The Problem:** The analytics dashboard requires multiple metrics at once: total doctor and patient counts, active/critical case counts, top physician caseloads, monthly patient admission trends, and a breakdown of diagnoses.

**Our Solution:** Instead of creating four separate endpoints or running four separate queries in sequence, we combined the analytics queries into a single MongoDB aggregation pipeline using the `$facet` stage. 

**Why it matters:** MongoDB processes all facets in parallel in a single database roundtrip. This eliminates multiple network trips between the Node.js server and MongoDB Atlas, reduces overall response latency, and ensures all dashboard metrics represent a consistent snapshot in time.

---

### 2. Maintained `patientCount` on Doctors vs. Dynamic Count Queries
**The Problem:** The doctors directory table must display the total number of assigned patients for each doctor, alongside their contact details and specialty. Running dynamic `$lookup` joins or counting patient documents for every doctor during pagination would quickly become slow as the patient collection grows.

**Our Solution:** We store a `patientCount` number directly on each doctor document. Whenever a patient is created, deleted, or reassigned to a different doctor, we update the count atomically using MongoDB's `$inc` operator.

**Why it matters:** Listing doctors with their patient count runs as a simple index-backed query (`IXSCAN`) on the `doctors` collection without any expensive cross-collection joins or sub-queries.

---

## Visual Evidence

Evidence of backend functionality and test verification is documented in `docs/screenshots/`:

1. **Database Seeding (`seed.log`):** Shows creation of admin credentials, 12 doctors, 38+ patients, and calculated patient counts.
2. **Automated API Verification (`test-api.log`):** Output from `npm run test:api` confirming health checks, 404 handling, auth token rejection, input validation, dynamic conditions retrieval, and live authenticated flows (8/8 passed).
3. **Production Build:** Clean TypeScript compilation with zero errors via `tsc`.

---

## Submission Details

- **Live Backend API URL:** `[Insert Live Backend URL on Render / VPS / Railway]`
- **Frontend GitHub Repo:** `[Insert Frontend Repo URL]`
- **Backend GitHub Repo:** `[Insert Backend Repo URL]`
- **Live Frontend URL:** `[Insert Live Frontend Website URL]`
- **Admin Login Credentials:**
  - **Email:** `admin@doctortracker.com`
  - **Password:** `Admin@123456`

---

## REST Endpoints Overview

### Authentication
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login with email and password | No |
| `GET` | `/api/auth/me` | Get current admin profile | Yes (Bearer) |

### Doctor Management
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/doctors` | List doctors (search, filter, paginate) | Yes (Bearer) |
| `POST` | `/api/doctors` | Register new doctor | Yes (Bearer) |
| `GET` | `/api/doctors/:id` | Get single doctor details | Yes (Bearer) |
| `DELETE` | `/api/doctors/:id` | Delete doctor record | Yes (Bearer) |
| `GET` | `/api/doctors/:id/patients` | List patients assigned to doctor | Yes (Bearer) |
| `POST` | `/api/doctors/:id/patients` | Add patient directly under doctor | Yes (Bearer) |
| `DELETE` | `/api/doctors/:id/patients/:patientId` | Remove patient from doctor | Yes (Bearer) |

### Patient Management
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/patients` | List patients (search, condition/status filter) | Yes (Bearer) |
| `GET` | `/api/patients/conditions` | List all dynamic distinct conditions | Yes (Bearer) |
| `GET` | `/api/patients/:id` | Get patient details with doctor | Yes (Bearer) |
| `POST` | `/api/patients` | Create new patient record | Yes (Bearer) |
| `PUT` | `/api/patients/:id` | Update patient record & doctor assignment | Yes (Bearer) |
| `DELETE` | `/api/patients/:id` | Delete patient record | Yes (Bearer) |

### Analytics
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/dashboard` | Aggregated dashboard KPI & chart data | Yes (Bearer) |
