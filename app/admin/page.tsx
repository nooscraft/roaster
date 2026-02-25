import { RetroCard } from '@/components/retro/RetroCard';
import { RetroBadge } from '@/components/retro/RetroBadge';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="pixel-font text-3xl text-yellow-300 mb-6 glow-text">
        DASHBOARD
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RetroCard variant="cyan">
          <div className="text-center">
            <p className="text-pink-400 text-4xl font-bold mb-2">0</p>
            <p className="text-cyan-300 text-sm">Total Posts</p>
          </div>
        </RetroCard>

        <RetroCard variant="pink">
          <div className="text-center">
            <p className="text-yellow-300 text-4xl font-bold mb-2">0</p>
            <p className="text-cyan-300 text-sm">Total Roasts</p>
          </div>
        </RetroCard>

        <RetroCard variant="yellow">
          <div className="text-center">
            <p className="text-pink-400 text-4xl font-bold mb-2 blink">0</p>
            <p className="text-cyan-300 text-sm">Pending Roasts</p>
          </div>
        </RetroCard>

        <RetroCard variant="cyan">
          <div className="text-center">
            <p className="text-red-500 text-4xl font-bold mb-2">0</p>
            <p className="text-cyan-300 text-sm">Reports</p>
          </div>
        </RetroCard>
      </div>

      <RetroCard variant="pink" className="mb-6">
        <h2 className="text-yellow-300 font-bold text-xl mb-4">
          📡 System Status
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-cyan-300">Database</span>
            <RetroBadge>✓ CONNECTED</RetroBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyan-300">X API</span>
            <RetroBadge>⚠ NOT CONFIGURED</RetroBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyan-300">OpenAI API</span>
            <RetroBadge>⚠ NOT CONFIGURED</RetroBadge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-cyan-300">Worker</span>
            <RetroBadge>⚠ NOT RUNNING</RetroBadge>
          </div>
        </div>
      </RetroCard>

      <RetroCard variant="cyan">
        <h2 className="text-yellow-300 font-bold text-xl mb-4">
          🎯 Quick Actions
        </h2>
        <div className="space-y-3">
          <a
            href="/admin/handles"
            className="block p-3 bg-purple-800 hover:bg-purple-700 transition-colors border-2 border-cyan-400"
          >
            <span className="text-pink-400">→</span> Manage Handles
          </a>
          <a
            href="/admin/roasts"
            className="block p-3 bg-purple-800 hover:bg-purple-700 transition-colors border-2 border-cyan-400"
          >
            <span className="text-pink-400">→</span> Review Pending Roasts
          </a>
          <a
            href="/admin/prompts"
            className="block p-3 bg-purple-800 hover:bg-purple-700 transition-colors border-2 border-cyan-400"
          >
            <span className="text-pink-400">→</span> Manage Prompts
          </a>
        </div>
      </RetroCard>
    </div>
  );
}
