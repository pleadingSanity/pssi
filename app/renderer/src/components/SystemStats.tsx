import { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemStats.css';

interface SystemStatsData {
  timestamp: string;
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: string;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
  disk: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    percentage: number;
  }>;
}

function SystemStats() {
  const [stats, setStats] = useState<SystemStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/stats');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 ** 3);
    return `${gb.toFixed(2)} GB`;
  };

  if (loading && !stats) {
    return <div className="stats-loading">Loading system stats...</div>;
  }

  if (error) {
    return (
      <div className="stats-error">
        <p>{error}</p>
        <button onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  if (!stats) {
    return <div className="stats-error">No data available</div>;
  }

  return (
    <div className="system-stats">
      <h2>System Statistics</h2>
      <p className="last-update">Last updated: {new Date(stats.timestamp).toLocaleString()}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>CPU</h3>
          <p><strong>Brand:</strong> {stats.cpu.brand}</p>
          <p><strong>Manufacturer:</strong> {stats.cpu.manufacturer}</p>
          <p><strong>Cores:</strong> {stats.cpu.cores}</p>
          <p><strong>Speed:</strong> {stats.cpu.speed} GHz</p>
        </div>

        <div className="stat-card">
          <h3>Memory</h3>
          <p><strong>Total:</strong> {formatBytes(stats.memory.total)}</p>
          <p><strong>Used:</strong> {formatBytes(stats.memory.used)}</p>
          <p><strong>Free:</strong> {formatBytes(stats.memory.free)}</p>
          <p><strong>Usage:</strong> {stats.memory.percentage}%</p>
        </div>

        <div className="stat-card">
          <h3>Operating System</h3>
          <p><strong>Platform:</strong> {stats.os.platform}</p>
          <p><strong>Distribution:</strong> {stats.os.distro}</p>
          <p><strong>Release:</strong> {stats.os.release}</p>
          <p><strong>Architecture:</strong> {stats.os.arch}</p>
        </div>

        <div className="stat-card full-width">
          <h3>Disk Storage</h3>
          {stats.disk.map((disk, index) => (
            <div key={index} className="disk-info">
              <p><strong>{disk.fs}</strong> ({disk.type})</p>
              <p>Size: {formatBytes(disk.size)} | Used: {formatBytes(disk.used)} | Available: {formatBytes(disk.available)}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${disk.percentage}%` }}></div>
              </div>
              <p className="disk-percentage">{disk.percentage}% used</p>
            </div>
          ))}
        </div>
      </div>

      <button className="refresh-btn" onClick={fetchStats}>
        Refresh Now
      </button>
    </div>
  );
}

export default SystemStats;
