import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { PipelineNode } from '../types';

const CATEGORY_COLOR = '#52c41a';

export default function SourceNode({ data, selected }: NodeProps<PipelineNode>) {
  return (
    <div
      style={{
        padding: '8px 16px',
        border: `2px solid ${selected ? '#1677ff' : CATEGORY_COLOR}`,
        borderRadius: 8,
        background: '#f6ffed',
        minWidth: 140,
        textAlign: 'center',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{data.label}</div>
      <div style={{ fontSize: 11, color: '#888' }}>source / {data.nodeType}</div>
      <Handle type="source" position={Position.Right} style={{ background: CATEGORY_COLOR }} />
    </div>
  );
}
