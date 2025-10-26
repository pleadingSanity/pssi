import { useState } from 'react';
import axios from 'axios';
import './RepoHealing.css';

function RepoHealing() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'check' | 'fix') => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:3000/api/repo/heal', { action });
      setResult(response.data);
    } catch (err) {
      setError(`Failed to ${action} repository`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="repo-healing">
      <h2>Repository Healing</h2>
      <p className="description">
        Check repository health and automatically fix common issues
      </p>

      <div className="action-buttons">
        <button
          className="check-btn"
          onClick={() => handleAction('check')}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Health'}
        </button>
        <button
          className="fix-btn"
          onClick={() => handleAction('fix')}
          disabled={loading}
        >
          {loading ? 'Fixing...' : 'Fix Issues'}
        </button>
      </div>

      {error && (
        <div className="result-box error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-box success">
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default RepoHealing;
