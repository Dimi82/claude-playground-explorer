#!/usr/bin/env node
/**
 * Playground Sync Server
 *
 * Combined HTTP + MCP server for interactive playground communication.
 *
 * HTTP (port 4242 for browser):
 *   POST /prompt - Submit a prompt, blocks until Claude responds
 *   GET /status - Check server status
 *
 * MCP (stdio for Claude Code):
 *   playground_watch - Blocks until a prompt arrives from the browser
 *   playground_respond - Send response back to the browser
 */

import http from 'http';
import { randomUUID } from 'crypto';
import { createInterface } from 'readline';

const PORT = parseInt(process.env.PORT || '4242', 10);

// In-memory store
let pendingPrompt = null;
let responseResolvers = new Map();  // requestId -> resolver for browser waiting for response
let watchResolvers = [];            // resolvers for Claude waiting for prompts

// ============================================================================
// HTTP Server (for Browser)
// ============================================================================

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

async function handleHttpRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /prompt - Browser submits a prompt, waits for Claude's response
  if (req.method === 'POST' && path === '/prompt') {
    try {
      const body = await parseBody(req);
      const { action, nodeId, graphType, context, prompt } = body;

      const requestId = randomUUID();
      pendingPrompt = {
        id: requestId,
        action,
        nodeId,
        graphType,
        context: context || {},
        prompt: prompt || context?.prompt || '',
        timestamp: Date.now()
      };

      console.error(`[sync] Prompt received: ${action} on ${nodeId}`);

      // Wake up Claude's playground_watch
      if (watchResolvers.length > 0) {
        const resolver = watchResolvers.shift();
        resolver(pendingPrompt);
      }

      // Block until Claude responds
      const response = await new Promise((resolve) => {
        responseResolvers.set(requestId, resolve);
      });

      pendingPrompt = null;
      sendJson(res, 200, { content: response.content });

    } catch (e) {
      sendJson(res, 400, { error: e.message });
    }
    return;
  }

  // GET /status
  if (req.method === 'GET' && path === '/status') {
    sendJson(res, 200, { connected: true, hasPendingPrompt: !!pendingPrompt });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

const httpServer = http.createServer(handleHttpRequest);

// ============================================================================
// MCP Protocol (stdio for Claude Code)
// ============================================================================

const MCP_TOOLS = [
  {
    name: 'playground_watch',
    description: 'BLOCKING: Waits for a user to interact with the playground. Call this in a loop to handle requests interactively. Returns when user clicks an AI action in the browser.',
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'playground_respond',
    description: 'Send response back to the playground after processing a prompt.',
    inputSchema: {
      type: 'object',
      properties: {
        requestId: { type: 'string', description: 'Request ID from playground_watch' },
        content: { type: 'string', description: 'Your response (markdown supported)' }
      },
      required: ['requestId', 'content']
    }
  }
];

async function handleMcpToolCall(name, args) {
  if (name === 'playground_watch') {
    // Return immediately if prompt already waiting
    if (pendingPrompt) {
      const p = pendingPrompt;
      console.error(`[sync] Returning pending prompt: ${p.action} on ${p.nodeId} (${p.id})`);
      return { requestId: p.id, action: p.action, nodeId: p.nodeId, graphType: p.graphType, prompt: p.prompt, context: p.context };
    }

    // Block until prompt arrives
    console.error(`[sync] Claude watching for interactions...`);
    const prompt = await new Promise(resolve => watchResolvers.push(resolve));
    return { requestId: prompt.id, action: prompt.action, nodeId: prompt.nodeId, graphType: prompt.graphType, prompt: prompt.prompt, context: prompt.context };
  }

  if (name === 'playground_respond') {
    const { requestId, content } = args;
    console.error(`[sync] Responding to ${requestId}`);

    // Try to find the resolver
    const resolver = responseResolvers.get(requestId);
    if (resolver) {
      resolver({ content });
      responseResolvers.delete(requestId);
      pendingPrompt = null; // Clear the pending prompt
      console.error(`[sync] Response sent successfully for ${requestId}`);
      return { success: true };
    }

    // If no resolver found, check if this matches the pending prompt and respond anyway
    if (pendingPrompt && pendingPrompt.id === requestId) {
      console.error(`[sync] Warning: No resolver found but prompt ID matches, clearing prompt`);
      pendingPrompt = null;
      return { success: true, warning: 'Browser may have timed out' };
    }

    console.error(`[sync] Error: Request ${requestId} not found. Pending: ${pendingPrompt?.id || 'none'}`);
    return { error: 'Request not found', pendingId: pendingPrompt?.id };
  }

  return { error: `Unknown tool: ${name}` };
}

function sendMcpResponse(id, result, isError = false) {
  const response = { jsonrpc: '2.0', id };
  if (isError) response.error = { code: -32603, message: result };
  else response.result = result;
  process.stdout.write(JSON.stringify(response) + '\n');
}

async function handleMcpMessage(message) {
  const { id, method, params } = message;

  switch (method) {
    case 'initialize':
      sendMcpResponse(id, {
        protocolVersion: '2024-11-05',
        serverInfo: { name: 'playground-sync', version: '1.0.0' },
        capabilities: { tools: {} }
      });
      break;
    case 'notifications/initialized':
      break;
    case 'tools/list':
      sendMcpResponse(id, { tools: MCP_TOOLS });
      break;
    case 'tools/call': {
      const { name, arguments: args } = params;
      const result = await handleMcpToolCall(name, args || {});
      sendMcpResponse(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
      break;
    }
    default:
      if (id !== undefined) sendMcpResponse(id, `Unknown method: ${method}`, true);
  }
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on('line', line => { try { handleMcpMessage(JSON.parse(line)); } catch (e) {} });

// ============================================================================
// Start
// ============================================================================

httpServer.listen(PORT, () => {
  console.error(`[playground-sync] Running on port ${PORT}`);
});
