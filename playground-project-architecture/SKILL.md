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

A single HTML file (`architecture-explorer.html`) in `docs/playground/` with:
- Three-panel layout (component tree, diagram canvas, details panel)
- Three diagram views: Workflow, Data Flow, File Structure
- Component annotations (questions, comments, edit suggestions)
- Auto-generated prompts with architectural context
- localStorage persistence

## Implementation

### Phase 1: Codebase Analysis

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

  componentData: {
    "component-id": {
      title: "Component Name",
      badge: "entry",  // entry, node, llm, tool, state
      badgeLabel: "ENTRY",
      file: "src/path/to/file.ts",
      description: "Description of what this component does.",
      responsibilities: ["Responsibility 1", "Responsibility 2"],
      code: "interface Example { prop: string; }"
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
  ]
};
```

### Phase 3: Generate HTML

1. Read the template file:
   ```
   playground-project-architecture/templates/architecture-explorer.html
   ```

2. Replace placeholders:
   - `{{PROJECT_NAME}}` with project name
   - `{{CONFIG_JSON}}` with JSON.stringify(CONFIG) (the config object)

3. Write to `docs/playground/architecture-explorer.html`

4. Open in browser:
   ```bash
   open docs/playground/architecture-explorer.html
   ```

## Component Badge Types

| Badge | Use For |
|-------|---------|
| `entry` | Main entry points, orchestrators, CLI handlers |
| `node` | Workflow/pipeline nodes, processing steps |
| `llm` | LLM-related: models, prompts, schemas |
| `tool` | Tools, utilities, executors |
| `state` | State objects, types, DTOs |

## Critical Rules

1. **Use real codebase elements** - Find actual component names, file paths
2. **Include file paths** - Every component should have its source file path
3. **Write helpful descriptions** - 2-3 sentences explaining what each component does
4. **List concrete responsibilities** - Specific things the component handles
5. **Include code snippets** - Key interfaces, types, or function signatures
6. **Open in browser** - Always run `open` command after creating
