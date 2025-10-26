import { useState } from 'react';
import Card from '../components/Card';

function Repos() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleHeal = async () => {
    if (!confirmEnabled) {
      alert('Please enable the Confirm toggle to proceed');
      return;
    }

    if (!repoUrl) {
      alert('Please enter a repository URL');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:3001/api/repos/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      
      // Log action to local file (in production)
      console.log('Repository healing initiated:', { repoUrl, branch, result: data });
    } catch (error) {
      console.error('Failed to heal repository:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Repository Healing</h2>
      <p className="text-gray-400 mb-8">
        Automatically heal dependencies and create pull requests
      </p>

      <Card title="Heal Dependencies">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confirm-heal"
              checked={confirmEnabled}
              onChange={(e) => setConfirmEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="confirm-heal" className="text-sm text-gray-400">
              Confirm dangerous actions
            </label>
          </div>

          <button
            onClick={handleHeal}
            disabled={loading || !confirmEnabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {loading ? 'Healing...' : 'Heal Dependencies'}
          </button>
        </div>
      </Card>

      {result && (
        <Card title="Result" className="mt-6">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
            {result}
          </pre>
        </Card>
      )}
    </div>
  );
}

export default Repos;
