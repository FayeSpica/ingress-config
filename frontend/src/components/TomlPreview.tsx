import { Modal, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

interface TomlPreviewProps {
  open: boolean;
  toml: string;
  onClose: () => void;
}

export default function TomlPreview({ open, toml, onClose }: TomlPreviewProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(toml);
      message.success('TOML copied to clipboard');
    } catch {
      message.error('Failed to copy');
    }
  };

  return (
    <Modal
      title="TOML Preview"
      open={open}
      onCancel={onClose}
      width={640}
      footer={[
        <Button key="copy" icon={<CopyOutlined />} onClick={handleCopy}>
          Copy
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: 16,
          borderRadius: 8,
          maxHeight: 480,
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {toml || '# Empty pipeline — add nodes and connect them.'}
      </pre>
    </Modal>
  );
}
