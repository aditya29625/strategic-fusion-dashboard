# Strategic Fusion Dashboard

> **Multi-source intelligence fusion platform for OSINT, HUMINT, and IMINT analysis**

A production-ready, analyst-grade geospatial intelligence dashboard featuring real-time data ingestion, interactive mapping, hover-to-view image previews, and advanced filtering.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Interactive Map** | Leaflet terrain map with marker clustering, pulse animations, and heatmap overlay |
| 👁️ **Hover Popups** | Instant image + metadata preview on marker hover |
| 📡 **OSINT Ingestion** | Auto-polling from MongoDB & AWS S3 every 30 seconds |
| 📋 **HUMINT Upload** | Drag-and-drop CSV / Excel / JSON with instant marker generation |
| 🛰️ **IMINT Upload** | Imagery upload tied to lat/lng coordinates → red marker on map |
| 🔴 **Live Feed** | Socket.IO real-time notifications for new intelligence events |
| 🔍 **Advanced Filters** | Filter by type, threat level, date range, and keyword search |
| 📊 **Timeline** | Chronological event timeline in the right panel |
| 💾 **Export** | Export filtered node reports as text files |
| 🌑 **Dark Theme** | Military-grade dark UI with glassmorphism panels |

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB (optional — app works in in-memory mode without it)

### 1. Start the Backend

```bash
cd strategic-fusion-dashboard/server
npm install
npm run dev
```

Server starts on **http://localhost:3001**

> If MongoDB is not running, the server automatically falls back to in-memory mode with 30+ pre-seeded mock intelligence nodes.

### 2. Start the Frontend

```bash
cd strategic-fusion-dashboard/client
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**

### 3. Open the App

Navigate to `http://localhost:5173`

**Demo credentials:**
- Username: `analyst`
- Password: `fusion2026`

---

## 🐳 Docker Deployment

```bash
cd strategic-fusion-dashboard
docker-compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- MongoDB: `localhost:27017`

---

## ⚙️ Environment Variables

Copy `server/.env` and fill in your credentials:

```env
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/strategic-fusion
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket
CORS_ORIGIN=http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/intelligence` | Fetch all nodes (with filter params) |
| GET | `/api/intelligence/:id` | Get single node by ID |
| DELETE | `/api/intelligence/:id` | Soft-delete a node |
| POST | `/api/intelligence/upload/csv` | Upload CSV → HUMINT markers |
| POST | `/api/intelligence/upload/json` | Upload JSON → markers |
| POST | `/api/intelligence/upload/xlsx` | Upload Excel → HUMINT markers |
| POST | `/api/intelligence/upload/image` | Upload image → IMINT marker |
| GET | `/api/health` | Health check |

### Query Parameters for `GET /api/intelligence`

| Param | Type | Example |
|-------|------|---------|
| `type` | string | `OSINT`, `HUMINT`, `IMINT` |
| `threat` | string | `Critical`, `High`, `Medium`, `Low` |
| `search` | string | `vehicle` |
| `from` | ISO date | `2026-04-01T00:00:00Z` |
| `to` | ISO date | `2026-04-19T23:59:59Z` |

---

## 📁 Project Structure

```
strategic-fusion-dashboard/
├── client/                     # Vite + React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # TopNav, LeftSidebar, RightPanel
│   │   │   └── map/            # MapView, MarkerPopup, MapControls
│   │   ├── pages/              # LandingPage, LoginPage, DashboardPage
│   │   ├── store/              # Zustand state (intel + UI)
│   │   ├── services/           # API client (Axios)
│   │   ├── types/              # TypeScript interfaces
│   │   └── index.css           # Design system (dark military theme)
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── models/             # MongoDB Mongoose schema
│   │   ├── routes/             # Express routes
│   │   ├── controllers/        # Intelligence + Upload controllers
│   │   └── services/           # Mock data (30+ nodes)
│   └── uploads/                # Stored IMINT images
│
├── sample-data/                # Test files
│   ├── humint-sample.csv
│   └── osint-sample.json
│
├── docker-compose.yml
└── README.md
```

---

## 🗺️ Marker Color Coding

| Color | Type | Description |
|-------|------|-------------|
| 🔵 Blue | OSINT | Open-source intelligence from MongoDB/S3 |
| 🟢 Green | HUMINT | Field reports from human sources |
| 🔴 Red | IMINT | Imagery intelligence / satellite data |

High and Critical threat markers have a **pulse ring animation**.

---

## 📋 Sample Test Data

Use files in `sample-data/` to test the upload features:

1. **HUMINT CSV**: Drag `humint-sample.csv` into the HUMINT UPLOAD section in the left sidebar
2. **OSINT JSON**: Drag `osint-sample.json` into the HUMINT UPLOAD section
3. **IMINT Image**: Drag any `.jpg` image into the IMINT UPLOAD section, enter coordinates

---

## 🔌 Real-time Features

The dashboard uses Socket.IO for real-time updates:
- Every ~25 seconds, a simulated new intelligence event is broadcast
- A toast notification appears in the top-right corner
- The notification bell in the top nav tracks unseen events
- All new nodes are immediately added to the map

---

## 🛡️ Security Notes

This is a demonstration application. For production deployment:
- Implement proper JWT authentication
- Add RBAC (role-based access control)
- Enable HTTPS / TLS
- Store credentials in a secrets manager
- Add rate limiting to API endpoints
- Enable MongoDB Atlas IP whitelisting

---

*Built with ❤️ by Strategic Fusion Dashboard — Analyst-grade intelligence tooling*
