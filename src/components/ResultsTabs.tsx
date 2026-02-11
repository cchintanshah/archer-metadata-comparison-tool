// ==========================================
// Results Tabs Component
// 4 Tabs: Matched, Mismatched, Not in Source, Not in Target
// Collapsible categories within each tab
// ==========================================

import React, { useState } from 'react';
import {
  ComparisonResult,
  TabResults,
  CategorizedResults,
  ComparisonSummary,
  Severity,
} from '../types';
import { useAppStore } from '../store/appStore';

// Icons
const ChevronDown = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CheckCircle = () => (
  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ExclamationCircle = () => (
  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const XCircle = () => (
  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

interface CollapsibleCategoryProps {
  title: string;
  items: ComparisonResult[];
  defaultExpanded?: boolean;
  showDifferences?: boolean;
}

const CollapsibleCategory: React.FC<CollapsibleCategoryProps> = ({
  title,
  items,
  defaultExpanded = false,
  showDifferences = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (items.length === 0) return null;

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.Critical:
        return <XCircle />;
      case Severity.Warning:
        return <ExclamationCircle />;
      default:
        return <CheckCircle />;
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    const colors = {
      [Severity.Critical]: 'bg-red-100 text-red-800',
      [Severity.Warning]: 'bg-yellow-100 text-yellow-800',
      [Severity.Info]: 'bg-blue-100 text-blue-800',
    };
    return colors[severity] || colors[Severity.Info];
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
          <span className="font-medium text-gray-700">{title}</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm">
            {items.length}
          </span>
        </div>
      </button>

      {/* Category Items */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(item.severity)}
                    <span className="font-medium text-gray-900">{item.itemName}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </div>
                  
                  {/* GUID */}
                  <div className="mt-1 text-xs text-gray-500 font-mono">
                    GUID: {item.itemGuid}
                  </div>
                  
                  {/* Parent */}
                  {item.parentName && (
                    <div className="mt-1 text-sm text-gray-600">
                      Parent: {item.parentName}
                    </div>
                  )}

                  {/* Property Differences */}
                  {showDifferences && item.propertyDifferences && item.propertyDifferences.length > 0 && (
                    <div className="mt-2 bg-yellow-50 rounded p-2">
                      <div className="text-xs font-medium text-yellow-800 mb-1">
                        Differences ({item.propertyDifferences.length}):
                      </div>
                      <div className="space-y-1">
                        {item.propertyDifferences.map((diff, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium text-gray-700">{diff.propertyName}:</span>
                            {diff.isCalculationDifference ? (
                              <div className="mt-1 grid grid-cols-2 gap-2">
                                <div className="bg-red-50 p-1 rounded">
                                  <div className="text-red-700 font-medium">Source:</div>
                                  <code className="text-xs break-all">{diff.sourceValue}</code>
                                </div>
                                <div className="bg-green-50 p-1 rounded">
                                  <div className="text-green-700 font-medium">Target:</div>
                                  <code className="text-xs break-all">{diff.targetValue}</code>
                                </div>
                              </div>
                            ) : (
                              <span className="ml-1">
                                <span className="text-red-600">"{diff.sourceValue}"</span>
                                <span className="mx-1">→</span>
                                <span className="text-green-600">"{diff.targetValue}"</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TabContentProps {
  categories: CategorizedResults;
  showDifferences?: boolean;
}

const TabContent: React.FC<TabContentProps> = ({ categories, showDifferences = false }) => {
  const categoryOrder: { key: keyof CategorizedResults; title: string }[] = [
    { key: 'calculatedFields', title: '📊 Calculated Fields' },
    { key: 'fields', title: '📝 Fields' },
    { key: 'modules', title: '📦 Modules' },
    { key: 'layouts', title: '🎨 Layouts' },
    { key: 'valuesLists', title: '📋 Values Lists' },
    { key: 'valuesListValues', title: '📑 Values List Values' },
    { key: 'ddeRules', title: '⚡ DDE Rules' },
    { key: 'ddeActions', title: '🎯 DDE Actions' },
    { key: 'reports', title: '📈 Reports' },
    { key: 'dashboards', title: '📊 Dashboards' },
    { key: 'workspaces', title: '🏢 Workspaces' },
    { key: 'iViews', title: '👁️ iViews' },
    { key: 'roles', title: '👤 Roles' },
    { key: 'securityParameters', title: '🔒 Security Parameters' },
    { key: 'notifications', title: '🔔 Notifications' },
    { key: 'dataFeeds', title: '📥 Data Feeds' },
    { key: 'schedules', title: '📅 Schedules' },
  ];

  const totalItems = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No items in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categoryOrder.map(({ key, title }) => (
        <CollapsibleCategory
          key={key}
          title={title}
          items={categories[key]}
          defaultExpanded={key === 'calculatedFields' || key === 'fields'}
          showDifferences={showDifferences}
        />
      ))}
    </div>
  );
};

interface ResultsTabsProps {
  tabResults: TabResults;
  summary: ComparisonSummary;
}

type TabKey = 'matched' | 'mismatched' | 'notInSource' | 'notInTarget';

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ tabResults, summary }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('notInTarget');
  const { sourceEnvironment, targetEnvironment } = useAppStore();

  const sourceName = sourceEnvironment?.displayName || 'Source';
  const targetName = targetEnvironment?.displayName || 'Target';

  const tabs: { key: TabKey; label: string; count: number; color: string; bgColor: string }[] = [
    { 
      key: 'matched', 
      label: 'Matched', 
      count: summary.matchedCount,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
    },
    { 
      key: 'mismatched', 
      label: 'Mismatched', 
      count: summary.mismatchedCount,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
    },
    { 
      key: 'notInSource', 
      label: `Not in ${sourceName}`, 
      count: summary.missingInSourceCount,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
    },
    { 
      key: 'notInTarget', 
      label: `Not in ${targetName}`, 
      count: summary.missingInTargetCount,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative
              ${activeTab === tab.key 
                ? `${tab.color} border-b-2 ${tab.key === 'matched' ? 'border-green-500' : tab.key === 'mismatched' ? 'border-yellow-500' : tab.key === 'notInSource' ? 'border-orange-500' : 'border-red-500'}` 
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <span>{tab.label}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs
              ${activeTab === tab.key ? tab.bgColor : 'bg-gray-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {activeTab === 'matched' && (
          <TabContent categories={tabResults.matched} />
        )}
        {activeTab === 'mismatched' && (
          <TabContent categories={tabResults.mismatched} showDifferences />
        )}
        {activeTab === 'notInSource' && (
          <TabContent categories={tabResults.notInSource} />
        )}
        {activeTab === 'notInTarget' && (
          <TabContent categories={tabResults.notInTarget} />
        )}
      </div>

      {/* Calculated Fields Summary */}
      {summary.calculatedFieldStats && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Calculated Fields Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-100 rounded p-2">
              <div className="text-lg font-bold text-green-600">
                {summary.calculatedFieldStats.matched}
              </div>
              <div className="text-xs text-green-700">Matched</div>
            </div>
            <div className="bg-yellow-100 rounded p-2">
              <div className="text-lg font-bold text-yellow-600">
                {summary.calculatedFieldStats.mismatched}
              </div>
              <div className="text-xs text-yellow-700">Mismatched</div>
            </div>
            <div className="bg-red-100 rounded p-2">
              <div className="text-lg font-bold text-red-600">
                {summary.calculatedFieldStats.formulaDifferences}
              </div>
              <div className="text-xs text-red-700">Formula Diffs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTabs;
