import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { PipelineNode } from '../types';

const CATEGORY_COLOR = '#faad14';

export default function TransformNode({ data, selected }: NodeProps<PipelineNode>) {
  return (
    <div
      style={{
        padding: '8px 16px',
        border: `2px solid ${selected ? '#1677ff' : CATEGORY_COLOR}`,
        borderRadius: 8,
        background: '#fffbe6',
        minWidth: 140,
        textAlign: 'center',
        fontSize: 13,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: CATEGORY_COLOR }} />
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{data.label}</div>
      <div style={{ fontSize: 11, color: '#888' }}>transform / {data.nodeType}</div>
      <Handle type="source" position={Position.Right} style={{ background: CATEGORY_COLOR }} />
    </div>
  );
}
