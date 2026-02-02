# Claude Code Skills & Agents

A collection of custom skills and agents for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI.

## Contents

- **Skills** - Reusable workflows that Claude can invoke
- **Agents** - Custom agent definitions with specialized prompts

## Skills Included

### playground-project-brainstorm

Creates an interactive HTML brainstorm explorer playground customized for any project's architecture. Features:

- Interactive concept map canvas with draggable nodes
- User-drawable edges between concepts
- Topic filtering and presets
- Knowledge status cycling (Know/Fuzzy/Unknown/Explore)
- Idea capture with add/delete
- Auto-generated prompts targeting the brainstorm-refiner agent
- **localStorage persistence** - all changes auto-save and restore

### playground-project-architecture

Creates an interactive HTML architecture explorer playground for any project. Features:

- Three-panel layout (component tree, diagrams, details)
- Four diagram views: Workflow, Data Flow, Sequence, File Structure
- Enhanced workflow diagrams with decision nodes, branches, and loops
- Component annotations (questions, comments, edit suggestions)
- Auto-generated prompts with architectural context
- **localStorage persistence** - all annotations auto-save
- Export annotations to clipboard
- Right-click context menu for quick annotation

## Custom Agents Included

### brainstorm-refiner

An elite thinking partner that helps explore, validate, and refine ideas through rigorous yet creative collaboration.

**When to use:**
- Early-stage concept development
- Evaluating multiple approaches to a problem
- Challenging assumptions systematically
- Sharpening vague ideas into concrete proposals

**Key behaviors:**
- Asks clever, insight-generating questions
- Presents 2-4 distinct options (never converges too early)
- Identifies gaps, risks, and opportunities honestly
- Follows structured output: Reflect → Probe → Expand → Validate → Refine → Guide

### brainstorm-challenger

An elite thinking partner focused on stress-testing and evolving ideas through constructive challenge.

**When to use:**
- Brainstorming sessions for new features
- Validating product concepts
- Exploring architectural decisions
- When you're stuck and need fresh perspectives

**Key behaviors:**
- Challenges assumptions relentlessly
- Generates concrete, non-obvious ideas
- Finds gaps and opportunities others overlook
- Leads the process proactively

## Prerequisites

1. **Claude Code CLI** - Install from [Anthropic](https://docs.anthropic.com/en/docs/claude-code)
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Modern web browser** - Chrome, Firefox, Safari, or Edge for viewing playgrounds

## Installation

### Installing Skills

#### Option 1: Symlink (Recommended for personal use)

```bash
# Clone the repo
git clone <repo-url> ~/claude-skills
cd ~/claude-skills

# Create symlinks for skills
ln -s "$(pwd)/playground-project-brainstorm" ~/.claude/skills/
ln -s "$(pwd)/playground-project-architecture" ~/.claude/skills/
```

#### Option 2: Copy directly

```bash
# Clone and copy
git clone <repo-url> /tmp/claude-skills
cp -r /tmp/claude-skills/playground-project-brainstorm ~/.claude/skills/
cp -r /tmp/claude-skills/playground-project-architecture ~/.claude/skills/
```

#### Option 3: Project-local skills

Copy skills into your project's `.claude/skills/` directory:

```bash
# From your project root
mkdir -p .claude/skills
cp -r ~/claude-skills/playground-project-brainstorm .claude/skills/
cp -r ~/claude-skills/playground-project-architecture .claude/skills/
```

### Installing Custom Agents

Copy agent definitions to your Claude agents directory:

```bash
# Create agents directory if it doesn't exist
mkdir -p ~/.claude/agents

# Copy agents
cp ~/claude-skills/agents/*.md ~/.claude/agents/
```

Or symlink for easy updates:

```bash
ln -s "$(pwd)/agents/brainstorm-refiner.md" ~/.claude/agents/
ln -s "$(pwd)/agents/brainstorm-challenger.md" ~/.claude/agents/
```

## Verification

After installation, verify components are available:

```bash
# Start Claude Code
claude

# Skills should appear when asking about available skills
# Agents should appear in the Task tool's available agent types
```

Invoke a skill directly:
```
/playground-project-brainstorm
/playground-project-architecture
```

Use an agent via Task tool:
```
Use the brainstorm-refiner agent to explore this idea...
```

## Usage

### Quick Start

```
# Create a brainstorm explorer for current project
/playground-project-brainstorm

# Create an architecture explorer for current project
/playground-project-architecture

# Or use natural language
"Create a brainstorm explorer for this codebase"
"Generate an architecture diagram playground"
```

### Using the Agents

```
# Refine an idea iteratively
"Use brainstorm-refiner to help me think through adding caching to our API"

# Challenge assumptions
"Use brainstorm-challenger to poke holes in my microservices proposal"

# Or just describe what you need
"I have a vague idea about improving our auth flow, help me brainstorm"
```

### Playground → Agent Workflow

1. Run `/playground-project-brainstorm`
2. In the playground, mark concepts as "Explore" or "Unknown"
3. Click "Copy Prompt"
4. Paste the prompt back to Claude - it will automatically use the brainstorm-refiner agent

## File Structure

```
claude-skills/
├── README.md
├── agents/
│   ├── brainstorm-refiner.md      # Custom agent definition
│   └── brainstorm-challenger.md   # Custom agent definition
├── playground-project-brainstorm/
│   ├── SKILL.md                   # Skill definition
│   └── templates/
│       └── brainstorm-explorer.html
└── playground-project-architecture/
    ├── SKILL.md                   # Skill definition
    └── templates/
        └── architecture-explorer.html
```

## Customization

### Skill Templates

Each skill includes an HTML template in its `templates/` directory. When Claude generates a playground for your project, it:

1. Analyzes your codebase
2. Generates a config JS file with project-specific data
3. Copies the template HTML
4. Adds the config script reference

**Brainstorm Explorer config:**
- `projectName` - For generated prompts
- `colors` - Topic colors
- `topicNames` - Display names
- `initialConcepts` - Concepts from codebase analysis
- `initialEdges` - Relationships between concepts

**Architecture Explorer config:**
- `projectName` - For generated prompts
- `componentData` - Component details (title, description, code snippets)
- `treeStructure` - Sidebar navigation
- `dataFlowLayers` - Data flow diagram
- `workflowStructureV2` - Enhanced workflow with decisions and branches
- `sequenceFlows` - Sequence diagrams
- `fileTreeEntries` - File structure view

### Agent Customization

Edit the agent `.md` files to customize:
- `name` - Agent identifier
- `description` - When Claude should use this agent (with examples)
- `model` - Which model to use (`inherit`, `sonnet`, `opus`, `haiku`)
- `color` - Terminal color for agent output
- The system prompt content below the frontmatter

## Contributing

1. Fork this repository
2. Create your feature branch
3. Test your changes with Claude Code
4. Submit a pull request

## License

MIT

---

## Acknowledgments

This project was inspired by the [playground plugin](https://github.com/anthropics/claude-plugins-official) from the official Claude plugins marketplace. The original playground concept provided the foundation for these self-contained, project-specific explorer tools.
