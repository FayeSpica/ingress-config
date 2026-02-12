import type { NodeTypeSchema } from '../types';

export const NODE_SCHEMAS: NodeTypeSchema[] = [
  // ============ Source nodes ============
  {
    category: 'source',
    nodeType: 'kafka',
    label: 'Kafka Source',
    fields: [
      { key: 'brokers', label: 'Brokers', type: 'string', required: true, placeholder: 'host1:9092,host2:9092' },
      { key: 'topic', label: 'Topic', type: 'string', required: true },
      { key: 'group_id', label: 'Group ID', type: 'string', required: true },
      { key: 'offset', label: 'Offset', type: 'select', default: 'latest', options: [{ label: 'Latest', value: 'latest' }, { label: 'Earliest', value: 'earliest' }] },
    ],
  },
  {
    category: 'source',
    nodeType: 'mysql',
    label: 'MySQL Source',
    fields: [
      { key: 'host', label: 'Host', type: 'string', required: true, placeholder: '127.0.0.1' },
      { key: 'port', label: 'Port', type: 'number', default: 3306 },
      { key: 'database', label: 'Database', type: 'string', required: true },
      { key: 'table', label: 'Table', type: 'string', required: true },
      { key: 'username', label: 'Username', type: 'string', required: true },
      { key: 'password', label: 'Password', type: 'string', required: true },
    ],
  },
  {
    category: 'source',
    nodeType: 'http',
    label: 'HTTP Source',
    fields: [
      { key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://example.com/data' },
      { key: 'method', label: 'Method', type: 'select', default: 'GET', options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }] },
      { key: 'interval', label: 'Interval (s)', type: 'number', default: 60 },
    ],
  },
  {
    category: 'source',
    nodeType: 'file',
    label: 'File Source',
    fields: [
      { key: 'path', label: 'File Path', type: 'string', required: true, placeholder: '/data/input.csv' },
      { key: 'format', label: 'Format', type: 'select', default: 'json', options: [{ label: 'JSON', value: 'json' }, { label: 'CSV', value: 'csv' }, { label: 'Text', value: 'text' }] },
    ],
  },
  {
    category: 'source',
    nodeType: 'postgres',
    label: 'Postgres Source',
    fields: [
      { key: 'host', label: 'Host', type: 'string', required: true, placeholder: '127.0.0.1' },
      { key: 'port', label: 'Port', type: 'number', default: 5432 },
      { key: 'database', label: 'Database', type: 'string', required: true },
      { key: 'table', label: 'Table', type: 'string', required: true },
      { key: 'username', label: 'Username', type: 'string', required: true },
      { key: 'password', label: 'Password', type: 'string', required: true },
    ],
  },

  // ============ Transform nodes ============
  {
    category: 'transform',
    nodeType: 'filter',
    label: 'Filter',
    fields: [
      { key: 'condition', label: 'Condition', type: 'string', required: true, placeholder: 'field == "value"' },
    ],
  },
  {
    category: 'transform',
    nodeType: 'map',
    label: 'Map',
    fields: [
      { key: 'expression', label: 'Expression', type: 'string', required: true, placeholder: 'field = upper(field)' },
    ],
  },
  {
    category: 'transform',
    nodeType: 'split',
    label: 'Split',
    fields: [
      { key: 'field', label: 'Field', type: 'string', required: true },
      { key: 'delimiter', label: 'Delimiter', type: 'string', default: ',' },
    ],
  },
  {
    category: 'transform',
    nodeType: 'aggregate',
    label: 'Aggregate',
    fields: [
      { key: 'group_by', label: 'Group By', type: 'string', required: true },
      { key: 'function', label: 'Function', type: 'select', default: 'count', options: [{ label: 'Count', value: 'count' }, { label: 'Sum', value: 'sum' }, { label: 'Avg', value: 'avg' }, { label: 'Max', value: 'max' }, { label: 'Min', value: 'min' }] },
      { key: 'field', label: 'Field', type: 'string' },
    ],
  },
  {
    category: 'transform',
    nodeType: 'join',
    label: 'Join',
    fields: [
      { key: 'join_type', label: 'Join Type', type: 'select', default: 'inner', options: [{ label: 'Inner', value: 'inner' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }, { label: 'Full', value: 'full' }] },
      { key: 'on', label: 'Join Key', type: 'string', required: true },
    ],
  },

  // ============ Sink nodes ============
  {
    category: 'sink',
    nodeType: 'kafka',
    label: 'Kafka Sink',
    fields: [
      { key: 'brokers', label: 'Brokers', type: 'string', required: true, placeholder: 'host1:9092,host2:9092' },
      { key: 'topic', label: 'Topic', type: 'string', required: true },
    ],
  },
  {
    category: 'sink',
    nodeType: 'mysql',
    label: 'MySQL Sink',
    fields: [
      { key: 'host', label: 'Host', type: 'string', required: true, placeholder: '127.0.0.1' },
      { key: 'port', label: 'Port', type: 'number', default: 3306 },
      { key: 'database', label: 'Database', type: 'string', required: true },
      { key: 'table', label: 'Table', type: 'string', required: true },
      { key: 'username', label: 'Username', type: 'string', required: true },
      { key: 'password', label: 'Password', type: 'string', required: true },
    ],
  },
  {
    category: 'sink',
    nodeType: 'http',
    label: 'HTTP Sink',
    fields: [
      { key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://example.com/webhook' },
      { key: 'method', label: 'Method', type: 'select', default: 'POST', options: [{ label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }] },
    ],
  },
  {
    category: 'sink',
    nodeType: 'file',
    label: 'File Sink',
    fields: [
      { key: 'path', label: 'File Path', type: 'string', required: true, placeholder: '/data/output.json' },
      { key: 'format', label: 'Format', type: 'select', default: 'json', options: [{ label: 'JSON', value: 'json' }, { label: 'CSV', value: 'csv' }, { label: 'Text', value: 'text' }] },
    ],
  },
  {
    category: 'sink',
    nodeType: 'elasticsearch',
    label: 'Elasticsearch Sink',
    fields: [
      { key: 'hosts', label: 'Hosts', type: 'string', required: true, placeholder: 'http://localhost:9200' },
      { key: 'index', label: 'Index', type: 'string', required: true },
    ],
  },
  {
    category: 'sink',
    nodeType: 'clickhouse',
    label: 'ClickHouse Sink',
    fields: [
      { key: 'host', label: 'Host', type: 'string', required: true, placeholder: '127.0.0.1' },
      { key: 'port', label: 'Port', type: 'number', default: 8123 },
      { key: 'database', label: 'Database', type: 'string', required: true },
      { key: 'table', label: 'Table', type: 'string', required: true },
      { key: 'username', label: 'Username', type: 'string', default: 'default' },
      { key: 'password', label: 'Password', type: 'string' },
    ],
  },
];

export function getSchemaByType(category: string, nodeType: string): NodeTypeSchema | undefined {
  return NODE_SCHEMAS.find((s) => s.category === category && s.nodeType === nodeType);
}
