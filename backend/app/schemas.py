from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# --- Graph data structures ---

class NodeData(BaseModel):
    label: str = ""
    node_type: str = ""  # e.g. "kafka", "mysql", "filter"
    category: str = ""   # "source", "transform", "sink"
    config: dict[str, Any] = Field(default_factory=dict)


class Node(BaseModel):
    id: str
    type: str = "default"
    position: dict[str, float] = Field(default_factory=dict)
    data: NodeData = Field(default_factory=NodeData)


class Edge(BaseModel):
    id: str
    source: str
    target: str
    source_handle: str | None = None
    target_handle: str | None = None


class GraphData(BaseModel):
    nodes: list[Node] = Field(default_factory=list)
    edges: list[Edge] = Field(default_factory=list)


# --- Config CRUD schemas ---

class ConfigCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = ""
    graph_data: GraphData


class ConfigUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    graph_data: GraphData | None = None


class ConfigResponse(BaseModel):
    id: str
    name: str
    description: str
    graph_data: dict[str, Any]
    toml_content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConfigListItem(BaseModel):
    id: str
    name: str
    description: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Validation / Preview ---

class ValidateRequest(BaseModel):
    graph_data: GraphData


class ValidateResponse(BaseModel):
    valid: bool
    errors: list[str] = Field(default_factory=list)


class PreviewRequest(BaseModel):
    graph_data: GraphData


class PreviewResponse(BaseModel):
    toml_content: str


# --- Node schema definition ---

class FieldSchema(BaseModel):
    name: str
    type: str  # "string", "integer", "boolean", "array", "object"
    required: bool = False
    default: Any = None
    description: str = ""
    options: list[str] | None = None  # for enum-like fields


class NodeTypeSchema(BaseModel):
    node_type: str
    category: str  # "source", "transform", "sink"
    label: str
    description: str = ""
    fields: list[FieldSchema] = Field(default_factory=list)
