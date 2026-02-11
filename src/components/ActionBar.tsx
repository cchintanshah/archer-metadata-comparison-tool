// ==========================================
// Action Bar Component
// Compare and Export functionality
// ==========================================

import React from 'react';
import { useAppStore } from '../store/appStore';
import { compareEnvironments } from '../services/comparisonEngine';
import { exportToCSV, exportToText } from '../services/excelExporter';
import { collectMetadata, CollectionProgress } from '../services/metadataCollector';

export const ActionBar: React.FC = () => {
  const {
    sourceEnvironment,
    targetEnvironment,
    collectionOptions,
    isLoading,
    loadingMessage,
    loadingProgress,
    comparisonResults,
    comparisonSummary,
    tabResults,
    setLoading,
    setSourceMetadata,
    setTargetMetadata,
    setComparisonResults,
    setError,
    setShowCollectionDialog,
  } = useAppStore();

  const canCompare = sourceEnvironment && targetEnvironment && 
    sourceEnvironment.id !== targetEnvironment.id;

  const handleCompare = async () => {
    if (!sourceEnvironment || !targetEnvironment) return;

    try {
      setLoading(true, 'Initializing...', 0);
      setError(null);

      // Progress callback
      const onProgress = (progress: CollectionProgress) => {
        setLoading(true, `${progress.currentStep}: ${progress.currentItem}`, progress.progress);
      };

      // Collect source metadata
      setLoading(true, 'Collecting from source environment...', 10);
      const sourceData = await collectMetadata(
        sourceEnvironment,
        collectionOptions,
        onProgress,
        true
      );
      setSourceMetadata(sourceData);

      // Collect target metadata
      setLoading(true, 'Collecting from target environment...', 50);
      const targetData = await collectMetadata(
        targetEnvironment,
        collectionOptions,
        onProgress,
        false
      );
      setTargetMetadata(targetData);

      // Run comparison
      setLoading(true, 'Comparing metadata using GUID matching...', 80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { results, tabResults, summary } = compareEnvironments(sourceData, targetData);

      setLoading(true, 'Finalizing results...', 95);
      await new Promise(resolve => setTimeout(resolve, 300));

      setComparisonResults(results, tabResults, summary);
      setLoading(false);

    } catch (error) {
      console.error('Comparison error:', error);
      setError(error instanceof Error ? error.message : 'Comparison failed');
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (comparisonResults.length === 0 || !comparisonSummary) return;
    exportToCSV(
      comparisonResults,
      comparisonSummary,
      sourceEnvironment?.displayName || 'Source',
      targetEnvironment?.displayName || 'Target'
    );
  };

  const handleExportText = () => {
    if (!comparisonSummary) return;
    exportToText(
      tabResults,
      comparisonSummary,
      sourceEnvironment?.displayName || 'Source',
      targetEnvironment?.displayName || 'Target'
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Collection Options Button */}
          <button
            onClick={() => setShowCollectionDialog(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Configure Collection</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={!canCompare || isLoading}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
              ${canCompare && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Compare Environments</span>
              </>
            )}
          </button>
        </div>

        {/* Export Buttons */}
        {comparisonResults.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportText}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">{loadingMessage}</span>
            <span className="text-sm text-gray-600">{loadingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionBar;
