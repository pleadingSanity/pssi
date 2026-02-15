import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import System from './pages/System';
import Repos from './pages/Repos';
import Deploy from './pages/Deploy';

type Tab = 'dashboard' | 'system' | 'repos' | 'deploy';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard' },
    { id: 'system' as Tab, label: 'System' },
    { id: 'repos' as Tab, label: 'Repos' },
    { id: 'deploy' as Tab, label: 'Deploy' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">PSSI v0.1</h1>
            <p className="text-gray-400 text-sm">Pleading Sanity System Intelligence</p>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'system' && <System />}
        {activeTab === 'repos' && <Repos />}
        {activeTab === 'deploy' && <Deploy />}
      </main>
    </div>
  );
}

export default App;
