// ==========================================
// Results Summary Component
// ==========================================

import React from 'react';
import { useAppStore } from '../store/appStore';
import { ComparisonType } from '../types';

export const ResultsSummary: React.FC = () => {
  const { comparisonSummary, sourceEnvironment, targetEnvironment } = useAppStore();

  if (!comparisonSummary || comparisonSummary.totalItems === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Comparison Results</h3>
        <p className="text-gray-500">Select source and target environments, then click "Compare Environments" to see results.</p>
      </div>
    );
  }

  const { totalItems, matchedCount, mismatchedCount, missingInSourceCount, missingInTargetCount, byType } = comparisonSummary;
  const matchPercentage = totalItems > 0 ? Math.round((matchedCount / totalItems) * 100) : 0;

  const statCards = [
    { label: 'Total Items', value: totalItems, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Matched', value: matchedCount, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Mismatched', value: mismatchedCount, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: `Not in ${sourceEnvironment?.displayName || 'Source'}`, value: missingInSourceCount, color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    { label: `Not in ${targetEnvironment?.displayName || 'Target'}`, value: missingInTargetCount, color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  ];

  // Get stats for main metadata types
  const mainTypes = [
    ComparisonType.CalculatedField,
    ComparisonType.Field,
    ComparisonType.Module,
    ComparisonType.DDERule,
    ComparisonType.DDEAction,
    ComparisonType.ValuesList,
    ComparisonType.Layout,
    ComparisonType.Report,
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Match Rate Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Match Rate</span>
          <span className="text-sm font-bold text-green-600">{matchPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${matchPercentage}%` }}
          />
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Breakdown by Metadata Type</h3>
        <div className="grid grid-cols-4 gap-2">
          {mainTypes.map((type) => {
            const stats = byType[type];
            if (!stats || stats.total === 0) return null;
            
            return (
              <div key={type} className="bg-gray-50 rounded p-2 text-center">
                <div className="text-xs text-gray-500 truncate" title={type}>
                  {type}
                </div>
                <div className="text-lg font-bold text-gray-800">{stats.total}</div>
                <div className="flex justify-center gap-1 text-xs">
                  {stats.matched > 0 && (
                    <span className="text-green-600">{stats.matched}✓</span>
                  )}
                  {stats.mismatched > 0 && (
                    <span className="text-yellow-600">{stats.mismatched}≠</span>
                  )}
                  {(stats.missingInSource + stats.missingInTarget) > 0 && (
                    <span className="text-red-600">{stats.missingInSource + stats.missingInTarget}✗</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;
