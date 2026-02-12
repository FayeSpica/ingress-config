from __future__ import annotations

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import Config
from .schemas import (
    ConfigCreate,
    ConfigUpdate,
    ConfigResponse,
    ConfigListItem,
    ValidateRequest,
    ValidateResponse,
    PreviewRequest,
    PreviewResponse,
    GraphData,
)
from .node_schemas import get_all_schemas
from .toml_engine import generate_toml, validate_graph


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Ingress Config API",
    description="Visual data pipeline configuration tool with TOML generation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Schemas API ====================

@app.get("/api/schemas")
def list_schemas():
    """Return all node type schemas for frontend form rendering."""
    schemas = get_all_schemas()
    return [s.model_dump() for s in schemas]


# ==================== Config CRUD ====================

@app.get("/api/configs", response_model=list[ConfigListItem])
def list_configs(db: Session = Depends(get_db)):
    """List all saved configurations."""
    configs = db.query(Config).order_by(Config.updated_at.desc()).all()
    return configs


@app.get("/api/configs/{config_id}", response_model=ConfigResponse)
def get_config(config_id: str, db: Session = Depends(get_db)):
    """Get a single configuration with TOML preview."""
    config = db.query(Config).filter(Config.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    # Parse graph_data from JSON string for response
    result = ConfigResponse(
        id=config.id,
        name=config.name,
        description=config.description,
        graph_data=json.loads(config.graph_data),
        toml_content=config.toml_content,
        created_at=config.created_at,
        updated_at=config.updated_at,
    )
    return result


@app.post("/api/configs", response_model=ConfigResponse, status_code=201)
def create_config(payload: ConfigCreate, db: Session = Depends(get_db)):
    """Create a new configuration. Generates TOML from graph_data."""
    toml_content = generate_toml(payload.graph_data)

    config = Config(
        name=payload.name,
        description=payload.description,
        graph_data=payload.graph_data.model_dump_json(),
        toml_content=toml_content,
    )
    db.add(config)
    db.commit()
    db.refresh(config)

    return ConfigResponse(
        id=config.id,
        name=config.name,
        description=config.description,
        graph_data=json.loads(config.graph_data),
        toml_content=config.toml_content,
        created_at=config.created_at,
        updated_at=config.updated_at,
    )


@app.put("/api/configs/{config_id}", response_model=ConfigResponse)
def update_config(config_id: str, payload: ConfigUpdate, db: Session = Depends(get_db)):
    """Update an existing configuration."""
    config = db.query(Config).filter(Config.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    if payload.name is not None:
        config.name = payload.name
    if payload.description is not None:
        config.description = payload.description
    if payload.graph_data is not None:
        config.graph_data = payload.graph_data.model_dump_json()
        config.toml_content = generate_toml(payload.graph_data)

    db.commit()
    db.refresh(config)

    return ConfigResponse(
        id=config.id,
        name=config.name,
        description=config.description,
        graph_data=json.loads(config.graph_data),
        toml_content=config.toml_content,
        created_at=config.created_at,
        updated_at=config.updated_at,
    )


@app.delete("/api/configs/{config_id}", status_code=204)
def delete_config(config_id: str, db: Session = Depends(get_db)):
    """Delete a configuration."""
    config = db.query(Config).filter(Config.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    db.delete(config)
    db.commit()


# ==================== Validation & Preview ====================

@app.post("/api/configs/validate", response_model=ValidateResponse)
def validate_config(payload: ValidateRequest):
    """Validate a graph configuration without saving."""
    errors = validate_graph(payload.graph_data)
    return ValidateResponse(valid=len(errors) == 0, errors=errors)


@app.post("/api/configs/preview", response_model=PreviewResponse)
def preview_config(payload: PreviewRequest):
    """Preview the generated TOML output without saving."""
    toml_content = generate_toml(payload.graph_data)
    return PreviewResponse(toml_content=toml_content)
