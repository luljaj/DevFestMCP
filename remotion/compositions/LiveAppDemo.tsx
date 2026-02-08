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

interface LiveAppDemoProps {
  isDark?: boolean;
}

export const LiveAppDemo: React.FC<LiveAppDemoProps> = ({
  isDark = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timings
  const appAppears = spring({ frame: frame - 10, fps });

  // Agent activities
  const agent1Activity = spring({ frame: frame - 40, fps });
  const agent2Activity = spring({ frame: frame - 100, fps });
  const agent3Activity = spring({ frame: frame - 160, fps });
  const agent1Release = spring({ frame: frame - 220, fps });
  const agent2Lock = spring({ frame: frame - 280, fps });
  const agent3Lock = spring({ frame: frame - 340, fps });

  // Agent colors
  const agentColors = {
    claude: '#10b981',
    cursor: '#3b82f6',
    cline: '#f59e0b',
    copilot: '#8b5cf6',
    devin: '#ec4899',
  };

  // Simulate lock states over time
  const authLock = frame >= 40 && frame < 240 ? {
    status: 'WRITING' as const,
    user_id: 'claude-agent',
    user_name: 'Claude',
    message: 'Refactoring auth',
    color: agentColors.claude,
  } : undefined;

  const dbLock = frame >= 80 && frame < 200 ? {
    status: 'READING' as const,
    user_id: 'cursor-dev',
    user_name: 'Cursor',
    message: 'Reading schema',
    color: agentColors.cursor,
  } : frame >= 200 && frame < 340 ? {
    status: 'WRITING' as const,
    user_id: 'cursor-dev',
    user_name: 'Cursor',
    message: 'Updating migrations',
    color: agentColors.cursor,
  } : undefined;

  const apiLock = frame >= 120 && frame < 360 ? {
    status: 'WRITING' as const,
    user_id: 'cline-bot',
    user_name: 'Cline',
    message: 'Adding endpoints',
    color: agentColors.cline,
  } : undefined;

  const configLock = frame >= 160 && frame < 280 ? {
    status: 'READING' as const,
    user_id: 'copilot-x',
    user_name: 'Copilot',
    message: 'Reading config',
    color: agentColors.copilot,
  } : undefined;

  const routesLock = frame >= 200 && frame < 380 ? {
    status: 'WRITING' as const,
    user_id: 'devin-ai',
    user_name: 'Devin',
    message: 'Updating routes',
    color: agentColors.devin,
  } : undefined;

  const middlewareLock = frame >= 260 && frame < 320 ? {
    status: 'WRITING' as const,
    user_id: 'claude-agent',
    user_name: 'Claude',
    message: 'Adding middleware',
    color: agentColors.claude,
  } : undefined;

  const testLock = frame >= 300 ? {
    status: 'WRITING' as const,
    user_id: 'copilot-x',
    user_name: 'Copilot',
    message: 'Writing tests',
    color: agentColors.copilot,
  } : undefined;

  const nodes = useMemo(() => [
    // Top-left zone: Auth & Types (Claude)
    {
      id: 'src/auth.ts',
      type: 'activeFile',
      position: { x: 80, y: 80 },
      data: {
        path: 'src/auth.ts',
        fileName: 'src/auth.ts',
        lockStatus: authLock?.status,
        lockUserId: authLock?.user_id,
        lockUserName: authLock?.user_name,
        lockColor: authLock?.color,
        isDark,
      },
    },
    {
      id: 'src/types.ts',
      type: 'activeFile',
      position: { x: 300, y: 100 },
      data: {
        path: 'src/types.ts',
        fileName: 'src/types.ts',
        isDark,
      },
    },
    // Middle zone: Database (Cursor)
    {
      id: 'src/db.ts',
      type: 'activeFile',
      position: { x: 500, y: 250 },
      data: {
        path: 'src/db.ts',
        fileName: 'src/db.ts',
        lockStatus: dbLock?.status,
        lockUserId: dbLock?.user_id,
        lockUserName: dbLock?.user_name,
        lockColor: dbLock?.color,
        isDark,
      },
    },
    {
      id: 'src/config.ts',
      type: 'activeFile',
      position: { x: 480, y: 400 },
      data: {
        path: 'src/config.ts',
        fileName: 'src/config.ts',
        lockStatus: configLock?.status,
        lockUserId: configLock?.user_id,
        lockUserName: configLock?.user_name,
        lockColor: configLock?.color,
        isDark,
      },
    },
    // Top-right zone: API & Services (Cline)
    {
      id: 'src/api.ts',
      type: 'activeFile',
      position: { x: 900, y: 100 },
      data: {
        path: 'src/api.ts',
        fileName: 'src/api.ts',
        lockStatus: apiLock?.status,
        lockUserId: apiLock?.user_id,
        lockUserName: apiLock?.user_name,
        lockColor: apiLock?.color,
        isDark,
      },
    },
    {
      id: 'src/services/email.ts',
      type: 'activeFile',
      position: { x: 1100, y: 80 },
      data: { path: 'src/services/email.ts', fileName: 'src/services/email.ts', isDark },
    },
    {
      id: 'src/services/logger.ts',
      type: 'activeFile',
      position: { x: 1100, y: 180 },
      data: { path: 'src/services/logger.ts', fileName: 'src/services/logger.ts', isDark },
    },
    {
      id: 'src/services/cache.ts',
      type: 'activeFile',
      position: { x: 700, y: 250 },
      data: { path: 'src/services/cache.ts', fileName: 'src/services/cache.ts', isDark },
    },
    // Bottom-right zone: Routes (Devin)
    {
      id: 'src/routes.ts',
      type: 'activeFile',
      position: { x: 900, y: 480 },
      data: {
        path: 'src/routes.ts',
        fileName: 'src/routes.ts',
        lockStatus: routesLock?.status,
        lockUserId: routesLock?.user_id,
        lockUserName: routesLock?.user_name,
        lockColor: routesLock?.color,
        isDark,
      },
    },
    {
      id: 'src/helpers/format.ts',
      type: 'activeFile',
      position: { x: 1100, y: 450 },
      data: { path: 'src/helpers/format.ts', fileName: 'src/helpers/format.ts', isDark },
    },
    {
      id: 'src/helpers/crypto.ts',
      type: 'activeFile',
      position: { x: 1100, y: 550 },
      data: { path: 'src/helpers/crypto.ts', fileName: 'src/helpers/crypto.ts', isDark },
    },
    // Bottom-left zone: Middleware & Utils (Claude)
    {
      id: 'src/middleware.ts',
      type: 'activeFile',
      position: { x: 100, y: 550 },
      data: {
        path: 'src/middleware.ts',
        fileName: 'src/middleware.ts',
        lockStatus: middlewareLock?.status,
        lockUserId: middlewareLock?.user_id,
        lockUserName: middlewareLock?.user_name,
        lockColor: middlewareLock?.color,
        isDark,
      },
    },
    {
      id: 'src/utils.ts',
      type: 'activeFile',
      position: { x: 280, y: 250 },
      data: {
        path: 'src/utils.ts',
        fileName: 'src/utils.ts',
        isDark,
      },
    },
    {
      id: 'src/validators.ts',
      type: 'activeFile',
      position: { x: 280, y: 500 },
      data: { path: 'src/validators.ts', fileName: 'src/validators.ts', isDark },
    },
    {
      id: 'src/constants.ts',
      type: 'activeFile',
      position: { x: 280, y: 380 },
      data: { path: 'src/constants.ts', fileName: 'src/constants.ts', isDark },
    },
    // Center zone: Models
    {
      id: 'src/models/user.ts',
      type: 'activeFile',
      position: { x: 680, y: 380 },
      data: { path: 'src/models/user.ts', fileName: 'src/models/user.ts', isDark },
    },
    {
      id: 'src/models/session.ts',
      type: 'activeFile',
      position: { x: 680, y: 520 },
      data: { path: 'src/models/session.ts', fileName: 'src/models/session.ts', isDark },
    },
    // Bottom zone: Tests (Copilot)
    {
      id: 'tests/auth.test.ts',
      type: 'activeFile',
      position: { x: 100, y: 700 },
      data: {
        path: 'tests/auth.test.ts',
        fileName: 'tests/auth.test.ts',
        lockStatus: testLock?.status,
        lockUserId: testLock?.user_id,
        lockUserName: testLock?.user_name,
        lockColor: testLock?.color,
        isDark,
      },
    },
    {
      id: 'tests/db.test.ts',
      type: 'activeFile',
      position: { x: 500, y: 680 },
      data: { path: 'tests/db.test.ts', fileName: 'tests/db.test.ts', isDark },
    },
    {
      id: 'tests/api.test.ts',
      type: 'activeFile',
      position: { x: 900, y: 660 },
      data: { path: 'tests/api.test.ts', fileName: 'tests/api.test.ts', isDark },
    },
    {
      id: 'tests/utils.test.ts',
      type: 'activeFile',
      position: { x: 280, y: 650 },
      data: { path: 'tests/utils.test.ts', fileName: 'tests/utils.test.ts', isDark },
    },
    // Config zone: Right edge
    {
      id: 'package.json',
      type: 'activeFile',
      position: { x: 1300, y: 200 },
      data: { path: 'package.json', fileName: 'package.json', isDark },
    },
    {
      id: 'tsconfig.json',
      type: 'activeFile',
      position: { x: 1300, y: 320 },
      data: { path: 'tsconfig.json', fileName: 'tsconfig.json', isDark },
    },
    {
      id: '.env.example',
      type: 'activeFile',
      position: { x: 1300, y: 440 },
      data: { path: '.env.example', fileName: '.env.example', isDark },
    },
    {
      id: 'README.md',
      type: 'activeFile',
      position: { x: 1300, y: 560 },
      data: { path: 'README.md', fileName: 'README.md', isDark },
    },
  ], [frame, authLock, dbLock, apiLock, configLock, routesLock, middlewareLock, testLock, isDark]);

  const edges = useMemo(() => [
    {
      id: 'auth-types',
      source: 'src/auth.ts',
      target: 'src/types.ts',
      animated: !!authLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: authLock ? 2 : 1.1, opacity: authLock ? 0.9 : 0.4 },
    },
    {
      id: 'auth-db',
      source: 'src/auth.ts',
      target: 'src/db.ts',
      animated: !!authLock || !!dbLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: (authLock || dbLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: (authLock || dbLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: (authLock || dbLock) ? 2 : 1.1, opacity: (authLock || dbLock) ? 0.9 : 0.4 },
    },
    {
      id: 'auth-utils',
      source: 'src/auth.ts',
      target: 'src/utils.ts',
      animated: !!authLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: authLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: authLock ? 2 : 1.1, opacity: authLock ? 0.9 : 0.4 },
    },
    {
      id: 'api-db',
      source: 'src/api.ts',
      target: 'src/db.ts',
      animated: !!apiLock || !!dbLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: (apiLock || dbLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: (apiLock || dbLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: (apiLock || dbLock) ? 2 : 1.1, opacity: (apiLock || dbLock) ? 0.9 : 0.4 },
    },
    {
      id: 'api-types',
      source: 'src/api.ts',
      target: 'src/types.ts',
      animated: !!apiLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: apiLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: apiLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: apiLock ? 2 : 1.1, opacity: apiLock ? 0.9 : 0.4 },
    },
    {
      id: 'api-routes',
      source: 'src/api.ts',
      target: 'src/routes.ts',
      animated: !!apiLock || !!routesLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: (apiLock || routesLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: (apiLock || routesLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: (apiLock || routesLock) ? 2 : 1.1, opacity: (apiLock || routesLock) ? 0.9 : 0.4 },
    },
    {
      id: 'db-config',
      source: 'src/db.ts',
      target: 'src/config.ts',
      animated: !!dbLock || !!configLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: (dbLock || configLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: (dbLock || configLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: (dbLock || configLock) ? 2 : 1.1, opacity: (dbLock || configLock) ? 0.9 : 0.4 },
    },
    {
      id: 'routes-middleware',
      source: 'src/routes.ts',
      target: 'src/middleware.ts',
      animated: !!routesLock || !!middlewareLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: (routesLock || middlewareLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: (routesLock || middlewareLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: (routesLock || middlewareLock) ? 2 : 1.1, opacity: (routesLock || middlewareLock) ? 0.9 : 0.4 },
    },
    {
      id: 'middleware-auth',
      source: 'src/middleware.ts',
      target: 'src/auth.ts',
      animated: !!middlewareLock || !!authLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: (middlewareLock || authLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: (middlewareLock || authLock) ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: (middlewareLock || authLock) ? 2 : 1.1, opacity: (middlewareLock || authLock) ? 0.9 : 0.4 },
    },
    {
      id: 'test-auth',
      source: 'tests/auth.test.ts',
      target: 'src/auth.ts',
      animated: !!testLock,
      markerEnd: { type: MarkerType.ArrowClosed, color: testLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa') },
      style: { stroke: testLock ? '#f59e0b' : (isDark ? '#52525b' : '#a1a1aa'), strokeWidth: testLock ? 2 : 1.1, opacity: testLock ? 0.9 : 0.4 },
    },
    // Additional realistic edges
    {
      id: 'auth-user',
      source: 'src/auth.ts',
      target: 'src/models/user.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'user-types',
      source: 'src/models/user.ts',
      target: 'src/types.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'api-email',
      source: 'src/api.ts',
      target: 'src/services/email.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'api-logger',
      source: 'src/api.ts',
      target: 'src/services/logger.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'db-cache',
      source: 'src/db.ts',
      target: 'src/services/cache.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'middleware-validators',
      source: 'src/middleware.ts',
      target: 'src/validators.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'validators-utils',
      source: 'src/validators.ts',
      target: 'src/utils.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'utils-constants',
      source: 'src/utils.ts',
      target: 'src/constants.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'utils-format',
      source: 'src/utils.ts',
      target: 'src/helpers/format.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'auth-crypto',
      source: 'src/auth.ts',
      target: 'src/helpers/crypto.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'session-types',
      source: 'src/models/session.ts',
      target: 'src/types.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'auth-session',
      source: 'src/auth.ts',
      target: 'src/models/session.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'test-db-db',
      source: 'tests/db.test.ts',
      target: 'src/db.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'test-api-api',
      source: 'tests/api.test.ts',
      target: 'src/api.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'test-utils-utils',
      source: 'tests/utils.test.ts',
      target: 'src/utils.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
    {
      id: 'config-constants',
      source: 'src/config.ts',
      target: 'src/constants.ts',
      markerEnd: { type: MarkerType.ArrowClosed, color: isDark ? '#52525b' : '#a1a1aa' },
      style: { stroke: isDark ? '#52525b' : '#a1a1aa', strokeWidth: 1, opacity: 0.3 },
    },
  ], [authLock, dbLock, apiLock, configLock, routesLock, middlewareLock, testLock, isDark]);

  // Activity feed events with agent communication
  const activities = useMemo(() => {
    const events = [];

    if (frame >= 40) events.push({
      id: '1',
      agent: 'Claude',
      color: '#10b981',
      action: 'claimed WRITING lock on',
      file: 'src/auth.ts',
      time: 'just now',
      opacity: interpolate(agent1Activity, [0, 1], [0, 1]),
    });

    if (frame >= 80) events.push({
      id: '2',
      agent: 'Cursor',
      color: '#3b82f6',
      action: 'waiting for auth dependencies, reading',
      file: 'src/db.ts',
      time: '2s ago',
      opacity: interpolate(agent2Activity, [0, 1], [0, 1]),
    });

    if (frame >= 120) events.push({
      id: '3',
      agent: 'Cline',
      color: '#f59e0b',
      action: 'coordinating with Claude, locked',
      file: 'src/api.ts',
      time: '3s ago',
      opacity: interpolate(agent3Activity, [0, 1], [0, 1]),
    });

    if (frame >= 160) events.push({
      id: '4',
      agent: 'Copilot',
      color: '#8b5cf6',
      action: 'checking config, no conflicts',
      file: 'src/config.ts',
      time: '4s ago',
      opacity: interpolate(agent1Release, [0, 1], [0, 1]),
    });

    if (frame >= 200) events.push({
      id: '5',
      agent: 'Cursor',
      color: '#3b82f6',
      action: 'upgraded to WRITING, safe to modify',
      file: 'src/db.ts',
      time: '5s ago',
      opacity: interpolate(agent2Lock, [0, 1], [0, 1]),
    });

    if (frame >= 200) events.push({
      id: '6',
      agent: 'Devin',
      color: '#ec4899',
      action: 'detected Cline on api, switching to',
      file: 'src/routes.ts',
      time: '5s ago',
      opacity: interpolate(agent2Lock, [0, 1], [0, 1]),
    });

    if (frame >= 240) events.push({
      id: '7',
      agent: 'Claude',
      color: '#10b981',
      action: 'released lock, work complete on',
      file: 'src/auth.ts',
      time: '7s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 260) events.push({
      id: '8',
      agent: 'Claude',
      color: '#10b981',
      action: 'moving to middleware, checking deps',
      file: 'src/middleware.ts',
      time: '8s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 280) events.push({
      id: '9',
      agent: 'Copilot',
      color: '#8b5cf6',
      action: 'released, waiting for auth unlock',
      file: 'src/config.ts',
      time: '9s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 300) events.push({
      id: '10',
      agent: 'Copilot',
      color: '#8b5cf6',
      action: 'auth clear, starting test suite',
      file: 'tests/auth.test.ts',
      time: '10s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 320) events.push({
      id: '11',
      agent: 'Claude',
      color: '#10b981',
      action: 'middleware complete, releasing',
      file: 'src/middleware.ts',
      time: '11s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 340) events.push({
      id: '12',
      agent: 'Cursor',
      color: '#3b82f6',
      action: 'migrations done, all tests passing',
      file: 'src/db.ts',
      time: '12s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 360) events.push({
      id: '13',
      agent: 'Cline',
      color: '#f59e0b',
      action: 'endpoints ready, releasing lock',
      file: 'src/api.ts',
      time: '13s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    if (frame >= 380) events.push({
      id: '14',
      agent: 'Devin',
      color: '#ec4899',
      action: 'routes complete, zero conflicts! 🎉',
      file: 'src/routes.ts',
      time: '14s ago',
      opacity: interpolate(agent3Lock, [0, 1], [0, 1]),
    });

    return events;
  }, [frame, agent1Activity, agent2Activity, agent3Activity, agent1Release, agent2Lock, agent3Lock]);

  const activeAgents = useMemo(() => {
    const agents = [];
    if ((frame >= 40 && frame < 240) || (frame >= 260 && frame < 320)) agents.push({ name: 'Claude', color: '#10b981', locks: 1 });
    if (frame >= 80 && frame < 340) agents.push({ name: 'Cursor', color: '#3b82f6', locks: 1 });
    if (frame >= 120 && frame < 360) agents.push({ name: 'Cline', color: '#f59e0b', locks: 1 });
    if ((frame >= 160 && frame < 280) || frame >= 300) agents.push({ name: 'Copilot', color: '#8b5cf6', locks: 1 });
    if (frame >= 200 && frame < 380) agents.push({ name: 'Devin', color: '#ec4899', locks: 1 });
    return agents;
  }, [frame]);

  return (
    <AbsoluteFill
      style={{
        background: isDark ? '#09090b' : '#fafafa',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '30px',
          display: 'flex',
          gap: '20px',
          opacity: interpolate(appAppears, [0, 1], [0, 1]),
        }}
      >
        {/* Main Graph Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div
            style={{
              padding: '16px 24px',
              background: isDark ? '#18181b' : '#ffffff',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
            <div style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: isDark ? '#27272a' : '#e4e4e7',
              color: isDark ? '#fafafa' : '#18181b',
            }}>
              {activeAgents.length} Active Agent{activeAgents.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Graph */}
          <div style={{
            flex: 1,
            background: isDark ? '#18181b' : '#f4f4f5',
            border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
            borderTop: 'none',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          }}>
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
              defaultViewport={{ x: 50, y: 100, zoom: 1.0 }}
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
                  const lockColor = node.data.lockColor;
                  if (!lockColor) return isDark ? '#3f3f46' : '#d4d4d8';
                  return lockColor;
                }}
              />
            </ReactFlow>
          </div>
        </div>

        {/* Sidebar - Activity Feed */}
        <div style={{
          width: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {/* Active Agents Panel */}
          <div
            style={{
              background: isDark ? '#18181b' : '#ffffff',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: isDark ? '#a1a1aa' : '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>
              Active Agents
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeAgents.map((agent, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: agent.color,
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isDark ? '#fafafa' : '#09090b',
                    }}>
                      {agent.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: isDark ? '#27272a' : '#e4e4e7',
                    color: isDark ? '#a1a1aa' : '#71717a',
                  }}>
                    {agent.locks} lock{agent.locks !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
              {activeAgents.length === 0 && (
                <div style={{
                  fontSize: '13px',
                  color: isDark ? '#71717a' : '#a1a1aa',
                  fontStyle: 'italic',
                }}>
                  No active agents
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed Panel */}
          <div
            style={{
              flex: 1,
              background: isDark ? '#18181b' : '#ffffff',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: isDark ? '#a1a1aa' : '#71717a',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>
              Live Activity
            </div>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
            }}>
              {activities.slice().reverse().map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: '12px',
                    background: isDark ? '#09090b' : '#f9fafb',
                    border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                    borderRadius: '10px',
                    opacity: activity.opacity,
                    transform: `translateY(${interpolate(activity.opacity, [0, 1], [10, 0])}px)`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: activity.color,
                    }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isDark ? '#fafafa' : '#09090b',
                    }}>
                      {activity.agent}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: isDark ? '#71717a' : '#a1a1aa',
                      marginLeft: 'auto',
                    }}>
                      {activity.time}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: isDark ? '#a1a1aa' : '#71717a',
                    lineHeight: '1.5',
                  }}>
                    {activity.action}{' '}
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: isDark ? '#fafafa' : '#09090b',
                      fontSize: '11px',
                    }}>
                      {activity.file}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
