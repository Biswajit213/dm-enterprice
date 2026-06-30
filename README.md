# Coffee Haven ☕

A premium full-stack coffee shop website built with React, Node.js, Express, and MongoDB.

## Project Structure

```
coffee-shop/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Node.js + Express backend
├── package.json     # Root with concurrently scripts
└── README.md
```

## Tech Stack

**Frontend:** React 18, React Router v6, Axios, Tailwind CSS, React Hot Toast  
**Backend:** Node.js, Express, JWT Auth, Google OAuth 2.0, Passport.js  
**Database:** MongoDB Atlas + Mongoose  
**Storage:** Cloudinary (images)  
**Payments:** Stripe

---

## Quick Start

### 1. Install Dependencies

```bash
cd coffee-shop
npm run install:all
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Fill in all values in `server/.env`:

| Variable | Where to get it |
|---|---|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) |
| `JWT_SECRET` | Any long random string |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) |
| `CLOUDINARY_*` | [Cloudinary Dashboard](https://cloudinary.com) |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) |
| `SMTP_*` | Your email provider (Gmail, etc.) |

### 3. Run Development

```bash
cd coffee-shop
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000/api

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Secret to `.env`

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/google` | Public | Google OAuth |
| GET | `/api/auth/profile` | User | Get profile |
| GET | `/api/products` | Public | List products |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/cart` | User | Get cart |
| POST | `/api/cart` | User | Update cart |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/my` | User | My orders |
| GET | `/api/admin/dashboard` | Admin | Analytics |
| GET | `/api/admin/users` | Admin | All users |

---

## Deployment

### Backend → Render

1. Create a new Web Service on [Render](https://render.com)
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables

### Frontend → Vercel

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Root directory: `client`
4. Add environment variable: `VITE_API_URL=https://your-render-app.onrender.com`
5. Update `vite.config.js` proxy or use the env variable

### Database → MongoDB Atlas

1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Copy connection string to `MONGO_URI`

---

## Default Admin Account

After setting up, manually update a user's role in MongoDB:

```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## Features Summary

- Public pages: Home, Menu, About, Contact
- Auth: JWT + Google OAuth 2.0 + Email verification + Password reset
- User: Dashboard, Profile, Orders, Favorites, Cart, Checkout
- Payments: Cash on Delivery + Stripe
- Reviews: Star rating + comment system
- Search: Text search + category + price filter + sorting
- Admin: Dashboard analytics, Product CRUD, Order management, User management
- Security: Helmet, Rate limiting, MongoDB sanitization, bcrypt, CORS
