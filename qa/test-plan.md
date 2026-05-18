# PhotoClick — Test Plan

**Document version:** 1.0  
**Application:** PhotoClick — Photography event booking and operations platform  
**Test types:** Manual UI, manual API (Postman), exploratory  
**Out of scope:** Automated E2E frameworks, performance/load testing tools, `messages` module (DB table only, no UI/API)

---

## 1. Introduction

### 1.1 Purpose

Define the approach, scope, and schedule for testing PhotoClick before release or after significant changes. This plan supports a junior QA portfolio by focusing on **manual** verification of real user journeys documented in the repository.

### 1.2 Application overview

PhotoClick connects **customers** who book photography packages for events, **admins** who approve orders and assign photographers, and **photographers** (stills/video) who view assignments. The stack is React (frontend), Express JWT API (backend), and MySQL (`photodb`).

### 1.3 References

- Root `README.md` — setup and role definitions  
- `be/routes/api.js` — authoritative API list  
- `fe/src/App.js` — route protection and role routing  
- `db/photodb.sql` — schema and seed data  

---

## 2. Test scope

### 2.1 In scope

| Area | Description |
|------|-------------|
| **Authentication** | Email/password sign-in, sign-up (Customer, Photographer-Stills, Photographer-Video), forgot password, optional Google sign-in |
| **Authorization** | JWT Bearer token, role-based routes (1 Admin, 2 Customer, 3–4 Photographer), 401/403 API responses |
| **Customer — New Booking** | Event type, Bronze/Silver/Gold packages, add-ons, venue (Google Places), date/time, price calculation, photographer capacity limits |
| **Customer — My Orders** | List/filter orders, statuses Pending / Approved / Rejected |
| **Customer — Profile** | View/update profile, password change |
| **Admin — Orders & Events** | Calendar, orders by date, approve/reject, assign stills/video photographers |
| **Admin — Team & Clients** | View workers and customers |
| **Admin — Reports** | Revenue, expenses, customer/staff/order reports with date ranges |
| **Admin — Content** | Gallery upload/delete, FAQ CRUD, About Us edit |
| **Photographer** | My Assignments (assigned orders) |
| **Shared** | Gallery (read), FAQ, About Us (read) |
| **API** | All routes in `be/routes/api.js` via Postman collection |
| **Security (manual checks)** | Rate limits on auth endpoints, file upload restrictions, session expiry messaging |

### 2.2 Out of scope

- Contact/messaging feature (`messages` table — not wired to API/UI)  
- Third-party Google Maps / OAuth provider outages (document as environmental)  
- Email delivery content in production inboxes (verify API success; email is best-effort)  
- Automated regression suites (no framework in repo)  

---

## 3. Test strategy

### 3.1 Test levels

| Level | Approach |
|-------|----------|
| **Smoke** | Critical path: sign-in per role, create order (customer), admin view orders (5–10 cases) |
| **Sanity** | Targeted check after a small fix in one module (e.g. only Gallery after image upload change) |
| **Functional** | Full cases in `test-cases.md` per module |
| **Regression** | Re-run P1 + affected P2 cases after releases |
| **API** | Scenarios in `api-test-scenarios.md` + Postman collection |
| **Negative / validation** | Invalid inputs, missing tokens, wrong roles, boundary dates |
| **Role-based access** | Customer cannot call admin endpoints; photographer cannot access `/admin` |

### 3.2 Test design techniques

- Equivalence partitioning (valid/invalid email, phone, password)  
- Boundary values (password length 7 vs 8, file size 10MB, max 20 upload files)  
- State transition (order: Pending → Approved / Rejected)  
- Error guessing (expired JWT, malformed Bearer header)  

### 3.3 Defect management

Record defects using the template in `bug-reports.md`. Severity guidelines:

| Severity | Example |
|----------|---------|
| **Critical** | Cannot sign in, order creation fails for all users, data leak across users |
| **High** | Admin cannot assign photographers; wrong role accesses admin API |
| **Medium** | UI validation mismatch with API; incorrect price display |
| **Low** | Cosmetic layout, typo in static text |

---

## 4. Test environment

| Component | Default | Configuration |
|-----------|---------|---------------|
| Frontend | `http://localhost:3000` | `fe/.env` → `REACT_APP_API_URL` |
| Backend API | `http://localhost:8801` | `be/.env` → `PORT`, `SITE_URL` |
| Database | MySQL `photodb` | Import `db/photodb.sql` |
| Browser | Chrome or Firefox (latest) | Clear localStorage between role tests |

### 4.1 Prerequisites

1. Node.js 18+  
2. MySQL/MariaDB running  
3. `npm install` in `be/` and `fe/`  
4. Backend: `npm run server` (port 8801)  
5. Frontend: `npm start` (port 3000)  

### 4.2 Test accounts (create via UI or use seeded DB users)

| Role | How to obtain | Notes |
|------|---------------|-------|
| Customer | `/signup` → Customer | RoleID 2 |
| Photographer | `/signup` → Stills or Video | RoleID 3 or 4 |
| Admin | Seeded in DB | RoleID 1; not available via public signup |

Use unique emails per test run to avoid duplicate registration errors.

---

## 5. Entry and exit criteria

### 5.1 Entry criteria

- [ ] Build/deploy instructions completed successfully  
- [ ] Database schema imported  
- [ ] API responds on `/api/getEventTypes` (public GET)  
- [ ] Test accounts available for each role  
- [ ] Postman environment variables `baseUrl` and `authToken` configured  

### 5.2 Exit criteria

- [ ] All P1 test cases executed with pass or accepted known issues  
- [ ] ≥ 95% P2 cases executed  
- [ ] No open Critical defects  
- [ ] API smoke collection run completed  
- [ ] Traceability matrix updated for executed cases  

### 5.3 Suspension criteria

- API or database unavailable for > 2 hours  
- Blocker defect prevents authentication for all roles  

---

## 6. Test deliverables

| Deliverable | Location |
|-------------|----------|
| Test plan | `qa/test-plan.md` (this document) |
| Test cases | `qa/test-cases.md` |
| API scenarios | `qa/api-test-scenarios.md` |
| Postman collection | `qa/postman/photoclick-api-collection.json` |
| Sample bug reports | `qa/bug-reports.md` |
| Traceability matrix | `qa/traceability-matrix.md` |
| Test summary report | *Created after execution (not pre-written)* |

---

## 7. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Google Maps/Places not configured | Test booking with manual venue text if autocomplete unavailable; document env gap |
| Email not sent in local dev | Verify HTTP 200/201; check server logs; do not fail order creation solely on email |
| Seeded order data affects calendar | Use unique event dates for new orders |
| JWT expires after 24h | Re-authenticate during long test sessions |
| Rate limit (20 auth attempts / 15 min) | Use distinct test users; wait or restart server in dev |

---

## 8. Schedule (suggested for portfolio demo)

| Phase | Duration | Activities |
|-------|----------|------------|
| Setup | 0.5 day | Environment, accounts, Postman import |
| Smoke | 0.5 day | TC-SMOKE-* cases |
| Functional — Auth & Customer | 1.5 days | TC-AUTH-*, TC-ORDER-*, TC-PROFILE-* |
| Functional — Admin | 1.5 days | TC-ADMIN-*, TC-GALLERY-*, TC-CONTENT-* |
| Functional — Photographer | 0.5 day | TC-PHOTO-* |
| API | 1 day | API-* scenarios + Postman |
| Regression | 0.5 day | P1 suite re-run |
| Reporting | 0.5 day | Summary + traceability update |

---

## 9. Approvals

| Role | Name | Date |
|------|------|------|
| QA Lead | *TBD* | |
| Dev Lead | *TBD* | |
| Product Owner | *TBD* | |
