import type { Node, Edge } from '@xyflow/react';

// --- Node category and type definitions ---

export type SourceType = 'kafka' | 'mysql' | 'http' | 'file' | 'postgres';
export type TransformType = 'filter' | 'map' | 'split' | 'aggregate' | 'join';
export type SinkType = 'kafka' | 'mysql' | 'http' | 'file' | 'elasticsearch' | 'clickhouse';

export type NodeCategory = 'source' | 'transform' | 'sink';
export type NodeSubType = SourceType | TransformType | SinkType;

// --- Node data shape ---

export interface NodeConfig {
  [key: string]: string | number | boolean;
}

export interface PipelineNodeData {
  label: string;
  category: NodeCategory;
  nodeType: NodeSubType;
  config: NodeConfig;
  [key: string]: unknown;
}

export type PipelineNode = Node<PipelineNodeData>;

// --- Pipeline / config persistence ---

export interface PipelineConfig {
  id?: string;
  name: string;
  description?: string;
  nodes: PipelineNode[];
  edges: Edge[];
  created_at?: string;
  updated_at?: string;
}

// --- Schema definitions for node types ---

export interface FieldSchema {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required?: boolean;
  default?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface NodeTypeSchema {
  category: NodeCategory;
  nodeType: NodeSubType;
  label: string;
  fields: FieldSchema[];
}

// --- Drag event payload ---

export interface DragNodePayload {
  category: NodeCategory;
  nodeType: NodeSubType;
  label: string;
}
