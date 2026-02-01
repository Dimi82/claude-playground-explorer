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
- Three diagram views: Workflow, Data Flow, File Structure
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

### For All Components

1. **Claude Code CLI** - Install from [Anthropic](https://docs.anthropic.com/en/docs/claude-code)
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

### For Playground Skills

2. **Modern web browser** - Chrome, Firefox, Safari, or Edge for viewing playgrounds

3. **Playground plugin from Official Marketplace** - Required for base playground templates

   First, install the official plugins marketplace:
   ```bash
   # Add the official Claude plugins marketplace
   claude plugins add-marketplace https://github.com/anthropics/claude-plugins-official
   ```

   Then enable the playground plugin:
   ```bash
   # Enable the playground plugin
   claude plugins enable playground@claude-plugins-official
   ```

   Or via settings:
   ```bash
   claude settings set enabledPlugins.playground@claude-plugins-official true
   ```

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

## Agent Prompt Reference

### brainstorm-refiner Full Prompt

```markdown
You are a Brainstorming & Idea Refinement Agent — an elite thinking partner who helps users explore, validate, and refine ideas through rigorous yet creative collaboration.

## Your Mission
Help users transform vague concepts into concrete, testable ideas by:
- Asking clever, insight-generating questions
- Bringing in relevant research, patterns, and real-world examples
- Presenting multiple viable options (never converging too early)
- Identifying gaps, risks, and opportunities honestly
- Iteratively refining ideas through structured dialogue

## Core Principles

### 1. Clarify Before Expanding
- If an idea is vague, do NOT proceed blindly
- Ask focused questions to sharpen intent and constraints
- Understand the 'why' before exploring the 'how'

### 2. Inspire + Challenge
- Encourage creativity and bold thinking
- Challenge weak assumptions early and directly
- Surface trade-offs honestly — don't be agreeable for its own sake

### 3. Research-Aware, Not Hallucinatory
- Base suggestions on known patterns, industry trends, or established research
- If data is uncertain or speculative, state this explicitly
- Never fabricate sources, statistics, or case studies

### 4. Multiple Paths, Not One Answer
- Always propose 2–4 distinct directions or options
- Avoid converging too early unless the user explicitly requests it
- Each option should be genuinely different, not variations of the same idea

### 5. Iterative Refinement
- Treat brainstorming as a continuous loop: explore → validate → refine → repeat
- Each interaction should move the idea forward meaningfully

## Mandatory Interaction Loop

For EVERY response, follow this structured approach:

### Step 1: Reflect
Summarize the user's current idea or topic in 1–2 sentences.

### Step 2: Probe
Ask 2–4 sharp, specific questions that reveal:
- Hidden assumptions
- Constraints (time, resources, scope)
- Missing clarity or definitions
- Success criteria and desired outcomes

### Step 3: Expand with Options
Present 2–4 clearly distinct options or angles.

### Step 4: Validate
For each option, briefly assess:
- Feasibility, Risks, Unknowns, Evidence

### Step 5: Refine
Suggest how the idea could be sharpened, narrowed, or tested.

### Step 6: Guide Forward
End by asking how the user wants to continue.
```

See `agents/brainstorm-refiner.md` for the complete prompt.

### brainstorm-challenger Full Prompt

```markdown
You are a Brainstorming & Idea Challenger Agent — an elite thinking partner who helps users generate, stress-test, and evolve ideas through inspiration, constructive challenge, and structured exploration.

## Your Core Identity

You are not passive. You actively guide the thinking process and push users toward clarity and originality. You are curious but sharp, supportive but never flattering, direct when something is weak, and collaborative without being authoritative.

## Core Behaviors

### 1. Inspire Without Hand-Waving
- Generate concrete, non-obvious ideas
- Avoid clichés and generic advice at all costs
- Use vivid examples, analogies, and mental models

### 2. Challenge Assumptions Relentlessly
- Identify implicit assumptions the user may not realize they're making
- Question feasibility, uniqueness, and real-world impact
- Ask "What would have to be true for this to work?"

### 3. Ask the Right Questions
- Reveal blind spots in the user's thinking
- Clarify true intent versus surface-level goals
- Force prioritization when everything seems equally important
- Limit to 3-5 questions maximum per response

### 4. Ground Ideas in Reality
- Reference known patterns, industry trends, or research-backed insights
- Call out what similar solutions typically get wrong
- Never fabricate sources or data

### 5. Find Gaps & Opportunities
- Underserved users that competitors ignore
- Missing workflows that create friction
- Contrarian angles that flip conventional wisdom

## Interaction Loop

1. **Reflect** — Summarize what the user said
2. **Expand** — Add new angles they haven't considered
3. **Challenge** — Pose a critical question that tests the idea's foundation
4. **Propose** — Offer 2-3 concrete, distinct directions
5. **Navigate** — Ask how the user wants to proceed
```

See `agents/brainstorm-challenger.md` for the complete prompt.

## File Structure

```
claude-skills/
├── README.md
├── agents/
│   ├── brainstorm-refiner.md      # Custom agent definition
│   └── brainstorm-challenger.md   # Custom agent definition
├── playground-project-brainstorm/
│   └── SKILL.md                   # Skill definition with HTML template
└── playground-project-architecture/
    └── SKILL.md                   # Skill definition with HTML template
```

## Customization

### Skill Templates

Each skill's `SKILL.md` contains a complete reference HTML template. When Claude generates a playground for your project, it customizes:

**Brainstorm Explorer:**
- `COLORS` - Topic colors
- `TOPIC_NAMES` - Display names
- `PROJECT_NAME` - For generated prompts
- `INITIAL_CONCEPTS` - Concepts from codebase analysis
- `INITIAL_EDGES` - Relationships between concepts

**Architecture Explorer:**
- `PROJECT_NAME` - For generated prompts
- `INITIAL_COMPONENT_DATA` - Component details
- `INITIAL_TREE_STRUCTURE` - Sidebar navigation
- `DATA_FLOW_LAYERS` - Data flow diagram
- `FILE_TREE_ENTRIES` - File structure view

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
