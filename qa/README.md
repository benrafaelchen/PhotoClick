# PhotoClick — QA Documentation

This folder contains manual and API testing documentation for the **PhotoClick** photography event management platform. All materials are derived from the actual project codebase (`fe/`, `be/`, `db/photodb.sql`) and are intended for a **Junior QA Tester portfolio**.

## Project snapshot (from codebase)

| Layer | Technology | Location |
|-------|------------|----------|
| Frontend | React 18 (CRA), React Router | `fe/src/` |
| Backend | Express.js REST API, JWT | `be/` |
| Database | MySQL / MariaDB | `db/photodb.sql` |
| Default ports | Frontend `3000`, API `8801` | `README.md`, `be/app.js` |

### User roles

| Role ID | Role name | Frontend route |
|---------|-----------|----------------|
| 1 | Admin | `/admin` |
| 2 | Customer | `/customer` |
| 3 | Photographer-Stills | `/photographer` |
| 4 | Photographer-Video | `/photographer` |

### Modules identified in code

| Module | Frontend | Backend API |
|--------|----------|-------------|
| Authentication | `SignInPage`, `SignUpPage`, `ForgotPassword` | `/signup`, `/signin`, `/forgotpassword`, `/google-signin` |
| Profile | `Profile` (all dashboards) | `/getUserData`, `/updateUserData` |
| Customer booking | `CreateNewOrder` | `/createOrder`, catalog: `/getEventTypes`, `/getPrices`, `/getPackStyles`, `/getPhotographerLimits` |
| Customer orders | `MyOrders` | `/getUserOrders` |
| Admin orders & calendar | `OrdersEvents`, `CalendarComponent` | `/getTotalOrders`, `/getOrdersAtDate`, `/approveOrder`, `/rejectOrder`, `/getAssignedOrders` |
| Worker assignment | `OrdersEvents`, `DisplayWorkers` | `/getWorkers`, `/getCustomers`, `/assignWorkers`, `/getAvailableWorkers`, etc. |
| Photographer assignments | `Events` | `/getOrdersForWorker` |
| Reports | `Reports` | `/getRevenue`, `/getExpenses`, `/getCustomerReport`, `/getWorkerReport`, `/getOrderReport` |
| Gallery | `Gallery` | `/getImages`, `/uploadImages`, `/deleteImage` |
| FAQ | `FAQ` | `/faqData`, `/addFaq`, `/deleteFaq` |
| About Us | `AboutUs` | `/aboutUsData`, `/editPageContent` |

**Note:** The `messages` table exists in `photodb.sql` but has **no API routes or UI** in the current codebase. It is out of scope for functional testing unless implemented later.

### Recent frontend changes covered in QA (retest recommended)

| Area | Behavior | Related test cases |
|------|----------|-------------------|
| Address / venue | Google Places / Maps **fully removed** from New Booking, Sign up, and Profile — plain free-text inputs only; no suggestions, chips, or Google UI artifacts | TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006 |
| Booking payload | Event location sent as `place: { name: eventLocation.trim() }`; backend and DB schema unchanged | TC-ORDER-014, API-ORDER-020 |
| Event dates (booking) | Today or future by **Israel local date** (`Asia/Jerusalem`); invalid paste blocked; booking does **not** show “Year must be between 2000 and 2100” | TC-ORDER-009, TC-ORDER-015–017 |
| Event dates (reports) | Admin Reports keep separate validation (may include year-range messages) | TC-REPORT-009 |
| Gallery | Broken/missing image URLs show placeholder, not broken icon | TC-GALLERY-010 |
| Booking success | After `POST /createOrder` succeeds, inline success alert with pending-approval copy; not shown on failed submit | TC-ORDER-018, TC-SMOKE-005 |

Frontend utilities: `fe/src/utils/dateValidation.js` (`validateEventDate`, `getIsraelLocalIsoDate`), `fe/src/utils/galleryPlaceholder.js`, `fe/src/components/CreateNewOrder.jsx`, `PlacesAutoComplete.jsx`, `AddressAutoComplete.jsx` (plain text wrappers).

## Documentation index

| File | Purpose |
|------|---------|
| [test-plan.md](./test-plan.md) | Scope, strategy, environments, entry/exit criteria |
| [test-cases.md](./test-cases.md) | Detailed manual test cases with IDs and priorities |
| [api-test-scenarios.md](./api-test-scenarios.md) | API-focused scenarios aligned with `be/routes/api.js` |
| [bug-reports.md](./bug-reports.md) | Sample defect reports (illustrative / portfolio) |
| [traceability-matrix.md](./traceability-matrix.md) | Requirements ↔ test case mapping |
| [postman/photoclick-api-collection.json](./postman/photoclick-api-collection.json) | Postman Collection v2.1 for manual API testing |

## How to use this pack

1. **Environment:** Import `db/photodb.sql`, configure `be/.env` and `fe/.env` per root `README.md`.
2. **Smoke test:** Run cases tagged `Smoke` in `test-cases.md` after each deployment.
3. **API testing:** Import the Postman collection, set `baseUrl` to `http://localhost:8801`, sign in to populate `authToken`.
4. **Traceability:** Use `traceability-matrix.md` to report coverage in test summary reports.

## Testing tools referenced

Only tools that fit this project and a junior manual/API workflow:

- **Browser** (Chrome / Firefox) — UI manual testing  
- **Postman** — REST API manual testing (collection provided)  
- **MySQL client** — optional data verification against `photodb`  
- **Browser DevTools** — network tab, localStorage (`authToken`, `userRole`)

No Selenium, Cypress, Playwright, or Jira artifacts are included; they are not part of this repository.

## Test data guidance

- Use **dedicated test accounts** created via `/signup` (Customer or Photographer roles).
- Admin accounts are typically **pre-seeded** in `photodb.sql` (RoleID `1`); do not commit real credentials to documentation.
- Passwords in examples are placeholders such as `TestPass123` — never use production secrets.

## Authoring conventions

- **Test case ID format:** `TC-<MODULE>-<###>` (e.g. `TC-AUTH-001`)
- **Priority:** P1 (critical) → P3 (low)
- **API scenario ID format:** `API-<MODULE>-<###>`

---

*Last aligned with codebase: PhotoClick main branch — Google Maps removed from address fields, Israel-local booking dates, gallery placeholders, and booking success message.*
