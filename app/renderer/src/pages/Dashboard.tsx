import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

function Dashboard({ onTabChange }: DashboardProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string, tab: string) => {
    onTabChange(tab);
    navigate(path);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <p className="text-gray-400 mb-8">
        Welcome to PSSI v0.1 – Your Windows desktop AI optimizer
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="System Monitor"
          onClick={() => handleNavigate('/system', 'system')}
        >
          <p className="text-gray-400">
            Monitor CPU, RAM, and GPU usage. Get optimization suggestions.
          </p>
          <div className="mt-4 text-blue-400 font-semibold">View Stats →</div>
        </Card>

        <Card
          title="Repository Healing"
          onClick={() => handleNavigate('/repos', 'repos')}
        >
          <p className="text-gray-400">
            Automatically heal dependencies and create pull requests.
          </p>
          <div className="mt-4 text-blue-400 font-semibold">Heal Repos →</div>
        </Card>

        <Card
          title="Deploy Hooks"
          onClick={() => handleNavigate('/deploy', 'deploy')}
        >
          <p className="text-gray-400">
            Trigger Netlify and Vercel deployments with one click.
          </p>
          <div className="mt-4 text-blue-400 font-semibold">Deploy Now →</div>
        </Card>

        <Card title="Quick Stats">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span>{navigator.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User Agent:</span>
              <span className="truncate ml-4">{navigator.userAgent.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Language:</span>
              <span>{navigator.language}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
