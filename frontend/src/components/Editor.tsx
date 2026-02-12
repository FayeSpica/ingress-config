import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  ReactFlowProvider,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Space, message, Input, Drawer } from 'antd';
import {
  SaveOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

import { nodeTypes } from '../nodes';
import NodePanel from './NodePanel';
import PropertyPanel from './PropertyPanel';
import TomlPreview from './TomlPreview';
import ConfigList from './ConfigList';
import { generateToml } from '../utils/toml';
import { getSchemaByType } from '../utils/schemas';
import { createConfig, updateConfig } from '../api';
import type { PipelineNode, NodeConfig, DragNodePayload, PipelineConfig } from '../types';

let idCounter = 0;
function nextId() {
  return `node_${++idCounter}`;
}

function EditorInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<any, any> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tomlOpen, setTomlOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<PipelineConfig | null>(null);
  const [configName, setConfigName] = useState('Untitled Pipeline');

  const selectedNode = useMemo(
    () => (nodes.find((n) => n.id === selectedNodeId) ?? null) as PipelineNode | null,
    [nodes, selectedNodeId],
  );

  // ---- Edge connection ----
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // ---- Node selection ----
  const onNodeClick = useCallback((_: React.MouseEvent, node: PipelineNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ---- Drop to create node ----
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      const payload: DragNodePayload = JSON.parse(raw);

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds || !rfInstance) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      // Build default config from schema
      const schema = getSchemaByType(payload.category, payload.nodeType);
      const defaultConfig: NodeConfig = {};
      schema?.fields.forEach((f) => {
        if (f.default !== undefined) {
          defaultConfig[f.key] = f.default;
        }
      });

      const newNode: PipelineNode = {
        id: nextId(),
        type: payload.category,
        position,
        data: {
          label: payload.label,
          category: payload.category,
          nodeType: payload.nodeType,
          config: defaultConfig,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [rfInstance, setNodes],
  );

  // ---- Update node config / label ----
  const onUpdateConfig = useCallback(
    (nodeId: string, config: NodeConfig) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, config } } : n,
        ),
      );
    },
    [setNodes],
  );

  const onUpdateLabel = useCallback(
    (nodeId: string, label: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
        ),
      );
    },
    [setNodes],
  );

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
    },
    [setNodes, setEdges],
  );

  // ---- TOML preview ----
  const tomlContent = useMemo(
    () => generateToml(nodes as PipelineNode[], edges),
    [nodes, edges],
  );

  // ---- Save ----
  const handleSave = async () => {
    const payload: PipelineConfig = {
      name: configName,
      nodes: nodes as PipelineNode[],
      edges,
    };

    try {
      if (currentConfig?.id) {
        const updated = await updateConfig(currentConfig.id, payload);
        setCurrentConfig(updated);
        message.success('Config updated');
      } else {
        const created = await createConfig(payload);
        setCurrentConfig(created);
        message.success('Config saved');
      }
    } catch {
      message.error('Failed to save config. Is the backend running?');
    }
  };

  // ---- Load config ----
  const handleLoadConfig = (config: PipelineConfig) => {
    setCurrentConfig(config);
    setConfigName(config.name);
    setNodes(config.nodes ?? []);
    setEdges(config.edges ?? []);
    setConfigDrawerOpen(false);
    setSelectedNodeId(null);
  };

  const handleNewPipeline = () => {
    setCurrentConfig(null);
    setConfigName('Untitled Pipeline');
    setNodes([]);
    setEdges([]);
    setConfigDrawerOpen(false);
    setSelectedNodeId(null);
    idCounter = 0;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Left sidebar: node palette */}
      <NodePanel />

      {/* Center: canvas + toolbar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
          }}
        >
          <Input
            style={{ width: 200 }}
            size="small"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
          />
          <Space>
            <Button
              size="small"
              icon={<SaveOutlined />}
              type="primary"
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => setTomlOpen(true)}
            >
              TOML Preview
            </Button>
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => setConfigDrawerOpen(true)}
            >
              Configs
            </Button>
          </Space>
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} style={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Controls />
            <Background gap={16} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Right sidebar: properties */}
      <PropertyPanel
        selectedNode={selectedNode}
        onUpdateConfig={onUpdateConfig}
        onUpdateLabel={onUpdateLabel}
        onDeleteNode={onDeleteNode}
      />

      {/* TOML preview modal */}
      <TomlPreview toml={tomlContent} open={tomlOpen} onClose={() => setTomlOpen(false)} />

      {/* Config list drawer */}
      <Drawer
        title="Config Manager"
        open={configDrawerOpen}
        onClose={() => setConfigDrawerOpen(false)}
        width={340}
      >
        <ConfigList
          onLoad={handleLoadConfig}
          onNew={handleNewPipeline}
          currentConfigId={currentConfig?.id}
        />
      </Drawer>
    </div>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}
