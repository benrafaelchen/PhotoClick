# PhotoClick — API Test Scenarios

Manual API testing guide aligned with `be/routes/api.js`. Use with **Postman** collection: `qa/postman/photoclick-api-collection.json`.

**Base URL:** `{{baseUrl}}` → default `http://localhost:8801`  
**Auth header (protected routes):** `Authorization: Bearer {{authToken}}`

---

## General API conventions

| Item | Value |
|------|--------|
| Content-Type | `application/json` (except file upload) |
| Auth | JWT in `Authorization` header; token from `/signin` or `/google-signin` |
| Admin-only | `requireRole(1)` — RoleID must be `1` |
| Customer order creation | Uses `req.user.email` — cannot create order for another email |
| Rate limits | Auth routes: 20 req / 15 min; all `/api/*`: 300 req / 15 min |

### UI-only validations (retest via manual test cases)

These behaviors are enforced in the React frontend; the API may still accept values if called directly from Postman:

| Fix area | UI test cases | API note |
|----------|---------------|----------|
| Free-text venue/address (Google Maps removed) | TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006 | `createOrder` requires `place.name` (string); UI sends `{ "name": "<trimmed text>" }` — see API-ORDER-020; backend unchanged |
| Booking event date (Israel local, invalid paste) | TC-ORDER-009, TC-ORDER-015–017 | API checks required fields and price; booking date rules are UI-only (`validateEventDate`) |
| Booking success message | TC-ORDER-018, TC-SMOKE-005 | `POST /createOrder` → 201 `{ success: true, ... }`; success alert is client-only after response |
| Reports date range | TC-REPORT-009 | Report POST bodies expect valid `fromDate` / `toDate`; may show year-range messages not used on booking |
| Gallery image placeholder | TC-GALLERY-010 | `GET /getImages` unchanged; fallback is client-side `onError` only |

---

## Authentication & users

| ID | Method | Endpoint | Auth | Scenario | Request body (sample) | Expected |
|----|--------|----------|------|----------|----------------------|----------|
| API-AUTH-001 | POST | `/api/signin` | No | Valid login | `{"userEmail":"customer@test.com","userPassword":"TestPass123"}` | 200; `token`, `roleID`, `email` |
| API-AUTH-002 | POST | `/api/signin` | No | Invalid password | Wrong password | 400; invalid email or password |
| API-AUTH-003 | POST | `/api/signin` | No | Missing fields | `{}` | 400; email and password required |
| API-AUTH-004 | POST | `/api/signup` | No | Valid customer | `email`, `personalId`, `password`, `firstName`, `lastName`, `phoneNumber`, `address`, `roleID`:2, `roleName`:"Customer" | 201; account created |
| API-AUTH-005 | POST | `/api/signup` | No | Invalid role admin | `roleID`:1 | 400; invalid account type |
| API-AUTH-006 | POST | `/api/signup` | No | Weak password | password 7 chars | 400; at least 8 characters |
| API-AUTH-007 | POST | `/api/signup` | No | Invalid phone | phone not 10 digits | 400 |
| API-AUTH-008 | POST | `/api/forgotpassword` | No | Valid email | `{"userEmail":"..."}` | 200; generic message |
| API-AUTH-009 | POST | `/api/forgotpassword` | No | Unknown email | unregistered email | 200; same generic message |
| API-AUTH-010 | POST | `/api/google-signin` | No | Valid credential | `{"credential":"<Google ID token>"}` | 200 with token OR 400 if user not registered |
| API-AUTH-011 | POST | `/api/getUserData` | Bearer | Valid token | `{}` or empty body | 200; user profile fields |
| API-AUTH-012 | POST | `/api/getUserData` | None | No token | — | 401 Authentication required |
| API-AUTH-013 | POST | `/api/getUserData` | Bearer | Expired/invalid token | — | 401 session expired or invalid |
| API-AUTH-014 | POST | `/api/updateUserData` | Bearer | Update profile | `firstName`, `lastName`, `phoneNumber`, `address` | 200 success |
| API-AUTH-015 | POST | `/api/updateUserData` | Bearer | Change password | include `newPassword` (≥8 chars) | 200; login works with new password |

---

## Orders & catalog (public + protected)

| ID | Method | Endpoint | Auth | Scenario | Expected |
|----|--------|----------|------|----------|----------|
| API-ORDER-001 | GET | `/api/getEventTypes` | No | List event types | 200; array from `eventkind` |
| API-ORDER-002 | GET | `/api/getPrices` | No | Add-on prices | 200; price map |
| API-ORDER-003 | GET | `/api/getPackStyles` | No | Package definitions | 200; bronze/silver/gold metadata |
| API-ORDER-004 | GET | `/api/getWorkStils` | No | Work stills catalog | 200 |
| API-ORDER-005 | GET | `/api/getPhotographerLimits` | No | Capacity limits | 200; stills/video limits |
| API-ORDER-006 | GET | `/api/getPhotographerCaps` | No | Alias of limits | Same as API-ORDER-005 |
| API-ORDER-007 | POST | `/api/createOrder` | Customer Bearer | Valid order | 201; `success: true` |
| API-ORDER-008 | POST | `/api/createOrder` | Customer Bearer | Missing location | `place` without `name` → 400 |
| API-ORDER-009 | POST | `/api/createOrder` | Customer Bearer | Missing event fields | no `eventType` → 400 |
| API-ORDER-010 | POST | `/api/createOrder` | No token | Unauthorized | 401 |
| API-ORDER-011 | POST | `/api/createOrder` | Admin Bearer | Wrong role | 403 if not customer? — createOrder only uses verifyToken, not requireRole; **admin can create order under admin email** |
| API-ORDER-012 | POST | `/api/getUserOrders` | Customer Bearer | Own orders | 200; orders for token email only |
| API-ORDER-013 | GET | `/api/getTotalOrders` | Admin Bearer | All orders summary | 200 |
| API-ORDER-014 | GET | `/api/getTotalOrders` | Customer Bearer | RBAC | 403 |
| API-ORDER-015 | POST | `/api/getOrdersAtDate` | Admin Bearer | Orders on date | `{"data":"2026-01-15"}` → 200 list |
| API-ORDER-016 | POST | `/api/approveOrder` | Admin Bearer | Approve | `{"orderId":1040}` → 200 |
| API-ORDER-017 | POST | `/api/rejectOrder` | Admin Bearer | Reject | `{"orderId":1040}` → 200; status Rejected |
| API-ORDER-018 | POST | `/api/approveOrder` | Customer Bearer | RBAC | 403 |
| API-ORDER-019 | POST | `/api/getAssignedOrders` | Admin Bearer | Assigned list | 200 |
| API-ORDER-020 | POST | `/api/createOrder` | Customer Bearer | Free-text venue | `place`: `{ "name": "Community Center, Haifa" }` with other required fields | 201 — aligns with TC-ORDER-014 (UI has no Google Places) |

**Sample `createOrder` body:**

```json
{
  "eventType": "Wedding Party",
  "packStyle": "bronze",
  "serialPack": 201,
  "eventDate": "2026-06-15",
  "eventTime": "18:00",
  "eventPrice": 2850,
  "place": { "name": "Test Venue Hall" },
  "quantities": {},
  "dynamicDescription": "Includes: 1 Photographers Stills, 1 Photographers Video..."
}
```

---

## Workers & assignments

| ID | Method | Endpoint | Auth | Scenario | Request sample | Expected |
|----|--------|----------|------|----------|----------------|----------|
| API-WORKER-001 | GET | `/api/getWorkers` | Admin | List photographers | — | 200 |
| API-WORKER-002 | GET | `/api/getCustomers` | Admin | List customers | — | 200 |
| API-WORKER-003 | POST | `/api/getAvailableWorkers` | Admin | Available for date | `{"data":"2026-01-15"}` | 200 |
| API-WORKER-004 | POST | `/api/getWorkersForOrder` | Admin | Workers for order | `{"data":1040}` | 200 |
| API-WORKER-005 | POST | `/api/assignWorkers` | Admin | Assign | `{"orderId":1040,"workers":[{"personalId":"111111111"}]}` | 200 |
| API-WORKER-006 | POST | `/api/getAssignedWorkersForAssignedOrders` | Admin | Mapped assignments | — | 200 |
| API-WORKER-007 | POST | `/api/getOrdersForWorker` | Photographer Bearer | My assignments | — | 200 orders for token user |
| API-WORKER-008 | GET | `/api/getWorkers` | Customer Bearer | RBAC | — | 403 |

---

## Events, FAQ, pages

| ID | Method | Endpoint | Auth | Scenario | Expected |
|----|--------|----------|------|----------|----------|
| API-EVENT-001 | GET | `/api/getEventNames` | No | Event name list | 200 |
| API-EVENT-002 | GET | `/api/getEventDates` | No | Calendar dates | 200 |
| API-FAQ-001 | GET | `/api/faqData` | No | Read FAQ | 200 array |
| API-FAQ-002 | POST | `/api/addFaq` | Admin | Add entry | `{"data":{"faq_title":"...","faq_content":"..."}}` → 200 |
| API-FAQ-003 | POST | `/api/deleteFaq` | Admin | Delete | `{"data":10}` → 200 |
| API-FAQ-004 | POST | `/api/addFaq` | Customer | RBAC | 403 |
| API-PAGE-001 | GET | `/api/aboutUsData` | No | About content | 200 |
| API-PAGE-002 | POST | `/api/editPageContent` | Admin | Update about | `page_content`, `page_info` → 200 |

---

## Reports (admin only)

| ID | Method | Endpoint | Auth | Scenario | Body | Expected |
|----|--------|----------|------|----------|------|----------|
| API-REPORT-001 | POST | `/api/getRevenue` | Admin | Date range | `fromDate`, `toDate` | 200 + revenue data |
| API-REPORT-002 | POST | `/api/getExpenses` | Admin | Date range | same | 200 |
| API-REPORT-003 | POST | `/api/getCustomerReport` | Admin | Customers | same | 200 |
| API-REPORT-004 | POST | `/api/getWorkerReport` | Admin | Staff | same | 200 |
| API-REPORT-005 | POST | `/api/getOrderReport` | Admin | Orders | same | 200 |
| API-REPORT-006 | POST | `/api/getRevenue` | Customer | RBAC | — | 403 |

---

## Images / gallery

| ID | Method | Endpoint | Auth | Scenario | Expected |
|----|--------|----------|------|----------|----------|
| API-IMG-001 | GET | `/api/getImages` | No | List images | 200; broken `src` URLs still return 200 — UI shows placeholder (TC-GALLERY-010) |
| API-IMG-002 | POST | `/api/uploadImages` | Admin | Multipart upload | form-data: `images` (files), `eventType` (e.g. `wedding`) | 200 |
| API-IMG-003 | POST | `/api/uploadImages` | Admin | Invalid MIME | upload `.txt` | 400 image types only |
| API-IMG-004 | POST | `/api/uploadImages` | Admin | File >10MB | large file | 400 file too large |
| API-IMG-005 | POST | `/api/deleteImage` | Admin | Delete | `imageId`, `imageName` | 200 |
| API-IMG-006 | POST | `/api/uploadImages` | Customer | RBAC | 403 |

**Static files:** Uploaded files served at `GET {{baseUrl}}/uploads/<filename>` per `be/app.js`.

---

## Security & negative API tests

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| API-SEC-001 | Missing Bearer prefix | `Authorization: <token>` without `Bearer ` | 401 |
| API-SEC-002 | SQL injection in email | signin with `userEmail`: `" OR 1=1 --"` | 400 invalid credentials; no 500 |
| API-SEC-003 | IDOR on orders | Customer A token; attempt getUserOrders logic for B | Only A's orders returned |
| API-SEC-004 | CORS from unknown origin | Request from non-`SITE_URL` origin | Blocked by CORS policy |
| API-SEC-005 | Auth rate limit | 21+ rapid signin attempts | 429 too many attempts |

---

## Suggested Postman test flow (smoke)

1. **Environment:** `baseUrl` = `http://localhost:8801`  
2. **Sign in (admin):** `POST /api/signin` → Tests tab saves `authToken` from response  
3. **Public catalog:** `GET /api/getEventTypes`, `/api/getPackStyles`  
4. **Sign in (customer):** save customer token to variable `customerToken`  
5. **Create order:** `POST /api/createOrder` with customer token  
6. **Admin approve:** switch to admin token → `POST /api/approveOrder`  
7. **Assign workers:** `POST /api/assignWorkers`  
8. **Photographer:** sign in → `POST /api/getOrdersForWorker`  
9. **Gallery:** `GET /api/getImages`  

---

## Response code quick reference

| Code | Meaning in PhotoClick |
|------|------------------------|
| 200 | Success (GET/POST updates) |
| 201 | Created (signup, createOrder) |
| 400 | Validation / business rule failure |
| 401 | Missing or invalid JWT |
| 403 | Valid JWT but wrong role |
| 429 | Rate limit exceeded |
| 500 | Server error (log on BE console) |
