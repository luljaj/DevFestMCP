import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Copy, FileCode2, GitFork, Lock, Timer, Users, X } from 'lucide-react';
import { GraphNode, LockEntry } from '../hooks/useGraphData';

interface NodeDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    node: GraphNode | null;
    lock: LockEntry | undefined;
    dependencies: string[];
    dependents: string[];
    repoUrl: string;
    branch: string;
    isDark: boolean;
}

export default function NodeDetailsDialog({
    isOpen,
    onClose,
    node,
    lock,
    dependencies,
    dependents,
    repoUrl,
    branch,
    isDark,
}: NodeDetailsDialogProps) {
    const [copiedPath, setCopiedPath] = useState(false);

    if (!node) return null;

    const statusStyle = lock
        ? (lock.status === 'WRITING'
            ? (isDark ? 'text-zinc-100 bg-zinc-700 border-zinc-600' : 'text-zinc-800 bg-zinc-200 border-zinc-300')
            : (isDark ? 'text-zinc-200 bg-zinc-800 border-zinc-700' : 'text-zinc-700 bg-zinc-100 border-zinc-200'))
        : (isDark ? 'text-zinc-300 bg-zinc-900 border-zinc-700' : 'text-zinc-600 bg-zinc-50 border-zinc-200');
    const expiresInSeconds = lock ? Math.max(0, Math.round((lock.expiry - Date.now()) / 1000)) : null;
    const githubFileUrl = toGitHubFileUrl(repoUrl, branch, node.id);
    const statusLabel = lock ? `${lock.status}${lock.user_name ? ` · ${lock.user_name}` : ''}` : 'AVAILABLE';

    const handleCopyPath = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            return;
        }

        try {
            await navigator.clipboard.writeText(node.id);
            setCopiedPath(true);
            window.setTimeout(() => setCopiedPath(false), 1200);
        } catch {
            setCopiedPath(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" />
                <Dialog.Content className={`fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-2xl outline-none animate-scale-in ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
                    <div className={`flex items-start justify-between border-b p-5 ${isDark ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-100 bg-zinc-50/80'}`}>
                        <div className="flex min-w-0 items-start gap-3">
                            <div className={`rounded-xl border p-2 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-200 bg-white'}`}>
                                <FileCode2 className={`h-5 w-5 ${isDark ? 'text-zinc-100' : 'text-zinc-700'}`} />
                            </div>
                            <div className="min-w-0">
                                <Dialog.Title className={`text-sm font-bold leading-tight break-all ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                    {node.id}
                                </Dialog.Title>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle}`}>
                                        {statusLabel}
                                    </span>
                                    <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                        {node.language || 'text'} · {node.size ? `${(node.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className={`rounded-lg border border-transparent p-1 transition-colors ${isDark ? 'text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200' : 'text-zinc-400 hover:border-zinc-200 hover:bg-white hover:text-zinc-600'}`}
                            aria-label="Close details dialog"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-5 p-5">
                        {lock && (
                            <div className={`relative overflow-hidden rounded-xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-800/80' : 'border-zinc-200 bg-zinc-50'}`}>
                                <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: neutralTone(lock.user_id) }} />
                                <div className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-700'}`}>
                                    <Users className="h-4 w-4" />
                                    <span>Locked by {lock.user_name}</span>
                                </div>
                                <p className={`mt-1 text-sm italic ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    "{lock.message || 'No intent message set.'}"
                                </p>
                                <div className={`mt-2 flex items-center gap-3 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    <span className="inline-flex items-center gap-1">
                                        <Lock className="h-3.5 w-3.5" />
                                        {lock.status}
                                    </span>
                                    {expiresInSeconds !== null && (
                                        <span className="inline-flex items-center gap-1">
                                            <Timer className="h-3.5 w-3.5" />
                                            Expires in {expiresInSeconds}s
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {!lock && (
                            <div className={`rounded-xl border px-3 py-2 text-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
                                File is available. No active lock currently.
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className={`rounded-xl border p-3 ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                                <h4 className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    Uses ({dependencies.length})
                                </h4>
                                <ul className="custom-scrollbar max-h-44 space-y-1.5 overflow-y-auto pr-2">
                                    {dependencies.length === 0 && <li className={`text-xs italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>None</li>}
                                    {dependencies.map(dep => (
                                        <li key={dep} className={`truncate rounded-md border px-2 py-1.5 text-xs ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`} title={dep}>
                                            {dep}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={`rounded-xl border p-3 ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                                <h4 className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    Used By ({dependents.length})
                                </h4>
                                <ul className="custom-scrollbar max-h-44 space-y-1.5 overflow-y-auto pr-2">
                                    {dependents.length === 0 && <li className={`text-xs italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>None</li>}
                                    {dependents.map(dep => (
                                        <li key={dep} className={`truncate rounded-md border px-2 py-1.5 text-xs ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`} title={dep}>
                                            {dep}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className={`rounded-xl border p-3 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                            <h4 className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                Actions
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                {githubFileUrl ? (
                                    <a
                                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100'}`}
                                        href={githubFileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <GitFork className="h-3.5 w-3.5" />
                                        View on GitHub
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                ) : (
                                    <span className={`rounded-md border px-3 py-1.5 text-xs ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-500' : 'border-zinc-200 bg-zinc-50 text-zinc-400'}`}>
                                        GitHub link unavailable
                                    </span>
                                )}

                                <button
                                    className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100'}`}
                                    onClick={handleCopyPath}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    {copiedPath ? 'Copied' : 'Copy path'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function neutralTone(seed: string): string {
    const tones = ['#3f3f46', '#52525b', '#71717a', '#a1a1aa'];
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }
    return tones[hash % tones.length];
}

function toGitHubFileUrl(repoUrl: string, branch: string, path: string): string | null {
    const trimmed = repoUrl.trim();
    if (!trimmed) {
        return null;
    }

    const normalized = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;

    if (!normalized.includes('github.com')) {
        return null;
    }

    const repoRoot = normalized.replace(/\/+$/, '');
    const safePath = path
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
    const safeBranch = encodeURIComponent(branch || 'main');

    return `${repoRoot}/blob/${safeBranch}/${safePath}`;
}
