import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface LiveMCPDemoProps {
  isDark?: boolean;
}

export const LiveMCPDemo: React.FC<LiveMCPDemoProps> = ({
  isDark = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timings
  const terminalAppears = spring({ frame: frame - 10, fps });

  // Left terminal (API calls)
  const leftCommand1Types = Math.min(Math.max(frame - 30, 0), 30);
  const leftResponse1Shows = spring({ frame: frame - 80, fps });
  const leftCommand2Types = Math.min(Math.max(frame - 140, 0), 30);
  const leftResponse2Shows = spring({ frame: frame - 190, fps });
  const leftCommand3Types = Math.min(Math.max(frame - 250, 0), 30);
  const leftResponse3Shows = spring({ frame: frame - 300, fps });

  // Right terminal (Agent workflow)
  const rightLine1Shows = spring({ frame: frame - 50, fps });
  const rightLine2Shows = spring({ frame: frame - 110, fps });
  const rightLine3Shows = spring({ frame: frame - 170, fps });
  const rightLine4Shows = spring({ frame: frame - 230, fps });
  const rightLine5Shows = spring({ frame: frame - 290, fps });
  const rightLine6Shows = spring({ frame: frame - 350, fps });
  const rightLine7Shows = spring({ frame: frame - 380, fps });

  // Left terminal - API calls
  const leftCmd1 = `check_status(
  file_paths=["src/auth.ts"]
)`.substring(0, leftCommand1Types * 3);

  const leftResponse1 = `→ PROCEED
  No conflicts detected`;

  const leftCmd2 = `post_status(
  file_paths=["src/auth.ts"],
  status="WRITING"
)`.substring(0, leftCommand2Types * 3);

  const leftResponse2 = `→ Lock acquired
  Status: WRITING`;

  const leftCmd3 = `# Agent B checks status
check_status(
  file_paths=["src/auth.ts"]
)`.substring(0, leftCommand3Types * 3);

  const leftResponse3 = `→ SWITCH_TASK
  Locked by Agent A`;

  return (
    <AbsoluteFill
      style={{
        background: isDark ? '#09090b' : '#fafafa',
        fontFamily: 'JetBrains Mono, Consolas, monospace',
      }}
    >
      {/* Main header */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '40px',
          right: '40px',
          padding: '16px 24px',
          background: isDark ? '#18181b' : '#ffffff',
          border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: interpolate(terminalAppears, [0, 1], [0, 1]),
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#e4e4e7' : '#18181b', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Relay MCP Integration
        </div>
        <div style={{ fontSize: '12px', color: isDark ? '#71717a' : '#a1a1aa' }}>
          Real-time Agent Coordination
        </div>
      </div>

      {/* Two terminals side by side */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '40px',
          right: '40px',
          bottom: '40px',
          display: 'flex',
          gap: '20px',
          opacity: interpolate(terminalAppears, [0, 1], [0, 1]),
        }}
      >
        {/* Left Terminal - MCP API */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '12px 20px',
              background: isDark ? '#18181b' : '#ffffff',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e4e4e7' : '#18181b' }}>
              MCP Protocol (Agent A)
            </span>
          </div>
          <div
            style={{
              flex: 1,
              background: isDark ? '#0c0c0d' : '#f9f9f9',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderTop: 'none',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              padding: '20px',
              overflowY: 'auto',
              fontSize: '12px',
              lineHeight: '1.6',
              color: isDark ? '#e4e4e7' : '#18181b',
            }}
          >
            {/* Left Command 1 */}
            {frame >= 30 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: isDark ? '#10b981' : '#059669', marginBottom: '6px' }}>
                  <span style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>relay-mcp$</span>{' '}
                  <span style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>{leftCmd1}</span>
                  {leftCommand1Types < 30 && <span style={{ opacity: 0.5 }}>▊</span>}
                </div>
                {frame >= 80 && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.1)',
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.3)'}`,
                      borderRadius: '6px',
                      color: isDark ? '#6ee7b7' : '#047857',
                      fontSize: '11px',
                      opacity: interpolate(leftResponse1Shows, [0, 1], [0, 1]),
                    }}
                  >
                    {leftResponse1}
                  </div>
                )}
              </div>
            )}

            {/* Left Command 2 */}
            {frame >= 140 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: isDark ? '#10b981' : '#059669', marginBottom: '6px' }}>
                  <span style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>relay-mcp$</span>{' '}
                  <span style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>{leftCmd2}</span>
                  {leftCommand2Types < 30 && <span style={{ opacity: 0.5 }}>▊</span>}
                </div>
                {frame >= 190 && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.1)',
                      border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.3)'}`,
                      borderRadius: '6px',
                      color: isDark ? '#6ee7b7' : '#047857',
                      fontSize: '11px',
                      opacity: interpolate(leftResponse2Shows, [0, 1], [0, 1]),
                    }}
                  >
                    {leftResponse2}
                  </div>
                )}
              </div>
            )}

            {/* Left Command 3 */}
            {frame >= 250 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: isDark ? '#3b82f6' : '#2563eb', marginBottom: '6px', fontSize: '11px' }}>
                  # Agent B checks status
                </div>
                <div style={{ color: isDark ? '#10b981' : '#059669', marginBottom: '6px' }}>
                  <span style={{ color: isDark ? '#71717a' : '#a1a1aa' }}>relay-mcp$</span>{' '}
                  <span style={{ color: isDark ? '#e4e4e7' : '#18181b' }}>{leftCmd3}</span>
                  {leftCommand3Types < 30 && <span style={{ opacity: 0.5 }}>▊</span>}
                </div>
                {frame >= 300 && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.1)',
                      border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.3)'}`,
                      borderRadius: '6px',
                      color: isDark ? '#fca5a5' : '#dc2626',
                      fontSize: '11px',
                      opacity: interpolate(leftResponse3Shows, [0, 1], [0, 1]),
                    }}
                  >
                    {leftResponse3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Terminal - AI Agent */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '12px 20px',
              background: isDark ? '#18181b' : '#ffffff',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e4e4e7' : '#18181b' }}>
              DevBot AI Agent
            </span>
          </div>
          <div
            style={{
              flex: 1,
              background: isDark ? '#0c0c0d' : '#f9f9f9',
              border: `2px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
              borderTop: 'none',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
              padding: '20px',
              overflowY: 'auto',
              fontSize: '12px',
              lineHeight: '1.7',
              color: isDark ? '#e4e4e7' : '#18181b',
            }}
          >
            {/* Agent workflow lines */}
            {frame >= 50 && (
              <div style={{ marginBottom: '12px', opacity: interpolate(rightLine1Shows, [0, 1], [0, 1]) }}>
                <span style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>🤖</span>{' '}
                <span style={{ color: isDark ? '#3b82f6' : '#2563eb', fontWeight: 600 }}>Task:</span>{' '}
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Refactor src/auth.ts</span>
              </div>
            )}

            {frame >= 110 && (
              <div style={{ marginBottom: '12px', opacity: interpolate(rightLine2Shows, [0, 1], [0, 1]) }}>
                <span style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>📡</span>{' '}
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Checking Relay for file conflicts...</span>
              </div>
            )}

            {frame >= 170 && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '10px 12px',
                  background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                  borderLeft: `3px solid ${isDark ? '#10b981' : '#059669'}`,
                  borderRadius: '4px',
                  opacity: interpolate(rightLine3Shows, [0, 1], [0, 1]),
                }}
              >
                <span style={{ color: isDark ? '#10b981' : '#059669', fontWeight: 600 }}>✓ PROCEED</span>
                <div style={{ color: isDark ? '#a1a1aa' : '#71717a', fontSize: '11px', marginTop: '4px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  No conflicts detected, file is available
                </div>
              </div>
            )}

            {frame >= 230 && (
              <div style={{ marginBottom: '12px', opacity: interpolate(rightLine4Shows, [0, 1], [0, 1]) }}>
                <span style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>🔒</span>{' '}
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Claiming WRITING lock on src/auth.ts...</span>
              </div>
            )}

            {frame >= 290 && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '10px 12px',
                  background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                  borderLeft: `3px solid ${isDark ? '#10b981' : '#059669'}`,
                  borderRadius: '4px',
                  opacity: interpolate(rightLine5Shows, [0, 1], [0, 1]),
                }}
              >
                <span style={{ color: isDark ? '#10b981' : '#059669', fontWeight: 600 }}>✓ Lock acquired</span>
                <div style={{ color: isDark ? '#a1a1aa' : '#71717a', fontSize: '11px', marginTop: '4px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Other agents will be notified
                </div>
              </div>
            )}

            {frame >= 350 && (
              <div style={{ marginBottom: '12px', opacity: interpolate(rightLine6Shows, [0, 1], [0, 1]) }}>
                <span style={{ color: isDark ? '#a1a1aa' : '#71717a' }}>✏️</span>{' '}
                <span style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Editing file safely...</span>
              </div>
            )}

            {frame >= 380 && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: isDark ? '#18181b' : '#ffffff',
                  border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
                  borderRadius: '8px',
                  opacity: interpolate(rightLine7Shows, [0, 1], [0, 1]),
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#e4e4e7' : '#18181b', marginBottom: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Agent Coordination Summary
                </div>
                <div style={{ fontSize: '10px', color: isDark ? '#a1a1aa' : '#71717a', lineHeight: '1.6', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  • Agent A: Working on src/auth.ts<br />
                  • Agent B: Blocked, switched tasks<br />
                  • Zero merge conflicts prevented ✓
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
