// ==========================================
// Collection Options Dialog Component
// Configure which metadata types to collect
// ==========================================

import React from 'react';
import { useAppStore } from '../store/appStore';
import { CollectionOptions } from '../types';

interface OptionCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

const OptionCheckbox: React.FC<OptionCheckboxProps> = ({ label, checked, onChange, description }) => (
  <label className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
    />
    <div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
    </div>
  </label>
);

export const CollectionOptionsDialog: React.FC = () => {
  const {
    showCollectionDialog,
    collectionOptions,
    setCollectionOptions,
    setShowCollectionDialog,
  } = useAppStore();

  const updateOption = <K extends keyof CollectionOptions>(key: K, value: CollectionOptions[K]) => {
    setCollectionOptions({ ...collectionOptions, [key]: value });
  };

  const selectAll = () => {
    setCollectionOptions({
      ...collectionOptions,
      includeModules: true,
      includeFields: true,
      includeCalculatedFields: true,
      includeLayouts: true,
      includeValuesLists: true,
      includeValuesListValues: true,
      includeDDERules: true,
      includeDDEActions: true,
      includeReports: true,
      includeDashboards: true,
      includeWorkspaces: true,
      includeIViews: true,
      includeRoles: true,
      includeSecurityParameters: true,
      includeNotifications: true,
      includeDataFeeds: true,
      includeSchedules: true,
    });
  };

  const selectNone = () => {
    setCollectionOptions({
      ...collectionOptions,
      includeModules: false,
      includeFields: false,
      includeCalculatedFields: false,
      includeLayouts: false,
      includeValuesLists: false,
      includeValuesListValues: false,
      includeDDERules: false,
      includeDDEActions: false,
      includeReports: false,
      includeDashboards: false,
      includeWorkspaces: false,
      includeIViews: false,
      includeRoles: false,
      includeSecurityParameters: false,
      includeNotifications: false,
      includeDataFeeds: false,
      includeSchedules: false,
    });
  };

  if (!showCollectionDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Collection Options</h2>
          <button
            onClick={() => setShowCollectionDialog(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Select None
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Core Metadata */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-blue-500">📦</span> Core Metadata
              </h3>
              <div className="space-y-1">
                <OptionCheckbox
                  label="Modules (Applications)"
                  checked={collectionOptions.includeModules}
                  onChange={(checked) => updateOption('includeModules', checked)}
                  description="Application definitions"
                />
                <OptionCheckbox
                  label="Fields"
                  checked={collectionOptions.includeFields}
                  onChange={(checked) => updateOption('includeFields', checked)}
                  description="Standard field definitions"
                />
                <OptionCheckbox
                  label="Calculated Fields"
                  checked={collectionOptions.includeCalculatedFields}
                  onChange={(checked) => updateOption('includeCalculatedFields', checked)}
                  description="Fields with calculation formulas"
                />
                <OptionCheckbox
                  label="Layouts"
                  checked={collectionOptions.includeLayouts}
                  onChange={(checked) => updateOption('includeLayouts', checked)}
                  description="Page layouts for modules"
                />
              </div>
            </div>

            {/* Values Lists */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-green-500">📋</span> Values Lists
              </h3>
              <div className="space-y-1">
                <OptionCheckbox
                  label="Values Lists"
                  checked={collectionOptions.includeValuesLists}
                  onChange={(checked) => updateOption('includeValuesLists', checked)}
                  description="Dropdown list definitions"
                />
                <OptionCheckbox
                  label="Values List Values"
                  checked={collectionOptions.includeValuesListValues}
                  onChange={(checked) => updateOption('includeValuesListValues', checked)}
                  description="Individual list values"
                />
              </div>
            </div>

            {/* Data Driven Events */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-yellow-500">⚡</span> Data Driven Events
              </h3>
              <div className="space-y-1">
                <OptionCheckbox
                  label="DDE Rules"
                  checked={collectionOptions.includeDDERules}
                  onChange={(checked) => updateOption('includeDDERules', checked)}
                  description="Event trigger rules"
                />
                <OptionCheckbox
                  label="DDE Actions"
                  checked={collectionOptions.includeDDEActions}
                  onChange={(checked) => updateOption('includeDDEActions', checked)}
                  description="Actions executed by rules"
                />
              </div>
            </div>

            {/* Reports & Dashboards */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-purple-500">📊</span> Reports & Dashboards
              </h3>
              <div className="space-y-1">
                <OptionCheckbox
                  label="Reports"
                  checked={collectionOptions.includeReports}
                  onChange={(checked) => updateOption('includeReports', checked)}
                  description="Report definitions"
                />
                <OptionCheckbox
                  label="Dashboards"
                  checked={collectionOptions.includeDashboards}
                  onChange={(checked) => updateOption('includeDashboards', checked)}
                  description="Dashboard configurations"
                />
                <OptionCheckbox
                  label="Workspaces"
                  checked={collectionOptions.includeWorkspaces}
                  onChange={(checked) => updateOption('includeWorkspaces', checked)}
                  description="Workspace definitions"
                />
                <OptionCheckbox
                  label="iViews"
                  checked={collectionOptions.includeIViews}
                  onChange={(checked) => updateOption('includeIViews', checked)}
                  description="Dashboard components"
                />
              </div>
            </div>

            {/* Security */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-red-500">🔒</span> Security
              </h3>
              <div className="space-y-1">
                <OptionCheckbox
                  label="Roles"
                  checked={collectionOptions.includeRoles}
                  onChange={(checked) => updateOption('includeRoles', checked)}
                  description="Role definitions"
                />
                <OptionCheckbox
                  label="Security Parameters"
                  checked={collectionOptions.includeSecurityParameters}
                  onChange={(checked) => updateOption('includeSecurityParameters', checked)}
                  description="Security configurations"
                />
              </div>
            </div>

            {/* Automation */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-cyan-500">🤖</span> Automation
              </h3>
              <div className="space-y-1">
                <OptionCheckbox
                  label="Notifications"
                  checked={collectionOptions.includeNotifications}
                  onChange={(checked) => updateOption('includeNotifications', checked)}
                  description="Email notifications"
                />
                <OptionCheckbox
                  label="Data Feeds"
                  checked={collectionOptions.includeDataFeeds}
                  onChange={(checked) => updateOption('includeDataFeeds', checked)}
                  description="Data import/export jobs"
                />
                <OptionCheckbox
                  label="Schedules"
                  checked={collectionOptions.includeSchedules}
                  onChange={(checked) => updateOption('includeSchedules', checked)}
                  description="Scheduled tasks"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <strong>GUID-Based Comparison:</strong> Items are matched by their GUID across environments. 
                Calculated fields include formula comparison to detect logic differences.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowCollectionDialog(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionOptionsDialog;
