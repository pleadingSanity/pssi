import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import System from './pages/System';
import Repos from './pages/Repos';
import Deploy from './pages/Deploy';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'system', label: 'System', path: '/system' },
    { id: 'repos', label: 'Repos', path: '/repos' },
    { id: 'deploy', label: 'Deploy', path: '/deploy' },
  ];

  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-bold">PSSI v0.1</h1>
          <p className="text-sm text-gray-400">Pleading Sanity System Intelligence</p>
        </header>

        {/* Tabs */}
        <nav className="bg-gray-800 border-b border-gray-700 px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard onTabChange={setActiveTab} />} />
            <Route path="/system" element={<System />} />
            <Route path="/repos" element={<Repos />} />
            <Route path="/deploy" element={<Deploy />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
