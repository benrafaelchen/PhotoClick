# PhotoClick — Manual Test Cases

**Legend — Priority:** P1 Critical | P2 High | P3 Medium/Low  
**Legend — Type:** POS Positive | NEG Negative | VAL Validation | RBAC Role-based | SMK Smoke | SAN Sanity | REG Regression

---

## Smoke & sanity

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-SMOKE-001 | SMK | P1 | Application loads sign-in page | FE running on port 3000 | Open `http://localhost:3000` | Sign-in page displays PhotoClick branding and email/password fields |
| TC-SMOKE-002 | SMK | P1 | Customer sign-in redirects to dashboard | Valid customer account | Sign in with customer credentials | Redirect to `/customer`; sidebar shows New Booking, My Orders, Profile, Gallery, About Us, FAQ |
| TC-SMOKE-003 | SMK | P1 | Admin sign-in redirects to admin dashboard | Valid admin account | Sign in | Redirect to `/admin`; default view Orders & Events |
| TC-SMOKE-004 | SMK | P1 | Public catalog APIs reachable | BE running | Browser or Postman: GET `/api/getEventTypes` | 200 OK with event types list |
| TC-SMOKE-005 | SMK | P1 | Create order end-to-end (customer) | Logged in as customer | Complete New Booking with required fields; submit | Inline success: *“Your booking request was submitted successfully and is now pending approval.”*; order in My Orders as Pending |
| TC-SANITY-001 | SAN | P2 | Gallery loads after code change | Any logged-in user | Open Gallery tab | Images load or empty state; no console crash |
| TC-SANITY-002 | SAN | P2 | Admin approve order | Admin logged in; pending order exists | Orders & Events → select date → Approve | Order status Approved; badge/stepper updated |

---

## Authentication (`SignInPage`, `SignUpPage`, `ForgotPassword`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-AUTH-001 | POS | P1 | Valid customer sign-in | Registered customer | Enter valid email/password; Sign In | Success message; redirect to `/customer`; `authToken` in localStorage |
| TC-AUTH-002 | POS | P1 | Valid admin sign-in | Admin in DB | Sign in | Redirect to `/admin` |
| TC-AUTH-003 | POS | P1 | Valid photographer sign-in | Photographer (role 3 or 4) | Sign in | Redirect to `/photographer` |
| TC-AUTH-004 | NEG | P1 | Invalid password | Known email | Wrong password | Error: invalid email or password; no token stored |
| TC-AUTH-005 | NEG | P2 | Empty email/password | On sign-in | Submit with empty fields | Client message: enter email and password |
| TC-AUTH-006 | VAL | P2 | Sign-up — customer happy path | On `/signup` | Fill all fields; Customer type; valid 10-digit phone; address; password ≥8 with uppercase and number | Account created; redirect to sign-in |
| TC-AUTH-007 | VAL | P2 | Sign-up — photographer stills | On `/signup` | Select Photographer → Stills | roleID 3; success registration |
| TC-AUTH-008 | VAL | P2 | Sign-up — photographer video | On `/signup` | Select Photographer → Video | roleID 4; success registration |
| TC-AUTH-009 | NEG | P2 | Sign-up — duplicate email | Email already registered | Register again with same email | Error: user already exists |
| TC-AUTH-010 | VAL | P2 | Sign-up — password too short | On signup | Password 7 chars | Validation error: at least 8 characters |
| TC-AUTH-011 | VAL | P2 | Sign-up — invalid phone | On signup | Phone not 10 digits | Validation: must be 10 digits |
| TC-AUTH-012 | NEG | P2 | Sign-up — admin role blocked | On signup | Attempt to POST signup as roleID 1 via API | 400 Invalid account type (only 2,3,4 allowed) |
| TC-AUTH-013 | POS | P2 | Forgot password — existing email | User in DB | `/forgotpassword` → submit email | Generic success message (no email enumeration) |
| TC-AUTH-014 | POS | P2 | Forgot password — unknown email | — | Submit unregistered email | Same generic message as TC-AUTH-013 |
| TC-AUTH-015 | POS | P3 | Google sign-in (optional) | `REACT_APP_GOOGLE_CLIENT_ID` set; user pre-registered | Use Google button on sign-in | Token issued; redirect by role (same as email sign-in) |
| TC-AUTH-016 | NEG | P3 | Google sign-in — unregistered Google account | Google user not in DB | Sign in with Google | Error from API; no session |
| TC-AUTH-017 | RBAC | P1 | Customer cannot open `/admin` | Logged in as customer | Navigate to `/admin` | Redirect to `/signin` |
| TC-AUTH-018 | RBAC | P1 | Photographer cannot open `/customer` | Logged in as photographer | Navigate to `/customer` | Redirect to `/signin` |
| TC-AUTH-019 | RBAC | P1 | Unauthenticated protected route | Logged out | Open `/customer` | Redirect to `/signin` |
| TC-AUTH-020 | NEG | P2 | Session expired token | Expired or invalid token in localStorage | Call protected API or navigate after token cleared | 401; redirect to sign-in; localStorage cleared |
| TC-AUTH-021 | REG | P2 | Auth rate limiting | — | Send >20 sign-in attempts in 15 min from same IP | 429 Too many attempts message |
| TC-AUTH-022 | POS | P1 | Sign-up — free-text address (no Google Maps) | On `/signup` | Type address in plain text field → complete registration | No autocomplete, suggestions, or Google UI; signup succeeds; address saved |

---

## Profile (`Profile.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-PROFILE-001 | POS | P2 | View profile | Logged in | Open Profile | Shows FirstName, LastName, Email, Phone, Address from `/getUserData` |
| TC-PROFILE-002 | POS | P2 | Update profile without password | Logged in | Change name/phone/address; save | Success message; data persisted after refresh |
| TC-PROFILE-003 | POS | P2 | Update password via profile | Logged in | Set new password ≥8 chars; save | Success; can sign in with new password |
| TC-PROFILE-004 | VAL | P2 | Update profile — missing required fields | Logged in | Clear first name; save | Validation error from API |
| TC-PROFILE-005 | RBAC | P2 | User cannot view another user's profile via API | Customer token | POST `/getUserData` with another email in body (if attempted) | API returns only token owner's data (IDOR-safe) |
| TC-PROFILE-006 | POS | P2 | Profile — free-text address update | Customer logged in | Profile → edit address as plain text → Save | No Google autocomplete UI; `/updateUserData` succeeds; address persists after refresh |

---

## Customer — New booking (`CreateNewOrder.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-ORDER-001 | POS | P1 | Create order — Bronze package | Customer logged in | Select event type, Bronze, free-text venue, future date/time; submit | 201 success; Pending order; success alert per TC-ORDER-018 |
| TC-ORDER-002 | POS | P1 | Create order — Silver package | Customer logged in | Select Silver package | Price reflects Silver base + add-ons |
| TC-ORDER-003 | POS | P1 | Create order — Gold package | Customer logged in | Select Gold package | Higher base price; description matches pack |
| TC-ORDER-004 | POS | P2 | Add optional products (quantities) | Customer logged in | Increase add-on quantities (albums, magnets, etc.) | Total price increases; description includes "Additional Includes" |
| TC-ORDER-005 | VAL | P1 | Submit without event type | Customer | Leave event type empty; submit | Client validation; order not submitted |
| TC-ORDER-006 | VAL | P1 | Submit without package | Customer | Leave pack style empty | Validation prevents submit |
| TC-ORDER-007 | VAL | P1 | Submit without venue | Customer | Leave event location empty | Error: location required; no success message |
| TC-ORDER-008 | VAL | P1 | Submit without event date/time | Customer | Missing date or time | Validation error |
| TC-ORDER-009 | NEG | P1 | Event date in the past blocked (Israel local) | Customer on New Booking | Set event date before today in Israel local calendar | Inline error e.g. *Event date must be today or a future date.*; order not submitted; no success message |
| TC-ORDER-010 | POS | P2 | Photographer capacity limits respected | `/getPhotographerLimits` returns limits | Select package with included photographers; try exceeding add-on stills/video | UI blocks or warns when exceeding available capacity |
| TC-ORDER-011 | NEG | P1 | Event location — no Google Maps UI | Customer on New Booking | Type in event location; inspect field and page (with or without `REACT_APP_GOOGLE_MAPS_KEY`) | Plain `<input>` only; no pac-container, suggestions, chips, or Google icons |
| TC-ORDER-012 | NEG | P2 | Create order without auth token | Logged out | POST `/createOrder` via Postman without Bearer | 401 Authentication required |
| TC-ORDER-013 | REG | P2 | Price calculation regression | Known package + quantities | Compare UI total with manual calculation from `/getPrices` | Totals match within discount rules |
| TC-ORDER-014 | POS | P1 | Free-text venue on New Booking | Customer logged in | Type venue (e.g. "Test Hall, Tel Aviv") → complete order | Request body includes `place: { name: "Test Hall, Tel Aviv" }` (trimmed); Pending in My Orders; no Google UI |
| TC-ORDER-015 | NEG | P1 | Booking date cannot be in the past | Customer | Select yesterday (Israel local “today”) | Validation message; submit blocked; no success message |
| TC-ORDER-016 | NEG | P1 | Booking date rejects invalid paste | Customer | Paste malformed date (e.g. `43211-01-01`, incomplete `20261-01-01`) | Booking-specific error (e.g. *Please select a valid future event date.*); **must not** show *Year must be between 2000 and 2100* |
| TC-ORDER-017 | POS | P1 | Booking date accepts valid future date | Customer | Select date from Israel today through +10 years; future time | No date error; order submits successfully |
| TC-ORDER-018 | POS | P1 | Booking success message after submit | Customer; valid booking data | Submit New Booking → wait for API success | Green alert above form: *“Your booking request was submitted successfully and is now pending approval.”*; form clears; message auto-hides ~6s; **not** shown if validation fails or API errors |

---

## Customer — My orders (`MyOrders.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-MYORDERS-001 | POS | P1 | List own orders | Customer with orders | Open My Orders | Only orders for logged-in email displayed |
| TC-MYORDERS-002 | POS | P2 | Filter orders by date range | Multiple orders | Set from/to dates | Filtered list matches range |
| TC-MYORDERS-003 | POS | P2 | Order status display | Orders in various statuses | View list | Pending / Approved / Rejected shown correctly |
| TC-MYORDERS-004 | POS | P2 | Order progress stepper | Approved order | Open order details | Stepper reflects status pipeline |
| TC-MYORDERS-005 | NEG | P2 | No orders state | New customer | Open My Orders | Empty state message; no errors |

---

## Admin — Orders & events (`OrdersEvents.jsx`, `CalendarComponent.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-ADMIN-001 | POS | P1 | Calendar shows event dates | Admin logged in | Open Orders & Events | Calendar highlights dates from `/getEventDates` |
| TC-ADMIN-002 | POS | P1 | View orders for selected date | Orders on date | Click calendar date | List from `/getOrdersAtDate` |
| TC-ADMIN-003 | POS | P1 | Approve pending order | Pending order on date | Select order → Approve | Status Approved; customer sees Approved in My Orders |
| TC-ADMIN-004 | POS | P1 | Reject pending order | Pending order | Reject | Status Rejected; rejection message in UI |
| TC-ADMIN-005 | POS | P1 | Assign stills photographers | Approved order; stills slots in description | Select stills workers → assign | `/assignWorkers` success; workers linked in DB |
| TC-ADMIN-006 | POS | P1 | Assign video photographers | Order needs video | Select video workers → assign | Assignment saved |
| TC-ADMIN-007 | VAL | P2 | Cannot assign more than package allows | Order allows 1 stills | Select 2 stills | UI prevents or API error |
| TC-ADMIN-008 | POS | P2 | View assigned orders list | Assigned orders exist | View assigned orders section | Data from `/getAssignedOrders` |
| TC-ADMIN-009 | RBAC | P1 | Customer cannot approve order | Customer token | POST `/approveOrder` | 403 permission denied |
| TC-ADMIN-010 | RBAC | P1 | Photographer cannot reject order | Photographer token | POST `/rejectOrder` | 403 |
| TC-ADMIN-011 | REG | P2 | Re-approve already approved order | Approved order | Approve again | Handled gracefully (no duplicate corruption) |

---

## Admin — Team & clients (`DisplayWorkers.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-TEAM-001 | POS | P2 | View workers list | Admin | Team & Clients tab | Photographers listed from `/getWorkers` |
| TC-TEAM-002 | POS | P2 | View customers list | Admin | Same tab | Customers from `/getCustomers` |
| TC-TEAM-003 | RBAC | P2 | Customer cannot list all workers | Customer token | GET `/getWorkers` | 403 |

---

## Admin — Reports (`Reports.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-REPORT-001 | POS | P2 | Revenue report | Admin; orders in range | Select date range → Generate → Revenue tab | Revenue total and order list |
| TC-REPORT-002 | POS | P2 | Expenses report | Admin | Expenses tab | Product and worker costs displayed |
| TC-REPORT-003 | POS | P2 | Customer report | Admin | Customers tab | Per-customer aggregates |
| TC-REPORT-004 | POS | P2 | Staff report | Admin | Staff tab | Photographer workload data |
| TC-REPORT-005 | POS | P2 | Orders report | Admin | Orders tab | Order-level report rows |
| TC-REPORT-006 | VAL | P2 | Generate without dates | Admin | Click generate with empty dates | Validation or empty result handled |
| TC-REPORT-007 | POS | P3 | Date presets | Admin | Click "This month" preset | From/to dates auto-filled |
| TC-REPORT-008 | RBAC | P2 | Customer cannot access reports | Customer token | POST `/getRevenue` | 403 |
| TC-REPORT-009 | NEG | P2 | Reports reject invalid date range | Admin | Enter invalid From/To (bad format, impossible date, or from > to) → Generate | Toast error with clear message; report not generated |

---

## Gallery (`Gallery.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-GALLERY-001 | POS | P2 | View gallery — all filter | Any user | Gallery → All | Images from `/getImages` |
| TC-GALLERY-002 | POS | P2 | Filter by event type | Images exist | Select Henna / Wedding / etc. | Only matching `event_type` shown |
| TC-GALLERY-003 | POS | P2 | Lightbox open/close | Images exist | Click image; press Escape | Lightbox opens and closes |
| TC-GALLERY-004 | POS | P2 | Admin upload images | Admin | Select files (JPEG/PNG/GIF/WebP); choose event type; upload | Images appear in gallery |
| TC-GALLERY-005 | NEG | P2 | Admin upload invalid file type | Admin | Upload `.pdf` | 400 Only image files allowed |
| TC-GALLERY-006 | NEG | P2 | Upload file > 10MB | Admin | Large file | 400 File too large |
| TC-GALLERY-007 | POS | P2 | Admin delete image | Admin | Delete image | Image removed from list and DB |
| TC-GALLERY-008 | RBAC | P2 | Customer cannot upload | Customer | No upload UI; POST `/uploadImages` without admin role | 403 or UI hidden |
| TC-GALLERY-009 | SAN | P3 | Public GET images without login | Logged out | GET `/api/getImages` | 200 — public read |
| TC-GALLERY-010 | POS | P2 | Placeholder when image URL broken | Gallery has seeded/missing file paths | Open Gallery → find image with dead `src` | Gray "Image unavailable" placeholder; no broken-image icon; layout unchanged |

---

## FAQ & About Us (`FAQ.jsx`, `AboutUs.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-CONTENT-001 | POS | P2 | View FAQ (all roles) | — | Open FAQ tab | Items from `/faqData` |
| TC-CONTENT-002 | POS | P2 | Admin add FAQ | Admin | Add title + content | New FAQ visible after refresh |
| TC-CONTENT-003 | POS | P2 | Admin delete FAQ | Admin | Delete entry | Removed from list |
| TC-CONTENT-004 | POS | P2 | View About Us | — | Open About Us | Content from `/aboutUsData` |
| TC-CONTENT-005 | POS | P2 | Admin edit About Us | Admin | Edit and save | `/editPageContent` persists |
| TC-CONTENT-006 | RBAC | P2 | Customer cannot add FAQ | Customer token | POST `/addFaq` | 403 |

---

## Photographer (`Events.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-PHOTO-001 | POS | P1 | View assigned events | Photographer assigned to orders | My Assignments | Orders from `/getOrdersForWorker` |
| TC-PHOTO-002 | POS | P2 | Assignment after admin assign | Admin assigns photographer | Photographer refreshes assignments | New event visible |
| TC-PHOTO-003 | RBAC | P2 | Photographer cannot create orders | Photographer | No New Booking in nav; POST `/createOrder` | 403 or customer-only flow N/A |
| TC-PHOTO-004 | POS | P3 | Photographer views gallery/FAQ | Photographer logged in | Open Gallery, FAQ | Read-only same as customer |

---

## Layout & navigation (`DashboardLayout.jsx`, `Header.jsx`)

| ID | Type | Priority | Title | Preconditions | Steps | Expected result |
|----|------|----------|-------|---------------|-------|-----------------|
| TC-UI-001 | POS | P3 | Sidebar navigation | Logged in | Click each nav item | Correct component renders |
| TC-UI-002 | POS | P2 | Sign out | Logged in | Sign out (if available) or clear session | Token removed; redirect to sign-in |
| TC-UI-003 | POS | P3 | Unknown URL | — | Visit `/unknown-page` | Redirect to `/signin` |
| TC-UI-004 | REG | P3 | Responsive layout | Mobile viewport | Resize browser | Usable layout without broken overlaps |

---

## Cross-cutting regression suite (minimum)

Execute before release:

- TC-SMOKE-001 through TC-SMOKE-005  
- TC-AUTH-001, TC-AUTH-004, TC-AUTH-017, TC-AUTH-019  
- TC-ORDER-001, TC-ORDER-005, TC-ORDER-007, TC-ORDER-011, TC-ORDER-014, TC-ORDER-015, TC-ORDER-017, TC-ORDER-018  
- TC-AUTH-022  
- TC-PROFILE-006  
- TC-MYORDERS-001  
- TC-ADMIN-003, TC-ADMIN-005, TC-ADMIN-009  
- TC-PHOTO-001  
- TC-GALLERY-004, TC-GALLERY-008, TC-GALLERY-010  
- TC-REPORT-009  
- TC-CONTENT-001, TC-CONTENT-006  
