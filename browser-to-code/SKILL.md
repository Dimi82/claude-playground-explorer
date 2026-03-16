---
name: browser-to-code
description: Gather context from Chrome browser tabs (Jira, Figma, docs) and hand off to a workflow skill (brainstorming, planning, debugging, code review)
---

# Browser to Code

Orchestrator skill that extracts context from your live Chrome browser tabs and transitions into the right development workflow. Requires the **chrome-cdp** skill to be installed.

## Flow

```
List Chrome tabs → User selects relevant tabs → Extract content → Summarize → User picks workflow → Invoke skill with full context
```

## Phase 1 — Gather Context

### Step 1: List tabs

Run the chrome-cdp list command:

```bash
~/.claude/skills/chrome-cdp/scripts/cdp.mjs list
```

**If this fails:**
- File not found → Tell the user: "The chrome-cdp skill is not installed. Install it by asking Claude Code: `Read https://github.com/pasky/chrome-cdp-skill and install the chrome-cdp skill`"
- Connection error → Tell the user: "Chrome remote debugging is not enabled. Go to `chrome://inspect/#remote-debugging` and toggle the switch ON."
- Empty list → Tell the user: "No Chrome tabs found. Open the relevant pages (Jira ticket, Figma design, docs) and try again."

### Step 2: User selects tabs

Present the tab list to the user. Ask them to select which tabs contain relevant context for their task. Use `AskUserQuestion` with `multiSelect: true`. Filter the tab list to show only meaningful tabs — skip `chrome://`, `about:blank`, auth redirects, and similar noise.

### Step 3: User categorizes tabs

For each selected tab, ask the user to assign a category:

- **Task/ticket** — The work item (Jira, ServiceNow, GitHub issue)
- **Design** — Visual reference (Figma, mockups, screenshots)
- **Reference** — Documentation, wiki, framework docs, API specs
- **General** — Anything else

If there are only 1-2 tabs, combine selection and categorization into a single question to avoid over-prompting.

### Step 4: Extract content

For each selected tab, extract content based on its category:

**Design tabs** → Take a screenshot:
```bash
~/.claude/skills/chrome-cdp/scripts/cdp.mjs shot <target> /tmp/browser-to-code-design.png
```
Then read the screenshot file so it's in the conversation as visual context.

**All other tabs** → Get the accessibility tree:
```bash
~/.claude/skills/chrome-cdp/scripts/cdp.mjs snap <target>
```

**If extraction fails for any tab**, skip it with a warning and continue with the rest.

**If a `snap` output is very large (3000+ lines)**, summarize the key sections (title, description, acceptance criteria, key content) rather than including the full tree.

### Step 5: Present structured summary

Compile the extracted content into a structured summary:

```markdown
## Gathered Context

### Task: [ticket ID] — [title]
- Type: [type] | Priority: [priority] | Sprint: [sprint]
- Description: [extracted from page]
- Acceptance criteria: [extracted if present]

### Design: [page title]
- [screenshot included above]
- [key visual elements described]

### Reference: [page title]
- [key content extracted and summarized]

### General: [page title]
- [relevant content extracted]
```

Ask the user: "Does this context summary look complete? Want to add or remove any tabs?"

If the user wants changes, go back to Step 2.

## Phase 2 — Choose Workflow

Once the user confirms the context summary, ask two things:

**First**, ask which workflow to use via `AskUserQuestion`:

| Option | Description | Skill |
|--------|-------------|-------|
| **Brainstorm & Plan** | New feature, unclear approach, needs design thinking first | `superpowers:brainstorming` |
| **Write Plan & Build** | Well-defined feature, ready to plan and implement | `superpowers:writing-plans` |
| **Debug** | Bug report, error, something is broken | `superpowers:systematic-debugging` |
| **Code Review** | Review existing code, PR, or implementation | `superpowers:requesting-code-review` |

**Second**, ask for any additional instructions:

> "Any additional instructions beyond what's in the browser context? (e.g., 'focus on the API layer', 'use the existing auth pattern', 'skip tests for now') — or press Enter to continue with just the browser context."

## Phase 3 — Handoff

Invoke the selected skill using the `Skill` tool. The gathered context and additional instructions are already in the conversation — the downstream skill will see them.

Before invoking, output a short transition message:

> "Context gathered. Starting **[selected workflow]** with the browser context above."

Then invoke the skill:

```
Skill: superpowers:brainstorming  (or whichever was selected)
```

**Do NOT pass the context summary as a skill argument.** It's already in the conversation history. The downstream skill will have full visibility of everything gathered.

**Do NOT try to automate or shortcut the downstream skill's process.** Each skill owns its own flow — brainstorming will ask clarifying questions, writing-plans will explore the codebase, debugging will investigate. This skill's job is done after handoff.

## Important

- **Read-only**: Never click, type, or navigate in the user's browser tabs. Only use `list`, `snap`, `shot`, and `html`.
- **User confirms everything**: Never skip the context summary confirmation or workflow selection.
- **One extraction per tab**: Don't repeatedly extract from the same tab.
- **Token awareness**: Large page extractions can consume significant context. Prefer `snap` over `html`, and summarize large outputs.
