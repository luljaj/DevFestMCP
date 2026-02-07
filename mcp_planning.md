# Dedalus Labs MCP Planning: Stateless Coordination Layer

## 1. Overview & Core Philosophy

**Goal**: Create a **stateless** MCP server that acts as the coordination logic layer for agentic collaboration. It serves as the bridge between agents (Cursor/VSCode) and the persistent state stored in the Vercel webapp.

**Key Constraints**:
- **Statelessness**: The MCP server MUST NOT store any state in memory or on disk. All state (locks, activity log, repo head) resides in the Vercel backend.
- **Authentication**: **GitHub Authentication**. Agents authenticate using GitHub tokens. The MCP server validates identity against GitHub/Vercel.
- **Orchestration**: Returns strict **orchestration commands** (defined in `schema.md`) to guide agents (e.g., `git pull`, `wait`).
- **Atomicity**: Vercel API handles atomic locking to prevent race conditions.

---

## 2. Architecture & Data Flow

### The "Sandwich" Model
```
[ Agent Layer ]  (Cursor/VSCode)
      FIELD AGENTS
      ↓  (MCP Tool Call + GitHub Token)
      ↓
[ MCP Server ]   (Python/FastAPI)
      COORDINATION LOGIC (Stateless)
      ↓  (GET/POST State via HTTPS)      ↑ (Orchestration Commands)
      ↓                                  |
[ Vercel Layer ] (Next.js/KV/PG)
      STATE & SIGNALING (Atomic Locks)
      ↓  (Persist to DB)
      ↓  (Broadcast via WebSocket)
[ Broadcast ]    (WebSocket)
      ↓
[ Clients ]      (Browser UI / Other Agents)
```

### Critical Flow: Atomic Locking
1.  **Agent -> MCP**: `post_status(symbols=[...], status="WRITING")`
2.  **MCP -> Vercel**: `POST /api/lock` (Atomic Transaction)
    *   Vercel checks if ANY symbol is already locked by another user.
    *   If locked: Returns 409 Conflict.
    *   If free: Sets locks and returns 200 OK.
3.  **Vercel -> MCP**: Response.
4.  **MCP -> Agent**:
    *   If 409: Returns `ORCHESTRATION_COMMAND: WAIT` or `STOP`.
    *   If 200: Returns `ORCHESTRATION_COMMAND: PROCEED`.

---

## 3. Authentication (GitHub)

**Mechanism**:
- **Client-Side**: Agents provide a GitHub Personal Access Token (PAT) or OAuth token in the request headers/context.
- **Verification**: MCP server verifies the token with GitHub (or Vercel passes it through) to resolve the `user_id` (GitHub username).
- **Identity**: All locks and activities are attributed to the GitHub username.

**Implementation Note**:
```python
ctx = get_context()
# Header: Authorization: Bearer <github_token>
user = verify_github_token(ctx.request_headers["Authorization"])
```

---

## 4. MCP Tool Definitions

Refer to `schema.md` for exact JSON schemas.

### Tool 1: `check_status`
**Entry Point**: Agents **MUST** call this first.

*   **Input**: `symbols` (List), `agent_head` (String).
*   **Logic**:
    1.  Query Vercel for `repo_head` and `locks`.
    2.  **Offline Mode**: If Vercel is unreachable (500/Timeout), return status `OFFLINE`. Allow `READING` but warn "Do not push".
    3.  **Staleness**: If `agent_head != repo_head`, return `ORCHESTRATION_COMMAND: PULL`.
*   **Output**: Schema defined in `schema.md`.

### Tool 2: `post_status`
**Purpose**: Claim/Release locks. Supports **Multi-Symbol Locking** (Atomic).

*   **Input**: `symbols` (List), `status` ("READING"|"WRITING"|"OPEN"), `agent_head`, `new_repo_head`.
*   **Recursive Locking**: Agents can include dependencies in the `symbols` list to lock a "parent and its dependencies".
*   **Logic**:
    1.  **Validation**: Enforce `agent_head == repo_head` for WRITING.
    2.  **Atomic Call**: Send list of symbols to Vercel `/api/lock`.
    3.  **Orchestration**:
        *   If Vercel returns 409 (Conflict): Return `WAIT` command.
        *   If Vercel returns 200: Return `PROCEED`.
        *   If Vercel down: Return `STOP` (Cannot safely write without locks).

### Tool 3: `post_activity`
**Purpose**: Team updates (Slack-style).
*   **Input**: `message`, `scope`, `intent`.

### Tool 4: `heartbeat`
**Purpose**: Refresh lock expiry.
**Timeout**: **100 seconds**.
*   **Failure Mode**: If heartbeat fails (404 Lock Lost / 500 Vercel Down), return `ORCHESTRATION_COMMAND: STOP`.
    *   Agent **MUST** stop writing and warn the user immediately.

---

## 5. Vercel Integration (Backend API)

The MCP server interacts with Vercel via **HTTPS Requests**.

*   **`POST /api/lock`**:
    *   Body: `{ symbols: ["A", "B"], user: "gh_user", status: "WRITING" }`
    *   **Behavior**: Atomic check-and-set. All or nothing.
*   **`GET /api/state`**: Returns global state.
*   **`POST /api/heartbeat`**: Refreshes expiry (set to Now + 100s).

---

## 6. Implementation Checklist

1.  **Schema Enforcement**: Use Pydantic models matching `schema.md`.
2.  **GitHub Auth**: Middleware to validate tokens.
3.  **Atomic Vercel Client**: Ensure `post_status` allows sending multiple symbols in one request.
4.  **Error Handling**:
    *   Vercel Down -> `check_status` = WARN (Offline).
    *   Vercel Down -> `post_status(WRITING)` = STOP (Unsafe).
5.  **Heartbeat Loop**: Ensure agents call every ~30-50s (well within 100s limit).

## 7. Prompts for AI Generation

*   "Generate Pydantic models based on `schema.md`."
*   "Implement `post_status` to hit Vercel's atomic `/api/lock` endpoint."
*   "Use GitHub token validation for `get_user()`."
*   "Implement the `OFFLINE` fallback in `check_status`."
