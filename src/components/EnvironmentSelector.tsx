// ==========================================
// Environment Selector Component
// ==========================================

import { Plus, Edit2, Trash2, Server } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils/cn';

export function EnvironmentSelector() {
  const {
    environments,
    sourceEnvironmentId,
    targetEnvironmentId,
    setSourceEnvironment,
    setTargetEnvironment,
    setShowEnvironmentDialog,
    deleteEnvironment,
  } = useAppStore();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this environment?')) {
      deleteEnvironment(id);
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const env = environments.find(e => e.id === id);
    if (env) {
      setShowEnvironmentDialog(true, env);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          Environment Selection
        </h2>
        <button
          onClick={() => setShowEnvironmentDialog(true, null)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Environment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Environment
          </label>
          <div className="relative">
            <select
              value={sourceEnvironmentId || ''}
              onChange={(e) => setSourceEnvironment(e.target.value || null)}
              className={cn(
                "w-full px-4 py-3 bg-white border rounded-lg appearance-none cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "text-gray-900 font-medium",
                sourceEnvironmentId ? "border-blue-300 bg-blue-50" : "border-gray-300"
              )}
            >
              <option value="">Select source environment...</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id} disabled={env.id === targetEnvironmentId}>
                  {env.displayName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {sourceEnvironmentId && (
            <div className="mt-2 text-sm text-gray-500">
              {environments.find(e => e.id === sourceEnvironmentId)?.baseUrl}
            </div>
          )}
        </div>

        {/* Target Environment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Environment
          </label>
          <div className="relative">
            <select
              value={targetEnvironmentId || ''}
              onChange={(e) => setTargetEnvironment(e.target.value || null)}
              className={cn(
                "w-full px-4 py-3 bg-white border rounded-lg appearance-none cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "text-gray-900 font-medium",
                targetEnvironmentId ? "border-green-300 bg-green-50" : "border-gray-300"
              )}
            >
              <option value="">Select target environment...</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id} disabled={env.id === sourceEnvironmentId}>
                  {env.displayName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {targetEnvironmentId && (
            <div className="mt-2 text-sm text-gray-500">
              {environments.find(e => e.id === targetEnvironmentId)?.baseUrl}
            </div>
          )}
        </div>
      </div>

      {/* Environment Cards */}
      {environments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Configured Environments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {environments.map((env) => (
              <div
                key={env.id}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  env.id === sourceEnvironmentId 
                    ? "border-blue-300 bg-blue-50" 
                    : env.id === targetEnvironmentId
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{env.displayName}</h4>
                    <p className="text-xs text-gray-500 truncate">{env.instanceName}</p>
                    <p className="text-xs text-gray-400 truncate mt-1">{env.baseUrl}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => handleEdit(env.id, e)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(env.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
