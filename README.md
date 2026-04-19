# 🛰️ Strategic Fusion Dashboard

> **Multi-source intelligence fusion platform for OSINT, HUMINT, and IMINT analysis**

A production-ready, analyst-grade **geospatial intelligence dashboard** built with React, Node.js, Express, and Socket.IO. It features real-time data ingestion, interactive mapping, hover-to-view image previews, and advanced filtering — all wrapped in a military-grade dark UI.

---

## 📸 Preview

![Strategic Fusion Dashboard](https://via.placeholder.com/1200x600/0a0f1a/00d4ff?text=Strategic+Fusion+Dashboard)

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

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19 + TypeScript** | UI framework with type safety |
| **Vite 8** | Fast build tool and dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **Leaflet + react-leaflet** | Interactive map rendering |
| **Leaflet.markercluster** | Marker clustering for dense data |
| **Socket.IO Client** | Real-time event streaming |
| **Zustand** | Lightweight global state management |
| **Axios** | HTTP client for API calls |
| **Framer Motion** | Smooth animations and transitions |
| **React Dropzone** | Drag-and-drop file uploads |
| **React Router DOM v7** | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe server code |
| **Socket.IO** | WebSocket real-time communication |
| **MongoDB + Mongoose** | Persistent data storage (optional) |
| **Multer** | Multipart file upload handling |
| **csv-parse** | CSV parsing for HUMINT uploads |
| **xlsx** | Excel file parsing |
| **AWS SDK** | S3 imagery ingestion (optional) |
| **dotenv** | Environment variable management |

---

## 🚀 Quick Start (Development)

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (optional — app works in in-memory mode without it)

### 1. Clone the Repository

```bash
git clone https://github.com/aditya29625/strategic-fusion-dashboard.git
cd strategic-fusion-dashboard
```

### 2. Start the Backend

```bash
cd server
npm install
npm run dev
```

> Server starts on **http://localhost:3001**
>
> ⚠️ If MongoDB is not running, the server automatically falls back to **in-memory mode** with 30+ pre-seeded mock intelligence nodes — no setup required.

### 3. Start the Frontend

```bash
cd ../client
npm install
npm run dev
```

> Frontend starts on **http://localhost:5173**

### 4. Open the App

Navigate to **http://localhost:5173**

**Demo credentials:**
- **Username:** `analyst`
- **Password:** `fusion2026`

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory (a template is already provided):

```env
PORT=3001
NODE_ENV=development

# MongoDB (optional — falls back to in-memory mode if not connected)
MONGODB_URI=mongodb://localhost:27017/strategic-fusion
# For MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/strategic-fusion

# AWS S3 (optional — for OSINT imagery ingestion)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-intelligence-bucket

# CORS
CORS_ORIGIN=http://localhost:5173
```

> All AWS and MongoDB fields are **optional**. The app is fully functional without them using mock data.

---

## 🐳 Docker Deployment

To run the full stack with Docker (including MongoDB):

```bash
cd strategic-fusion-dashboard
docker-compose up --build
```

Services started:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |
| MongoDB | localhost:27017 |

---

## 📡 API Reference

### Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/intelligence` | Fetch all intelligence nodes (supports filter params) |
| `GET` | `/api/intelligence/:id` | Get a single node by ID |
| `DELETE` | `/api/intelligence/:id` | Soft-delete a node |
| `POST` | `/api/intelligence/upload/csv` | Upload CSV → HUMINT markers |
| `POST` | `/api/intelligence/upload/json` | Upload JSON → markers |
| `POST` | `/api/intelligence/upload/xlsx` | Upload Excel → HUMINT markers |
| `POST` | `/api/intelligence/upload/image` | Upload image → IMINT marker |
| `GET` | `/api/health` | Health check |

### Query Parameters for `GET /api/intelligence`

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `type` | string | `OSINT` | Filter by intelligence type |
| `threat` | string | `Critical` | Filter by threat level |
| `search` | string | `vehicle` | Keyword search across all fields |
| `from` | ISO date | `2026-04-01T00:00:00Z` | Start date filter |
| `to` | ISO date | `2026-04-19T23:59:59Z` | End date filter |

---

## 📁 Project Structure

```
strategic-fusion-dashboard/
├── client/                         # Vite + React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # TopNav, LeftSidebar, RightPanel
│   │   │   └── map/               # MapView, MarkerPopup, MapControls
│   │   ├── pages/                  # LandingPage, LoginPage, DashboardPage
│   │   ├── store/                  # Zustand state (intel + UI slices)
│   │   ├── services/              # Axios API client
│   │   ├── types/                 # TypeScript interfaces & enums
│   │   └── index.css              # Design system (dark military theme)
│   ├── tailwind.config.js
│   └── vite.config.ts             # Vite config with API proxy
│
├── server/                         # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── models/                # Mongoose schema (IntelligenceNode)
│   │   ├── routes/                # Express API routes
│   │   ├── controllers/           # Intelligence & Upload controllers
│   │   └── services/             # Mock data seeder (30+ nodes)
│   ├── uploads/                   # Stored IMINT images
│   └── .env                       # Environment variables
│
├── sample-data/                   # Test files for upload features
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
| 🔵 **Blue** | OSINT | Open-source intelligence from MongoDB / S3 |
| 🟢 **Green** | HUMINT | Field reports from human sources (CSV / Excel / JSON upload) |
| 🔴 **Red** | IMINT | Imagery intelligence / satellite data (image upload) |

> ⚡ **High** and **Critical** threat markers render with an animated **pulse ring** for immediate visual priority.

---

## 📋 Testing with Sample Data

Use files in `sample-data/` to test the upload features:

1. **HUMINT CSV** — Drag `humint-sample.csv` into the *HUMINT UPLOAD* section in the left sidebar
2. **OSINT JSON** — Drag `osint-sample.json` into the *HUMINT UPLOAD* section
3. **IMINT Image** — Drag any `.jpg`/`.png` image into the *IMINT UPLOAD* section and enter lat/lng coordinates

---

## 🔌 Real-time Features (Socket.IO)

The dashboard uses Socket.IO for live intelligence streaming:

- Every ~25 seconds, a **simulated new intelligence event** is broadcast from the server
- A **toast notification** appears in the top-right corner with event details
- The **notification bell** in the top nav tracks unseen events (with a badge count)
- All new nodes are **immediately added to the map** without a page reload

---

## 🛡️ Security Notes

> This is a demonstration application. For production deployment, consider:

- [ ] Implement proper **JWT authentication** with refresh tokens
- [ ] Add **RBAC** (role-based access control) for analyst vs. admin roles
- [ ] Enable **HTTPS / TLS** with a certificate
- [ ] Store credentials in a **secrets manager** (AWS Secrets Manager, Vault)
- [ ] Add **rate limiting** to API endpoints (e.g., express-rate-limit)
- [ ] Enable **MongoDB Atlas IP whitelisting**
- [ ] Sanitize all user-uploaded file contents before processing

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ — Analyst-grade intelligence tooling for modern threat assessment*
