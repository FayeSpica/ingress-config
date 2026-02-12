import { Form, Input, InputNumber, Switch, Select, Typography, Empty, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getSchemaByType } from '../utils/schemas';
import type { PipelineNode, NodeConfig } from '../types';

interface PropertyPanelProps {
  selectedNode: PipelineNode | null;
  onUpdateConfig: (nodeId: string, config: NodeConfig) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export default function PropertyPanel({
  selectedNode,
  onUpdateConfig,
  onUpdateLabel,
  onDeleteNode,
}: PropertyPanelProps) {
  if (!selectedNode) {
    return (
      <div
        style={{
          width: 280,
          borderLeft: '1px solid #f0f0f0',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
        }}
      >
        <Empty description="Select a node to edit" />
      </div>
    );
  }

  const { data } = selectedNode;
  const schema = getSchemaByType(data.category, data.nodeType);

  const handleFieldChange = (key: string, value: string | number | boolean) => {
    onUpdateConfig(selectedNode.id, { ...data.config, [key]: value });
  };

  return (
    <div
      style={{
        width: 280,
        borderLeft: '1px solid #f0f0f0',
        padding: 16,
        overflowY: 'auto',
        background: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          Properties
        </Typography.Text>
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDeleteNode(selectedNode.id)}
        >
          Delete
        </Button>
      </div>

      <Form layout="vertical" size="small">
        <Form.Item label="Name">
          <Input
            value={data.label}
            onChange={(e) => onUpdateLabel(selectedNode.id, e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Category">
          <Input value={data.category} disabled />
        </Form.Item>

        <Form.Item label="Type">
          <Input value={data.nodeType} disabled />
        </Form.Item>

        {schema?.fields.map((field) => (
          <Form.Item
            key={field.key}
            label={field.label}
            required={field.required}
          >
            {field.type === 'string' && (
              <Input
                value={(data.config[field.key] as string) ?? (field.default as string) ?? ''}
                placeholder={field.placeholder}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            )}
            {field.type === 'number' && (
              <InputNumber
                style={{ width: '100%' }}
                value={(data.config[field.key] as number) ?? (field.default as number) ?? undefined}
                onChange={(v) => handleFieldChange(field.key, v ?? 0)}
              />
            )}
            {field.type === 'boolean' && (
              <Switch
                checked={
                  (data.config[field.key] as boolean) ?? (field.default as boolean) ?? false
                }
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            )}
            {field.type === 'select' && (
              <Select
                style={{ width: '100%' }}
                value={(data.config[field.key] as string) ?? (field.default as string)}
                options={field.options}
                onChange={(v) => handleFieldChange(field.key, v)}
              />
            )}
          </Form.Item>
        ))}
      </Form>
    </div>
  );
}
