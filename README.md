# Pleading Sanity System Intelligence (PSSI) v0.1

AI optimizer for Windows desktop – system stats, repo healing, and deploy hooks.

## Features

- **Dashboard**: Overview of system stats and capabilities
- **System**: CPU/RAM/GPU monitoring with optimization suggestions
- **Repos**: Automated dependency healing and PR creation
- **Deploy**: One-click Netlify and Vercel deployments

## Tech Stack

- **Frontend**: Electron + Vite + React + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript
- **Task Runner**: Python 3.11+
- **Build**: pnpm + Node 20

## Setup

### Windows (PowerShell)

```powershell
.\scripts\win\setup.ps1
```

This will:
- Install Node 20 and Python 3.11 (if needed)
- Install pnpm
- Create `.env.local` from `.ENV.example`
- Run `pnpm install`

### Manual Setup

1. Install Node 20 and Python 3.11+
2. Install pnpm: `npm install -g pnpm`
3. Copy `.ENV.example` to `.env.local` and fill in values
4. Install dependencies: `pnpm install`

## Development

```bash
# Start dev server (Electron + Vite + Express)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

## Configuration

Edit `.env.local`:

- `GH_TOKEN`: GitHub personal access token for creating PRs
- `NETLIFY_BUILD_HOOK`: Netlify build hook URL
- `VERCEL_DEPLOY_HOOK`: Vercel deploy hook URL
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `PORT`: Express server port (default: 3001)

## API Endpoints

- `GET /api/stats` - System stats (CPU, RAM, GPU)
- `POST /api/optimize` - Generate optimization plan
- `POST /api/repos/heal` - Heal repository dependencies
- `POST /api/deploy/netlify` - Trigger Netlify deployment
- `POST /api/deploy/vercel` - Trigger Vercel deployment
- `POST /api/ai/test` - Test OpenAI integration

## Python Tasks

### Dependency Healing

```bash
# Dry-run (default)
python python/tasks/heal_deps.py --repo https://github.com/user/repo --branch main

# Actually create PR (requires GH_TOKEN)
python python/tasks/heal_deps.py --repo https://github.com/user/repo --branch main --apply
```

## CI/CD

- **Auto-fix dependencies**: Runs on push, opens PR when `GH_TOKEN` is set
- **Fusion sync**: Triggers Netlify/Vercel on merge when hooks are configured

## License

MIT
