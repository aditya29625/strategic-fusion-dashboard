import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import mongoose from 'mongoose';
import intelligenceRouter from './routes/intelligence';
import { mockIntelligenceData } from './services/mockData';
import { setUseInMemory } from './controllers/intelligenceController';
import { Intelligence } from './models/Intelligence';

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/intelligence', intelligenceRouter);

// Health check
app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: process.env.NODE_ENV })
);

// ── MongoDB ───────────────────────────────────────────────────────────────────
async function connectMongo() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/strategic-fusion';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅  MongoDB connected:', uri);

    // Seed if collection is empty
    const count = await Intelligence.countDocuments();
    if (count === 0) {
      console.log('🌱  Seeding', mockIntelligenceData.length, 'mock intelligence nodes...');
      await Intelligence.insertMany(mockIntelligenceData);
      console.log('✅  Seed complete');
    }
  } catch (err) {
    console.warn('⚠️   MongoDB unavailable — running in in-memory mode:', (err as Error).message);
    setUseInMemory(true);
  }
}

// ── Socket.IO — real-time feed ────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌  Client connected:', socket.id);
  socket.emit('connected', { message: 'Strategic Fusion Dashboard — Live Feed Active' });

  socket.on('disconnect', () => console.log('🔌  Client disconnected:', socket.id));
});

// Broadcast a new intelligence event every ~25 seconds (simulates real-time feed)
let feedIndex = 0;
setInterval(() => {
  const node = mockIntelligenceData[feedIndex % mockIntelligenceData.length];
  feedIndex++;
  const feedEvent = {
    ...node,
    nodeId: `FEED-${Date.now()}`,
    timestamp: new Date().toISOString(),
    _isLiveFeed: true,
  };
  io.emit('intelligence:new', feedEvent);
}, 25000);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

(async () => {
  await connectMongo();
  httpServer.listen(PORT, () => {
    console.log(`🚀  Strategic Fusion Server running on http://localhost:${PORT}`);
  });
})();

export { io };
