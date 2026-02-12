import { Collapse } from 'antd';
import {
  DatabaseOutlined,
  SwapOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { NODE_SCHEMAS } from '../utils/schemas';
import type { NodeCategory } from '../types';

const CATEGORY_META: Record<NodeCategory, { label: string; icon: React.ReactNode; color: string }> = {
  source: { label: 'Source', icon: <DatabaseOutlined />, color: '#52c41a' },
  transform: { label: 'Transform', icon: <SwapOutlined />, color: '#faad14' },
  sink: { label: 'Sink', icon: <ExportOutlined />, color: '#ff4d4f' },
};

const CATEGORIES: NodeCategory[] = ['source', 'transform', 'sink'];

export default function NodePanel() {
  const onDragStart = (
    event: React.DragEvent,
    category: NodeCategory,
    nodeType: string,
    label: string,
  ) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ category, nodeType, label }),
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  const items = CATEGORIES.map((cat) => {
    const meta = CATEGORY_META[cat];
    const schemas = NODE_SCHEMAS.filter((s) => s.category === cat);

    return {
      key: cat,
      label: (
        <span>
          {meta.icon} <span style={{ marginLeft: 6 }}>{meta.label}</span>
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {schemas.map((s) => (
            <div
              key={`${s.category}-${s.nodeType}`}
              draggable
              onDragStart={(e) => onDragStart(e, s.category, s.nodeType, s.label)}
              style={{
                padding: '6px 10px',
                border: `1px solid ${meta.color}`,
                borderRadius: 6,
                cursor: 'grab',
                fontSize: 13,
                background: '#fff',
                userSelect: 'none',
              }}
            >
              {s.label}
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <div
      style={{
        width: 220,
        borderRight: '1px solid #f0f0f0',
        padding: '12px 8px',
        overflowY: 'auto',
        background: '#fafafa',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, paddingLeft: 4 }}>
        Node Palette
      </div>
      <Collapse defaultActiveKey={CATEGORIES} ghost items={items} />
    </div>
  );
}
