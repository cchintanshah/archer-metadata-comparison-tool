// ==========================================
// Results Summary Component
// ==========================================

import { CheckCircle, XCircle, AlertTriangle, MinusCircle, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export function ResultsSummary() {
  const { summary, environments, sourceEnvironmentId, targetEnvironmentId } = useAppStore();

  if (!summary) return null;

  const sourceEnv = environments.find(e => e.id === sourceEnvironmentId);
  const targetEnv = environments.find(e => e.id === targetEnvironmentId);

  const matchPercentage = summary.totalItems > 0 
    ? ((summary.matchedCount / summary.totalItems) * 100).toFixed(1)
    : '0';

  // Calculate types with issues
  const typesWithIssues = Object.entries(summary.byType)
    .filter(([, stats]) => stats.total > 0 && (stats.mismatched > 0 || stats.missingInSource > 0 || stats.missingInTarget > 0))
    .length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Comparison Summary</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Matched</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{summary.matchedCount}</div>
          <div className="text-xs text-green-600">{matchPercentage}% of total</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Mismatched</span>
          </div>
          <div className="text-2xl font-bold text-yellow-800">{summary.mismatchedCount}</div>
          <div className="text-xs text-yellow-600">Properties differ</div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">Not in {targetEnv?.displayName || 'Target'}</span>
          </div>
          <div className="text-2xl font-bold text-red-800">{summary.missingInTargetCount}</div>
          <div className="text-xs text-red-600">Source only</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MinusCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Not in {sourceEnv?.displayName || 'Source'}</span>
          </div>
          <div className="text-2xl font-bold text-orange-800">{summary.missingInSourceCount}</div>
          <div className="text-xs text-orange-600">Target only</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Match Rate</span>
          <span className="font-medium">{matchPercentage}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div 
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${(summary.matchedCount / summary.totalItems) * 100}%` }}
          />
          <div 
            className="bg-yellow-500 h-full transition-all duration-500"
            style={{ width: `${(summary.mismatchedCount / summary.totalItems) * 100}%` }}
          />
          <div 
            className="bg-red-500 h-full transition-all duration-500"
            style={{ width: `${(summary.missingInTargetCount / summary.totalItems) * 100}%` }}
          />
          <div 
            className="bg-orange-500 h-full transition-all duration-500"
            style={{ width: `${(summary.missingInSourceCount / summary.totalItems) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Total: {summary.totalItems} items compared</span>
          <span>{typesWithIssues} types with differences</span>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Breakdown by Type</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-medium text-gray-600">Type</th>
                <th className="text-right py-2 px-2 font-medium text-gray-600">Total</th>
                <th className="text-right py-2 px-2 font-medium text-green-600">Match</th>
                <th className="text-right py-2 px-2 font-medium text-yellow-600">Diff</th>
                <th className="text-right py-2 px-2 font-medium text-red-600">Missing</th>
                <th className="text-right py-2 px-2 font-medium text-orange-600">Extra</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.byType)
                .filter(([, stats]) => stats.total > 0)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([type, stats]) => (
                  <tr key={type} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium text-gray-900">{type}</td>
                    <td className="py-2 px-2 text-right text-gray-600">{stats.total}</td>
                    <td className="py-2 px-2 text-right text-green-600">{stats.matched}</td>
                    <td className="py-2 px-2 text-right text-yellow-600">{stats.mismatched}</td>
                    <td className="py-2 px-2 text-right text-red-600">{stats.missingInTarget}</td>
                    <td className="py-2 px-2 text-right text-orange-600">{stats.missingInSource}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
