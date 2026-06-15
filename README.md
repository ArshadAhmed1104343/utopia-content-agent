# Utopia Content Agent

Converts a Granola meeting transcript into three publishable outputs — a LinkedIn post, a personalised follow-up email, and a press angle — in a single Claude API call.

---

## What it does

The studio generates a Granola transcript after every meeting. This agent reads that transcript, extracts the strongest signal, and produces:

- **LinkedIn post** — studio voice, mapped to the LAUNCH framework stage
- **Follow-up email** — personalised to the key attendee, references something specific they said
- **Press angle** — one sentence a journalist could pitch to their editor
- **JSON output** — agent-readable, so a second Utopia OS node can pick it up without a human in the middle

---

## How to run it

**Inside Claude.ai (recommended for demo):**
1. Open [claude.ai](https://claude.ai) and start a new conversation
2. Paste the `.jsx` file content into the chat and ask Claude to render it as an artifact
3. Click **Load sample** to use the built-in transcript, or paste your own Granola transcript
4. Click **Run agent**

No API key needed inside Claude.ai — authentication is handled by the platform.

**Outside Claude.ai (Replit / local):**
1. Add your Anthropic API key to the fetch headers: `"x-api-key": "sk-ant-..."`
2. Run with Vite or any React bundler
3. Same flow applies

---

## The prompt

System prompt sent to `claude-sonnet-4-6` on every run:

```
You are Utopia Studio's content agent. Utopia Studio is a venture studio in Doha
that co-builds early-stage companies alongside founders called fellows.

Voice rules: declarative, specific, no hedging. The studio publishes opinions,
not summaries. No filler phrases like "excited to announce" or "delighted to share."
Short sentences. Strong verbs.

The LAUNCH framework maps every piece of content to a stage:
Lead (awareness), Amplify (reach), Unify (community), Nurture (trust),
Convert (action), Harvest (advocacy).

From the transcript, extract the single strongest signal and produce:
1. A LinkedIn post — max 150 words, declarative opening line, 2-3 hashtags, one LAUNCH stage assigned
2. A follow-up email to the key attendee — subject + body, max 100 words, references something specific they said or committed to
3. A press angle — one sentence a Gulf tech journalist could pitch to their editor

Return ONLY valid JSON, no preamble, no markdown fences:
{ "linkedin_post", "follow_up_email": { "subject", "body" },
  "press_angle", "key_attendee", "launch_stage", "signal" }
```

---

## Tools and APIs called

| Tool | Purpose |
|------|---------|
| Anthropic Messages API | Core inference — `claude-sonnet-4-6` |
| React (Claude.ai artifacts runtime) | UI and state management |

---

## Output format (JSON)

```json
{
  "linkedin_post": "string",
  "follow_up_email": {
    "subject": "string",
    "body": "string"
  },
  "press_angle": "string",
  "key_attendee": "Name, Role",
  "launch_stage": "Lead | Amplify | Unify | Nurture | Convert | Harvest",
  "signal": "one-sentence core insight from the transcript"
}
```

This JSON is the handoff format for the next agent in Utopia OS — a Slack poster, an email sender, or a Linear logger can consume it without a human in the middle.

---

Built by Arshad · Utopia Studio Agentic Operator Assignment
