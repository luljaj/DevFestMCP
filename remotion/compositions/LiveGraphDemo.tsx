import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import RemotionFileNode from '../components/RemotionFileNode';

const nodeTypes = {
  activeFile: RemotionFileNode,
};

interface LiveGraphDemoProps {
  isDark?: boolean;
}

export const LiveGraphDemo: React.FC<LiveGraphDemoProps> = ({
  isDark = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timings
  const graphAppears = spring({ frame: frame - 10, fps });
  const agent1Locks = spring({ frame: frame - 90, fps });
  const agent2Appears = spring({ frame: frame - 150, fps });
  const agent2BlockedDirect = spring({ frame: frame - 210, fps });
  const agent2TriesUtils = spring({ frame: frame - 270, fps });
  const agent2BlockedNeighbor = spring({ frame: frame - 330, fps });
  const agent2SwitchesConfig = spring({ frame: frame - 390, fps });

  // Simulate lock states over time
  const authLock = frame >= 90 ? {
    status: 'WRITING' as const,
    user_id: 'agent-a',
    user_name: 'Agent A',
    message: 'Refactoring authentication',
  } : undefined;

  const configLock = frame >= 390 ? {
    status: 'WRITING' as const,
    user_id: 'agent-b',
    user_name: 'Agent B',
    message: 'Updating config',
  } : undefined;

  const nodes = useMemo(() => [
    {
      id: 'src/auth.ts',
      type: 'activeFile',
      position: { x: 100, y: 100 },
      data: {
        path: 'src/auth.ts',
        fileName: 'src/auth.ts',
        lockStatus: authLock?.status,
        lockUserId: authLock?.user_id,
        lockUserName: authLock?.user_name,
        lockColor: authLock ? '#f87171' : undefined,
        isUpdated: false,
        isSearchMatch: frame >= 150 && frame < 180,
        isDark,
      },
    },
    {
      id: 'src/types.ts',
      type: 'activeFile',
      position: { x: 450, y: 50 },
      data: {
        path: 'src/types.ts',
        fileName: 'src/types.ts',
        isUpdated: false,
        isSearchMatch: false,
        isDark,
      },
    },
    {
      id: 'src/utils.ts',
      type: 'activeFile',
      position: { x: 450, y: 200 },
      data: {
        path: 'src/utils.ts',
        fileName: 'src/utils.ts',
        isUpdated: false,
        isSearchMatch: frame >= 270 && frame < 300,
        isDark,
      },
    },
    {
      id: 'src/config.ts',
      type: 'activeFile',
      position: { x: 800, y: 125 },
      data: {
        path: 'src/config.ts',
        fileName: 'src/config.ts',
        lockStatus: configLock?.status,
        lockUserId: configLock?.user_id,
        lockUserName: configLock?.user_name,
        lockColor: configLock ? '#f87171' : undefined,
        isUpdated: false,
        isSearchMatch: frame >= 390 && frame < 420,
        isDark,
      },
    },
  ], [frame, authLock, configLock, isDark]);

  const edges = useMemo(() => {
    // Highlight neighbor edges when Agent B tries to edit utils.ts
    const highlightNeighbor = frame >= 270 && frame < 390;

    return [
      {
        id: 'auth-types',
        source: 'src/auth.ts',
        target: 'src/types.ts',
        animated: !!authLock,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'),
          width: authLock ? 14 : 12,
          height: authLock ? 14 : 12,
        },
        style: {
          stroke: authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'),
          strokeWidth: authLock ? 2 : 1.1,
          opacity: authLock ? 0.9 : 0.4,
        },
      },
      {
        id: 'auth-utils',
        source: 'src/auth.ts',
        target: 'src/utils.ts',
        animated: !!authLock || highlightNeighbor,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: highlightNeighbor ? '#ef4444' : (authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa')),
          width: (authLock || highlightNeighbor) ? 14 : 12,
          height: (authLock || highlightNeighbor) ? 14 : 12,
        },
        style: {
          stroke: highlightNeighbor ? '#ef4444' : (authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa')),
          strokeWidth: (authLock || highlightNeighbor) ? 2.5 : 1.1,
          opacity: (authLock || highlightNeighbor) ? 1 : 0.4,
        },
      },
    ];
  }, [frame, authLock, isDark]);

  // Status messages
  const statusMessage = frame < 90 ? null
    : frame < 150 ? 'Agent A claims WRITING lock on auth.ts'
    : frame < 210 ? 'Agent B wants to edit auth.ts - checking status...'
    : frame < 270 ? 'Agent B receives SWITCH_TASK - direct conflict'
    : frame < 330 ? 'Agent B tries utils.ts instead...'
    : frame < 390 ? 'SWITCH_TASK - utils.ts is a neighbor of locked file!'
    : 'Agent B switches to config.ts - safe to edit ✓';

  const statusColor = frame < 90 ? '#71717a'
    : frame < 150 ? '#10b981'
    : frame < 210 ? '#f59e0b'
    : frame < 270 ? '#ef4444'
    : frame < 330 ? '#f59e0b'
    : frame < 390 ? '#ef4444'
    : '#10b981';

  return (
    <AbsoluteFill
      style={{
        background: isDark ? '#09090b' : '#fafafa',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          margin: '40px',
          width: 'calc(100% - 80px)',
          height: 'calc(100% - 80px)',
          border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
          borderRadius: '24px',
          overflow: 'hidden',
          background: isDark ? '#18181b' : '#f4f4f5',
          opacity: interpolate(graphAppears, [0, 1], [0, 1]),
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? '#09090b' : '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: isDark ? '#fafafa' : '#09090b' }}>
              Relay
            </div>
            <div style={{ fontSize: '14px', color: isDark ? '#a1a1aa' : '#71717a' }}>
              luljaj/DevFest • master
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: isDark ? '#27272a' : '#e4e4e7',
              color: isDark ? '#fafafa' : '#18181b',
            }}>
              {(frame >= 90 && frame < 390) || frame >= 390 ? '1' : '0'} Active Lock{((frame >= 90 && frame < 390) || frame >= 390) ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Graph */}
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 130px)' }}>
          <ReactFlow
            nodes={nodes as any}
            edges={edges as any}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnDrag={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: isDark ? '#18181b' : '#f4f4f5' }}
            defaultViewport={{ x: 200, y: 100, zoom: 0.85 }}
          >
            <Background
              color={isDark ? '#3f3f46' : '#a1a1aa'}
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
            />
            <Controls position="top-right" showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                const lockStatus = node.data.lockStatus;
                if (!lockStatus) return isDark ? '#3f3f46' : '#d4d4d8';
                return '#f87171';
              }}
            />
          </ReactFlow>
        </div>

        {/* Status bar */}
        {statusMessage && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDark ? '#09090b' : '#ffffff',
              opacity: interpolate(
                frame < 150 ? agent1Locks
                  : frame < 210 ? agent2Appears
                  : frame < 270 ? agent2BlockedDirect
                  : frame < 330 ? agent2TriesUtils
                  : frame < 390 ? agent2BlockedNeighbor
                  : agent2SwitchesConfig,
                [0, 1],
                [0, 1]
              ),
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusColor,
              }}
            />
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: isDark ? '#fafafa' : '#18181b',
            }}>
              {statusMessage}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
