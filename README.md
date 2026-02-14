# Votion - Open Source Workspace Platform

An open-source, self-hostable alternative to Notion built with modern web technologies.

## Features

- **Block-based Editor**: Flexible content blocks (text, headings, lists, code, databases)
- **Databases**: Create custom tables with flexible property types
- **Real-time Collaboration**: Multi-user editing with WebSocket support
- **Pages & Hierarchy**: Nested pages with unlimited depth
- **Rich Text Editing**: Markdown support, slash commands
- **API-First Architecture**: Full REST API for integrations
- **Self-Hostable**: Docker-based deployment
- **Open Source**: MIT License

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Running with Docker

```bash
git clone https://github.com/yourusername/votion.git
cd votion
cp .env.example .env
docker-compose up -d
```

Access at http://localhost:3000

### Local Development

```bash
# Set up environment
cp .env.example .env

# Start database
docker-compose up -d postgres redis

# Run backend
cd backend && npm install && npm run dev

# Run frontend (new terminal)
cd frontend && npm install && npm run dev
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Tiptap
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.io
- **Container**: Docker & Docker Compose

## Project Structure

```
votion/
├── backend/          # Node.js API server
├── frontend/         # Next.js frontend
├── database/         # DB schemas and migrations
├── docker-compose.yml
└── README.md
```

## API Documentation

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - List workspaces
- `POST /api/workspaces` - Create workspace
- `PATCH /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Pages
- `GET /api/workspaces/:workspaceId/pages` - List pages
- `POST /api/workspaces/:workspaceId/pages` - Create page
- `GET /api/pages/:id` - Get page
- `PATCH /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Blocks
- `GET /api/pages/:pageId/blocks` - List blocks
- `POST /api/pages/:pageId/blocks` - Create block
- `PATCH /api/blocks/:id` - Update block
- `DELETE /api/blocks/:id` - Delete block

### Databases
- `GET /api/databases/:id` - Get database
- `POST /api/databases/:id/rows` - Create row
- `PATCH /api/databases/:id/rows/:rowId` - Update row

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE)
