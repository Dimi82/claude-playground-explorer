---
name: playground-project-brainstorm
description: Create an interactive HTML brainstorm explorer playground customized for the current project's architecture
---

# Project Brainstorm Explorer

Creates a self-contained HTML playground that visualizes the current project's architecture as an interactive concept map. Users mark their knowledge level on each concept, draw connections between concepts, capture ideas, and generate prompts for the brainstorm-refiner agent.

## When to Use

- Starting work on an unfamiliar codebase
- Planning significant architectural changes
- Onboarding to a new project
- Mapping knowledge gaps before deep dives
- Collaborative brainstorming sessions

## Output

A single HTML file (`brainstorm-explorer.html`) in the project root with:
- Interactive concept map canvas with draggable nodes
- User-drawable edges between concepts
- Topic filtering and presets
- Knowledge status cycling (Know/Fuzzy/Unknown/Explore)
- Idea capture with add/delete (ideas appear as nodes on canvas)
- Auto-generated prompts targeting the brainstorm-refiner agent
- localStorage persistence

## Implementation

### Phase 1: Codebase Analysis

Analyze the project to identify:

1. **4-5 Major Topic Areas** - Look for:
   - Directory structure patterns (src/api, src/db, src/ui)
   - Package.json scripts and dependencies
   - Key architectural files (routes, models, services, controllers)
   - README or docs that describe architecture
   - Recently modified files (indicates active development areas)

2. **4-5 Concepts Per Topic** - For each topic, identify:
   - Core components/modules with file paths
   - Key patterns being used
   - Integration points
   - Pain points (TODOs, FIXMEs, complex files)

3. **Relationships** - Map:
   - Dependencies between concepts
   - Data flow connections
   - Cross-topic integrations (shown as dashed edges)

### Phase 2: Build Configuration

Generate a CONFIG object with this structure:

```javascript
const CONFIG = {
  projectName: "Your Project",

  colors: {
    topic1: "#4fc3f7",  // blue
    topic2: "#81c784",  // green
    topic3: "#ffb74d",  // orange
    topic4: "#ba68c8",  // purple
    general: "#90a4ae"  // gray (keep this)
  },

  topicNames: {
    topic1: "Topic 1 Display Name",
    topic2: "Topic 2 Display Name",
    topic3: "Topic 3 Display Name",
    topic4: "Topic 4 Display Name"
  },

  concepts: [
    {
      id: "t1-concept1",
      topic: "topic1",
      name: "Concept Name",
      desc: "Description from codebase (src/path.ts)",
      status: "fuzzy",  // know, fuzzy, unknown, explore
      x: 150,
      y: 120
    }
  ],

  edges: [
    { from: "t1-concept1", to: "t1-concept2" },              // same topic (solid)
    { from: "t1-concept1", to: "t2-concept1", cross: true }  // cross-topic (dashed)
  ]
};
```

### Phase 3: Generate HTML

**Option A: External Config (Recommended - saves ~90% tokens)**

This approach separates config from template, reducing token usage significantly.

1. Write the CONFIG object as a JSON file:
   ```bash
   # Write to docs/playground/config-{projectname}.json
   ```

2. Convert JSON to JavaScript config file:
   ```bash
   node -e "const fs=require('fs'); const c=JSON.parse(fs.readFileSync('docs/playground/config-{projectname}.json')); fs.writeFileSync('docs/playground/config-{projectname}.js', 'window.EXTERNAL_CONFIG = ' + JSON.stringify(c, null, 2) + ';');"
   ```

3. Copy the template (no modifications needed):
   ```bash
   cp ~/.claude/skills/playground-project-brainstorm/templates/brainstorm-explorer.html docs/playground/
   ```

4. Add script tag to load config before main script. Edit `docs/playground/brainstorm-explorer.html`:
   ```html
   <!-- Add this line before the main <script> tag -->
   <script src="config-{projectname}.js"></script>
   ```

5. Open in browser:
   ```bash
   open docs/playground/brainstorm-explorer.html
   ```

**Option B: Inline Config (Legacy)**

For backwards compatibility or single-file distribution:

1. Read the template file:
   ```
   playground-project-brainstorm/templates/brainstorm-explorer.html
   ```

2. Replace placeholders:
   - `{{PROJECT_NAME}}` with project name
   - Modify the config loader to use inline config by replacing the `loadConfig()` function body with:
     ```javascript
     return {{CONFIG_JSON}};
     ```

3. Write to `brainstorm-explorer.html` in project root

4. Open in browser:
   ```bash
   open brainstorm-explorer.html
   ```

## Example Topic Patterns

| Project Type | Typical Topics |
|--------------|----------------|
| Web API | Routes, Services, Data Layer, Auth, Middleware |
| Frontend | Components, State, Routing, API Client, Styling |
| CLI Tool | Commands, Config, I/O, Parsing, Plugins |
| Data Pipeline | Ingestion, Transform, Storage, Scheduling, Monitoring |
| Agent/AI | Planning, Execution, Tools, Memory, Orchestration |

## Node Positioning Guidelines

Position nodes spatially by topic:
- Topic 1: Upper left area (x: 100-300, y: 80-200)
- Topic 2: Upper right area (x: 400-600, y: 80-200)
- Topic 3: Lower left area (x: 100-300, y: 280-400)
- Topic 4: Lower right area (x: 400-600, y: 280-400)

## Critical Rules

1. **Use real codebase elements** - Find actual file names, component names, patterns
2. **Include file paths in descriptions** - Help user navigate to relevant code
3. **Default status to 'fuzzy'** - User adjusts from there
4. **Pre-draw meaningful edges** - Show actual dependencies you discover
5. **Position nodes by topic** - Group related concepts spatially
6. **Open in browser** - Always run `open` command after creating
