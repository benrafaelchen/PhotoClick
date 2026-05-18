# PhotoClick — Sample Bug Reports

The defects below are **realistic examples** aligned with PhotoClick modules. They illustrate how a junior QA tester would document issues during manual testing. IDs are fictional portfolio samples unless you discover the same behavior during execution — then promote them to live defects.

**Severity:** Critical | High | Medium | Low  
**Status:** New | In Progress | Fixed | Won't Fix | Cannot Reproduce

---

## Fixed defects (retest notes)

The following issues were identified during testing, fixed in the frontend, and should be verified on each regression pass using the linked test cases.

---

## BUG-008

| Field | Value |
|-------|-------|
| **ID** | BUG-008 |
| **Title** | Google Places / Maps autocomplete blocked or broke address and venue flows |
| **Module** | Address / venue (`CreateNewOrder`, `SignUpPage`, `Profile`, `PlacesAutoComplete`, `AddressAutoComplete`) |
| **Severity** | Critical |
| **Priority** | P1 |
| **Environment** | Local — with or without `REACT_APP_GOOGLE_MAPS_KEY` |
| **Status** | **Fixed** |

**Description:**  
Location and address fields depended on Google Places / Maps. Missing keys, billing issues, or broken autocomplete UI (suggestions, icons, `pac-container`) prevented reliable New Booking, sign-up, and profile updates.

**Steps to reproduce (historical):**

1. Set or omit `REACT_APP_GOOGLE_MAPS_KEY` in `fe/.env`.  
2. Customer → New Booking → type venue → submit.  
3. Sign up or update Profile address.

**Expected result (current):**  
Plain controlled text inputs only — **no** Google UI, suggestions, chips, or autocomplete artifacts. Booking sends `place: { name: eventLocation.trim() }`. Backend and database unchanged; no DB reload required.

**Actual result (before fix):**  
Console errors or broken Google widgets; venue/address not passed reliably; flows blocked or confusing.

**Retest notes:**  
Verified with TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006. Re-test if Maps or Places is reintroduced to any address field.

**Test case link:** TC-ORDER-011, TC-ORDER-014, TC-AUTH-022, TC-PROFILE-006

---

## BUG-009

| Field | Value |
|-------|-------|
| **ID** | BUG-009 |
| **Title** | Event booking date accepts invalid years and past dates |
| **Module** | Customer — New Booking (`CreateNewOrder.jsx`) |
| **Severity** | High |
| **Priority** | P1 |
| **Environment** | Local — Chrome / Firefox |
| **Status** | **Fixed** |

**Description:**  
The event date field allowed invalid input (e.g. year `43211`) and past dates, leading to bad data or confusing API errors.

**Steps to reproduce (historical):**

1. Customer → New Booking.  
2. Enter or paste an invalid date or select a past date.  
3. Submit order.

**Expected result:**  
Booking uses Israel local “today” through +10 years (`validateEventDate` in `dateValidation.js`); invalid/past paste blocked with booking-specific messages (e.g. *Event date must be today or a future date.*). Booking must **not** display *Year must be between 2000 and 2100* (that message remains for Reports via `validateDateString`).

**Actual result (before fix):**  
Invalid dates accepted or only rejected at API with generic message; confusing year-range copy on booking.

**Retest notes:**  
Verified with TC-ORDER-009, TC-ORDER-015, TC-ORDER-016, TC-ORDER-017. Admin Reports: TC-REPORT-009 / BUG-011.

**Test case link:** TC-ORDER-009, TC-ORDER-015–017, TC-REPORT-009

---

## BUG-010

| Field | Value |
|-------|-------|
| **ID** | BUG-010 |
| **Title** | Gallery shows broken image icon for missing local upload files |
| **Module** | Gallery (`Gallery.jsx`) |
| **Severity** | Medium |
| **Priority** | P2 |
| **Environment** | Local — seeded DB with `image_data` paths not on disk |
| **Status** | **Fixed** |

**Description:**  
Some gallery `src` URLs pointed to files that do not exist on the server (e.g. after DB import without uploads folder). Browser displayed broken-image icons.

**Steps to reproduce (historical):**

1. Open Gallery with seeded `images` rows but missing files under `/uploads`.  
2. Observe thumbnails.

**Expected result:**  
SVG placeholder ("Image unavailable"); grid layout unchanged; lightbox uses same fallback on error.

**Actual result (before fix):**  
Broken image icon in thumbnail and lightbox.

**Retest notes:**  
Verified with TC-GALLERY-010. Valid images still load normally (TC-GALLERY-001).

**Test case link:** TC-GALLERY-010

---

## BUG-011

| Field | Value |
|-------|-------|
| **ID** | BUG-011 |
| **Title** | Admin Reports accept invalid From/To dates |
| **Module** | Admin — Reports (`Reports.jsx`) |
| **Severity** | Medium |
| **Priority** | P2 |
| **Environment** | Local — Admin dashboard |
| **Status** | **Fixed** |

**Description:**  
Report date inputs did not validate malformed or illogical dates before calling report APIs.

**Steps to reproduce (historical):**

1. Admin → Reports.  
2. Enter invalid date or set From after To.  
3. Click Generate Report.

**Expected result:**  
Toast error from `validateDateString`; no API calls until range is valid.

**Actual result (before fix):**  
Invalid range sent to API or silent `Invalid Date` behavior.

**Retest notes:**  
Verified with TC-REPORT-009. Presets (TC-REPORT-007) still populate valid ranges.

**Test case link:** TC-REPORT-009

---

## Open / sample defects

---

## BUG-001

| Field | Value |
|-------|-------|
| **ID** | BUG-001 |
| **Title** | Customer can navigate to `/admin` URL briefly before redirect when manipulating localStorage |
| **Module** | Authentication / RBAC |
| **Severity** | Medium |
| **Priority** | P2 |
| **Environment** | Local — Chrome 124, FE `localhost:3000`, BE `localhost:8801` |
| **Status** | New |

**Description:**  
When a customer session is active, manually setting `userRole` to `1` in DevTools localStorage and navigating to `/admin` may render admin layout for a moment before API calls fail or route guard redirects.

**Steps to reproduce:**

1. Sign in as Customer.  
2. Open DevTools → Application → Local Storage.  
3. Change `userRole` from `2` to `1`.  
4. Navigate to `http://localhost:3000/admin`.

**Expected result:**  
Server-side authorization prevents any admin data from loading; user is immediately redirected to sign-in with no sensitive data exposed.

**Actual result:**  
Admin shell may flash on screen; some tabs load empty state before 403 errors on API calls.

**Notes:**  
Frontend `ProtectedRoute` in `fe/src/App.js` trusts client-side `userRole`. Verify all admin APIs return 403 with customer JWT (they should per `requireRole(1)`).

**Attachments:** Screenshot of Network tab showing 403 on `/getTotalOrders`.

---

## BUG-002

| Field | Value |
|-------|-------|
| **ID** | BUG-002 |
| **Title** | Order booking allows submit when event time is not selected |
| **Module** | Customer — New Booking |
| **Severity** | High |
| **Priority** | P1 |
| **Environment** | Local — Firefox 125 |
| **Status** | New |

**Description:**  
Under certain sequences (select package before time), the Create Order button becomes enabled without `eventTime`, causing API 400 or incomplete order.

**Steps to reproduce:**

1. Sign in as Customer → New Booking.  
2. Select event type and Bronze package.  
3. Enter venue and date only (leave time blank).  
4. Click Create Order.

**Expected result:**  
Client-side validation blocks submit with clear message for event time.

**Actual result:**  
Request sent; user sees generic error or confusing message from API: "Missing required order fields".

**Test case link:** TC-ORDER-008

---

## BUG-003

| Field | Value |
|-------|-------|
| **ID** | BUG-003 |
| **Title** | Gallery filter "Bar / Bat Mitzvah" does not match `bar-mitzvah` event_type for some images |
| **Module** | Gallery |
| **Severity** | Low |
| **Priority** | P3 |
| **Environment** | Local |
| **Status** | New |

**Description:**  
Filtering gallery by "Bar / Bat Mitzvah Party" hides images uploaded with `event_type` `bar-mitzvah` if naming convention differs from filter id.

**Steps to reproduce:**

1. Admin uploads images with event type Henna.  
2. Switch filter to Bar / Bat Mitzvah.  
3. Compare with DB `images.event_type` values.

**Expected result:**  
Filter shows all bar/bat mitzvah tagged images per `EVENT_FILTERS` in `Gallery.jsx`.

**Actual result:**  
Some seeded images from `photodb.sql` do not appear under expected filter.

**Test case link:** TC-GALLERY-002

---

## BUG-004

| Field | Value |
|-------|-------|
| **ID** | BUG-004 |
| **Title** | Forgot password success message shown but email not received in local environment |
| **Module** | Authentication |
| **Severity** | Low |
| **Priority** | P3 |
| **Environment** | Local — `EMAIL_PASS` empty in `be/.env` |
| **Status** | Won't Fix (environment) |

**Description:**  
UI shows success message per anti-enumeration design, but no email arrives when Gmail credentials are not configured.

**Steps to reproduce:**

1. Leave `EMAIL_PASS` unset in backend `.env`.  
2. Submit forgot password for valid user.

**Expected result:**  
Documented dev limitation OR clear log warning in UI for testers.

**Actual result:**  
Generic success only; tester believes email failed functionally.

**Notes:**  
Not a production defect if `EMAIL_USER` / `EMAIL_PASS` configured. Verify server logs for nodemailer errors.

---

## BUG-005

| Field | Value |
|-------|-------|
| **ID** | BUG-005 |
| **Title** | Admin cannot assign photographers when order description omits "Photographers Video" phrase |
| **Module** | Admin — Orders & Events |
| **Severity** | High |
| **Priority** | P1 |
| **Environment** | Local |
| **Status** | New |

**Description:**  
`extractPhotographersCount` in `OrdersEvents.jsx` parses photographer counts from `OrderDescription` text. Custom or edited descriptions may set `maxVideos` to 0 and hide video assignment UI even when package includes video.

**Steps to reproduce:**

1. Create order with add-ons only (no standard pack phrase).  
2. Admin opens order on calendar.  
3. Attempt to assign video photographer.

**Expected result:**  
Assignment limits derived from package serial (`SerialPack`) or `packs` table, not fragile string parsing.

**Actual result:**  
Video assignment section missing; cannot assign video crew.

**Test case link:** TC-ADMIN-006

---

## BUG-006

| Field | Value |
|-------|-------|
| **ID** | BUG-006 |
| **Title** | Expired JWT shows generic error on Profile save without redirect |
| **Module** | Authentication / Profile |
| **Severity** | Medium |
| **Priority** | P2 |
| **Environment** | Local — token older than 24h |
| **Status** | New |

**Description:**  
After JWT expiry, Profile update displays error message but user remains on dashboard until manual navigation.

**Steps to reproduce:**

1. Sign in; wait 24+ hours OR manually corrupt token.  
2. Profile → Save changes.

**Expected result:**  
`handleAuthExpired` in `fe/src/utils/api.js` clears session and redirects to `/signin` with "Session expired" messaging.

**Actual result:**  
Error toast only on some endpoints; inconsistent redirect.

**Test case link:** TC-AUTH-020

---

## BUG-007

| Field | Value |
|-------|-------|
| **ID** | BUG-007 |
| **Title** | Google Sign-In button hidden when package not installed but no fallback message |
| **Module** | Authentication |
| **Severity** | Low |
| **Priority** | P3 |
| **Environment** | FE build without `@react-oauth/google` |
| **Status** | New |

**Description:**  
`SignInPage.jsx` sets `GoogleLogin = null` on import failure; UI may show no indication that Google login is unavailable.

**Expected result:**  
Inform user that Google login is disabled or configure client ID.

**Actual result:**  
Email/password only with no explanation.

---

## Bug report template (copy for new defects)

```markdown
## BUG-XXX

| Field | Value |
|-------|-------|
| **ID** | BUG-XXX |
| **Title** | |
| **Module** | |
| **Severity** | |
| **Priority** | |
| **Environment** | |
| **Status** | New |

**Description:**

**Steps to reproduce:**
1.
2.
3.

**Expected result:**

**Actual result:**

**Test case link:**

**Attachments:**
```
