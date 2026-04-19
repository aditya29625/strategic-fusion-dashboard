import axios from 'axios';
import type { IntelligenceNode, ApiResponse } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const http = axios.create({ baseURL: BASE, timeout: 10000 });

export const api = {
  getAll: (params?: Record<string, string>) =>
    http.get<ApiResponse<IntelligenceNode[]>>('/api/intelligence', { params }),

  getById: (id: string) =>
    http.get<ApiResponse<IntelligenceNode>>(`/api/intelligence/${id}`),

  deleteById: (id: string) =>
    http.delete(`/api/intelligence/${id}`),

  uploadCsv: (file: File, onProgress?: (p: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return http.post<ApiResponse<IntelligenceNode[]>>('/api/intelligence/upload/csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    });
  },

  uploadJson: (file: File, onProgress?: (p: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return http.post<ApiResponse<IntelligenceNode[]>>('/api/intelligence/upload/json', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    });
  },

  uploadXlsx: (file: File, onProgress?: (p: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return http.post<ApiResponse<IntelligenceNode[]>>('/api/intelligence/upload/xlsx', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    });
  },

  uploadImage: (
    file: File,
    meta: { latitude: string; longitude: string; title: string; description: string; threatLevel: string },
    onProgress?: (p: number) => void
  ) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(meta).forEach(([k, v]) => form.append(k, v));
    return http.post<ApiResponse<IntelligenceNode>>('/api/intelligence/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    });
  },

  health: () => http.get('/api/health'),
};
