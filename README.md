# PSSI - Pleading Sanity System Intelligence

[![CI](https://github.com/pleadingSanity/pssi/workflows/CI/badge.svg)](https://github.com/pleadingSanity/pssi/actions)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/pleadingSanity/pssi)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> AI optimizer for Windows, Android, and handhelds - v0.1.0

## Overview

PSSI (Pleading Sanity System Intelligence) is a Windows desktop agent built with modern web technologies, designed to optimize system performance, monitor health, and provide intelligent automation capabilities.

## Features

- **System Statistics Dashboard** - Real-time monitoring of CPU, memory, disk, and network
- **Repository Healing** - Automated repository health checks and fixes
- **AI Test Endpoint** - Integration point for AI services and automation
- **Deploy Hooks** - Webhook endpoints for deployment automation
- **Python Task Runner** - Background task processing and system optimization

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Desktop**: Electron
- **Backend**: Express.js (Node.js)
- **Task Runner**: Python 3.x
- **Package Manager**: pnpm
- **Build System**: Vite + TypeScript

## Prerequisites

- Node.js 20 or higher
- pnpm 8 or higher
- Python 3.8+ (optional, for task runner)
- Windows 10/11 (primary target platform)

## Quick Start

### Using the Setup Script (Windows)

```powershell
# Clone the repository
git clone https://github.com/pleadingSanity/pssi.git
cd pssi

# Run the setup script
.\scripts\win\setup.ps1
```

### Manual Setup

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start development mode
pnpm run dev
```

## Project Structure

```
pssi/
├── app/
│   ├── electron/          # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   └── preload.ts     # Preload script
│   ├── renderer/          # React frontend
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── App.tsx       # Main app component
│   │   │   └── main.tsx      # React entry point
│   │   └── index.html
│   └── server/            # Express API server
│       ├── index.ts       # Server entry point
│       └── routes/        # API route handlers
├── python/
│   └── tasks/             # Python task runner
│       └── runner.py      # Main task runner
├── scripts/
│   └── win/               # Windows scripts
│       └── setup.ps1      # Setup script
├── .github/
│   └── workflows/         # GitHub Actions
│       ├── ci.yml         # Continuous integration
│       ├── auto-fix.yml   # Auto-fix workflow
│       └── sync.yml       # Dependency sync workflow
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Available Scripts

### Development

```bash
# Start all services (Vite dev server + Electron + Express)
pnpm run dev

# Start individual services
pnpm run dev:vite      # Vite dev server only
pnpm run dev:electron  # Electron only
pnpm run dev:server    # Express server only
```

### Building

```bash
# Build all components
pnpm run build

# Build individual components
pnpm run build:renderer  # Build React app
pnpm run build:electron  # Build Electron app
pnpm run build:server    # Build Express server
```

### Code Quality

```bash
# Run linter
pnpm run lint

# Fix linting issues automatically
pnpm run lint:fix

# Type checking
pnpm run typecheck

# Run tests
pnpm test
```

### Python Tasks

```bash
# Run system check
python python/tasks/runner.py check

# Run system optimization
python python/tasks/runner.py optimize
```

## API Endpoints

The Express server runs on `http://localhost:3000` and provides the following endpoints:

- `GET /health` - Health check endpoint
- `GET /api/stats` - System statistics
- `POST /api/ai/test` - AI test endpoint
- `POST /api/repo/heal` - Repository healing
- `POST /api/deploy/hook` - Deployment webhooks

## GitHub Actions Workflows

### CI Workflow
Runs on every push and pull request:
- Type checking
- Linting
- Building
- Testing

### Auto-Fix Workflow
Automatically fixes linting issues and commits them back to the repository.

### Sync Workflow
Runs daily to:
- Update dependencies
- Run builds and tests
- Create PR if updates are available

## Development Guidelines

1. **Code Style**: Follow TypeScript and React best practices
2. **Commits**: Use conventional commit messages
3. **PRs**: Ensure all checks pass before merging
4. **Testing**: Add tests for new features

## Configuration

### TypeScript
Configuration is in `tsconfig.json` with separate configs for:
- `app/electron/tsconfig.json` - Electron settings
- `app/server/tsconfig.json` - Server settings

### Vite
Configuration is in `vite.config.ts`

### ESLint
Configuration is in `.eslintrc.cjs`

## Troubleshooting

### Build Issues

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port Conflicts

If ports 3000 or 5173 are in use:
- Change port in `vite.config.ts` for dev server
- Set `PORT` environment variable for Express server

## Roadmap

- [ ] Android support
- [ ] Handheld device optimization
- [ ] Advanced AI integrations
- [ ] Cloud sync capabilities
- [ ] Plugin system
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [https://github.com/pleadingSanity/pssi/issues](https://github.com/pleadingSanity/pssi/issues)

## Acknowledgments

Built with modern web technologies and open-source tools.

---

**PSSI v0.1.0** - Pleading Sanity System Intelligence
