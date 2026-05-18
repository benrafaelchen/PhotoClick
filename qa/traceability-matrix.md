# PhotoClick — Requirements Traceability Matrix

Maps **application capabilities** (derived from codebase) to **test cases** and **API scenarios**. Use during test reporting to show coverage.

**Legend:** ✅ Covered | ⏳ Planned | ➖ Not applicable (feature absent)

---

## Functional requirements vs tests

| Req ID | Requirement (from codebase) | UI test cases | API scenarios | Priority |
|--------|----------------------------|---------------|---------------|----------|
| REQ-AUTH-01 | User can sign in with email/password | TC-AUTH-001–005 | API-AUTH-001–003 | P1 |
| REQ-AUTH-02 | User can register as Customer or Photographer | TC-AUTH-006–011, TC-AUTH-022 | API-AUTH-004–007 | P1 |
| REQ-AUTH-03 | User can request password reset | TC-AUTH-013–014 | API-AUTH-008–009 | P2 |
| REQ-AUTH-04 | Optional Google sign-in for existing users | TC-AUTH-015–016 | API-AUTH-010 | P3 |
| REQ-AUTH-05 | JWT protects routes; 24h expiry | TC-AUTH-019–020 | API-AUTH-012–013 | P1 |
| REQ-AUTH-06 | Role-based frontend routing | TC-AUTH-017–018 | — | P1 |
| REQ-AUTH-07 | Role-based API access (admin = role 1) | TC-ADMIN-009–010, TC-TEAM-003 | API-ORDER-014, API-WORKER-008 | P1 |
| REQ-PROF-01 | User can view/update own profile | TC-PROFILE-001–004, TC-PROFILE-006 | API-AUTH-011–015 | P2 |
| REQ-ORDER-01 | Customer can browse event types and packages | TC-ORDER-001–004 | API-ORDER-001–005 | P1 |
| REQ-ORDER-02 | Customer can create booking with venue/date/time | TC-ORDER-001–009, TC-ORDER-014–017 | API-ORDER-007–009 | P1 |
| REQ-ORDER-05 | Booking event date: Israel local today … +10y; invalid paste blocked; no Reports year-range message | TC-ORDER-009, TC-ORDER-015–017 | — | P1 |
| REQ-ORDER-06 | Customer sees success message after successful booking submit | TC-ORDER-018, TC-SMOKE-005 | API-ORDER-007 | P1 |
| REQ-ADDR-01 | Address/venue via free-text only (Google Maps / Places removed) | TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006 | API-ORDER-020 | P1 |
| REQ-ORDER-03 | Photographer capacity enforced in UI | TC-ORDER-010 | API-ORDER-005 | P2 |
| REQ-ORDER-04 | Customer views own orders and status | TC-MYORDERS-001–004 | API-ORDER-012 | P1 |
| REQ-ADMIN-01 | Admin views orders on calendar by date | TC-ADMIN-001–002 | API-ORDER-015, API-EVENT-002 | P1 |
| REQ-ADMIN-02 | Admin approves/rejects orders | TC-ADMIN-003–004 | API-ORDER-016–017 | P1 |
| REQ-ADMIN-03 | Admin assigns photographers to orders | TC-ADMIN-005–007 | API-WORKER-003–005 | P1 |
| REQ-ADMIN-04 | Admin views workers and customers | TC-TEAM-001–002 | API-WORKER-001–002 | P2 |
| REQ-ADMIN-05 | Admin generates financial/ops reports | TC-REPORT-001–009 | API-REPORT-001–005 | P2 |
| REQ-PHOTO-01 | Photographer views assigned events | TC-PHOTO-001–002 | API-WORKER-007 | P1 |
| REQ-GAL-01 | All users can browse gallery | TC-GALLERY-001–003, TC-GALLERY-010 | API-IMG-001 | P2 |
| REQ-GAL-02 | Admin uploads/deletes gallery images | TC-GALLERY-004–007 | API-IMG-002–005 | P2 |
| REQ-GAL-03 | Gallery shows placeholder when image fails to load | TC-GALLERY-010 | — | P2 |
| REQ-CNT-01 | FAQ readable by all; editable by admin | TC-CONTENT-001–003, TC-CONTENT-006 | API-FAQ-001–004 | P2 |
| REQ-CNT-02 | About Us readable; editable by admin | TC-CONTENT-004–005 | API-PAGE-001–002 | P2 |
| REQ-SEC-01 | Rate limiting on auth endpoints | TC-AUTH-021 | API-SEC-005 | P2 |
| REQ-SEC-02 | Upload validation (type, size, count) | TC-GALLERY-005–006 | API-IMG-003–004 | P2 |
| REQ-MSG-01 | Contact/messages module | ➖ | ➖ | N/A |

---

## Test type coverage matrix

| Module | Smoke | Sanity | Functional | Regression | Negative | API |
|--------|-------|--------|------------|------------|----------|-----|
| Auth | TC-SMOKE-002 | — | TC-AUTH-* | TC-AUTH-021 | TC-AUTH-004–012 | API-AUTH-* |
| Profile | — | — | TC-PROFILE-* | — | TC-PROFILE-004 | API-AUTH-011–015 |
| Customer orders | TC-SMOKE-005 | — | TC-ORDER-*, TC-MYORDERS-* | TC-ORDER-013–017 | TC-ORDER-005–016 | API-ORDER-* |
| Address (free-text) | — | — | TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006 | TC-ORDER-011, TC-ORDER-014 | — | API-ORDER-020 |
| Admin ops | TC-SMOKE-003, TC-SANITY-002 | TC-SANITY-002 | TC-ADMIN-*, TC-TEAM-* | TC-ADMIN-011 | TC-ADMIN-009–010 | API-ORDER-013–019, API-WORKER-* |
| Reports | — | — | TC-REPORT-* | TC-REPORT-009 | TC-REPORT-006, TC-REPORT-009 | API-REPORT-* |
| Gallery | TC-SANITY-001 | TC-SANITY-001 | TC-GALLERY-* | TC-GALLERY-010 | TC-GALLERY-005–008 | API-IMG-* |
| Content | — | — | TC-CONTENT-* | — | TC-CONTENT-006 | API-FAQ-*, API-PAGE-* |
| Photographer | — | — | TC-PHOTO-* | — | TC-PHOTO-003 | API-WORKER-007 |
| UI/Nav | TC-SMOKE-001 | — | TC-UI-* | TC-UI-004 | TC-UI-003 | — |

---

## User flow traceability

| User flow (README.md) | Steps covered by |
|----------------------|------------------|
| Customer: Sign up → Create order → Success message → Email confirmation | TC-AUTH-006, TC-AUTH-022, TC-ORDER-001, TC-ORDER-014, TC-ORDER-018, API-ORDER-007 |
| Customer: Track Pending/Approved/Rejected | TC-MYORDERS-003, TC-ADMIN-003–004 |
| Admin: Calendar → Assign → Approve | TC-ADMIN-001–007, API-ORDER-015–016, API-WORKER-005 |
| Admin: Reports | TC-REPORT-001–005, API-REPORT-001–005 |
| Admin: Gallery / FAQ / About | TC-GALLERY-004, TC-CONTENT-002–005 |
| Photographer: View assignments | TC-PHOTO-001, API-WORKER-007 |

---

## Defect traceability

| Bug ID | Related requirements | Test cases |
|--------|---------------------|------------|
| BUG-001 | REQ-AUTH-06, REQ-AUTH-07 | TC-AUTH-017, TC-ADMIN-009 |
| BUG-002 | REQ-ORDER-02 | TC-ORDER-008 |
| BUG-003 | REQ-GAL-01 | TC-GALLERY-002 |
| BUG-004 | REQ-AUTH-03 | TC-AUTH-013 |
| BUG-005 | REQ-ADMIN-03 | TC-ADMIN-006 |
| BUG-006 | REQ-AUTH-05 | TC-AUTH-020 |
| BUG-007 | REQ-AUTH-04 | TC-AUTH-015 |
| BUG-008 | REQ-ADDR-01 | TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006 |
| BUG-009 | REQ-ORDER-05 | TC-ORDER-009, TC-ORDER-015–017 |
| BUG-010 | REQ-GAL-03 | TC-GALLERY-010 |
| BUG-011 | REQ-ADMIN-05 | TC-REPORT-009 |

---

## Coverage summary (template after execution)

| Metric | Value |
|--------|-------|
| Total requirements | 28 (excl. N/A) |
| Requirements with ≥1 test | *fill after run* |
| P1 test cases executed | *fill* / *total* |
| Open Critical bugs | *fill* |

---

## Source file reference

| Requirement area | Primary source files |
|-----------------|---------------------|
| Routes | `be/routes/api.js` |
| Auth middleware | `be/middleware/auth.js` |
| Order logic | `be/controllers/user.js` (`createOrder`), `be/controllers/orders.js` |
| Frontend routing | `fe/src/App.js` |
| Customer UI | `fe/src/pages/MainPageCustomer.jsx`, `fe/src/components/CreateNewOrder.jsx` |
| Date validation | `fe/src/utils/dateValidation.js` (`validateEventDate`, `validateDateString`) |
| Address / venue UI | `fe/src/components/CreateNewOrder.jsx`, `PlacesAutoComplete.jsx`, `AddressAutoComplete.jsx`, `SignUpPage.jsx`, `Profile.jsx` |
| Booking success UI | `fe/src/components/CreateNewOrder.jsx` |
| Gallery fallback | `fe/src/components/Gallery.jsx`, `fe/src/utils/galleryPlaceholder.js` |
| Admin UI | `fe/src/pages/MainPageAdmin.jsx`, `fe/src/components/OrdersEvents.jsx` |
| Database | `db/photodb.sql` |
