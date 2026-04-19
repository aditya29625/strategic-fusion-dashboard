import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Intelligence, IIntelligence, ThreatLevel, IntelType } from '../models/Intelligence';
import { addToInMemory, setUseInMemory } from './intelligenceController';

// Helper to normalize a row into an intelligence node
function normalizeRow(row: Record<string, string>, index: number): Partial<IIntelligence> {
  const lat = parseFloat(row.latitude || row.lat || row.Latitude || '0');
  const lng = parseFloat(row.longitude || row.lng || row.lon || row.Longitude || '0');
  return {
    nodeId: row.id || row.nodeId || `HUMINT-UPLOAD-${Date.now()}-${index}`,
    type: (row.type || 'HUMINT') as IntelType,
    title: row.title || row.Title || `Uploaded Record ${index + 1}`,
    latitude: isNaN(lat) ? 28.6139 : lat,
    longitude: isNaN(lng) ? 77.209 : lng,
    timestamp: row.time || row.timestamp ? new Date(row.time || row.timestamp) : new Date(),
    description: row.description || row.desc || row.Description || '',
    threatLevel: (row.threat || row.threatLevel || 'Medium') as ThreatLevel,
    source: 'HUMINT-Upload',
    tags: ['uploaded'],
    isActive: true,
  };
}

// POST /api/upload/csv
export async function uploadCsv(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const content = fs.readFileSync(req.file.path, 'utf8');
    const rows: Record<string, string>[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const nodes = rows.map(normalizeRow);
    await saveNodes(nodes);

    fs.unlinkSync(req.file.path);
    res.json({ success: true, count: nodes.length, data: nodes });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// POST /api/upload/json
export async function uploadJson(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const content = fs.readFileSync(req.file.path, 'utf8');
    const parsed = JSON.parse(content);
    const rows: Record<string, string>[] = Array.isArray(parsed) ? parsed : [parsed];

    const nodes = rows.map(normalizeRow);
    await saveNodes(nodes);

    fs.unlinkSync(req.file.path);
    res.json({ success: true, count: nodes.length, data: nodes });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// POST /api/upload/xlsx
export async function uploadXlsx(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet);

    const nodes = rows.map(normalizeRow);
    await saveNodes(nodes);

    fs.unlinkSync(req.file.path);
    res.json({ success: true, count: nodes.length, data: nodes });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// POST /api/upload/image  -- IMINT image upload
export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const { latitude, longitude, title, description, threatLevel } = req.body;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'Valid latitude and longitude are required' });
    }

    const filename = req.file.filename;
    const imageUrl = `/uploads/${filename}`;

    const node: Partial<IIntelligence> = {
      nodeId: `IMINT-UPLOAD-${Date.now()}`,
      type: 'IMINT',
      title: title || `IMINT Image ${Date.now()}`,
      latitude: lat,
      longitude: lng,
      timestamp: new Date(),
      description: description || 'Image uploaded by analyst',
      imageUrl,
      threatLevel: (threatLevel || 'Medium') as ThreatLevel,
      source: 'IMINT-Upload',
      tags: ['image', 'uploaded'],
      isActive: true,
    };

    await saveNodes([node]);
    res.json({ success: true, data: node });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

async function saveNodes(nodes: Partial<IIntelligence>[]) {
  try {
    await Intelligence.insertMany(nodes, { ordered: false });
  } catch {
    // MongoDB unavailable — use in-memory
    nodes.forEach((n) => addToInMemory(n));
  }
}
