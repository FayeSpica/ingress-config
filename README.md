# Ingress Config

A visual data pipeline configuration tool that lets you build ingress pipelines by dragging and connecting Source, Transform, and Sink nodes, then generates TOML configuration files.

## Architecture

```
frontend/ (React + TypeScript + Vite)
  - @xyflow/react for drag-and-drop node editor
  - Ant Design for UI components
  - Axios for API communication

backend/ (Python FastAPI)
  - FastAPI REST API with auto-generated docs
  - SQLAlchemy + SQLite for config persistence
  - TOML generation engine with graph validation
```

### Data Flow

1. User drags nodes (Source / Transform / Sink) from the palette onto the canvas
2. User connects nodes with edges to define the data flow
3. User configures each node via the property panel
4. The system generates TOML configuration in real-time
5. Configurations can be saved, loaded, and managed through the API

### Supported Node Types

**Source**: Kafka, MySQL, PostgreSQL, HTTP, File
**Transform**: Filter, Map, Split, Aggregate, Join
**Sink**: Kafka, MySQL, HTTP, File, Elasticsearch, ClickHouse

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/schemas | List all node type schemas |
| GET | /api/configs | List saved configurations |
| POST | /api/configs | Create a new configuration |
| GET | /api/configs/{id} | Get a configuration |
| PUT | /api/configs/{id} | Update a configuration |
| DELETE | /api/configs/{id} | Delete a configuration |
| POST | /api/configs/validate | Validate graph without saving |
| POST | /api/configs/preview | Preview generated TOML |

Interactive API docs available at `http://localhost:8000/docs` when the backend is running.

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Quick Start

### Option 1: Using the start script

```bash
chmod +x start.sh
./start.sh
```

This starts both the backend (port 8000) and frontend dev server (port 3000).

### Option 2: Manual startup

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

### Option 3: Docker Compose

```bash
docker-compose up --build
```

The app will be available at http://localhost:3000.

## Project Structure

```
ingress-config/
  backend/
    app/
      main.py          # FastAPI app with all API routes
      models.py         # SQLAlchemy database models
      schemas.py        # Pydantic request/response schemas
      node_schemas.py   # Node type definitions (source/transform/sink)
      toml_engine.py    # TOML generation and graph validation
      database.py       # Database connection setup
    requirements.txt
  frontend/
    src/
      api/index.ts          # API client (Axios)
      components/
        Editor.tsx           # Main editor with ReactFlow canvas
        NodePanel.tsx        # Left sidebar node palette
        PropertyPanel.tsx    # Right sidebar property editor
        TomlPreview.tsx      # TOML preview modal
        ConfigList.tsx       # Config manager drawer
      nodes/
        SourceNode.tsx       # Source node component (green)
        TransformNode.tsx    # Transform node component (yellow)
        SinkNode.tsx         # Sink node component (red)
      types/index.ts         # TypeScript type definitions
      utils/
        schemas.ts           # Frontend node schema definitions
        toml.ts              # Client-side TOML generation
    package.json
    vite.config.ts
  docker-compose.yml
  start.sh
  README.md
```
