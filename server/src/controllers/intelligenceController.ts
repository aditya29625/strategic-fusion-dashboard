import { Request, Response } from 'express';
import { Intelligence, IIntelligence } from '../models/Intelligence';
import { mockIntelligenceData } from '../services/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory store used when MongoDB is unavailable
// ─────────────────────────────────────────────────────────────────────────────
let inMemoryStore: Partial<IIntelligence>[] = [...mockIntelligenceData];
let useInMemory = false;

export function setUseInMemory(val: boolean) {
  useInMemory = val;
}

export function addToInMemory(record: Partial<IIntelligence>) {
  inMemoryStore = [record, ...inMemoryStore];
}

// GET /api/intelligence
export async function getAll(req: Request, res: Response) {
  try {
    const { type, threat, search, from, to, limit = 200, skip = 0 } = req.query;

    if (useInMemory) {
      let results = [...inMemoryStore];
      if (type) results = results.filter((r) => r.type === type);
      if (threat) results = results.filter((r) => r.threatLevel === threat);
      if (search) {
        const q = (search as string).toLowerCase();
        results = results.filter(
          (r) =>
            r.title?.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q) ||
            r.nodeId?.toLowerCase().includes(q)
        );
      }
      if (from) results = results.filter((r) => r.timestamp! >= new Date(from as string));
      if (to) results = results.filter((r) => r.timestamp! <= new Date(to as string));
      return res.json({ success: true, count: results.length, data: results });
    }

    // MongoDB path
    const query: Record<string, unknown> = { isActive: true };
    if (type) query.type = type;
    if (threat) query.threatLevel = threat;
    if (search) query.$text = { $search: search as string };
    if (from || to) {
      query.timestamp = {};
      if (from) (query.timestamp as Record<string, unknown>).$gte = new Date(from as string);
      if (to) (query.timestamp as Record<string, unknown>).$lte = new Date(to as string);
    }

    const data = await Intelligence.find(query)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// GET /api/intelligence/:id
export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (useInMemory) {
      const item = inMemoryStore.find((r) => r.nodeId === id);
      if (!item) return res.status(404).json({ success: false, error: 'Not found' });
      return res.json({ success: true, data: item });
    }

    const item = await Intelligence.findOne({ nodeId: id, isActive: true });
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// DELETE /api/intelligence/:id
export async function deleteById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (useInMemory) {
      inMemoryStore = inMemoryStore.filter((r) => r.nodeId !== id);
      return res.json({ success: true, message: 'Deleted' });
    }

    await Intelligence.findOneAndUpdate({ nodeId: id }, { isActive: false });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}
