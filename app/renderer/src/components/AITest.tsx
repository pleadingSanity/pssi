import { useState } from 'react';
import axios from 'axios';
import './AITest.css';

function AITest() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('default');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await axios.post('http://localhost:3000/api/ai/test', {
        prompt,
        model,
      });
      setResponse(result.data);
    } catch (err) {
      setError('Failed to test AI endpoint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-test">
      <h2>AI Test Endpoint</h2>
      <p className="description">
        Test the AI integration endpoint with custom prompts
      </p>

      <div className="input-section">
        <div className="form-group">
          <label htmlFor="model">Model:</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude">Claude</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="prompt">Prompt:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your AI prompt here..."
            rows={6}
          />
        </div>

        <button
          className="test-btn"
          onClick={handleTest}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test AI'}
        </button>
      </div>

      {error && (
        <div className="result-box error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="result-box success">
          <h3>AI Response</h3>
          <div className="response-details">
            <p><strong>Model:</strong> {response.model}</p>
            <p><strong>Status:</strong> {response.status}</p>
            <p><strong>Timestamp:</strong> {new Date(response.timestamp).toLocaleString()}</p>
          </div>
          <div className="response-content">
            <h4>Response:</h4>
            <p>{response.response}</p>
          </div>
          {response.note && (
            <div className="response-note">
              <em>{response.note}</em>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AITest;
