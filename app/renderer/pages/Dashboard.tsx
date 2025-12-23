import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import axios from 'axios';

interface Stats {
  cpu: number;
  memory: number;
  gpu: number;
  cpuTemp: number;
  gpuTemp: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="CPU Usage"
          value={`${stats?.cpu || 0}%`}
          subtitle="Current processor load"
        />
        <Card
          title="Memory Usage"
          value={`${stats?.memory || 0}%`}
          subtitle="RAM utilization"
        />
        <Card
          title="GPU Usage"
          value={`${stats?.gpu || 0}%`}
          subtitle="Graphics processor load"
        />
        <Card
          title="CPU Temperature"
          value={`${stats?.cpuTemp || 0}°C`}
          subtitle="Processor thermal"
        />
        <Card
          title="GPU Temperature"
          value={`${stats?.gpuTemp || 0}°C`}
          subtitle="Graphics thermal"
        />
        <Card
          title="Status"
          value="Healthy"
          subtitle="All systems nominal"
          className="bg-green-900"
        />
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded transition-colors">
            Optimize System
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded transition-colors">
            Heal Dependencies
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded transition-colors">
            Deploy to Cloud
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
