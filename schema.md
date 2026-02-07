# Orchestration & Data Schema

## 1. Orchestration Commands
These commands are returned by MCP tools (`check_status`, `post_status`) to guide the agent's next actions. Agents **MUST** parse and execute these commands.

### Schema
```json
{
  "type": "orchestration_command",
  "action": "PULL" | "PUSH" | "WAIT" | "STOP" | "PROCEED",
  "command": "string" | null,
  "reason": "string",
  "metadata": {
    "remote_head": "string",  // for PULL/PUSH
    "lock_owner": "string",   // for WAIT
    "conflicts": ["string"]   // for WAIT/STOP
  }
}
```

### Command Types

| Action | Description | `command` value | Condition |
| :--- | :--- | :--- | :--- |
| **PULL** | Local repo is behind remote. | `git pull --rebase` | `agent_head != repo_head` |
| **PUSH** | Lock release requires sync. | `git push` | `post_status(OPEN)` but `head` unchanged |
| **WAIT** | Symbol is locked by another user. | `sleep 5` | `locks[symbol] != null` |
| **STOP** | Hard conflict or error. | `null` | Heartbeat failed, Vercel down |
| **PROCEED**| Safe to continue. | `null` | No conflicts, fresh repo |

---

## 2. Tool Input/Output Schemas

### `check_status`

**Request:**
```json
{
  "symbols": ["auth.ts", "auth.ts::validateToken"],
  "agent_head": "abc1234567890abcdef1234567890abcdef12" 
}
```

**Response:**
```json
{
  "status": "OK" | "STALE" | "CONFLICT" | "OFFLINE",
  "repo_head": "abc1234...",
  "locks": {
    "auth.ts": {
      "user": "github_user_1",
      "status": "WRITING",
      "timestamp": 1234567890
    }
  },
  "orchestration": {
    "type": "orchestration_command",
    "action": "PULL",
    "command": "git pull --rebase",
    "reason": "Remote is ahead by 2 commits"
  }
}
```

### `post_status`

**Request:**
```json
{
  "symbols": ["auth.ts::validateToken", "auth.ts::login"], // Supports multi-locking
  "status": "READING" | "WRITING" | "OPEN",
  "message": "Refactoring auth logic",
  "agent_head": "abc1234...",
  "new_repo_head": "def4567..." // Only for OPEN
}
```

**Response:**
```json
{
  "success": true,
  "orphaned_dependencies": ["utils.ts"], // Info on what else might need locking
  "orchestration": {
    "type": "orchestration_command",
    "action": "PROCEED",
    "command": null
  }
}
```

---

## 3. Data Structures (Vercel Backend)

### Lock Entry
```json
{
  "symbol": "string",
  "user_id": "string", // GitHub Username
  "status": "READING" | "WRITING",
  "agent_head": "string",
  "timestamp": 1610000000,
  "expiry": 1610000100 // timestamp + 100s
}
```

### Activity Log
```json
{
  "id": "uuid",
  "user_id": "github_user_1",
  "message": "Starting header component refactor",
  "scope": ["src/components/Header.tsx"],
  "intent": "WRITING",
  "timestamp": 1610000000
}
```
