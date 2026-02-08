# 🎬 Remotion Setup - Updated with Live Components!

## ✅ What's New

Your Remotion videos now use the **actual components from your Relay frontend** to create realistic, live-looking demos!

### 📹 Updated Video Compositions

#### 1. **HeroVideo** (10 seconds) - UNCHANGED
- Animated "Relay" branding intro
- Feature badges with spring animations
- DevFest 2026 branding

#### 2. **LiveGraphDemo** (14 seconds) - NEW! 🔥
- Uses your **actual FileNode and DependencyEdge components**
- Uses **ReactFlow** with your real graph visualization
- Simulates live agent coordination:
  - Agent A locks `src/auth.ts` (WRITING)
  - Agent B tries to edit → gets SWITCH_TASK
  - Agent B switches to `src/utils.ts` (safe)
  - Agent A releases lock
- **Real UI** from your app - looks like a screen recording!

#### 3. **LiveMCPDemo** (15 seconds) - NEW! 🔥
- Terminal-style MCP protocol demonstration
- Shows actual curl commands and JSON responses
- Demonstrates:
  - `check_status` → PROCEED
  - `post_status` → Lock acquired
  - Second agent `check_status` → SWITCH_TASK (conflict!)
- Uses real API response format from your backend

## 🚀 Quick Start

### Preview Videos
```bash
npm run remotion:studio
```

### Render All Videos
```bash
./scripts/render-all-videos.sh
```

This will create:
- `remotion/output/01-hero.mp4` - Branding intro (10s)
- `remotion/output/02-live-graph.mp4` - Live graph demo (14s)
- `remotion/output/03-mcp-integration.mp4` - MCP terminal demo (15s)

## 🎨 What Makes These "Live"

### LiveGraphDemo
✅ Uses your actual `FileNode` component with:
- Real lock status colors (#f87171 for WRITING)
- Pulse animations on locked nodes
- Folder paths and file names
- Lock user badges

✅ Uses your actual `DependencyEdge` component with:
- Animated edges when files are locked
- Color transitions (#f59e0b for locked dependencies)

✅ Uses your real ReactFlow setup with:
- Background dots pattern
- MiniMap showing lock states
- Controls panel
- Exact same styling as your app

### LiveMCPDemo
✅ Shows your actual API endpoints
✅ Uses real JSON-RPC 2.0 format
✅ Demonstrates actual orchestration commands (PROCEED, SWITCH_TASK)
✅ Terminal-style UI that looks like real command execution

## 🎯 Perfect For

- **README.md demos** - Show the actual UI in action
- **Social media** - Twitter, LinkedIn posts with real product footage
- **DevFest 2026 presentation** - Live demo that always works
- **Documentation** - Tutorial videos using real components
- **Landing page** - Hero section with actual product visuals

## 📊 Video Specifications

| Composition | Duration | What It Shows | File Size |
|-------------|----------|---------------|-----------|
| HeroVideo | 10s | Branding intro | ~8-12 MB |
| LiveGraphDemo | 14s | Real graph UI with agents | ~12-18 MB |
| LiveMCPDemo | 15s | Terminal MCP demo | ~10-15 MB |

## 🔧 Customization

### Change the Repository Display
Edit `LiveGraphDemo.tsx`:
```tsx
<div style={{ fontSize: '14px', color: isDark ? '#a1a1aa' : '#71717a' }}>
  your-org/your-repo • branch-name  // Change this
</div>
```

### Change File Names
Edit the `nodes` array in `LiveGraphDemo.tsx`:
```tsx
{
  id: 'your/file/path.ts',  // Change file path
  data: {
    path: 'your/file/path.ts',
    fileName: 'your/file/path.ts',
    // ...
  },
}
```

### Adjust Timing
Edit animation frames in the components:
```tsx
const agent1Locks = spring({ frame: frame - 90, fps });  // Starts at frame 90
const agent2Appears = spring({ frame: frame - 150, fps }); // Starts at frame 150
```

## 🐛 Troubleshooting

### "Cannot find module 'reactflow'"
The ReactFlow styles are imported - make sure all dependencies are installed:
```bash
npm install
```

### Tailwind CSS classes not working
The updated videos use inline styles only - Tailwind is not needed for Remotion.

### FileNode not rendering correctly
Make sure your `app/components/FileNode.tsx` uses conditional className checks:
```tsx
const FileNode = ({ data }: FileNodeProps) => {
  // Component should handle isDark prop
}
```

## 📝 Converting to GIF for GitHub

After rendering, convert to GIF for embedding in READMEs:
```bash
# Install ffmpeg if needed
brew install ffmpeg

# Convert to GIF (optimized for GitHub)
ffmpeg -i remotion/output/02-live-graph.mp4 \
  -vf "fps=15,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 remotion/output/02-live-graph.gif
```

## 🎉 Result

Your videos now showcase the **actual Relay UI** instead of mock animations. This makes them:
- More authentic and credible
- Easier to maintain (uses same components as your app)
- More impressive for demos and presentations
- Consistent with your actual product styling

Render them and see the difference! 🚀

```bash
npm run remotion:studio
```
