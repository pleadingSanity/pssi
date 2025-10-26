import React, { useState } from 'react';
import axios from 'axios';

const Deploy: React.FC = () => {
  const [confirmNetlify, setConfirmNetlify] = useState(false);
  const [confirmVercel, setConfirmVercel] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [results, setResults] = useState<{ platform: string; message: string }[]>([]);

  const handleDeploy = async (platform: 'netlify' | 'vercel') => {
    const confirm = platform === 'netlify' ? confirmNetlify : confirmVercel;
    
    if (!confirm) {
      alert(`Please enable the Confirm toggle for ${platform} before deploying`);
      return;
    }

    setDeploying(platform);

    try {
      const response = await axios.post(`http://localhost:3001/deploy/${platform}`);
      setResults((prev) => [
        ...prev,
        { 
          platform: platform.charAt(0).toUpperCase() + platform.slice(1), 
          message: `✅ ${response.data.message}` 
        },
      ]);
    } catch (error: any) {
      setResults((prev) => [
        ...prev,
        { 
          platform: platform.charAt(0).toUpperCase() + platform.slice(1), 
          message: `❌ ${error.response?.data?.error || error.message}` 
        },
      ]);
    } finally {
      setDeploying(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Cloud Deployment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Netlify */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Netlify</h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="confirmNetlify"
              checked={confirmNetlify}
              onChange={(e) => setConfirmNetlify(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirmNetlify" className="ml-2 text-sm text-gray-300">
              Confirm: Trigger Netlify build
            </label>
          </div>

          <button
            onClick={() => handleDeploy('netlify')}
            disabled={deploying === 'netlify' || !confirmNetlify}
            className={`${
              confirmNetlify && deploying !== 'netlify'
                ? 'bg-teal-600 hover:bg-teal-700'
                : 'bg-gray-600 cursor-not-allowed'
            } text-white font-medium py-3 px-6 rounded transition-colors w-full`}
          >
            {deploying === 'netlify' ? 'Deploying...' : 'Deploy to Netlify'}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            Requires NETLIFY_BUILD_HOOK in .env.local
          </p>
        </div>

        {/* Vercel */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Vercel</h3>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="confirmVercel"
              checked={confirmVercel}
              onChange={(e) => setConfirmVercel(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="confirmVercel" className="ml-2 text-sm text-gray-300">
              Confirm: Trigger Vercel deploy
            </label>
          </div>

          <button
            onClick={() => handleDeploy('vercel')}
            disabled={deploying === 'vercel' || !confirmVercel}
            className={`${
              confirmVercel && deploying !== 'vercel'
                ? 'bg-black hover:bg-gray-900'
                : 'bg-gray-600 cursor-not-allowed'
            } text-white font-medium py-3 px-6 rounded transition-colors w-full border border-white`}
          >
            {deploying === 'vercel' ? 'Deploying...' : 'Deploy to Vercel'}
          </button>

          <p className="text-xs text-gray-400 mt-3">
            Requires VERCEL_DEPLOY_HOOK in .env.local
          </p>
        </div>
      </div>

      {/* Deployment Results */}
      {results.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Deployment History</h3>
            <button
              onClick={() => setResults([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="bg-gray-700 rounded p-3">
                <p className="text-sm">
                  <span className="font-semibold text-blue-400">{result.platform}:</span>{' '}
                  <span className="text-gray-300">{result.message}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mt-6">
        <p className="text-sm text-yellow-100">
          ⚠️ <strong>Safety Note:</strong> These actions trigger production deployments. 
          Ensure your build hooks are correctly configured in your .env.local file.
        </p>
      </div>
    </div>
  );
};

export default Deploy;
