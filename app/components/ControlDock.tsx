import React from 'react';
import { Activity, GitBranch, Github, Moon, RefreshCw, Sun, TimerReset } from 'lucide-react';

interface ControlDockProps {
    repoUrl: string;
    setRepoUrl: (url: string) => void;
    branch: string;
    setBranch: (branch: string) => void;
    onRefresh: () => void;
    refreshing: boolean;
    loading: boolean;
    lastUpdatedAt: number | null;
    activeLocks: number;
    pollIntervalMs: number;
    isDark: boolean;
    onToggleTheme: () => void;
}

export default function ControlDock({
    repoUrl,
    setRepoUrl,
    branch,
    setBranch,
    onRefresh,
    refreshing,
    loading,
    lastUpdatedAt,
    activeLocks,
    pollIntervalMs,
    isDark,
    onToggleTheme,
}: ControlDockProps) {
    const statusLabel = loading
        ? 'Initializing'
        : refreshing
            ? 'Refreshing'
            : lastUpdatedAt
                ? `Synced ${relativeTime(lastUpdatedAt)}`
                : 'Awaiting data';

    return (
        <div className={`fixed inset-x-0 top-0 z-[85] border-b rounded-b-2xl ${isDark ? 'border-zinc-800 bg-black/95 text-zinc-100' : 'border-zinc-200 bg-white/95 text-zinc-900'}`}>
            <div className="mx-auto flex h-12 w-full max-w-[1800px] items-center gap-2 px-3 md:px-4">
                <div className={`flex min-w-0 items-center gap-2 border rounded-lg px-2 py-1 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
                    <Github className={`h-3.5 w-3.5 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    <input
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className={`w-36 border-none bg-transparent text-xs outline-none md:w-64 ${isDark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-700 placeholder:text-zinc-400'}`}
                        placeholder="github.com/owner/repo"
                    />
                </div>

                <div className={`flex items-center gap-2 border rounded-lg px-2 py-1 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
                    <GitBranch className={`h-3.5 w-3.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    <input
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className={`w-16 border-none bg-transparent text-xs outline-none ${isDark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-700 placeholder:text-zinc-400'}`}
                        placeholder="main"
                    />
                </div>

                <div className={`hidden items-center gap-1 border rounded-lg px-2 py-1 text-[11px] md:flex ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
                    <span
                        className={`h-2 w-2 rounded-full ${refreshing ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: isDark ? '#a1a1aa' : '#71717a' }}
                    />
                    {statusLabel}
                </div>

                <div className={`hidden items-center gap-1 border rounded-lg px-2 py-1 text-[11px] sm:flex ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
                    <TimerReset className={`h-3 w-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    {Math.round(pollIntervalMs / 1000)}s
                </div>

                <div className={`hidden items-center gap-1 border rounded-lg px-2 py-1 text-[11px] sm:flex ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
                    <Activity className={`h-3 w-3 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                    {activeLocks}
                </div>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        onClick={onToggleTheme}
                        className={`h-8 w-8 border rounded-lg transition-colors ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'}`}
                        title="Toggle dark mode"
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <Sun className="mx-auto h-4 w-4" /> : <Moon className="mx-auto h-4 w-4" />}
                    </button>

                    <button
                        onClick={onRefresh}
                        className={`h-8 w-8 border rounded-lg transition-colors ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'} ${refreshing ? 'animate-spin' : ''}`}
                        title="Refresh graph"
                        aria-label="Refresh graph"
                    >
                        <RefreshCw className="mx-auto h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function relativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    if (diff < 30_000) {
        return 'just now';
    }
    if (diff < 60 * 60 * 1000) {
        return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
    }
    return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
}
