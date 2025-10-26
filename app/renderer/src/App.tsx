import { useState } from 'react';
import SystemStats from './components/SystemStats';
import RepoHealing from './components/RepoHealing';
import AITest from './components/AITest';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'stats' | 'healing' | 'ai'>('stats');

  return (
    <div className="app">
      <header className="app-header">
        <h1>PSSI - Pleading Sanity System Intelligence</h1>
        <p>v0.1.0 - Windows Desktop Agent</p>
      </header>
      
      <nav className="app-nav">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          System Stats
        </button>
        <button
          className={activeTab === 'healing' ? 'active' : ''}
          onClick={() => setActiveTab('healing')}
        >
          Repo Healing
        </button>
        <button
          className={activeTab === 'ai' ? 'active' : ''}
          onClick={() => setActiveTab('ai')}
        >
          AI Test
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'stats' && <SystemStats />}
        {activeTab === 'healing' && <RepoHealing />}
        {activeTab === 'ai' && <AITest />}
      </main>
    </div>
  );
}

export default App;
