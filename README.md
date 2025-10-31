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
