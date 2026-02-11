// ==========================================
// Environment Dialog Component
// Add/Edit Archer environments
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { testConnection } from '../services/metadataCollector';
import { createEnvironment } from '../types';

export const EnvironmentDialog: React.FC = () => {
  const {
    showEnvironmentDialog,
    editingEnvironment,
    setShowEnvironmentDialog,
    addEnvironment,
    updateEnvironment,
  } = useAppStore();

  const [displayName, setDisplayName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (editingEnvironment) {
      setDisplayName(editingEnvironment.displayName);
      setBaseUrl(editingEnvironment.baseUrl);
      setInstanceName(editingEnvironment.instanceName);
      setUsername(editingEnvironment.username);
      setPassword(''); // Don't show encrypted password
    } else {
      setDisplayName('');
      setBaseUrl('');
      setInstanceName('');
      setUsername('');
      setPassword('');
    }
    setTestResult(null);
  }, [editingEnvironment, showEnvironmentDialog]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const env = createEnvironment({
      displayName,
      baseUrl,
      instanceName,
      username,
      encryptedPassword: password, // In real app, encrypt this
    });

    try {
      const result = await testConnection(env);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    }

    setIsTesting(false);
  };

  const handleSave = () => {
    if (!displayName || !baseUrl || !username) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingEnvironment) {
      updateEnvironment({
        ...editingEnvironment,
        displayName,
        baseUrl,
        instanceName,
        username,
        encryptedPassword: password || editingEnvironment.encryptedPassword,
      });
    } else {
      addEnvironment(createEnvironment({
        displayName,
        baseUrl,
        instanceName,
        username,
        encryptedPassword: password,
      }));
    }

    setShowEnvironmentDialog(false);
  };

  if (!showEnvironmentDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingEnvironment ? 'Edit Environment' : 'Add Environment'}
          </h2>
          <button
            onClick={() => setShowEnvironmentDialog(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Production, Development, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://archer.company.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instance Name
            </label>
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="Default"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sysadmin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!editingEnvironment && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingEnvironment ? '(unchanged)' : 'Enter password'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !baseUrl || !username}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${isTesting || !baseUrl || !username
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
            >
              {isTesting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Testing...</span>
                </>
              ) : (
                <span>Test Connection</span>
              )}
            </button>
            {testResult && (
              <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowEnvironmentDialog(false)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingEnvironment ? 'Save Changes' : 'Add Environment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentDialog;
