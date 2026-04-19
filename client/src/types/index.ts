// Core intelligence node type
export type IntelType = 'OSINT' | 'HUMINT' | 'IMINT';
export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface IntelligenceNode {
  _id?: string;
  nodeId: string;
  type: IntelType;
  title: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  description: string;
  imageUrl?: string;
  threatLevel: ThreatLevel;
  source: string;
  tags?: string[];
  reporterId?: string;
  isActive?: boolean;
  _isLiveFeed?: boolean;
}

export interface FilterState {
  types: IntelType[];
  threatLevels: ThreatLevel[];
  search: string;
  dateFrom: string;
  dateTo: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

export interface LiveFeedEntry {
  nodeId: string;
  type: IntelType;
  title: string;
  timestamp: string;
  threatLevel: ThreatLevel;
}
