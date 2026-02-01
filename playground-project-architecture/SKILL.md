---
name: playground-project-architecture
description: Create an interactive HTML architecture explorer playground for the current project
---

# Project Architecture Explorer

## Overview

Creates a self-contained HTML playground that visualizes the current project's architecture with three panels: component tree (left), workflow/data flow/file diagrams (center), and component details with annotations (right). Users explore architecture, add annotations (questions, comments, edit suggestions), and generate prompts for Claude. All state persists to localStorage.

## When to Use

- Exploring an unfamiliar codebase's architecture
- Documenting questions about architectural decisions
- Planning architectural changes with context
- Onboarding to understand system structure
- Code reviews that need architectural context
- Creating documentation for architecture

## Output

A single HTML file (`architecture-explorer.html`) in `docs/playground/` or project root with:
- Three-panel layout (component tree, diagram canvas, details panel)
- Three diagram views: Workflow, Data Flow, File Structure
- Component annotations (questions, comments, edit suggestions)
- Auto-generated prompts with architectural context
- **localStorage persistence** - all annotations auto-save and restore on reload
- Export annotations to clipboard
- Right-click context menu for quick annotation

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

### Phase 2: Build the Playground

Use the reference template below, customizing:
- Title in header
- `componentData` object with actual component info
- `treeStructure` array for sidebar navigation
- Workflow diagram node layout
- Data flow layers
- File tree structure

### Phase 3: Launch

After creating the file:
```bash
open docs/playground/architecture-explorer.html
```

## Reference Template

Use this exact structure, replacing placeholder data with project-specific content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROJECT_NAME - Architecture Explorer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117; color: #c9d1d9; min-height: 100vh; display: flex; flex-direction: column;
    }
    header {
      background: #161b22; border-bottom: 1px solid #30363d; padding: 16px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    header h1 { font-size: 20px; font-weight: 600; color: #f0f6fc; }
    .header-actions { display: flex; gap: 8px; }
    .header-btn {
      background: #21262d; border: 1px solid #30363d; border-radius: 6px;
      padding: 6px 12px; color: #c9d1d9; font-size: 12px; cursor: pointer;
    }
    .header-btn:hover { background: #30363d; }
    .header-btn.active { background: #238636; border-color: #238636; color: white; }
    .main-container { display: flex; flex: 1; overflow: hidden; }

    /* Left Panel */
    .component-tree {
      width: 280px; background: #161b22; border-right: 1px solid #30363d;
      overflow-y: auto; padding: 16px 0;
    }
    .tree-section { margin-bottom: 8px; }
    .tree-section-header {
      padding: 8px 16px; font-size: 11px; font-weight: 600;
      text-transform: uppercase; color: #8b949e; letter-spacing: 0.5px;
    }
    .tree-item {
      padding: 8px 16px 8px 24px; cursor: pointer; display: flex;
      align-items: center; gap: 8px; transition: background 0.15s; font-size: 13px;
      position: relative;
    }
    .tree-item:hover { background: #21262d; }
    .tree-item.active { background: #388bfd26; color: #58a6ff; border-left: 2px solid #58a6ff; padding-left: 22px; }
    .tree-item.has-annotation::after {
      content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      width: 8px; height: 8px; border-radius: 50%; background: #f0883e;
    }
    .tree-item .icon {
      width: 16px; height: 16px; border-radius: 3px; display: flex;
      align-items: center; justify-content: center; font-size: 10px; font-weight: bold;
    }
    .icon-node { background: #238636; color: white; }
    .icon-llm { background: #a371f7; color: white; }
    .icon-tool { background: #f0883e; color: white; }
    .icon-state { background: #3fb950; color: white; }
    .icon-entry { background: #58a6ff; color: white; }

    /* Center Panel */
    .diagram-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .diagram-header {
      background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .view-tabs { display: flex; gap: 4px; }
    .view-tab {
      padding: 6px 12px; background: transparent; border: 1px solid #30363d;
      border-radius: 6px; color: #8b949e; cursor: pointer; font-size: 12px;
    }
    .view-tab:hover { background: #21262d; color: #c9d1d9; }
    .view-tab.active { background: #21262d; color: #f0f6fc; border-color: #58a6ff; }
    .diagram-canvas { flex: 1; position: relative; overflow: auto; padding: 40px; }

    /* Workflow Diagram */
    .workflow-diagram { display: flex; flex-direction: column; align-items: flex-end; gap: 20px; min-width: 800px; padding-right: 80px; }
    .phase-row { display: flex; align-items: center; gap: 24px; }
    .workflow-below-phase3 { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    .node-box {
      background: #21262d; border: 2px solid #30363d; border-radius: 8px;
      padding: 16px 20px; min-width: 180px; cursor: pointer; transition: all 0.2s;
      text-align: center; position: relative;
    }
    .node-box:hover { border-color: #58a6ff; transform: translateY(-2px); }
    .node-box.selected { border-color: #58a6ff; background: #388bfd26; }
    .node-box.has-annotation { box-shadow: 0 0 0 3px #f0883e40; }
    .node-box.phase-1 { border-left: 4px solid #58a6ff; }
    .node-box.phase-2 { border-left: 4px solid #a371f7; }
    .node-box.phase-3 { border-left: 4px solid #3fb950; }
    .node-box.phase-4 { border-left: 4px solid #f0883e; }
    .node-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
    .node-subtitle { font-size: 11px; color: #8b949e; }
    .annotation-badge {
      position: absolute; top: -8px; right: -8px; width: 20px; height: 20px;
      background: #f0883e; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 10px; font-weight: bold; color: white;
    }
    .arrow { color: #484f58; font-size: 24px; cursor: pointer; padding: 4px; border-radius: 4px; }
    .arrow:hover { background: #21262d; }
    .arrow.has-annotation { color: #f0883e; }
    .arrow-down { margin: 8px 0; }
    .conditional-box {
      background: #161b22; border: 2px dashed #30363d; border-radius: 8px;
      padding: 12px 16px; font-size: 12px; color: #8b949e; cursor: pointer;
    }
    .conditional-box:hover { border-color: #58a6ff; }
    .conditional-box.has-annotation { border-color: #f0883e; }
    .branch-container { display: flex; gap: 60px; align-items: flex-start; }
    .branch { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .branch-label { font-size: 11px; color: #8b949e; padding: 4px 8px; background: #21262d; border-radius: 4px; }

    /* Data Flow */
    .data-flow-diagram { display: flex; flex-direction: column; gap: 32px; padding: 20px; }
    .flow-layer { display: flex; align-items: center; gap: 24px; }
    .flow-layer-label { width: 120px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #8b949e; text-align: right; }
    .flow-boxes { display: flex; gap: 16px; flex-wrap: wrap; }
    .flow-box {
      background: #21262d; border: 1px solid #30363d; border-radius: 6px;
      padding: 12px 16px; font-size: 12px; cursor: pointer; position: relative;
    }
    .flow-box:hover { border-color: #58a6ff; }
    .flow-box.selected { border-color: #58a6ff; background: #388bfd26; }
    .flow-box.has-annotation { box-shadow: 0 0 0 2px #f0883e40; }

    /* File Tree */
    .file-tree { font-family: 'SF Mono', Monaco, monospace; font-size: 13px; padding: 20px; }
    .file-entry { padding: 4px 0; cursor: pointer; display: flex; align-items: center; gap: 8px; position: relative; }
    .file-entry:hover { color: #58a6ff; }
    .file-entry.selected { color: #58a6ff; }
    .file-entry.has-annotation::after {
      content: ''; position: absolute; right: 0; width: 8px; height: 8px;
      border-radius: 50%; background: #f0883e;
    }
    .file-indent { color: #484f58; }
    .file-icon { width: 16px; text-align: center; }

    /* Right Panel */
    .details-panel { width: 420px; background: #161b22; border-left: 1px solid #30363d; display: flex; flex-direction: column; }
    .details-header { padding: 16px 20px; border-bottom: 1px solid #30363d; display: flex; align-items: center; justify-content: space-between; }
    .details-title { font-weight: 600; font-size: 16px; }
    .details-badge { font-size: 10px; padding: 3px 8px; border-radius: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-node { background: #238636; color: white; }
    .badge-llm { background: #a371f7; color: white; }
    .badge-tool { background: #f0883e; color: white; }
    .badge-state { background: #3fb950; color: white; }
    .badge-entry { background: #58a6ff; color: white; }
    .details-content { flex: 1; overflow-y: auto; padding: 20px; }
    .detail-section { margin-bottom: 24px; }
    .detail-section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #8b949e; margin-bottom: 12px; letter-spacing: 0.5px; }
    .detail-text { font-size: 13px; line-height: 1.6; color: #c9d1d9; }
    .detail-code { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 12px; font-family: 'SF Mono', Monaco, monospace; font-size: 12px; overflow-x: auto; white-space: pre; }
    .detail-list { list-style: none; }
    .detail-list li { padding: 6px 0; font-size: 13px; display: flex; align-items: flex-start; gap: 8px; }
    .detail-list li::before { content: '\2022'; color: #58a6ff; }
    .detail-file { font-family: 'SF Mono', Monaco, monospace; font-size: 12px; color: #58a6ff; padding: 8px 12px; background: #0d1117; border-radius: 4px; margin-bottom: 8px; display: inline-block; }

    /* Annotations Section */
    .annotations-section { background: #0d1117; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .annotation-item { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 12px; margin-bottom: 8px; }
    .annotation-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .annotation-type { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; text-transform: uppercase; }
    .annotation-type.question { background: #388bfd40; color: #58a6ff; }
    .annotation-type.comment { background: #3fb95040; color: #3fb950; }
    .annotation-type.edit { background: #f0883e40; color: #f0883e; }
    .annotation-delete { background: none; border: none; color: #f85149; cursor: pointer; font-size: 14px; }
    .annotation-text { font-size: 13px; line-height: 1.5; margin-bottom: 8px; }
    .annotation-prompt {
      background: #0d1117; border: 1px solid #30363d; border-radius: 4px;
      padding: 10px; font-family: 'SF Mono', Monaco, monospace; font-size: 11px;
      line-height: 1.4; color: #8b949e; white-space: pre-wrap; margin-top: 8px;
    }
    .annotation-prompt-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 6px;
    }
    .annotation-prompt-label { font-size: 10px; color: #6e7681; text-transform: uppercase; }
    .annotation-copy-btn {
      background: #21262d; border: 1px solid #30363d; border-radius: 4px;
      padding: 3px 8px; font-size: 10px; color: #8b949e; cursor: pointer;
    }
    .annotation-copy-btn:hover { background: #30363d; color: #c9d1d9; }
    .annotation-copy-btn.copied { background: #238636; border-color: #238636; color: white; }
    .add-annotation-btn {
      width: 100%; padding: 10px; background: #21262d; border: 1px dashed #30363d;
      border-radius: 6px; color: #8b949e; font-size: 12px; cursor: pointer; margin-top: 8px;
    }
    .add-annotation-btn:hover { background: #30363d; color: #c9d1d9; border-style: solid; }

    /* Question Panel */
    .question-panel { border-top: 1px solid #30363d; padding: 16px 20px; background: #0d1117; }
    .question-input-container { display: flex; gap: 8px; }
    .question-input { flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 10px 14px; color: #c9d1d9; font-size: 13px; outline: none; }
    .question-input:focus { border-color: #58a6ff; }
    .question-input::placeholder { color: #484f58; }
    .question-btn { background: #238636; border: none; border-radius: 6px; padding: 10px 16px; color: white; font-size: 13px; font-weight: 500; cursor: pointer; }
    .question-btn:hover { background: #2ea043; }

    /* Context Menu */
    .context-menu {
      position: fixed; background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      padding: 8px 0; min-width: 180px; z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      display: none;
    }
    .context-menu.visible { display: block; }
    .context-menu-item {
      padding: 8px 16px; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 10px;
    }
    .context-menu-item:hover { background: #21262d; }
    .context-menu-item .icon { font-size: 14px; }
    .context-menu-divider { height: 1px; background: #30363d; margin: 4px 0; }

    /* Annotation Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); z-index: 1001; display: none;
      align-items: center; justify-content: center;
    }
    .modal-overlay.visible { display: flex; }
    .modal {
      background: #161b22; border: 1px solid #30363d; border-radius: 12px;
      padding: 24px; width: 400px; max-width: 90%;
    }
    .modal-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .modal-field { margin-bottom: 16px; }
    .modal-label { font-size: 12px; color: #8b949e; margin-bottom: 6px; display: block; }
    .modal-select, .modal-textarea {
      width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
      padding: 10px 12px; color: #c9d1d9; font-size: 13px;
    }
    .modal-textarea { min-height: 100px; resize: vertical; font-family: inherit; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .modal-btn {
      padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none;
    }
    .modal-btn.primary { background: #238636; color: white; }
    .modal-btn.secondary { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
    .modal-btn:hover { opacity: 0.9; }

    /* Annotations Summary Panel */
    .annotations-summary {
      background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 20px;
      display: none;
    }
    .annotations-summary.visible { display: block; }
    .annotations-summary-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #8b949e; margin-bottom: 8px; }
    .annotations-stats { display: flex; gap: 16px; }
    .stat-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
    .stat-dot { width: 8px; height: 8px; border-radius: 50%; }
    .stat-dot.question { background: #58a6ff; }
    .stat-dot.comment { background: #3fb950; }
    .stat-dot.edit { background: #f0883e; }
  </style>
</head>
<body>
  <header>
    <h1>PROJECT_NAME - Architecture Explorer</h1>
    <div class="header-actions">
      <button class="header-btn" id="export-btn">Export Annotations</button>
      <button class="header-btn" id="reset-btn">Reset All</button>
      <button class="header-btn" id="clear-btn">Clear Annotations</button>
    </div>
  </header>

  <!-- Annotations Summary -->
  <div class="annotations-summary" id="annotations-summary">
    <div class="annotations-summary-title">Annotations</div>
    <div class="annotations-stats" id="annotations-stats"></div>
  </div>

  <div class="main-container">
    <!-- Left Panel -->
    <div class="component-tree" id="component-tree"></div>

    <!-- Center Panel -->
    <div class="diagram-panel">
      <div class="diagram-header">
        <div class="view-tabs">
          <button class="view-tab active" data-view="workflow">Workflow</button>
          <button class="view-tab" data-view="dataflow">Data Flow</button>
          <button class="view-tab" data-view="files">File Structure</button>
        </div>
        <div style="font-size: 11px; color: #8b949e;">Right-click to annotate</div>
      </div>
      <div class="diagram-canvas" id="diagram-canvas"></div>
    </div>

    <!-- Right Panel -->
    <div class="details-panel">
      <div class="details-header">
        <span class="details-title" id="detail-title">Select a component</span>
        <span class="details-badge badge-node" id="detail-badge" style="display: none;">NODE</span>
      </div>
      <div class="details-content" id="detail-content"></div>
      <div class="question-panel">
        <div class="question-input-container">
          <input type="text" class="question-input" id="question-input" placeholder="Ask about the architecture...">
          <button class="question-btn" id="ask-btn">Ask</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Context Menu -->
  <div class="context-menu" id="context-menu">
    <div class="context-menu-item" data-action="question"><span class="icon">?</span> Add Question</div>
    <div class="context-menu-item" data-action="comment"><span class="icon">C</span> Add Comment</div>
    <div class="context-menu-item" data-action="edit"><span class="icon">E</span> Mark for Edit</div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" data-action="view"><span class="icon">V</span> View Details</div>
  </div>

  <!-- Annotation Modal -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <div class="modal-title" id="modal-title">Add Annotation</div>
      <div class="modal-field">
        <label class="modal-label">Type</label>
        <select class="modal-select" id="annotation-type">
          <option value="question">Question</option>
          <option value="comment">Comment</option>
          <option value="edit">Edit Suggestion</option>
        </select>
      </div>
      <div class="modal-field">
        <label class="modal-label">Your annotation</label>
        <textarea class="modal-textarea" id="annotation-text" placeholder="Enter your question, comment, or edit suggestion..."></textarea>
      </div>
      <div class="modal-actions">
        <button class="modal-btn secondary" id="modal-cancel">Cancel</button>
        <button class="modal-btn primary" id="modal-save">Save</button>
      </div>
    </div>
  </div>

  <script>
    // ============ CUSTOMIZE THIS SECTION ============

    // Project name for prompts
    const PROJECT_NAME = 'your project';

    // Component data - populate from codebase analysis
    const INITIAL_COMPONENT_DATA = {
      'component-id': {
        title: 'Component Name',
        badge: 'entry', // entry, node, llm, tool, state
        badgeLabel: 'ENTRY',
        file: 'src/path/to/file.ts',
        description: 'Description of what this component does.',
        responsibilities: [
          'Responsibility 1',
          'Responsibility 2'
        ],
        code: 'interface Example {\n  prop: string;\n}'
      }
      // ... add more components
    };

    // Tree structure for sidebar navigation
    const INITIAL_TREE_STRUCTURE = [
      {
        header: 'Entry Points',
        items: [
          { id: 'component-id', icon: 'E', iconClass: 'icon-entry' }
        ]
      }
      // ... add more sections
    ];

    // Data flow layers
    const DATA_FLOW_LAYERS = [
      { label: 'Input', items: ['component-id'] },
      // ... add more layers
    ];

    // File tree entries
    const FILE_TREE_ENTRIES = [
      { indent: '', icon: 'D', text: 'src/', component: null },
      { indent: 'L--', icon: 'F', text: 'file.ts', component: 'component-id' }
      // ... add more entries
    ];

    // ============ END CUSTOMIZATION ============

    const STORAGE_KEY = 'architecture-explorer-state';

    // State
    const state = {
      componentData: { ...INITIAL_COMPONENT_DATA },
      treeStructure: JSON.parse(JSON.stringify(INITIAL_TREE_STRUCTURE)),
      selectedComponent: null,
      currentView: 'workflow',
      annotations: {},
      contextTarget: null
    };

    // ============ PERSISTENCE ============
    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          annotations: state.annotations,
          version: 1
        }));
      } catch (e) { console.warn('Failed to save:', e); }
    }

    function loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.version === 1) {
            state.annotations = p.annotations || {};
            return true;
          }
        }
      } catch (e) { console.warn('Failed to load:', e); }
      return false;
    }

    function clearState() {
      if (confirm('Reset explorer to default state? This will clear all your annotations.')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }

    // ============ ANNOTATIONS ============
    function updateAnnotationsSummary() {
      var summary = document.getElementById('annotations-summary');
      var stats = document.getElementById('annotations-stats');
      var counts = { question: 0, comment: 0, edit: 0 };

      Object.values(state.annotations).forEach(function(list) {
        list.forEach(function(a) { counts[a.type]++; });
      });

      var total = counts.question + counts.comment + counts.edit;
      if (total > 0) {
        summary.classList.add('visible');
        stats.textContent = '';
        if (counts.question > 0) {
          var item = document.createElement('div');
          item.className = 'stat-item';
          var dot = document.createElement('span');
          dot.className = 'stat-dot question';
          item.appendChild(dot);
          item.appendChild(document.createTextNode(counts.question + ' questions'));
          stats.appendChild(item);
        }
        if (counts.comment > 0) {
          var item = document.createElement('div');
          item.className = 'stat-item';
          var dot = document.createElement('span');
          dot.className = 'stat-dot comment';
          item.appendChild(dot);
          item.appendChild(document.createTextNode(counts.comment + ' comments'));
          stats.appendChild(item);
        }
        if (counts.edit > 0) {
          var item = document.createElement('div');
          item.className = 'stat-item';
          var dot = document.createElement('span');
          dot.className = 'stat-dot edit';
          item.appendChild(dot);
          item.appendChild(document.createTextNode(counts.edit + ' edits'));
          stats.appendChild(item);
        }
      } else {
        summary.classList.remove('visible');
      }
    }

    // ============ TREE RENDERING ============
    function renderTree() {
      var tree = document.getElementById('component-tree');
      tree.textContent = '';

      state.treeStructure.forEach(function(section) {
        var sectionDiv = document.createElement('div');
        sectionDiv.className = 'tree-section';

        var header = document.createElement('div');
        header.className = 'tree-section-header';
        header.textContent = section.header;
        sectionDiv.appendChild(header);

        section.items.forEach(function(item) {
          var itemDiv = document.createElement('div');
          itemDiv.className = 'tree-item';
          if (state.selectedComponent === item.id) itemDiv.classList.add('active');
          if (state.annotations[item.id] && state.annotations[item.id].length > 0) itemDiv.classList.add('has-annotation');
          itemDiv.dataset.component = item.id;

          var icon = document.createElement('span');
          icon.className = 'icon ' + item.iconClass;
          icon.textContent = item.icon;
          itemDiv.appendChild(icon);

          var data = state.componentData[item.id];
          var label = document.createTextNode(data ? data.title.split(' (')[0] : item.id);
          itemDiv.appendChild(label);

          itemDiv.addEventListener('click', function() { selectComponent(item.id); });
          itemDiv.addEventListener('contextmenu', function(e) { showContextMenu(e, item.id); });

          sectionDiv.appendChild(itemDiv);
        });

        tree.appendChild(sectionDiv);
      });
    }

    // ============ DIAGRAM RENDERING ============
    // Workflow, data flow, and file structure rendering functions
    // These are implemented similar to the brainstorm explorer
    // but use node boxes instead of canvas circles

    function renderWorkflowView() {
      var canvas = document.getElementById('diagram-canvas');
      canvas.textContent = '';
      // Build workflow nodes using createNodeBox()
      // Customize this for your project's specific workflow
      var placeholder = document.createElement('div');
      placeholder.style.cssText = 'color: #8b949e; padding: 40px; text-align: center;';
      placeholder.textContent = 'Customize renderWorkflowView() for your project workflow';
      canvas.appendChild(placeholder);
    }

    function renderDataFlowView() {
      var canvas = document.getElementById('diagram-canvas');
      canvas.textContent = '';

      var diagram = document.createElement('div');
      diagram.className = 'data-flow-diagram';

      DATA_FLOW_LAYERS.forEach(function(layer) {
        var layerDiv = document.createElement('div');
        layerDiv.className = 'flow-layer';

        var label = document.createElement('div');
        label.className = 'flow-layer-label';
        label.textContent = layer.label;
        layerDiv.appendChild(label);

        var boxes = document.createElement('div');
        boxes.className = 'flow-boxes';

        layer.items.forEach(function(id) {
          var data = state.componentData[id] || { title: id };
          var box = document.createElement('div');
          box.className = 'flow-box';
          if (state.selectedComponent === id) box.classList.add('selected');
          if (state.annotations[id] && state.annotations[id].length > 0) box.classList.add('has-annotation');
          box.dataset.component = id;
          box.textContent = data.title.split(' (')[0];
          box.addEventListener('click', function() { selectComponent(id); });
          box.addEventListener('contextmenu', function(e) { showContextMenu(e, id); });
          boxes.appendChild(box);
        });

        layerDiv.appendChild(boxes);
        diagram.appendChild(layerDiv);
      });

      canvas.appendChild(diagram);
    }

    function renderFilesView() {
      var canvas = document.getElementById('diagram-canvas');
      canvas.textContent = '';

      var tree = document.createElement('div');
      tree.className = 'file-tree';

      FILE_TREE_ENTRIES.forEach(function(f) {
        var entry = document.createElement('div');
        entry.className = 'file-entry';
        if (f.component && state.selectedComponent === f.component) entry.classList.add('selected');
        if (f.component && state.annotations[f.component] && state.annotations[f.component].length > 0) entry.classList.add('has-annotation');
        if (f.component) entry.dataset.component = f.component;

        if (f.indent) {
          var indent = document.createElement('span');
          indent.className = 'file-indent';
          indent.textContent = f.indent;
          entry.appendChild(indent);
        }

        var icon = document.createElement('span');
        icon.className = 'file-icon';
        icon.textContent = f.icon === 'D' ? 'D' : 'F';
        entry.appendChild(icon);

        entry.appendChild(document.createTextNode(' ' + f.text));

        if (f.component) {
          entry.addEventListener('click', function() { selectComponent(f.component); });
          entry.addEventListener('contextmenu', function(e) { showContextMenu(e, f.component); });
        }

        tree.appendChild(entry);
      });

      canvas.appendChild(tree);
    }

    function renderCurrentView() {
      if (state.currentView === 'workflow') renderWorkflowView();
      else if (state.currentView === 'dataflow') renderDataFlowView();
      else if (state.currentView === 'files') renderFilesView();
    }

    function createNodeBox(id, phaseClass) {
      var data = state.componentData[id] || { title: id, badgeLabel: '' };
      var box = document.createElement('div');
      box.className = 'node-box ' + phaseClass;
      if (state.selectedComponent === id) box.classList.add('selected');
      if (state.annotations[id] && state.annotations[id].length > 0) {
        box.classList.add('has-annotation');
        var badge = document.createElement('div');
        badge.className = 'annotation-badge';
        badge.textContent = state.annotations[id].length;
        box.appendChild(badge);
      }
      box.dataset.component = id;

      var title = document.createElement('div');
      title.className = 'node-title';
      title.textContent = data.title.split(' (')[0];
      box.appendChild(title);

      var subtitle = document.createElement('div');
      subtitle.className = 'node-subtitle';
      subtitle.textContent = data.badgeLabel || '';
      box.appendChild(subtitle);

      box.addEventListener('click', function() { selectComponent(id); });
      box.addEventListener('contextmenu', function(e) { showContextMenu(e, id); });

      return box;
    }

    // ============ COMPONENT SELECTION ============
    function selectComponent(id) {
      state.selectedComponent = id;
      updateDetails();
      renderCurrentView();
      renderTree();
    }

    function updateDetails() {
      var id = state.selectedComponent;
      var data = state.componentData[id];
      var detailContent = document.getElementById('detail-content');
      var detailTitle = document.getElementById('detail-title');
      var detailBadge = document.getElementById('detail-badge');

      if (!data) {
        detailTitle.textContent = 'Select a component';
        detailBadge.style.display = 'none';
        detailContent.textContent = '';

        var section = document.createElement('div');
        section.className = 'detail-section';
        var title = document.createElement('div');
        title.className = 'detail-section-title';
        title.textContent = 'Getting Started';
        section.appendChild(title);
        var text = document.createElement('p');
        text.className = 'detail-text';
        text.textContent = 'Click on any component in the tree or diagram to see details. Right-click to add annotations.';
        section.appendChild(text);
        detailContent.appendChild(section);
        return;
      }

      detailTitle.textContent = data.title;
      detailBadge.textContent = data.badgeLabel;
      detailBadge.className = 'details-badge badge-' + data.badge;
      detailBadge.style.display = 'inline';

      detailContent.textContent = '';

      // Annotations for this component
      var annotations = state.annotations[id] || [];
      if (annotations.length > 0) {
        var annoSection = document.createElement('div');
        annoSection.className = 'annotations-section';

        var annoTitle = document.createElement('div');
        annoTitle.className = 'detail-section-title';
        annoTitle.textContent = 'Your Annotations (' + annotations.length + ')';
        annoSection.appendChild(annoTitle);

        annotations.forEach(function(a, idx) {
          var item = document.createElement('div');
          item.className = 'annotation-item';

          var header = document.createElement('div');
          header.className = 'annotation-header';

          var type = document.createElement('span');
          type.className = 'annotation-type ' + a.type;
          type.textContent = a.type;
          header.appendChild(type);

          var deleteBtn = document.createElement('button');
          deleteBtn.className = 'annotation-delete';
          deleteBtn.textContent = 'x';
          deleteBtn.addEventListener('click', function() {
            state.annotations[id].splice(idx, 1);
            if (state.annotations[id].length === 0) delete state.annotations[id];
            saveState();
            updateAnnotationsSummary();
            renderCurrentView();
            renderTree();
            updateDetails();
          });
          header.appendChild(deleteBtn);

          item.appendChild(header);

          var text = document.createElement('div');
          text.className = 'annotation-text';
          text.textContent = a.text;
          item.appendChild(text);

          // Show the generated prompt
          if (a.prompt) {
            var promptHeader = document.createElement('div');
            promptHeader.className = 'annotation-prompt-header';

            var promptLabel = document.createElement('span');
            promptLabel.className = 'annotation-prompt-label';
            promptLabel.textContent = 'Prompt for Claude';
            promptHeader.appendChild(promptLabel);

            var copyBtn = document.createElement('button');
            copyBtn.className = 'annotation-copy-btn';
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', function() {
              navigator.clipboard.writeText(a.prompt).then(function() {
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(function() {
                  copyBtn.textContent = 'Copy';
                  copyBtn.classList.remove('copied');
                }, 1500);
              });
            });
            promptHeader.appendChild(copyBtn);

            item.appendChild(promptHeader);

            var promptDiv = document.createElement('div');
            promptDiv.className = 'annotation-prompt';
            promptDiv.textContent = a.prompt;
            item.appendChild(promptDiv);
          }

          annoSection.appendChild(item);
        });

        var addBtn = document.createElement('button');
        addBtn.className = 'add-annotation-btn';
        addBtn.textContent = '+ Add another annotation';
        addBtn.addEventListener('click', function() { openAnnotationModal(id); });
        annoSection.appendChild(addBtn);

        detailContent.appendChild(annoSection);
      }

      // File
      if (data.file) {
        var fileDiv = document.createElement('div');
        fileDiv.className = 'detail-file';
        fileDiv.textContent = data.file;
        detailContent.appendChild(fileDiv);
      }

      // Description
      var descSection = document.createElement('div');
      descSection.className = 'detail-section';
      var descTitle = document.createElement('div');
      descTitle.className = 'detail-section-title';
      descTitle.textContent = 'Description';
      descSection.appendChild(descTitle);
      var descText = document.createElement('p');
      descText.className = 'detail-text';
      descText.textContent = data.description;
      descSection.appendChild(descText);
      detailContent.appendChild(descSection);

      // Responsibilities
      if (data.responsibilities) {
        var respSection = document.createElement('div');
        respSection.className = 'detail-section';
        var respTitle = document.createElement('div');
        respTitle.className = 'detail-section-title';
        respTitle.textContent = 'Responsibilities';
        respSection.appendChild(respTitle);
        var respList = document.createElement('ul');
        respList.className = 'detail-list';
        data.responsibilities.forEach(function(r) {
          var li = document.createElement('li');
          li.textContent = r;
          respList.appendChild(li);
        });
        respSection.appendChild(respList);
        detailContent.appendChild(respSection);
      }

      // Code
      if (data.code) {
        var codeSection = document.createElement('div');
        codeSection.className = 'detail-section';
        var codeTitle = document.createElement('div');
        codeTitle.className = 'detail-section-title';
        codeTitle.textContent = 'Interface / Code';
        codeSection.appendChild(codeTitle);
        var codePre = document.createElement('pre');
        codePre.className = 'detail-code';
        codePre.textContent = data.code;
        codeSection.appendChild(codePre);
        detailContent.appendChild(codeSection);
      }

      // Quick actions
      if (annotations.length === 0) {
        var actSection = document.createElement('div');
        actSection.className = 'detail-section';
        var actTitle = document.createElement('div');
        actTitle.className = 'detail-section-title';
        actTitle.textContent = 'Annotate';
        actSection.appendChild(actTitle);
        var addBtn = document.createElement('button');
        addBtn.className = 'add-annotation-btn';
        addBtn.textContent = '+ Add annotation (or right-click)';
        addBtn.addEventListener('click', function() { openAnnotationModal(id); });
        actSection.appendChild(addBtn);
        detailContent.appendChild(actSection);
      }
    }

    // ============ CONTEXT MENU ============
    function showContextMenu(e, componentId) {
      e.preventDefault();
      state.contextTarget = componentId;
      var menu = document.getElementById('context-menu');
      menu.style.left = e.pageX + 'px';
      menu.style.top = e.pageY + 'px';
      menu.classList.add('visible');
    }

    function hideContextMenu() {
      document.getElementById('context-menu').classList.remove('visible');
    }

    document.addEventListener('click', hideContextMenu);

    document.querySelectorAll('.context-menu-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var action = item.dataset.action;
        if (action === 'view') {
          selectComponent(state.contextTarget);
        } else {
          openAnnotationModal(state.contextTarget, action);
        }
        hideContextMenu();
      });
    });

    // ============ ANNOTATION MODAL ============
    function openAnnotationModal(componentId, type) {
      state.contextTarget = componentId;
      var data = state.componentData[componentId] || { title: componentId };
      document.getElementById('modal-title').textContent = 'Annotate: ' + data.title;
      document.getElementById('annotation-type').value = type || 'question';
      document.getElementById('annotation-text').value = '';
      document.getElementById('modal-overlay').classList.add('visible');
      document.getElementById('annotation-text').focus();
    }

    document.getElementById('modal-cancel').addEventListener('click', function() {
      document.getElementById('modal-overlay').classList.remove('visible');
    });

    document.getElementById('modal-save').addEventListener('click', function() {
      var type = document.getElementById('annotation-type').value;
      var text = document.getElementById('annotation-text').value.trim();
      if (text) {
        var prompt = generatePromptForAnnotation(state.contextTarget, type, text);

        if (!state.annotations[state.contextTarget]) state.annotations[state.contextTarget] = [];
        state.annotations[state.contextTarget].push({ type: type, text: text, prompt: prompt, timestamp: Date.now() });
        saveState();
        updateAnnotationsSummary();
        renderCurrentView();
        renderTree();
        selectComponent(state.contextTarget);
      }
      document.getElementById('modal-overlay').classList.remove('visible');
    });

    function generatePromptForAnnotation(componentId, type, text) {
      var data = state.componentData[componentId] || { title: componentId, file: '' };
      var prompt = 'In the ' + PROJECT_NAME + ' codebase';

      if (type === 'question') {
        prompt = text + '\n\nContext: This question is about the ' + data.title + ' component';
        if (data.file) prompt += ' in ' + data.file;
        prompt += '.';
      } else if (type === 'comment') {
        prompt = 'I have an observation about ' + data.title + ': ' + text;
        prompt += '\n\nCan you provide more context or confirm this understanding?';
        if (data.file) prompt += '\n\nFile: ' + data.file;
      } else if (type === 'edit') {
        prompt = 'I want to make an edit to ' + data.title + ': ' + text;
        prompt += '\n\nCan you help me implement this change?';
        if (data.file) prompt += '\n\nFile: ' + data.file;
      }

      return prompt;
    }

    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('visible');
    });

    // ============ QUESTION INPUT ============
    document.getElementById('ask-btn').addEventListener('click', function() {
      var q = document.getElementById('question-input').value.trim();
      if (q) {
        var comp = state.selectedComponent;
        var prompt = q;

        if (comp && state.componentData[comp]) {
          var data = state.componentData[comp];
          prompt += '\n\nContext: Looking at ' + data.title;
          if (data.file) prompt += ' (' + data.file + ')';
          prompt += ' in the ' + PROJECT_NAME + ' codebase.';
        } else {
          prompt += '\n\nContext: ' + PROJECT_NAME + ' codebase.';
        }

        var targetId = comp || 'general';
        if (!state.annotations[targetId]) state.annotations[targetId] = [];
        state.annotations[targetId].push({ type: 'question', text: q, prompt: prompt, timestamp: Date.now() });
        saveState();
        updateAnnotationsSummary();
        if (comp) {
          selectComponent(comp);
        } else {
          updateDetails();
        }
        document.getElementById('question-input').value = '';
      }
    });

    document.getElementById('question-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') document.getElementById('ask-btn').click();
    });

    // ============ VIEW SWITCHING ============
    document.querySelectorAll('.view-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        state.currentView = tab.dataset.view;
        document.querySelectorAll('.view-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        renderCurrentView();
      });
    });

    // ============ HEADER ACTIONS ============
    document.getElementById('export-btn').addEventListener('click', function() {
      var output = 'Architecture Annotations - ' + PROJECT_NAME + '\n';
      output += '='.repeat(50) + '\n\n';

      Object.keys(state.annotations).forEach(function(key) {
        var data = state.componentData[key] || { title: key };
        output += '## ' + data.title + '\n';
        state.annotations[key].forEach(function(a) {
          output += '- [' + a.type.toUpperCase() + '] ' + a.text + '\n';
        });
        output += '\n';
      });

      navigator.clipboard.writeText(output).then(function() {
        alert('Annotations exported to clipboard!');
      });
    });

    document.getElementById('reset-btn').addEventListener('click', clearState);

    document.getElementById('clear-btn').addEventListener('click', function() {
      if (confirm('Clear all annotations?')) {
        state.annotations = {};
        saveState();
        updateAnnotationsSummary();
        renderCurrentView();
        renderTree();
        updateDetails();
      }
    });

    // ============ INIT ============
    var wasLoaded = loadState();
    renderTree();
    renderCurrentView();
    updateAnnotationsSummary();
    updateDetails();
    if (wasLoaded) console.log('Restored saved state from localStorage');
  </script>
</body>
</html>
```

## Customization Checklist

When generating an architecture explorer for a new project, customize these sections:

1. **`<title>`** - Replace `PROJECT_NAME` with actual project name
2. **`<h1>`** - Same project name in header
3. **`PROJECT_NAME`** - JavaScript constant for prompts
4. **`INITIAL_COMPONENT_DATA`** - Populate from codebase analysis:
   - Each component needs: title, badge, badgeLabel, file, description, responsibilities, code
   - Badge types: `entry`, `node`, `llm`, `tool`, `state`
5. **`INITIAL_TREE_STRUCTURE`** - Sidebar navigation sections
6. **`DATA_FLOW_LAYERS`** - Layers for data flow diagram
7. **`FILE_TREE_ENTRIES`** - File structure view entries
8. **`renderWorkflowView()`** - Build the main workflow diagram using `createNodeBox()`

## Critical Rules

1. **Use real codebase elements** - Don't use generic placeholders; find actual component names, file paths
2. **Include file paths** - Every component should have its source file path
3. **Write helpful descriptions** - 2-3 sentences explaining what each component does
4. **List concrete responsibilities** - Specific things the component handles
5. **Include code snippets** - Key interfaces, types, or function signatures
6. **Open in browser** - Always run `open architecture-explorer.html` after creating

## Component Badge Types

| Badge | Use For |
|-------|---------|
| `entry` | Main entry points, orchestrators, CLI handlers |
| `node` | Workflow/pipeline nodes, processing steps |
| `llm` | LLM-related: models, prompts, schemas |
| `tool` | Tools, utilities, executors |
| `state` | State objects, types, DTOs |

## Example Tree Structure

```javascript
const INITIAL_TREE_STRUCTURE = [
  {
    header: 'Entry Points',
    items: [
      { id: 'main-orchestrator', icon: 'E', iconClass: 'icon-entry' },
      { id: 'cli-handler', icon: 'C', iconClass: 'icon-entry' }
    ]
  },
  {
    header: 'Processing Nodes',
    items: [
      { id: 'parse-input', icon: '1', iconClass: 'icon-node' },
      { id: 'transform', icon: '2', iconClass: 'icon-node' },
      { id: 'output', icon: '3', iconClass: 'icon-node' }
    ]
  },
  {
    header: 'Services',
    items: [
      { id: 'api-client', icon: 'A', iconClass: 'icon-tool' },
      { id: 'cache', icon: 'C', iconClass: 'icon-tool' }
    ]
  }
];
```
