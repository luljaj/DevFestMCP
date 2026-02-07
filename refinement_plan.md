# Refinement of Dedalus Labs MCP Planning

## Critiques & Refinements

1.  **Race Condition Reality Check**:
    *   **Critique**: The `agent_head == repo_head` check is good but not foolproof. Git is distributed. If User A locks, User B might push to remote *before* User A pushes, invalidating User A's base.
    *   **Refinement**: We must acknowledge this. The lock is an **advisory lock**. It signals intent. The ultimate source of truth is the git remote. If User A's push fails due to non-fast-forward, they must pull and re-verify. The MCP improves probability of success but cannot guarantee it 100% without wrapping the git server itself.

2.  **Atomicity Implementation Details**:
    *   **Critique**: "Atomic Vercel API" is vague.
    *   **Refinement**: Specify that the Vercel backend must use a transaction (if Postgres) or a Lua script/MULTI-EXEC (if Redis/KV) to check *all* requested symbols. If any are locked by another, fail the whole request.

3.  **The "Offline" Trap**:
    *   **Critique**: Allowing `READING` while offline is dangerous if the user then tries to `write` based on stale code.
    *   **Refinement**: Change `OFFLINE` behavior. If Vercel is unreachable, `check_status` should return `WARNING: OFFLINE`. The Agent should display this prominently. `post_status` should fail. Reading is allowed *at user's risk*, but the system must scream "YOU ARE FLYING BLIND".

4.  **Zombie Locks & TTL**:
    *   **Critique**: 100s is too long for a "fast" agent workflow if it crashes.
    *   **Refinement**: Lower TTL to **30 seconds**. Heartbeat every **10 seconds**. This makes the system feel snappier if an agent dies.

5.  **Multi-Repo/Branch**:
    *   **Critique**: The system assumes one global `repo_head`.
    *   **Refinement**: Add `branch` to the schema. Locks should be namespaced by `repo_url` + `branch`.

## Planned Changes to `mcp_planning.md` and `schema.md`

1.  **Update `schema.md`**:
    *   Add `branch` field to all requests.
    *   Add `warnings` list to `check_status` response (for Offline/Stale warnings).

2.  **Update `mcp_planning.md`**:
    *   **Concurrency**: Explicitly state locks are advisory.
    *   **Offline**: Stricter offline policies.
    *   **TTL**: Reduce to 30s.
    *   **Architecture**: Add `branch` awareness.
