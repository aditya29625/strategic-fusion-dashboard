import mongoose, { Schema, Document } from 'mongoose';

export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IntelType = 'OSINT' | 'HUMINT' | 'IMINT';

export interface IIntelligence extends Document {
  nodeId: string;
  type: IntelType;
  title: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  description: string;
  imageUrl?: string;
  threatLevel: ThreatLevel;
  source: string;
  tags?: string[];
  reporterId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IntelligenceSchema = new Schema<IIntelligence>(
  {
    nodeId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['OSINT', 'HUMINT', 'IMINT'], required: true },
    title: { type: String, required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    timestamp: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    imageUrl: { type: String },
    threatLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    source: { type: String, required: true },
    tags: [{ type: String }],
    reporterId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index
IntelligenceSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Geo query support
IntelligenceSchema.index({ latitude: 1, longitude: 1 });

export const Intelligence = mongoose.model<IIntelligence>('Intelligence', IntelligenceSchema);
