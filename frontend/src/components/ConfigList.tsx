import { useState, useEffect, useCallback } from 'react';
import { List, Button, Popconfirm, message, Empty, Spin, Input } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { fetchConfigs, deleteConfig, createConfig } from '../api';
import type { PipelineConfig } from '../types';

interface ConfigListProps {
  onLoad: (config: PipelineConfig) => void;
  onNew: () => void;
  currentConfigId?: string;
}

export default function ConfigList({ onLoad, onNew, currentConfigId }: ConfigListProps) {
  const [configs, setConfigs] = useState<PipelineConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConfigs();
      setConfigs(data);
    } catch {
      // API may not be available yet
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteConfig(id);
      message.success('Config deleted');
      load();
    } catch {
      message.error('Failed to delete config');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const config = await createConfig({
        name: newName.trim(),
        nodes: [],
        edges: [],
      });
      message.success('Config created');
      setNewName('');
      setCreating(false);
      load();
      onLoad(config);
    } catch {
      message.error('Failed to create config');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Saved Configs</span>
        <span>
          <Button size="small" icon={<ReloadOutlined />} onClick={load} style={{ marginRight: 4 }} />
          <Button size="small" icon={<PlusOutlined />} onClick={() => setCreating(true)} />
        </span>
      </div>

      {creating && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <Input
            size="small"
            placeholder="Config name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onPressEnter={handleCreate}
          />
          <Button size="small" type="primary" onClick={handleCreate}>
            Save
          </Button>
          <Button size="small" onClick={() => setCreating(false)}>
            Cancel
          </Button>
        </div>
      )}

      <Spin spinning={loading}>
        {configs.length === 0 ? (
          <Empty description="No configs yet" />
        ) : (
          <List
            size="small"
            dataSource={configs}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.id === currentConfigId ? '#e6f4ff' : undefined,
                  borderRadius: 6,
                  padding: '4px 8px',
                  marginBottom: 4,
                }}
                actions={[
                  <Button
                    key="load"
                    size="small"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => onLoad(item)}
                  />,
                  <Popconfirm
                    key="del"
                    title="Delete this config?"
                    onConfirm={() => item.id && handleDelete(item.id)}
                  >
                    <Button size="small" type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={<span style={{ fontSize: 13 }}>{item.name}</span>}
                  description={
                    <span style={{ fontSize: 11 }}>
                      {item.nodes?.length ?? 0} nodes
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>

      <Button
        style={{ marginTop: 8, width: '100%' }}
        size="small"
        onClick={onNew}
      >
        New Pipeline
      </Button>
    </div>
  );
}
