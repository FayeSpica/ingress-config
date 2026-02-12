import axios from 'axios';
import type { PipelineConfig, PipelineNode } from '../types';
import type { Edge } from '@xyflow/react';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Convert frontend PipelineConfig to backend ConfigCreate/ConfigUpdate format
function toBackendPayload(config: PipelineConfig) {
  return {
    name: config.name,
    description: config.description ?? '',
    graph_data: {
      nodes: config.nodes.map((n) => ({
        id: n.id,
        type: n.type ?? 'default',
        position: n.position ?? { x: 0, y: 0 },
        data: {
          label: n.data?.label ?? '',
          node_type: n.data?.nodeType ?? '',
          category: n.data?.category ?? '',
          config: n.data?.config ?? {},
        },
      })),
      edges: config.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        source_handle: e.sourceHandle ?? null,
        target_handle: e.targetHandle ?? null,
      })),
    },
  };
}

// Convert backend ConfigResponse to frontend PipelineConfig format
function fromBackendResponse(data: any): PipelineConfig {
  const graphData = data.graph_data ?? { nodes: [], edges: [] };
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    nodes: (graphData.nodes ?? []).map((n: any) => ({
      id: n.id,
      type: n.type ?? 'default',
      position: n.position ?? { x: 0, y: 0 },
      data: {
        label: n.data?.label ?? '',
        category: n.data?.category ?? '',
        nodeType: n.data?.node_type ?? '',
        config: n.data?.config ?? {},
      },
    })) as PipelineNode[],
    edges: (graphData.edges ?? []).map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.source_handle ?? undefined,
      targetHandle: e.target_handle ?? undefined,
    })) as Edge[],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function fetchConfigs(): Promise<PipelineConfig[]> {
  const res = await client.get('/configs');
  return (res.data ?? []).map(fromBackendResponse);
}

export async function fetchConfig(id: string): Promise<PipelineConfig> {
  const res = await client.get(`/configs/${id}`);
  return fromBackendResponse(res.data);
}

export async function createConfig(config: PipelineConfig): Promise<PipelineConfig> {
  const res = await client.post('/configs', toBackendPayload(config));
  return fromBackendResponse(res.data);
}

export async function updateConfig(id: string, config: PipelineConfig): Promise<PipelineConfig> {
  const res = await client.put(`/configs/${id}`, toBackendPayload(config));
  return fromBackendResponse(res.data);
}

export async function deleteConfig(id: string): Promise<void> {
  await client.delete(`/configs/${id}`);
}
