import { useState } from 'react';
import Card from '../components/Card';

function Deploy() {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [results, setResults] = useState<{ [key: string]: string }>({});

  const handleDeploy = async (platform: 'netlify' | 'vercel') => {
    if (!confirmEnabled) {
      alert('Please enable the Confirm toggle to proceed');
      return;
    }

    setLoading(platform);
    try {
      const response = await fetch(`http://localhost:3001/api/deploy/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setResults((prev) => ({
        ...prev,
        [platform]: JSON.stringify(data, null, 2),
      }));
      
      // Log action to local file (in production)
      console.log(`${platform} deployment triggered:`, data);
    } catch (error) {
      console.error(`Failed to deploy to ${platform}:`, error);
      setResults((prev) => ({
        ...prev,
        [platform]: `Error: ${error}`,
      }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Deploy Hooks</h2>
      <p className="text-gray-400 mb-8">
        Trigger Netlify and Vercel deployments with one click
      </p>

      <Card title="Deployment Actions">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="confirm-deploy"
              checked={confirmEnabled}
              onChange={(e) => setConfirmEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="confirm-deploy" className="text-sm text-gray-400">
              Confirm dangerous actions
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleDeploy('netlify')}
              disabled={loading !== null || !confirmEnabled}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition-colors"
            >
              {loading === 'netlify' ? 'Deploying...' : 'Deploy to Netlify'}
            </button>

            <button
              onClick={() => handleDeploy('vercel')}
              disabled={loading !== null || !confirmEnabled}
              className="bg-black hover:bg-gray-900 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded border border-gray-700 transition-colors"
            >
              {loading === 'vercel' ? 'Deploying...' : 'Deploy to Vercel'}
            </button>
          </div>
        </div>
      </Card>

      {Object.entries(results).length > 0 && (
        <div className="mt-6 space-y-4">
          {Object.entries(results).map(([platform, result]) => (
            <Card key={platform} title={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Result`}>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-96">
                {result}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Deploy;
