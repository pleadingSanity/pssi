import React, { useEffect, useState } from 'react';
import Gauge from '../components/Gauge';
import axios from 'axios';

interface Stats {
  cpu: number;
  memory: number;
  gpu: number;
  cpuTemp: number;
  gpuTemp: number;
}

const System: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scanning, setScanning] = useState(false);
  const [confirmScan, setConfirmScan] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    if (!confirmScan) {
      alert('Please enable the Confirm toggle before scanning');
      return;
    }

    setScanning(true);
    try {
      const response = await axios.post('http://localhost:3001/optimize');
      alert(`Optimization Plan:\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      alert('Failed to create optimization plan: ' + error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">System Monitor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Gauge label="CPU Usage" value={stats?.cpu || 0} unit="%" color="blue" />
        <Gauge label="Memory Usage" value={stats?.memory || 0} unit="%" color="green" />
        <Gauge label="GPU Usage" value={stats?.gpu || 0} unit="%" color="purple" />
        <Gauge 
          label="CPU Temperature" 
          value={stats?.cpuTemp || 0} 
          max={100} 
          unit="°C" 
          color="orange" 
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Actions</h3>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="confirmScan"
            checked={confirmScan}
            onChange={(e) => setConfirmScan(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="confirmScan" className="ml-2 text-sm text-gray-300">
            Confirm: I understand this will scan and create an optimization plan
          </label>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning || !confirmScan}
          className={`${
            confirmScan && !scanning
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-600 cursor-not-allowed'
          } text-white font-medium py-3 px-6 rounded transition-colors`}
        >
          {scanning ? 'Scanning...' : 'Scan & Optimize'}
        </button>

        <p className="text-sm text-gray-400 mt-4">
          ⚠️ Safety: Scan creates a plan only. No system changes are made automatically.
        </p>
      </div>
    </div>
  );
};

export default System;
