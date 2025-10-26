import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Gauge from '../components/Gauge';

interface SystemStats {
  cpu: { usage: number; temp: number };
  ram: { usage: number; total: number; used: number };
  gpu: { usage: number; temp: number };
}

function System() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [optimizePlan, setOptimizePlan] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!confirmEnabled) {
      alert('Please enable the Confirm toggle to proceed');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setOptimizePlan(data.plan);
      
      // Log action to local file (in production)
      console.log('Optimization plan generated:', data.plan);
    } catch (error) {
      console.error('Failed to optimize:', error);
      alert('Failed to generate optimization plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">System Monitor</h2>
      <p className="text-gray-400 mb-8">
        Real-time system stats and optimization suggestions
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card title="CPU">
          {stats ? (
            <div className="space-y-4">
              <Gauge label="Usage" value={stats.cpu.usage} />
              <Gauge label="Temperature" value={stats.cpu.temp} unit="°C" />
            </div>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </Card>

        <Card title="RAM">
          {stats ? (
            <div className="space-y-4">
              <Gauge label="Usage" value={stats.ram.usage} />
              <div className="text-sm text-gray-400">
                {(stats.ram.used / 1024).toFixed(1)} GB / {(stats.ram.total / 1024).toFixed(1)} GB
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </Card>

        <Card title="GPU">
          {stats ? (
            <div className="space-y-4">
              <Gauge label="Usage" value={stats.gpu.usage} />
              <Gauge label="Temperature" value={stats.gpu.temp} unit="°C" />
            </div>
          ) : (
            <p className="text-gray-400">Loading...</p>
          )}
        </Card>

        <Card title="Actions">
          <div className="space-y-4">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {loading ? 'Scanning...' : 'Scan System'}
            </button>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirm-optimize"
                checked={confirmEnabled}
                onChange={(e) => setConfirmEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="confirm-optimize" className="text-sm text-gray-400">
                Confirm dangerous actions
              </label>
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading || !confirmEnabled}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Generate Optimization Plan
            </button>
          </div>
        </Card>
      </div>

      {optimizePlan && (
        <Card title="Optimization Plan">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">{optimizePlan}</pre>
        </Card>
      )}
    </div>
  );
}

export default System;
