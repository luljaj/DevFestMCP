# Agent Coordination Guide

## What This System Does

You're working in a **shared codebase** where multiple AI agents (like you) and humans collaborate simultaneously on the same repository. This system helps everyone avoid stepping on each other's toes by coordinating who's working on what files.

Think of it like a shared office where people call out "I'm working on this document!" before they start editing, so others know to work on something else instead.

---

## The Core Problem

**Without coordination:**
- Two agents edit the same file simultaneously
- Both try to commit their changes
- Git merge conflicts everywhere
- Wasted work, frustration, broken builds

**With this system:**
- Agents check before editing: "Is anyone working on this file?"
- Lock the file while working: "I'm editing this now!"
- Release when done: "File is free for others!"
- Everyone works smoothly in parallel on different files

---

## How It Works (Simple Version)

### 1. **Before You Edit Anything**

Ask the system: "Is this file available?"
- ✅ **Available** → Go ahead and work on it
- ⚠️ **Someone else is editing it** → Pick a different task or wait
- 🔵 **Someone is reading it** → You can read too, but don't write yet

### 2. **When You Start Working**

Tell the system: "I'm working on this file now"
- Marks the file as locked by you
- Other agents see it's taken and work elsewhere
- You have 5 minutes to complete your work

### 3. **While You're Working**

- Make your changes
- Commit to git
- Push your changes

### 4. **When You're Done**

Tell the system: "I'm done, file is free"
- Releases the lock
- Other agents can now work on it
- System tracks what you did for team visibility

---

## Your Responsibilities as an Agent

### ✅ **Always Check First**

Before modifying ANY file, you **must** check if it's available. This is non-negotiable.

**Bad:**
```
User: "Refactor the auth system"
Agent: *immediately starts editing auth.ts*
```

**Good:**
```
User: "Refactor the auth system"
Agent: *checks status of auth.ts first*
Agent: "I see auth.ts is currently being edited by Jane. 
       Would you like me to work on something else, or wait?"
```

### ✅ **Respect Locks**

If another agent or human is working on a file:
- **DO NOT** edit that file
- **DO** find alternative work
- **DO** inform the user about the conflict

The system will tell you:
- **DIRECT lock:** Someone is actively editing this file → **Pick something else**
- **NEIGHBOR lock:** Someone is editing a file this one depends on → **Read-only, no edits**

### ✅ **Communicate Your Intent**

When you start working on a new area, post a brief update:
- "Starting authentication refactor"
- "Moving to database layer to investigate timeout"
- "Implementing password reset feature"

This helps your teammates (human and AI) understand the big picture.

### ✅ **Work in Time Blocks**

You have **5 minutes** to complete your work on a file before your lock expires.

**If you need longer:**
- Break work into smaller chunks
- Or refresh your lock by checking in again
- System auto-releases locks after 5 minutes of inactivity

### ✅ **Be a Good Teammate**

- Don't hog files unnecessarily
- Release locks as soon as you're done
- Post activity updates when switching focus areas
- If you encounter unexpected issues, communicate them

---

## File-Level Locking (Important!)

**Granularity:** The system locks **entire files**, not individual functions or lines.

This means:
- If someone is editing `auth.ts`, you **cannot** edit `auth.ts` at all
- Even if you want to change a different function in that file
- You must wait or pick a different file

**Why?**
- Simple and predictable
- Prevents most merge conflicts
- Fast coordination checks
- Clear ownership

---

## The Coordination Protocol

### Step 1: Check Status

**Tool:** `check_status`

**When:** Before planning any file edits

**Example:**
```
You need to modify: auth.ts, utils.ts

Call: check_status(file_paths=["src/auth.ts", "src/utils.ts"])

Response might say:
- "auth.ts is locked by Jane (WRITING)"
- "utils.ts is available (OPEN)"
```

**Your decision:**
- Work on utils.ts only
- Or ask user if they want to wait for auth.ts
- Or find completely different work

### Step 2: Claim Your Files

**Tool:** `post_status`

**When:** You've decided what to work on and it's available

**Example:**
```
Call: post_status(
  file_paths=["src/utils.ts"],
  status="WRITING",
  message="Refactoring utility functions"
)

Now you own utils.ts for the next 5 minutes
Other agents will see it's locked and work elsewhere
```

### Step 3: Do Your Work

- Read the code
- Make your changes
- Test if needed
- Commit to git
- Push to the repository

**Time limit:** 5 minutes per lock

### Step 4: Release

**Tool:** `post_status`

**When:** You've committed and pushed

**Example:**
```
Call: post_status(
  file_paths=["src/utils.ts"],
  status="OPEN",
  message="Completed refactoring",
  new_repo_head="abc123def"  // Your new commit SHA
)

Lock is released
File is available for others
```

---

## Activity Updates (Optional but Helpful)

**Tool:** `post_activity`

**When to use:**
- Starting work in a new area/module
- Switching from one layer to another (frontend → backend)
- Completing a major milestone
- Encountering blockers

**When NOT to use:**
- Every single file edit (too noisy)
- Chat messages (this isn't a chat system)
- Debugging details

**Example:**
```
Starting work:
post_activity(
  summary="Starting authentication refactor",
  scope=["src/auth/*"],
  intent="WRITING"
)

Switching focus:
post_activity(
  summary="Moving to database layer to fix connection timeout",
  scope=["src/db/*"],
  intent="DEBUGGING"
)

Completing:
post_activity(
  summary="Auth refactor complete, running integration tests",
  scope=["src/auth/*"],
  intent="TESTING"
)
```

---

## Understanding Lock Types

### 🔴 WRITING (Direct Lock)

**What it means:** Someone is actively editing this file

**What you should do:** 
- Do NOT read or write this file
- Choose different work
- The system will tell you to "SWITCH_TASK"

### 🔵 READING

**What it means:** Someone is analyzing/reading this file

**What you can do:**
- Read it too (multiple readers OK)
- Do NOT write to it yet

**What you cannot do:**
- Edit it (wait for them to finish)

### ⚪ OPEN

**What it means:** File is available

**What you can do:**
- Claim it for READING or WRITING
- Start your work

---

## Handling Conflicts

### Scenario 1: File You Need is Locked

**System says:** "auth.ts is locked by Jane (WRITING)"

**Your options:**
1. **Switch tasks:** Work on a different file/feature
2. **Wait:** Tell user "Jane is working on auth.ts. Would you like me to wait or work on something else?"
3. **Coordinate:** Check activity feed to see what Jane is doing

**Do NOT:**
- Ignore the lock and edit anyway
- Force your way in
- Assume it'll be fine

### Scenario 2: Multiple Files Needed, Some Locked

**System says:** 
- "auth.ts is OPEN ✓"
- "db.ts is locked by Alex (WRITING) ✗"

**Your options:**
1. **Partial work:** If auth.ts alone is useful, work on it
2. **Wait for both:** If you need both, explain to user and wait
3. **Alternative approach:** Find a different way that doesn't need db.ts

### Scenario 3: Dependency is Being Modified

**System says:** "db.ts is OPEN, but utils.ts (which db.ts depends on) is being WRITTEN by Sam"

**Your decision:**
- **Low risk:** If you're just reading db.ts, probably OK
- **High risk:** If you're changing db.ts behavior that depends on utils.ts, wait
- **Ask user:** Explain the dependency risk

---

## What Happens If You Don't Follow the Protocol?

### You don't check before editing:
- You and another agent edit the same file
- Git merge conflict when you both push
- Someone's work gets lost or requires manual merge
- User frustration

### You ignore a lock:
- Same merge conflict issues
- System shows conflicts in the UI
- You look like a bad teammate
- Coordination system becomes useless

### Your lock expires (5 min timeout):
- System auto-releases your file
- Another agent might claim it
- Now you both have changes to the same file
- Merge conflicts again

**Bottom line:** Follow the protocol. It exists to help everyone work smoothly.

---

## Best Practices

### 🎯 Plan Before You Lock

**Bad:**
```
1. Lock auth.ts, db.ts, utils.ts, config.ts
2. Start reading code to figure out what to do
3. Realize you only need auth.ts
4. 5 minutes pass, locks expire, chaos
```

**Good:**
```
1. Read the code first (no locks needed for reading)
2. Plan your exact changes
3. Lock only what you'll actually edit
4. Execute quickly
5. Release immediately
```

### 🎯 Lock Minimally

Only lock files you're **actively modifying right now**.

Don't lock files you *might* need later.

### 🎯 Work in Focused Chunks

Break big tasks into 5-minute chunks:
- "Refactor auth.ts" (5 min)
- Release
- "Update tests" (5 min)
- Release
- "Update documentation" (5 min)

Better than trying to do everything in one 20-minute session.

### 🎯 Communicate Proactively

If something unexpected happens:
- Found a bug while refactoring
- Realized you need to change more files
- Hit a blocker

Post an activity update so your team knows what's happening.

---

## Example: A Good Coordination Flow

**User request:** "Add password reset functionality"

**Agent response:**
```
I'll add password reset functionality. Let me check what files I need to modify.

*calls check_status for auth.ts, email.ts, db.ts*

Status check complete:
- auth.ts: OPEN ✓
- email.ts: OPEN ✓  
- db.ts: Currently being edited by Alex (WRITING) ✗

Alex is working on the database layer. I can implement the core 
password reset logic in auth.ts and email.ts now, but I'll need 
to wait for Alex to finish before adding the database storage.

Would you like me to:
1. Start with auth.ts and email.ts now (core logic)
2. Wait for Alex to finish, then do everything together
3. Check what Alex is working on to avoid conflicts

*user chooses option 1*

Starting work on password reset feature.

*calls post_status to lock auth.ts and email.ts*
*posts activity: "Implementing password reset feature (auth + email)"*
*makes changes, commits, pushes*
*calls post_status to release locks*

Core password reset logic complete. I'll need to add the database 
persistence once Alex is done with db.ts.

*later, when db.ts is free*
*checks status, locks db.ts, adds persistence code, releases*

Password reset feature complete!
```

---

## Key Takeaways

1. **Always check before editing** - No exceptions
2. **Respect locks** - They're there for a reason  
3. **Work in 5-minute chunks** - Don't overstay your locks
4. **Communicate your intent** - Help your team coordinate
5. **Release immediately** - Don't hog files
6. **Switch tasks when blocked** - Stay productive
7. **File-level locking** - Entire files, not functions

---

## You're Part of a Team

This system only works if everyone follows it. You're not just working alone—you're collaborating with other agents and humans in real-time.

Be a good teammate:
- Check first, edit second
- Communicate your plans
- Release locks promptly
- Adapt when things are locked
- Help avoid conflicts

**The goal:** Everyone works efficiently in parallel, no merge conflicts, no wasted effort, smooth collaboration.

You've got this! 🚀
