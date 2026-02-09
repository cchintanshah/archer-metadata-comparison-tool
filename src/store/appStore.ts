// ==========================================
// App Store - Global State Management
// ==========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ArcherEnvironment,
  CollectionOptions,
  ComparisonResult,
  ComparisonSummary,
  getDefaultCollectionOptions,
  createEnvironment,
  Module,
} from '@/types';

interface AppState {
  // Environments
  environments: ArcherEnvironment[];
  sourceEnvironmentId: string | null;
  targetEnvironmentId: string | null;
  
  // Collection options
  collectionOptions: CollectionOptions;
  availableModules: Module[];
  
  // Comparison state
  isComparing: boolean;
  comparisonProgress: number;
  comparisonStatus: string;
  results: ComparisonResult[];
  summary: ComparisonSummary | null;
  
  // UI state
  activeTab: 'notInTarget' | 'notInSource' | 'mismatches' | 'matched';
  showEnvironmentDialog: boolean;
  showCollectionDialog: boolean;
  editingEnvironment: ArcherEnvironment | null;
  
  // Actions
  addEnvironment: (env: Omit<ArcherEnvironment, 'id'>) => void;
  updateEnvironment: (id: string, env: Partial<ArcherEnvironment>) => void;
  deleteEnvironment: (id: string) => void;
  setSourceEnvironment: (id: string | null) => void;
  setTargetEnvironment: (id: string | null) => void;
  setCollectionOptions: (options: Partial<CollectionOptions>) => void;
  setAvailableModules: (modules: Module[]) => void;
  setComparing: (comparing: boolean) => void;
  setComparisonProgress: (progress: number, status: string) => void;
  setResults: (results: ComparisonResult[], summary: ComparisonSummary) => void;
  clearResults: () => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setShowEnvironmentDialog: (show: boolean, editing?: ArcherEnvironment | null) => void;
  setShowCollectionDialog: (show: boolean) => void;
}

// Sample environments for demo
const sampleEnvironments: ArcherEnvironment[] = [
  {
    id: 'env-1',
    displayName: 'Production',
    baseUrl: 'https://archer-prod.company.com',
    instanceName: 'ArcherProd',
    username: 'admin',
    encryptedPassword: 'encrypted_password_1',
  },
  {
    id: 'env-2',
    displayName: 'Development',
    baseUrl: 'https://archer-dev.company.com',
    instanceName: 'ArcherDev',
    username: 'admin',
    encryptedPassword: 'encrypted_password_2',
  },
  {
    id: 'env-3',
    displayName: 'UAT',
    baseUrl: 'https://archer-uat.company.com',
    instanceName: 'ArcherUAT',
    username: 'admin',
    encryptedPassword: 'encrypted_password_3',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      environments: sampleEnvironments,
      sourceEnvironmentId: null,
      targetEnvironmentId: null,
      collectionOptions: getDefaultCollectionOptions(),
      availableModules: [],
      isComparing: false,
      comparisonProgress: 0,
      comparisonStatus: '',
      results: [],
      summary: null,
      activeTab: 'mismatches',
      showEnvironmentDialog: false,
      showCollectionDialog: false,
      editingEnvironment: null,
      
      // Actions
      addEnvironment: (env) => set((state) => ({
        environments: [...state.environments, createEnvironment(env)],
      })),
      
      updateEnvironment: (id, updates) => set((state) => ({
        environments: state.environments.map((env) =>
          env.id === id ? { ...env, ...updates } : env
        ),
      })),
      
      deleteEnvironment: (id) => set((state) => ({
        environments: state.environments.filter((env) => env.id !== id),
        sourceEnvironmentId: state.sourceEnvironmentId === id ? null : state.sourceEnvironmentId,
        targetEnvironmentId: state.targetEnvironmentId === id ? null : state.targetEnvironmentId,
      })),
      
      setSourceEnvironment: (id) => set({ sourceEnvironmentId: id }),
      setTargetEnvironment: (id) => set({ targetEnvironmentId: id }),
      
      setCollectionOptions: (options) => set((state) => ({
        collectionOptions: { ...state.collectionOptions, ...options },
      })),
      
      setAvailableModules: (modules) => set({ availableModules: modules }),
      
      setComparing: (comparing) => set({ isComparing: comparing }),
      
      setComparisonProgress: (progress, status) => set({
        comparisonProgress: progress,
        comparisonStatus: status,
      }),
      
      setResults: (results, summary) => set({
        results,
        summary,
        isComparing: false,
        comparisonProgress: 100,
        comparisonStatus: 'Comparison complete',
      }),
      
      clearResults: () => set({
        results: [],
        summary: null,
        comparisonProgress: 0,
        comparisonStatus: '',
      }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setShowEnvironmentDialog: (show, editing = null) => set({
        showEnvironmentDialog: show,
        editingEnvironment: editing,
      }),
      
      setShowCollectionDialog: (show) => set({ showCollectionDialog: show }),
    }),
    {
      name: 'archer-comparison-store',
      partialize: (state) => ({
        environments: state.environments,
        collectionOptions: state.collectionOptions,
      }),
    }
  )
);
