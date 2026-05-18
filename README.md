# PhotoClick

Professional photography event management platform. Book photographers, manage events, track orders, and run your photography business.

## Architecture

- **Frontend:** React 18 (Create React App) with custom CSS design system
- **Backend:** Express.js REST API with JWT authentication
- **Database:** MySQL / MariaDB
- **Email:** Nodemailer with Gmail

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL / MariaDB running locally
- npm

### 1. Database Setup

Import the schema into your MySQL server:

```bash
mysql -u root -p < db/photodb.sql
```

### 2. Backend Setup

```bash
cd be
cp .env.example .env    # Edit .env with your values
npm install
npm run server          # Starts on port 8801
```

### 3. Frontend Setup

```bash
cd fe
npm install
npm start               # Starts on port 3000
```

### 4. Run Both Together

```bash
cd be
npm start               # Runs backend + frontend concurrently
```

## Environment Variables

### Backend (`be/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8801` | Server port |
| `DB_HOST` | No | `localhost` | MySQL host |
| `DB_USER` | No | `root` | MySQL user |
| `DB_PASSWORD` | No | (empty) | MySQL password |
| `DB_NAME` | No | `photodb` | Database name |
| `JWT_SECRET` | **Yes (production)** | dev-only random | Token signing secret |
| `EMAIL_USER` | Yes | - | Gmail address for sending emails |
| `EMAIL_PASS` | Yes | - | Gmail App Password |
| `ADMIN_EMAILS` | No | - | Comma-separated admin notification emails |
| `SITE_URL` | No | `http://localhost:3000` | Frontend URL (used in email links) |
| `API_BASE_URL` | No | `http://localhost:8801` | Public API URL (used for image URLs) |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |

### Frontend (`fe/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | No | `http://localhost:8801` | Backend API URL |
| `REACT_APP_GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `REACT_APP_GOOGLE_MAPS_KEY` | No | - | Unused for address/venue (manual text entry only) |

## User Roles

| Role ID | Name | Access |
|---------|------|--------|
| 1 | Admin | Full dashboard, orders, reports, workers, content management |
| 2 | Customer | Create orders, view own orders, profile, gallery |
| 3 | Photographer-Stills | View assigned events, profile, gallery |
| 4 | Photographer-Video | View assigned events, profile, gallery |

## User Flows

### Customer Flow
1. Sign up as Customer
2. Create a new order (select event type, package, venue as free text, date/time)
3. Receive order confirmation email
4. Track order status (Pending / Approved / Rejected)
5. View order history with date filtering

### Admin Flow
1. Sign in as Admin
2. View orders on calendar by date
3. Assign photographers to events
4. Approve or reject orders
5. Manage workers and customers
6. Generate reports (revenue, expenses, customers, workers, orders)
7. Upload/manage gallery images
8. Manage FAQ and About Us content

### Photographer Flow
1. Sign in as Photographer
2. View assigned events
3. Receive email notifications for new assignments

## Google Login Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google Identity Services" API
4. Go to Credentials > Create OAuth 2.0 Client ID (Web application)
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
6. Copy the Client ID
7. Set `GOOGLE_CLIENT_ID` in `be/.env`
8. Set `REACT_APP_GOOGLE_CLIENT_ID` in `fe/.env`
9. Restart both servers

Note: Google login only works for users who already have a PhotoClick account. Users must sign up with email/password first.

## Security Features

- JWT-based authentication with 24h token expiry
- bcrypt password hashing (backward-compatible upgrade from plaintext)
- Role-based access control on all protected endpoints
- IDOR protection (users can only access their own data)
- Rate limiting on auth endpoints (20 req/15min) and API (300 req/15min)
- Helmet security headers
- CORS restricted to frontend origin
- File upload validation (type, size, count limits)
- Input validation on all endpoints
- Secure password reset flow
- No secrets in source code (environment variables only)

## Production Deployment

### Backend

```bash
cd be
npm install --production
NODE_ENV=production node app.js
```

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start app.js --name photoclick-api
```

### Frontend

```bash
cd fe
npm run build
```

Serve the `build/` folder with nginx or any static file server.

### Production Checklist

- [ ] Set a strong, random `JWT_SECRET` (32+ characters)
- [ ] Set strong MySQL credentials (not root/empty)
- [ ] Configure HTTPS on both frontend and backend
- [ ] Update `SITE_URL` to production frontend URL
- [ ] Update `REACT_APP_API_URL` to production backend URL
- [ ] Set `API_BASE_URL` to public backend URL
- [ ] `REACT_APP_GOOGLE_MAPS_KEY` is optional (address fields use manual text entry)
- [ ] Configure Gmail App Password for email
- [ ] Set up database backups
- [ ] Ensure `.env` files are NOT in version control
- [ ] Set `NODE_ENV=production` on the server

## QA Documentation

Manual and API testing materials for this project live under [`qa/`](qa/). They are written for a **Junior QA Tester portfolio** (sample cases and reports — not a claim of professional QA employment).

| Document | Description |
|----------|-------------|
| [qa/README.md](qa/README.md) | QA pack overview and index |
| [qa/test-plan.md](qa/test-plan.md) | Scope, strategy, environments, entry/exit criteria |
| [qa/test-cases.md](qa/test-cases.md) | **80+** detailed manual test cases with IDs and priorities |
| [qa/bug-reports.md](qa/bug-reports.md) | Sample defect reports for portfolio use |
| [qa/api-test-scenarios.md](qa/api-test-scenarios.md) | API scenarios aligned with `be/routes/api.js` |
| [qa/traceability-matrix.md](qa/traceability-matrix.md) | Requirements ↔ test case mapping |
| [qa/postman/photoclick-api-collection.json](qa/postman/photoclick-api-collection.json) | Postman Collection v2.1 |

The QA pack includes:

- 80+ manual test cases  
- Sample bug reports  
- API test scenarios  
- Traceability matrix  
- Postman collection  
- Coverage for **authentication**, **booking flow**, **admin order management**, **role-based access**, **gallery**, **reports**, **form validation**, **manual address input** (no Google autocomplete), **Israel-local booking date validation**, and **booking success message** after submit  

Recent UI behavior documented in QA (no backend or database changes required to retest):

- **Address / venue:** free-text on New Booking, Sign up, and Profile — Google Places / Maps autocomplete removed  
- **Booking dates:** today or future in Israel local time; booking does not use the Reports “Year 2000–2100” message  
- **Gallery:** placeholder for broken or missing images  
- **Booking success:** after a successful `createOrder` response, customers see: *“Your booking request was submitted successfully and is now pending approval.”*

## License

All rights reserved. PhotoClick.
