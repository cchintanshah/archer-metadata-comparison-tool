// ==========================================
// Application State Store (Zustand)
// ==========================================

import { create } from 'zustand';
import {
  ArcherEnvironment,
  CollectionOptions,
  ComparisonResult,
  ComparisonSummary,
  TabResults,
  CollectedMetadata,
  getDefaultCollectionOptions,
  createEmptyTabResults,
} from '../types';

export interface AppState {
  // Environments
  environments: ArcherEnvironment[];
  sourceEnvironment: ArcherEnvironment | null;
  targetEnvironment: ArcherEnvironment | null;
  
  // Collection
  collectionOptions: CollectionOptions;
  sourceMetadata: CollectedMetadata | null;
  targetMetadata: CollectedMetadata | null;
  
  // Comparison Results
  comparisonResults: ComparisonResult[];
  tabResults: TabResults;
  comparisonSummary: ComparisonSummary | null;
  
  // UI State
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  error: string | null;
  
  // Dialogs
  showEnvironmentDialog: boolean;
  showCollectionDialog: boolean;
  editingEnvironment: ArcherEnvironment | null;
  
  // Actions
  setEnvironments: (environments: ArcherEnvironment[]) => void;
  addEnvironment: (environment: ArcherEnvironment) => void;
  updateEnvironment: (environment: ArcherEnvironment) => void;
  deleteEnvironment: (id: string) => void;
  setSourceEnvironment: (environment: ArcherEnvironment | null) => void;
  setTargetEnvironment: (environment: ArcherEnvironment | null) => void;
  
  setCollectionOptions: (options: CollectionOptions) => void;
  setSourceMetadata: (metadata: CollectedMetadata | null) => void;
  setTargetMetadata: (metadata: CollectedMetadata | null) => void;
  
  setComparisonResults: (results: ComparisonResult[], tabResults: TabResults, summary: ComparisonSummary) => void;
  clearResults: () => void;
  
  setLoading: (isLoading: boolean, message?: string, progress?: number) => void;
  setError: (error: string | null) => void;
  
  setShowEnvironmentDialog: (show: boolean, editing?: ArcherEnvironment | null) => void;
  setShowCollectionDialog: (show: boolean) => void;
}

// Default summary
const defaultSummary: ComparisonSummary = {
  totalItems: 0,
  matchedCount: 0,
  mismatchedCount: 0,
  missingInSourceCount: 0,
  missingInTargetCount: 0,
  calculatedFieldStats: {
    matched: 0,
    mismatched: 0,
    formulaDifferences: 0,
  },
  byType: {} as ComparisonSummary['byType'],
};

// Load environments from localStorage
const loadEnvironments = (): ArcherEnvironment[] => {
  try {
    const saved = localStorage.getItem('archer_environments');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save environments to localStorage
const saveEnvironments = (environments: ArcherEnvironment[]) => {
  localStorage.setItem('archer_environments', JSON.stringify(environments));
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  environments: loadEnvironments(),
  sourceEnvironment: null,
  targetEnvironment: null,
  
  collectionOptions: getDefaultCollectionOptions(),
  sourceMetadata: null,
  targetMetadata: null,
  
  comparisonResults: [],
  tabResults: createEmptyTabResults(),
  comparisonSummary: defaultSummary,
  
  isLoading: false,
  loadingMessage: '',
  loadingProgress: 0,
  error: null,
  
  showEnvironmentDialog: false,
  showCollectionDialog: false,
  editingEnvironment: null,
  
  // Actions
  setEnvironments: (environments) => {
    saveEnvironments(environments);
    set({ environments });
  },
  
  addEnvironment: (environment) => {
    const environments = [...get().environments, environment];
    saveEnvironments(environments);
    set({ environments });
  },
  
  updateEnvironment: (environment) => {
    const environments = get().environments.map(e => 
      e.id === environment.id ? environment : e
    );
    saveEnvironments(environments);
    set({ environments });
  },
  
  deleteEnvironment: (id) => {
    const environments = get().environments.filter(e => e.id !== id);
    saveEnvironments(environments);
    
    const state = get();
    const updates: Partial<AppState> = { environments };
    
    if (state.sourceEnvironment?.id === id) {
      updates.sourceEnvironment = null;
    }
    if (state.targetEnvironment?.id === id) {
      updates.targetEnvironment = null;
    }
    
    set(updates);
  },
  
  setSourceEnvironment: (environment) => set({ sourceEnvironment: environment }),
  setTargetEnvironment: (environment) => set({ targetEnvironment: environment }),
  
  setCollectionOptions: (options) => set({ collectionOptions: options }),
  setSourceMetadata: (metadata) => set({ sourceMetadata: metadata }),
  setTargetMetadata: (metadata) => set({ targetMetadata: metadata }),
  
  setComparisonResults: (results, tabResults, summary) => set({ 
    comparisonResults: results,
    tabResults,
    comparisonSummary: summary,
  }),
  
  clearResults: () => set({ 
    comparisonResults: [],
    tabResults: createEmptyTabResults(),
    comparisonSummary: defaultSummary,
    sourceMetadata: null,
    targetMetadata: null,
  }),
  
  setLoading: (isLoading, message = '', progress = 0) => set({ 
    isLoading, 
    loadingMessage: message,
    loadingProgress: progress,
  }),
  
  setError: (error) => set({ error }),
  
  setShowEnvironmentDialog: (show, editing = null) => set({ 
    showEnvironmentDialog: show,
    editingEnvironment: editing,
  }),
  
  setShowCollectionDialog: (show) => set({ showCollectionDialog: show }),
}));

export default useAppStore;
