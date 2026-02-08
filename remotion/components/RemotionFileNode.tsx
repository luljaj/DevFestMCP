import React, { memo, CSSProperties } from 'react';
import { Handle, Position } from 'reactflow';

interface RemotionFileNodeProps {
  data: {
    fileName: string;
    path?: string;
    lockStatus?: 'READING' | 'WRITING';
    lockUserId?: string;
    lockUserName?: string;
    lockColor?: string;
    isUpdated?: boolean;
    isSearchMatch?: boolean;
    isDark?: boolean;
  };
}

const RemotionFileNode = ({ data }: RemotionFileNodeProps) => {
  const { fileName, lockStatus, lockUserName, lockColor, isUpdated, isSearchMatch, path, isDark } = data;

  const isTaken = !!lockStatus;
  const resolvedPath = path ?? fileName;
  const displayName = getDisplayFileName(resolvedPath);
  const folderPath = getFolderPath(resolvedPath);
  const folderLabel = folderPath || '(root)';

  const accentColor = lockColor ?? (isDark ? '#71717a' : '#a1a1aa');
  const borderColor = isTaken ? accentColor : isDark ? '#71717a' : '#a1a1aa';
  const borderWidth = isTaken ? '2.8px' : '1.5px';
  const borderStyle = lockStatus === 'READING' ? 'dashed' : 'solid';
  const backgroundColor = !isTaken
    ? (isDark ? '#18181b' : '#fafafa')
    : lockStatus === 'WRITING'
      ? withOpacity(accentColor, isDark ? 0.24 : 0.16)
      : withOpacity(accentColor, isDark ? 0.16 : 0.1);

  const boxShadow = buildNodeShadow({
    isTaken,
    accentColor,
    isSearchMatch: Boolean(isSearchMatch),
    isUpdated: Boolean(isUpdated),
    isDark,
  });

  const containerStyle: CSSProperties = {
    position: 'relative',
    minWidth: '210px',
    overflow: 'hidden',
    borderRadius: '16px',
    padding: '12px 16px',
    transition: 'all 0.2s',
    borderColor,
    borderStyle,
    borderWidth,
    backgroundColor,
    boxShadow,
    animation: isTaken ? 'gentle-pulse 2s ease-in-out infinite' : 'none',
  };

  const fileNameStyle: CSSProperties = {
    fontFamily: 'JetBrains Mono, Consolas, monospace',
    fontSize: '12px',
    fontWeight: 600,
    color: isDark ? '#fafafa' : '#09090b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: '4px',
  };

  const folderStyle: CSSProperties = {
    fontSize: '10px',
    color: isDark ? '#a1a1aa' : '#71717a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: '4px',
  };

  const lockContainerStyle: CSSProperties = {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  };

  const lockBadgeStyle: CSSProperties = {
    borderRadius: '999px',
    border: `1px solid ${accentColor}`,
    padding: '2px 8px',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    backgroundColor: withOpacity(accentColor, isDark ? 0.18 : 0.14),
    color: isDark ? '#f4f4f5' : '#18181b',
  };

  const userNameStyle: CSSProperties = {
    fontSize: '9px',
    color: isDark ? '#d4d4d8' : '#52525b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  };

  const handleStyle: CSSProperties = {
    width: '8px',
    height: '4px',
    borderRadius: '2px',
    opacity: 0,
    background: isDark ? '#71717a' : '#d4d4d8',
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes gentle-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
        `}
      </style>
      <div style={containerStyle}>
        {isSearchMatch && (
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(125, 211, 252, 0.7)' : 'rgba(14, 165, 233, 0.55)'}`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        {isUpdated && (
          <div
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              border: `2px solid ${isDark ? 'rgba(113, 113, 122, 0.6)' : 'rgba(161, 161, 170, 0.55)'}`,
            }}
          />
        )}

        <div style={fileNameStyle} title={resolvedPath}>
          {displayName}
        </div>
        <div style={folderStyle} title={folderLabel}>
          {folderLabel}
        </div>
        {lockStatus && lockUserName && (
          <div style={lockContainerStyle}>
            <span style={lockBadgeStyle}>
              {lockStatus}
            </span>
            <span style={userNameStyle} title={lockUserName}>
              {lockUserName}
            </span>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, top: '-2px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, bottom: '-2px' }}
      />
    </div>
  );
};

function getDisplayFileName(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash === -1) {
    return path;
  }
  return path.slice(lastSlash + 1);
}

function getFolderPath(path: string): string {
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash === -1) {
    return '';
  }
  return path.slice(0, lastSlash);
}

function buildNodeShadow({
  isTaken,
  accentColor,
  isSearchMatch,
  isUpdated,
  isDark,
}: {
  isTaken: boolean;
  accentColor: string;
  isSearchMatch: boolean;
  isUpdated: boolean;
  isDark?: boolean;
}): string {
  const layers: string[] = [];

  if (isTaken) {
    layers.push(`0 0 0 1px ${withOpacity(accentColor, isDark ? 0.9 : 0.7)}`);
    layers.push(`0 0 18px ${withOpacity(accentColor, isDark ? 0.45 : 0.32)}`);
  }

  if (isSearchMatch) {
    layers.push(isDark ? '0 0 0 1px rgba(56,189,248,0.85)' : '0 0 0 1px rgba(14,116,144,0.48)');
    layers.push(isDark ? '0 0 18px rgba(56,189,248,0.28)' : '0 0 12px rgba(56,189,248,0.2)');
  } else if (isUpdated) {
    layers.push(isDark ? '0 0 0 1px rgba(161,161,170,0.55)' : '0 0 0 1px rgba(113,113,122,0.35)');
  }

  return layers.length > 0 ? layers.join(', ') : 'none';
}

function withOpacity(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) {
    return hex;
  }

  const r = Number.parseInt(cleaned.slice(0, 2), 16);
  const g = Number.parseInt(cleaned.slice(2, 4), 16);
  const b = Number.parseInt(cleaned.slice(4, 6), 16);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return hex;
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default memo(RemotionFileNode);
