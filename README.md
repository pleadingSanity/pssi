# PSSI v0.1 - Pleading Sanity System Intelligence

Windows desktop agent for system monitoring, repository healing, and cloud deployment.

## Features

- 🖥️ **System Monitor**: Real-time CPU, Memory, GPU stats and temperatures
- 🔧 **Repo Healing**: Automatically fix common dependency issues
- 🚀 **Cloud Deploy**: Trigger Netlify and Vercel deployments
- 🤖 **AI Test**: OpenAI integration for testing
- ⚡ **Electron Desktop App**: Native Windows application
- 🎨 **Modern UI**: React + Vite + Tailwind CSS

## Quick Start (Windows)

### 1. Initial Setup

```powershell
# Clone the repository (if not already done)
git clone https://github.com/pleadingSanity/pssi.git
cd pssi

# Run the setup script
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\win\setup.ps1

# Install dependencies
pnpm install
```

### 2. Configuration

Edit `.env.local` with your credentials:

```env
GH_TOKEN=your_github_token_here
OPENAI_API_KEY=your_openai_key_here
NETLIFY_BUILD_HOOK=https://api.netlify.com/build_hooks/your_hook_id
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/your_hook_id
```

### 3. Run the Application

```powershell
pnpm dev
```

This will start:
- React renderer on http://localhost:3000
- Express API server on http://localhost:3001
- Electron desktop app

## Available Scripts

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build the application for production
- `pnpm test` - Run Jest tests
- `pnpm server` - Start only the API server
- `pnpm electron:dev` - Start only the Electron app
- `pnpm renderer:dev` - Start only the React renderer

## Project Structure

```
pssi/
├── app/
│   ├── electron/          # Electron main process
│   │   ├── main.ts        # Main process entry
│   │   └── preload.ts     # Preload script (contextBridge)
│   ├── renderer/          # React frontend
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── System.tsx
│   │   │   ├── Repos.tsx
│   │   │   └── Deploy.tsx
│   │   ├── components/    # Reusable components
│   │   │   ├── Card.tsx
│   │   │   └── Gauge.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── server/            # Express API
│       ├── index.ts       # API routes
│       └── __tests__/     # Jest tests
├── python/
│   └── tasks/
│       └── heal_deps.py   # Dependency healing script
├── scripts/
│   └── win/
│       └── setup.ps1      # Windows setup script
├── .github/
│   └── workflows/
│       ├── auto-fix-dependencies.yml
│       └── fusion-sync.yml
└── package.json
```

## API Endpoints

- `GET /stats` - Get system statistics (CPU, RAM, GPU, temps)
- `POST /optimize` - Generate optimization plan (no system changes)
- `POST /repos/heal` - Run dependency healing script
- `POST /deploy/netlify` - Trigger Netlify build hook
- `POST /deploy/vercel` - Trigger Vercel deploy hook
- `POST /ai/test` - Test OpenAI integration

## GitHub Actions

### Auto-fix Dependencies
Runs on push to main/develop branches. Checks for common dependency issues (e.g., `mailchimp-marketing`) and creates PRs with fixes.

### Fusion Sync
Triggers after merge to main. Automatically deploys to Netlify and Vercel if webhooks are configured as repository secrets.

### Required Secrets

Add these in GitHub repository settings → Secrets → Actions:

- `NETLIFY_BUILD_HOOK` - Your Netlify build hook URL
- `VERCEL_DEPLOY_HOOK` - Your Vercel deploy hook URL
- `GH_TOKEN` - GitHub personal access token (optional, for PR creation)
- `OPENAI_API_KEY` - OpenAI API key (optional, for AI features)

## Safety Notes

⚠️ **Important Safety Features:**

1. **Explicit Confirmation Required**: All destructive actions (system scan, repo healing, deployments) require toggling a confirmation checkbox before execution.

2. **No Auto-Changes**: The optimize endpoint creates a plan only - no automatic system modifications are made.

3. **Isolated Git Operations**: The heal script works in a separate branch and creates a PR for review.

4. **Single Instance**: Electron enforces single-instance lock to prevent conflicts.

5. **Sandboxed Renderer**: Uses contextIsolation and disables nodeIntegration for security.

## Requirements

- Windows 10/11
- Node.js 20 LTS
- Python 3.11
- pnpm (installed via setup script)

## Development

Built with:
- **Electron 28** - Desktop application framework
- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **Express 4** - API server
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **Jest 29** - Testing framework
# PSSI v0.1

**Pleading Sanity System Intelligence** – AI optimizer for Windows, Android, and handhelds

A Windows desktop agent built with Electron, Vite, React, Express API, and Python task runner.

## Features

- 🖥️ **System Stats UI** - Real-time system monitoring with CPU, memory, and disk usage
- 🔧 **Repo Healing** - Automated repository health checks and repairs
- 🚀 **Deploy Hooks** - Webhook-based deployment automation
- 🤖 **AI Test Endpoint** - API endpoint for AI model testing
- 🔄 **Auto-Fix Workflow** - GitHub Actions for automated fixes
- 🔄 **Sync Workflow** - Automated dependency updates and system checks

## Architecture

```
/app
  /electron     - Electron main process and preload scripts
  /renderer     - React + Vite frontend application
  /server       - Express API server
/python
  /tasks        - Python task runner scripts
/scripts
  /win          - Windows-specific setup and deploy scripts
/.github
  /workflows    - CI/CD automation workflows
```

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - Fast, disk space efficient package manager
- **Python 3.8+** - For task runner scripts
- **Windows 10/11** - Primary development platform

## Quick Start

### Windows Setup

Run the setup script to install all dependencies:

```powershell
.\scripts\win\setup.ps1
```

Or manually:

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install -r python/requirements.txt
```

## Development

### Start Electron App

```bash
pnpm electron:dev
```

This starts the Electron application with hot-reload enabled.

### Start API Server

```bash
pnpm server:dev
```

The API server runs on `http://localhost:3000`.

### Start Frontend Only

```bash
pnpm dev
```

Frontend dev server runs on `http://localhost:5173`.

## Building

### Build for Production

```bash
pnpm build
```

This compiles:
- TypeScript to JavaScript
- React app with Vite
- Electron app with electron-builder

Output goes to:
- `dist/` - Renderer build
- `dist-electron/` - Electron build
- `release/` - Packaged application

### Build API Server

```bash
pnpm server:build
```

Output: `dist-server/`

## API Endpoints

### Health Check
```
GET /health
```

### System Stats
```
GET /api/stats
```

### AI Test Endpoint
```
POST /api/ai/test
Body: { "prompt": "test prompt", "model": "test" }
```

### Deploy Hook
```
POST /api/deploy/hook
Body: { "event": "push", "repository": "pssi", "ref": "main" }
```

### Repo Healing
```
POST /api/repo/heal
```

## Python Tasks

### Repo Healing

```bash
python python/tasks/repo_healing.py
```

Checks for:
- Missing required files
- Dependency issues
- Common configuration problems

### System Stats

```bash
python python/tasks/system_stats.py
```

Gathers detailed system statistics including CPU, memory, and disk usage.

## Scripts

### Deploy Hook

```powershell
.\scripts\win\deploy.ps1
```

Automated deployment script triggered by webhooks.

## GitHub Workflows

### Auto-Fix

Runs on every push and PR:
- Lints code
- Builds application
- Runs repo healing

### Sync

Runs daily at 2 AM UTC:
- Updates dependencies
- Runs system checks
- Auto-commits changes

## Linting

```bash
pnpm lint
```

## Project Structure

```
pssi/
├── app/
│   ├── electron/
│   │   ├── main.ts          # Electron main process
│   │   └── preload.ts       # Preload script for IPC
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── App.tsx      # Main React component
│   │   │   ├── main.tsx     # React entry point
│   │   │   └── vite-env.d.ts
│   │   └── index.html
│   └── server/
│       └── index.ts         # Express API server
├── python/
│   ├── tasks/
│   │   ├── repo_healing.py  # Repo health checks
│   │   └── system_stats.py  # System monitoring
│   └── requirements.txt
├── scripts/
│   └── win/
│       ├── setup.ps1        # Windows setup script
│       └── deploy.ps1       # Deploy automation
├── .github/
│   └── workflows/
│       ├── auto-fix.yml     # Auto-fix workflow
│       └── sync.yml         # Sync workflow
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Version

0.1.0 - Initial release
