import React, { useState } from 'react';
import axios from 'axios';

const Repos: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [confirmHeal, setConfirmHeal] = useState(false);
  const [healing, setHealing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleHeal = async () => {
    if (!confirmHeal) {
      alert('Please enable the Confirm toggle before healing');
      return;
    }

    if (!repoUrl) {
      alert('Please enter a repository URL');
      return;
    }

    setHealing(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3001/repos/heal', {
        repoUrl,
        branch,
      });
      setResult(`✅ Success: ${response.data.message}\n\nOutput:\n${response.data.output}`);
    } catch (error: any) {
      setResult(`❌ Failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setHealing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Repository Healing</h2>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Link Repository</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="confirmHeal"
              checked={confirmHeal}
              onChange={(e) => setConfirmHeal(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirmHeal" className="ml-2 text-sm text-gray-300">
              Confirm: I understand this will analyze and fix dependencies
            </label>
          </div>

          <button
            onClick={handleHeal}
            disabled={healing || !confirmHeal}
            className={`${
              confirmHeal && !healing
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 cursor-not-allowed'
            } text-white font-medium py-3 px-6 rounded transition-colors w-full`}
          >
            {healing ? 'Healing Dependencies...' : 'Heal Dependencies'}
          </button>

          <p className="text-sm text-gray-400">
            ℹ️ This will check for common dependency issues (e.g., mailchimp-marketing)
            and create a PR if fixes are needed.
          </p>
        </div>
      </div>

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Result</h3>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Repos;
