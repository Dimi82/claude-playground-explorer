---
name: playground-project-architecture
description: Create an interactive HTML architecture explorer playground for the current project
---

# Project Architecture Explorer

Creates a self-contained HTML playground that visualizes the current project's architecture with three panels: component tree (left), workflow/data flow/file diagrams (center), and component details with annotations (right).

## When to Use

- Exploring an unfamiliar codebase's architecture
- Documenting questions about architectural decisions
- Planning architectural changes with context
- Onboarding to understand system structure

## Output

Files in `docs/playground/` directory:
- `{context-name}-architecture-{timestamp}.html` - The interactive playground
- `{context-name}-architecture-{timestamp}-config.js` - The configuration data

Where `{context-name}` is a short descriptive name based on the focus area (e.g., "tools", "api", "auth") and `{timestamp}` is in format `YYYYMMDD-HHMM`.

Features:
- Three-panel layout (component tree, diagram canvas, details panel)
- Four diagram views: Workflow, Data Flow, File Structure, Sequence
- Component annotations (questions, comments, edit suggestions)
- Auto-generated prompts with architectural context
- localStorage persistence

## Implementation

### Phase 1: Codebase Analysis

**Scope Discovery** (do this first):
- Treat user's focus area as the PRIMARY scope, not the ONLY scope
- Before diving deep, identify foundational/supporting directories that the focus area depends on
- Check repo root and adjacent directories for: shared types/interfaces, schemas, templates, config files, utilities
- Use glob patterns to find related files (e.g., if exploring "tools/", also check "schemas/", "types/", "config/")
- Map how the focus area imports from or references other directories

Analyze the project to identify:

1. **Entry Points** - Main orchestrator classes, CLI entry, API handlers
2. **Workflow Nodes** - Core processing steps/phases
3. **System Layers** - LLM, Tools, Services, Data Access
4. **State & Types** - Key interfaces, state objects, DTOs
5. **File Structure** - Map to actual file paths

For each component, capture:
- Title and badge type (entry, node, llm, tool, state)
- File path
- Description (2-3 sentences)
- Responsibilities (3-5 bullet points)
- Key code/interface snippet

### Phase 2: Build Configuration

Generate a CONFIG object with this structure:

```javascript
const CONFIG = {
  projectName: "Your Project",

  // IMPORTANT: Add entries for ALL selectable elements across all diagrams
  componentData: {
    // Tree/workflow components
    "component-id": {
      title: "Component Name",
      badge: "entry",  // entry, node, llm, tool, state
      badgeLabel: "ENTRY",
      file: "src/path/to/file.ts",
      description: "Description of what this component does.",
      responsibilities: ["Responsibility 1", "Responsibility 2"],
      code: "interface Example { prop: string; }"
    },
    // Workflow V2 nodes - use the componentId from nodes
    "validator": {
      title: "Input Validator",
      badge: "node",
      badgeLabel: "NODE",
      file: "src/validator.ts",
      description: "Validates incoming requests.",
      responsibilities: ["Schema validation", "Type checking"],
      code: "function validate(input: unknown): Result"
    },
    // Sequence diagram participants
    "client": {
      title: "Client Application",
      badge: "entry",
      badgeLabel: "CLIENT",
      file: "src/client/index.ts",
      description: "Frontend client that initiates requests.",
      responsibilities: ["User interaction", "API calls"],
      code: "class Client { async login(credentials) }"
    },
    // Sequence diagram messages
    "msg-1": {
      title: "POST /login",
      badge: "tool",
      badgeLabel: "HTTP",
      file: "src/api/routes/auth.ts",
      description: "HTTP endpoint for user authentication.",
      responsibilities: ["Validate payload", "Forward to auth service"],
      code: "router.post('/login', async (req, res) => { ... })"
    }
  },

  treeStructure: [
    {
      header: "Entry Points",
      items: [{ id: "component-id", icon: "E", iconClass: "icon-entry" }]
    }
  ],

  dataFlowLayers: [
    { label: "Input", items: ["component-id"] }
  ],

  fileTreeEntries: [
    { indent: "", icon: "D", text: "src/", component: null },
    { indent: "L--", icon: "F", text: "file.ts", component: "component-id" }
  ],

  workflowStructure: [
    { phase: "phase-1", nodes: ["component-id-1", "component-id-2"] }
  ],

  // Enhanced workflow with conditionals, branches, and loops (optional)
  workflowStructureV2: {
    nodes: [
      { id: "start", type: "start", label: "Start" },
      { id: "validate", type: "process", label: "Validate", componentId: "validator", phase: "phase-1" },
      { id: "check", type: "decision", label: "Valid?" },
      { id: "success", type: "process", label: "Process", componentId: "processor", phase: "phase-2" },
      { id: "error", type: "process", label: "Handle Error", componentId: "error-handler", phase: "phase-2" },
      { id: "merge", type: "merge" },
      { id: "end", type: "end", label: "End" }
    ],
    edges: [
      { from: "start", to: "validate" },
      { from: "validate", to: "check" },
      { from: "check", to: "success", label: "Yes", branch: "primary" },
      { from: "check", to: "error", label: "No", branch: "secondary" },
      { from: "success", to: "merge" },
      { from: "error", to: "merge" },
      { from: "merge", to: "end" },
      { from: "error", to: "validate", label: "Retry", type: "loop" }
    ]
  },

  sequenceFlows: [
    {
      name: "Authentication Flow",
      participants: [
        { id: "client", name: "Client" },
        { id: "api", name: "API Gateway" },
        { id: "auth", name: "Auth Service" },
        { id: "db", name: "Database" }
      ],
      messages: [
        { id: "msg-1", from: "client", to: "api", label: "POST /login", type: "sync" },
        { id: "msg-2", from: "api", to: "auth", label: "validateCredentials()", type: "sync" },
        { id: "msg-3", from: "auth", to: "db", label: "query user", type: "async" },
        { id: "msg-4", from: "db", to: "auth", label: "user record", type: "return" },
        { id: "msg-5", from: "auth", to: "auth", label: "verifyPassword()", type: "sync" },
        { id: "msg-6", from: "auth", to: "api", label: "token", type: "return" },
        { id: "msg-7", from: "api", to: "client", label: "200 OK + token", type: "return" }
      ]
    }
  ]
};
```

### Phase 3: Generate Output

**File Naming Convention:**

Generate filenames based on context and timestamp:
- Context name: derive from the focus area (e.g., "tools", "api-layer", "auth-system")
- Timestamp: use format `YYYYMMDD-HHMM` (e.g., `20260205-1430`)

Example filenames:
- `tools-architecture-20260205-1430.html`
- `tools-architecture-20260205-1430-config.js`

**Generation Steps:**

1. Create the docs/playground directory if needed:
   ```bash
   mkdir -p docs/playground
   ```

2. Write the CONFIG object directly as a JS file (do NOT create a JSON file):
   ```
   docs/playground/{context-name}-architecture-{timestamp}-config.js
   ```

   The file should contain:
   ```javascript
   window.EXTERNAL_CONFIG = {
     // ... your CONFIG object here
   };
   ```

3. Copy the template:
   ```bash
   cp ~/.claude/skills/playground-project-architecture/templates/architecture-explorer.html docs/playground/{context-name}-architecture-{timestamp}.html
   ```

4. Edit the HTML file to add the config script tag before the main `<script>` tag:
   ```html
   <script src="{context-name}-architecture-{timestamp}-config.js"></script>
   ```

5. Open in browser:
   ```bash
   open docs/playground/{context-name}-architecture-{timestamp}.html
   ```

## Component Badge Types

| Badge | Use For |
|-------|---------|
| `entry` | Main entry points, orchestrators, CLI handlers |
| `node` | Workflow/pipeline nodes, processing steps |
| `llm` | LLM-related: models, prompts, schemas |
| `tool` | Tools, utilities, executors |
| `state` | State objects, types, DTOs |

## Sequence Flow Configuration

The `sequenceFlows` array defines UML-style sequence diagrams showing message flows between participants.

### Participants
Define actors/systems that send/receive messages:
```javascript
{ id: "unique-id", name: "Display Name" }
```
- `id`: Unique identifier (can reference existing componentData)
- `name`: Display name (fallback if component not in componentData)

### Messages
Define interactions between participants:
```javascript
{
  id: "msg-1",           // Optional: enables selection/annotation
  from: "participant-id",
  to: "participant-id",
  label: "message text",
  type: "sync"           // sync, async, return
}
```

### Message Types
| Type | Visual | Use For |
|------|--------|---------|
| `sync` | Solid blue arrow | Synchronous calls |
| `async` | Solid purple arrow | Asynchronous calls |
| `return` | Dashed gray arrow | Return values/responses |

### Self-Calls
When `from === to`, renders as a loop back to the same participant. Use for internal processing steps.

### Component Data for Messages
Add message details to `componentData` for rich details panel:
```javascript
"msg-1": {
  title: "POST /login",
  badge: "tool",
  badgeLabel: "HTTP",
  file: "src/api/routes/auth.ts",
  description: "HTTP endpoint for user authentication",
  responsibilities: ["Validate payload", "Forward to auth service"],
  code: "router.post('/login', async (req, res) => { ... })"
}
```

## Enhanced Workflow Configuration (V2)

For complex workflows with conditionals, parallel branches, and loops, use `workflowStructureV2` instead of the legacy `workflowStructure`.

### Node Types

| Type | Visual | Use For |
|------|--------|---------|
| `start` | Green rounded pill | Entry point of workflow |
| `process` | Rectangle box | Processing steps (supports phase colors) |
| `decision` | Orange diamond | Conditional branching points |
| `merge` | Gray circle | Where branches rejoin |
| `end` | Red rounded pill | Exit point of workflow |

### Node Properties

```javascript
{
  id: "unique-id",           // Required: unique identifier
  type: "process",           // Required: start, process, decision, merge, end
  label: "Display Text",     // Optional: text shown in node
  componentId: "comp-id",    // Optional: links to componentData for details panel
  phase: "phase-1"           // Optional: adds phase color (phase-1 to phase-4)
}
```

### Edge Properties

```javascript
{
  id: "edge-id",             // Optional: enables selection/annotation
  from: "source-node-id",    // Required: source node
  to: "target-node-id",      // Required: target node
  label: "Yes",              // Optional: text label on edge
  branch: "primary",         // Optional: "primary" (blue) or "secondary" (gray)
  type: "loop"               // Optional: "loop" for back-edges (curved purple dashed)
}
```

### Layout Algorithm

The system automatically computes top-down layered layout:
1. Finds start nodes (type="start" or no incoming edges)
2. Assigns layers using longest-path algorithm
3. Places nodes in same layer side-by-side
4. Routes edges with SVG paths (straight or curved for loops)

### Backward Compatibility

If `workflowStructureV2` is not defined, the legacy `workflowStructure` (array of phase rows) is used.

## Critical Rules

1. **Use real codebase elements** - Find actual component names, file paths
2. **Include file paths** - Every component should have its source file path
3. **Write helpful descriptions** - 2-3 sentences explaining what each component does
4. **List concrete responsibilities** - Specific things the component handles
5. **Include code snippets** - Key interfaces, types, or function signatures
6. **Open in browser** - Always run `open` command after creating
7. **MANDATORY: Add componentData for ALL diagram elements** - Every selectable element in every diagram MUST have a corresponding entry in `componentData`. This includes:
   - All workflow nodes (use `componentId` to link)
   - All sequence diagram participants (use participant `id`)
   - All sequence diagram messages (use message `id`)
   - All data flow layer items
   - All file tree entries with `component` set

   Without componentData entries, the details panel will be empty when users click elements. The details panel is essential for understanding what each element represents.
