import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

export interface GraphNode {
    id: string;
    type: 'file';
    size?: number;
    language?: string;
}

export interface GraphEdge {
    source: string;
    target: string;
    type: 'import';
}

export interface LockEntry {
    user_id: string;
    user_name: string;
    status: 'READING' | 'WRITING';
    message: string;
    timestamp: number;
    expiry: number;
}

export interface DependencyGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
    locks: Record<string, LockEntry>;
    version: string;
    metadata: {
        generated_at: number;
        files_processed: number;
        edges_found: number;
    };
}

export type ActivityEvent = {
    id: string;
    type: 'lock_acquired' | 'lock_released' | 'lock_reassigned' | 'message_updated';
    filePath: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: number;
};

interface UseGraphDataReturn {
    graph: DependencyGraph | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    activities: ActivityEvent[];
    lastUpdatedAt: number | null;
    fetchGraph: (options?: { regenerate?: boolean }) => Promise<void>;
    setRepoUrl: (url: string) => void;
    setBranch: (branch: string) => void;
    repoUrl: string;
    branch: string;
    isUsingImportedGraph: boolean;
    importGraphFromJson: (json: string) => { error: string | null };
    clearImportedGraph: () => void;
    exportGraphJson: () => string | null;
}

const initialRepo = 'github.com/luljaj/relayfrontend';
const initialBranch = 'master';
const DEFAULT_POLL_INTERVAL_MS = 30_000;
const MIN_POLL_INTERVAL_MS = 5_000;
const MAX_POLL_INTERVAL_MS = 300_000;

interface UseGraphDataOptions {
    pollIntervalMs?: number;
}

export function useGraphData(options?: UseGraphDataOptions): UseGraphDataReturn {
    const [repoUrl, setRepoUrl] = useState(initialRepo);
    const [branch, setBranch] = useState(initialBranch);
    const [graph, setGraph] = useState<DependencyGraph | null>(null);
    const [importedGraph, setImportedGraph] = useState<DependencyGraph | null>(null);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
    const [rateLimitRetryAt, setRateLimitRetryAt] = useState<number | null>(null);

    const hasLoadedRef = useRef(false);
    const previousLocksRef = useRef<Record<string, LockEntry>>({});
    const pollIntervalMs = normalizePollInterval(options?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS);
    const isUsingImportedGraph = importedGraph !== null;
    const activeGraph = importedGraph ?? graph;

    const fetchGraph = useCallback(
        async (options?: { regenerate?: boolean }) => {
            if (isUsingImportedGraph) {
                return;
            }

            const now = Date.now();
            if (rateLimitRetryAt && now < rateLimitRetryAt) {
                return;
            }
            if (rateLimitRetryAt && now >= rateLimitRetryAt) {
                setRateLimitRetryAt(null);
            }

            if (!hasLoadedRef.current) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            setError(null);

            try {
                const normalizedRepoUrl = normalizeRepoUrl(repoUrl);
                const query = new URLSearchParams({
                    repo_url: normalizedRepoUrl,
                    branch: branch.trim() || 'master',
                    ...(options?.regenerate ? { regenerate: 'true' } : {}),
                });

                const response = await fetch(`/api/graph?${query.toString()}`);
                const rawBody = await response.text();
                const data = parseGraphResponse(rawBody);

                if (!response.ok) {
                    if (response.status === 429) {
                        const retryAt = extractRetryAt(data);
                        if (retryAt && retryAt > Date.now()) {
                            setRateLimitRetryAt(retryAt);
                        }
                    }
                    const message = extractErrorMessage(data) ?? `Failed to fetch graph (${response.status})`;
                    throw new Error(message);
                }

                if (!isDependencyGraph(data)) {
                    throw new Error('Graph API returned an invalid payload.');
                }

                const nextGraph = data;
                const receivedAt = Date.now();
                setGraph(nextGraph);
                captureActivity(previousLocksRef.current, nextGraph.locks, setActivities, receivedAt);
                previousLocksRef.current = nextGraph.locks;
                setLastUpdatedAt(receivedAt);

                hasLoadedRef.current = true;
            } catch (requestError) {
                const message = requestError instanceof Error ? requestError.message : 'Unknown error';
                setError(message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [repoUrl, branch, isUsingImportedGraph, rateLimitRetryAt],
    );

    useEffect(() => {
        if (isUsingImportedGraph) {
            return;
        }

        previousLocksRef.current = {};
        setActivities([]);
        setLastUpdatedAt(null);
        setRateLimitRetryAt(null);
        hasLoadedRef.current = false;

        fetchGraph();
    }, [fetchGraph, isUsingImportedGraph]);

    useEffect(() => {
        if (isUsingImportedGraph) {
            return;
        }

        const interval = setInterval(() => {
            fetchGraph();
        }, pollIntervalMs);

        return () => clearInterval(interval);
    }, [fetchGraph, pollIntervalMs, isUsingImportedGraph]);

    const importGraphFromJson = useCallback((json: string): { error: string | null } => {
        if (!json.trim()) {
            return { error: 'JSON input is empty.' };
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(json);
        } catch {
            return { error: 'Invalid JSON.' };
        }

        if (!isDependencyGraph(parsed)) {
            return { error: 'JSON does not match the expected graph schema.' };
        }

        const nextGraph = parsed;
        setImportedGraph(nextGraph);
        setError(null);
        setLoading(false);
        setRefreshing(false);
        setActivities([]);
        previousLocksRef.current = nextGraph.locks;
        hasLoadedRef.current = true;
        setLastUpdatedAt(Date.now());
        setRateLimitRetryAt(null);

        return { error: null };
    }, []);

    const clearImportedGraph = useCallback(() => {
        setImportedGraph(null);
        setActivities([]);
        setLastUpdatedAt(null);
        setError(null);
        setRateLimitRetryAt(null);
        previousLocksRef.current = {};
        hasLoadedRef.current = false;
    }, []);

    const exportGraphJson = useCallback(() => {
        if (!activeGraph) {
            return null;
        }

        return JSON.stringify(activeGraph, null, 2);
    }, [activeGraph]);

    return {
        graph: activeGraph,
        loading,
        refreshing,
        error,
        activities,
        lastUpdatedAt,
        fetchGraph,
        setRepoUrl,
        setBranch,
        repoUrl,
        branch,
        isUsingImportedGraph,
        importGraphFromJson,
        clearImportedGraph,
        exportGraphJson,
    };
}

type GraphApiError = {
    error?: string;
    details?: string;
    retry_after_ms?: number;
};

function parseGraphResponse(rawBody: string): DependencyGraph | GraphApiError {
    if (!rawBody) {
        return { error: 'Graph API returned an empty response body.' };
    }

    try {
        const parsed = JSON.parse(rawBody);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as DependencyGraph | GraphApiError;
        }
        return { error: 'Graph API returned a non-object JSON payload.' };
    } catch {
        const preview = rawBody.slice(0, 140).replace(/\s+/g, ' ').trim();
        return { error: `Graph API returned non-JSON content: ${preview || 'Unknown response body'}` };
    }
}

function extractErrorMessage(data: unknown): string | null {
    if (typeof data !== 'object' || data === null) {
        return null;
    }

    const maybeError = (data as GraphApiError).error;
    const maybeDetails = (data as GraphApiError).details;
    if (typeof maybeError === 'string' && maybeError.trim()) {
        if (typeof maybeDetails === 'string' && maybeDetails.trim()) {
            return `${maybeError}: ${maybeDetails}`;
        }
        return maybeError;
    }

    return null;
}

function extractRetryAt(data: unknown): number | null {
    if (typeof data !== 'object' || data === null) {
        return null;
    }

    const retryAfter = (data as GraphApiError).retry_after_ms;
    if (typeof retryAfter === 'number' && Number.isFinite(retryAfter) && retryAfter > Date.now()) {
        return retryAfter;
    }

    const details = (data as GraphApiError).details;
    if (typeof details !== 'string') {
        return null;
    }

    const isoMatch = details.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/);
    if (!isoMatch) {
        return null;
    }

    const parsed = Date.parse(isoMatch[0]);
    if (Number.isNaN(parsed)) {
        return null;
    }

    return parsed;
}

function isDependencyGraph(value: unknown): value is DependencyGraph {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as Partial<DependencyGraph>;
    return (
        Array.isArray(candidate.nodes) &&
        Array.isArray(candidate.edges) &&
        typeof candidate.locks === 'object' &&
        candidate.locks !== null &&
        typeof candidate.version === 'string'
    );
}

function normalizePollInterval(value: number): number {
    if (!Number.isFinite(value)) {
        return DEFAULT_POLL_INTERVAL_MS;
    }

    return Math.min(MAX_POLL_INTERVAL_MS, Math.max(MIN_POLL_INTERVAL_MS, Math.round(value)));
}

function normalizeRepoUrl(input: string): string {
    const value = input.trim();
    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }
    if (value.startsWith('github.com/')) {
        return `https://${value}`;
    }
    return value;
}

function captureActivity(
    previousLocks: Record<string, LockEntry>,
    currentLocks: Record<string, LockEntry>,
    setActivities: Dispatch<SetStateAction<ActivityEvent[]>>,
    receivedAt: number,
): void {
    const events: ActivityEvent[] = [];

    for (const [filePath, lock] of Object.entries(currentLocks)) {
        const prev = previousLocks[filePath];

        if (!prev) {
            events.push({
                id: `acquire:${filePath}:${lock.timestamp}`,
                type: 'lock_acquired',
                filePath,
                userId: lock.user_id,
                userName: lock.user_name,
                message: lock.message,
                timestamp: lock.timestamp,
            });
            continue;
        }

        if (prev.user_id !== lock.user_id || prev.status !== lock.status) {
            events.push({
                id: `reassign:${filePath}:${lock.timestamp}`,
                type: 'lock_reassigned',
                filePath,
                userId: lock.user_id,
                userName: lock.user_name,
                message: lock.message,
                timestamp: lock.timestamp,
            });
        }

        if (prev.message !== lock.message) {
            events.push({
                id: `message:${filePath}:${lock.timestamp}`,
                type: 'message_updated',
                filePath,
                userId: lock.user_id,
                userName: lock.user_name,
                message: lock.message,
                timestamp: lock.timestamp,
            });
        }
    }

    for (const [filePath, lock] of Object.entries(previousLocks)) {
        if (!currentLocks[filePath]) {
            events.push({
                id: `release:${filePath}:${receivedAt}`,
                type: 'lock_released',
                filePath,
                userId: lock.user_id,
                userName: lock.user_name,
                message: lock.message,
                timestamp: receivedAt,
            });
        }
    }

    if (events.length === 0) {
        return;
    }

    setActivities((prev) => [...prev, ...events].sort((a, b) => a.timestamp - b.timestamp).slice(-80));
}
