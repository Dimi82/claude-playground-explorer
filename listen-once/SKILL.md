---
name: listen-once
description: Use when user wants single voice input capture without spoken response - invokes voice listening, transcribes speech, responds in text only
---

# Listen Once

## Overview

Capture a single voice input and respond with text only. No spoken response, no conversation loop.

## When to Use

- User wants to speak a command or question once
- Text response is preferred over voice response
- Quick voice-to-text capture needed

## Workflow

```dot
digraph listen_once {
    rankdir=LR;
    "Skill invoked" -> "Call converse tool" -> "Return transcription" -> "Respond in TEXT only";
}
```

## Implementation

Call `mcp__voicemode__converse` with these parameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `message` | "Listening..." | Brief notification |
| `wait_for_response` | `true` | Capture voice input |
| `skip_tts` | `true` | Don't speak the message |
| `listen_duration_max` | `30` | Reasonable timeout |

## Critical Rules

1. **Call converse ONCE** - Do not loop or call again after receiving input
2. **Text response ONLY** - After transcription, respond in chat text, not voice
3. **No follow-up listen** - Single shot, then done

## Example

User invokes `/listen-once`

You call:
```
mcp__voicemode__converse(
  message="Listening...",
  wait_for_response=true,
  skip_tts=true,
  listen_duration_max=30
)
```

Tool returns: `"Voice response: What's the weather like today?"`

You respond in TEXT: "I heard you ask about the weather. [Then answer the question in text]"

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Speaking response aloud | Set `skip_tts=true` and respond in chat text |
| Listening again after response | Single invocation only - stop after first transcription |
| Long message before listening | Keep message brief: "Listening..." |
