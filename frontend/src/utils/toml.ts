import type { PipelineNode, NodeConfig } from '../types';
import type { Edge } from '@xyflow/react';

function escapeTomlString(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function formatValue(val: string | number | boolean): string {
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return String(val);
  return `"${escapeTomlString(String(val))}"`;
}

function configToToml(config: NodeConfig, indent = '  '): string {
  return Object.entries(config)
    .filter(([, v]) => v !== '' && v !== undefined)
    .map(([k, v]) => `${indent}${k} = ${formatValue(v)}`)
    .join('\n');
}

export function generateToml(nodes: PipelineNode[], edges: Edge[]): string {
  const lines: string[] = [];

  // Group nodes by category
  const sources = nodes.filter((n) => n.data.category === 'source');
  const transforms = nodes.filter((n) => n.data.category === 'transform');
  const sinks = nodes.filter((n) => n.data.category === 'sink');

  // Sources
  sources.forEach((node, i) => {
    const header = sources.length > 1 ? `[[source]]` : `[source]`;
    lines.push(header);
    lines.push(`  type = "${node.data.nodeType}"`);
    lines.push(`  name = "${escapeTomlString(node.data.label)}"`);
    const cfg = configToToml(node.data.config);
    if (cfg) lines.push(cfg);
    if (i < sources.length - 1) lines.push('');
  });

  if (sources.length && (transforms.length || sinks.length)) lines.push('');

  // Transforms
  transforms.forEach((node, i) => {
    const header = transforms.length > 1 ? `[[transform]]` : `[transform]`;
    lines.push(header);
    lines.push(`  type = "${node.data.nodeType}"`);
    lines.push(`  name = "${escapeTomlString(node.data.label)}"`);
    const cfg = configToToml(node.data.config);
    if (cfg) lines.push(cfg);
    if (i < transforms.length - 1) lines.push('');
  });

  if (transforms.length && sinks.length) lines.push('');

  // Sinks
  sinks.forEach((node, i) => {
    const header = sinks.length > 1 ? `[[sink]]` : `[sink]`;
    lines.push(header);
    lines.push(`  type = "${node.data.nodeType}"`);
    lines.push(`  name = "${escapeTomlString(node.data.label)}"`);
    const cfg = configToToml(node.data.config);
    if (cfg) lines.push(cfg);
    if (i < sinks.length - 1) lines.push('');
  });

  // Edges / pipeline connections
  if (edges.length) {
    lines.push('');
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (src && tgt) {
        lines.push(`# ${src.data.label} -> ${tgt.data.label}`);
      }
    });

    lines.push('');
    lines.push('[[pipeline]]');
    edges.forEach((edge) => {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (src && tgt) {
        lines.push(`  # ${src.data.label} -> ${tgt.data.label}`);
      }
    });
    lines.push(`  edges = [`);
    edges.forEach((edge, i) => {
      const comma = i < edges.length - 1 ? ',' : '';
      lines.push(`    { source = "${edge.source}", target = "${edge.target}" }${comma}`);
    });
    lines.push(`  ]`);
  }

  return lines.join('\n') + '\n';
}
