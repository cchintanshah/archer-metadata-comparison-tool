// ==========================================
// API Client - Connects to .NET Backend
// ==========================================

import {
  ArcherEnvironment,
  CollectedMetadata,
  CollectionOptions,
  ComparisonResult,
  ComparisonSummary,
  Module,
} from '@/types';

// API Base URL - Configure based on environment
const API_BASE_URL = 'https://localhost:7001/api';

// Helper for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// ==========================================
// Environment API
// ==========================================

export async function getEnvironments(): Promise<ArcherEnvironment[]> {
  return apiRequest<ArcherEnvironment[]>('/environments');
}

export async function createEnvironment(
  environment: Omit<ArcherEnvironment, 'id'>
): Promise<ArcherEnvironment> {
  return apiRequest<ArcherEnvironment>('/environments', {
    method: 'POST',
    body: JSON.stringify(environment),
  });
}

export async function updateEnvironment(
  id: string,
  environment: Partial<ArcherEnvironment>
): Promise<ArcherEnvironment> {
  return apiRequest<ArcherEnvironment>(`/environments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(environment),
  });
}

export async function deleteEnvironmentApi(id: string): Promise<void> {
  await apiRequest<void>(`/environments/${id}`, {
    method: 'DELETE',
  });
}

export async function testEnvironmentConnection(
  id: string
): Promise<{ success: boolean; message: string; version?: string }> {
  return apiRequest<{ success: boolean; message: string; version?: string }>(
    `/environments/${id}/test`
  );
}

// ==========================================
// Metadata API
// ==========================================

export async function getModulesFromEnvironment(
  environmentId: string
): Promise<Module[]> {
  return apiRequest<Module[]>(`/metadata/${environmentId}/modules`);
}

export async function collectMetadataFromApi(
  environmentId: string,
  options: CollectionOptions,
  onProgress?: (message: string, progress: number) => void
): Promise<CollectedMetadata> {
  // For real-time progress, we could use SignalR or SSE
  // For simplicity, we'll use polling or a single request
  
  if (onProgress) {
    onProgress('Collecting metadata...', 0);
  }

  const result = await apiRequest<CollectedMetadata>(
    `/metadata/${environmentId}/collect`,
    {
      method: 'POST',
      body: JSON.stringify(options),
    }
  );

  if (onProgress) {
    onProgress('Collection complete', 100);
  }

  return result;
}

// ==========================================
// Comparison API
// ==========================================

export interface ComparisonRequest {
  sourceEnvironmentId: string;
  targetEnvironmentId: string;
  options: CollectionOptions;
}

export interface ComparisonResponse {
  results: ComparisonResult[];
  summary: ComparisonSummary;
  sourceMetadata: CollectedMetadata;
  targetMetadata: CollectedMetadata;
}

export async function compareEnvironments(
  request: ComparisonRequest
): Promise<ComparisonResponse> {
  return apiRequest<ComparisonResponse>('/comparison/compare', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ==========================================
// Export API
// ==========================================

export async function exportToExcelApi(
  sourceName: string,
  targetName: string,
  results: ComparisonResult[],
  summary: ComparisonSummary
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/excel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceName,
      targetName,
      results,
      summary,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to export to Excel');
  }

  return response.blob();
}

// ==========================================
// Fallback Mode - Use Mock Data
// ==========================================

let useMockMode = true;

export function setMockMode(enabled: boolean) {
  useMockMode = enabled;
}

export function isMockMode(): boolean {
  return useMockMode;
}

// Check if backend is available
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
