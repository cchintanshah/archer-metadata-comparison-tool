// ==========================================
// Environment Selector Component
// ==========================================

import React from 'react';
import { useAppStore } from '../store/appStore';
import { ArcherEnvironment } from '../types';

export const EnvironmentSelector: React.FC = () => {
  const {
    environments,
    sourceEnvironment,
    targetEnvironment,
    setSourceEnvironment,
    setTargetEnvironment,
    setShowEnvironmentDialog,
    deleteEnvironment,
  } = useAppStore();

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const env = environments.find(e => e.id === id) || null;
    setSourceEnvironment(env);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const env = environments.find(e => e.id === id) || null;
    setTargetEnvironment(env);
  };

  const handleEdit = (env: ArcherEnvironment) => {
    setShowEnvironmentDialog(true, env);
  };

  const handleDelete = (env: ArcherEnvironment) => {
    if (confirm(`Are you sure you want to delete "${env.displayName}"?`)) {
      deleteEnvironment(env.id);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center gap-8">
        {/* Source Environment */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Environment
          </label>
          <div className="flex gap-2">
            <select
              value={sourceEnvironment?.id || ''}
              onChange={handleSourceChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select source environment...</option>
              {environments.map(env => (
                <option key={env.id} value={env.id} disabled={env.id === targetEnvironment?.id}>
                  {env.displayName}
                </option>
              ))}
            </select>
            {sourceEnvironment && (
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(sourceEnvironment)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(sourceEnvironment)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {sourceEnvironment && (
            <div className="mt-1 text-xs text-gray-500">
              {sourceEnvironment.baseUrl}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        {/* Target Environment */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Environment
          </label>
          <div className="flex gap-2">
            <select
              value={targetEnvironment?.id || ''}
              onChange={handleTargetChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select target environment...</option>
              {environments.map(env => (
                <option key={env.id} value={env.id} disabled={env.id === sourceEnvironment?.id}>
                  {env.displayName}
                </option>
              ))}
            </select>
            {targetEnvironment && (
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(targetEnvironment)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(targetEnvironment)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {targetEnvironment && (
            <div className="mt-1 text-xs text-gray-500">
              {targetEnvironment.baseUrl}
            </div>
          )}
        </div>

        {/* Add Environment Button */}
        <button
          onClick={() => setShowEnvironmentDialog(true, null)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Environment</span>
        </button>
      </div>
    </div>
  );
};

export default EnvironmentSelector;
