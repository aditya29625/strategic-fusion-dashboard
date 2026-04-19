import { create } from 'zustand';
import type { IntelligenceNode, FilterState, LiveFeedEntry } from '../types';

interface IntelligenceStore {
  nodes: IntelligenceNode[];
  filteredNodes: IntelligenceNode[];
  selectedNode: IntelligenceNode | null;
  filters: FilterState;
  liveFeed: LiveFeedEntry[];
  isLoading: boolean;
  lastUpdated: Date | null;
  // Actions
  setNodes: (nodes: IntelligenceNode[]) => void;
  addNode: (node: IntelligenceNode) => void;
  setSelectedNode: (node: IntelligenceNode | null) => void;
  setFilters: (partial: Partial<FilterState>) => void;
  addToLiveFeed: (entry: LiveFeedEntry) => void;
  setLoading: (loading: boolean) => void;
  applyFilters: () => void;
}

const defaultFilters: FilterState = {
  types: ['OSINT', 'HUMINT', 'IMINT'],
  threatLevels: ['Low', 'Medium', 'High', 'Critical'],
  search: '',
  dateFrom: '',
  dateTo: '',
};

export const useIntelStore = create<IntelligenceStore>((set, get) => ({
  nodes: [],
  filteredNodes: [],
  selectedNode: null,
  filters: defaultFilters,
  liveFeed: [],
  isLoading: false,
  lastUpdated: null,

  setNodes: (nodes) => {
    set({ nodes, lastUpdated: new Date() });
    get().applyFilters();
  },

  addNode: (node) => {
    const nodes = [node, ...get().nodes];
    set({ nodes });
    get().applyFilters();
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  setFilters: (partial) => {
    set({ filters: { ...get().filters, ...partial } });
    get().applyFilters();
  },

  addToLiveFeed: (entry) => {
    const feed = [entry, ...get().liveFeed].slice(0, 50); // keep last 50
    set({ liveFeed: feed });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  applyFilters: () => {
    const { nodes, filters } = get();
    let result = [...nodes];

    // Type filter
    if (filters.types.length > 0) {
      result = result.filter((n) => filters.types.includes(n.type));
    }

    // Threat filter
    if (filters.threatLevels.length < 4) {
      result = result.filter((n) => filters.threatLevels.includes(n.threatLevel));
    }

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.nodeId.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Date range
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      result = result.filter((n) => new Date(n.timestamp) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      result = result.filter((n) => new Date(n.timestamp) <= to);
    }

    set({ filteredNodes: result });
  },
}));

// UI store — panels, theme, notifications
interface UIStore {
  rightPanelOpen: boolean;
  leftSidebarOpen: boolean;
  showHeatmap: boolean;
  showClusters: boolean;
  mapLayer: 'street' | 'satellite' | 'terrain';
  isDark: boolean;
  notificationCount: number;
  timelinePlaying: boolean;
  timelineIdx: number;
  // Actions
  setRightPanel: (open: boolean) => void;
  setLeftSidebar: (open: boolean) => void;
  toggleHeatmap: () => void;
  toggleClusters: () => void;
  setMapLayer: (layer: 'street' | 'satellite' | 'terrain') => void;
  toggleTheme: () => void;
  setNotifications: (n: number) => void;
  setTimelinePlaying: (playing: boolean) => void;
  setTimelineIdx: (idx: number) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  rightPanelOpen: false,
  leftSidebarOpen: true,
  showHeatmap: false,
  showClusters: true,
  mapLayer: 'street',
  isDark: true,
  notificationCount: 3,
  timelinePlaying: false,
  timelineIdx: 0,

  setRightPanel: (open) => set({ rightPanelOpen: open }),
  setLeftSidebar: (open) => set({ leftSidebarOpen: open }),
  toggleHeatmap: () => set({ showHeatmap: !get().showHeatmap }),
  toggleClusters: () => set({ showClusters: !get().showClusters }),
  setMapLayer: (layer) => set({ mapLayer: layer }),
  toggleTheme: () => set({ isDark: !get().isDark }),
  setNotifications: (n) => set({ notificationCount: n }),
  setTimelinePlaying: (playing) => set({ timelinePlaying: playing }),
  setTimelineIdx: (idx) => set({ timelineIdx: idx }),
}));
