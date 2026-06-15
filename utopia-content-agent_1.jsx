import { useState } from "react";

const SAMPLE_TRANSCRIPT = `Meeting: Co-Build Session — SupplyFlowQatar | 14:00 Doha Time
Attendees: Mo (Studio Director), Fatima Al-Rashidi (Fellow, CEO SupplyFlowQatar), Tariq (Tech Lead)

Mo: Alright, let's start with where you are on the market gauge. Fatima, what did you find?

Fatima: I spoke to three freight forwarders in the Industrial Area last week. All three said the same thing — they're tracking shipments in WhatsApp groups. Screenshot-based tracking. The biggest one, Hassan Logistics, moving about 200 containers a month with no idea where 30% of them are at any given time.

Mo: That's a real number. Representative or an outlier?

Fatima: Hassan said that's normal across the sector. He introduced me to two other operators who confirmed it.

Tariq: The tech lift is actually low — we're not building new infrastructure, we're building a visibility layer on top of existing port systems. Integrates with QTerminals' existing data feeds.

Mo: Fatima, I want you in front of QTerminals next week. Not a pitch — a discovery call. Can you get that scheduled?

Fatima: Yes. Tariq connected me to someone there. I'll confirm by tomorrow.

Mo: Good. We're presenting SupplyFlowQatar at the Radical Asia call on Thursday. Tariq, pull together a one-pager on the tech architecture before that.

Tariq: Will do. I'll have it by Wednesday EOD.

Mo: Fatima, your G0 is in six days. You need two more calls on the books. QTerminals plus one more — who else?

Fatima: I've been talking to someone at Qatar Navigation. I'll push for a formal meeting this week.

Mo: Don't ask, just propose a time. Three calls confirmed before G0 or we push the review. That's the gate.

[Meeting ended 14:43]`;

const SYSTEM_PROMPT = `You are Utopia Studio's content agent. Utopia Studio is a venture studio in Doha that co-builds early-stage companies alongside founders called fellows.

Voice rules: declarative, specific, no hedging. The studio publishes opinions, not summaries. No filler phrases like "excited to announce" or "delighted to share." Short sentences. Strong verbs.

The LAUNCH framework maps every piece of content to a stage:
- Lead: awareness, introducing a concept or person for the first time
- Amplify: reach, sharing proof or results to a wider audience
- Unify: community, spotlighting a relationship or network moment
- Nurture: trust, showing process, depth, or behind-the-scenes thinking
- Convert: action, driving a specific next step from the audience
- Harvest: advocacy, celebrating an outcome or milestone

From the transcript, extract the single strongest signal and produce three outputs:

1. LINKEDIN_POST — Studio account post. Max 150 words. First line must be a declarative statement that stands alone. 2-3 relevant hashtags max. Assign one LAUNCH stage.

2. FOLLOW_UP_EMAIL — Personalised email to the key attendee. Reference something specific they said or committed to. Subject line plus body. Max 100 words. Direct but warm — no corporate pleasantries.

3. PRESS_ANGLE — One sentence a Gulf tech journalist could pitch to their editor. Specific, newsworthy, no hype.

Return ONLY valid JSON, no preamble, no markdown code fences:
{
  "linkedin_post": "full post text",
  "follow_up_email": {
    "subject": "subject line",
    "body": "email body"
  },
  "press_angle": "one sentence",
  "key_attendee": "Name, Role",
  "launch_stage": "one of: Lead | Amplify | Unify | Nurture | Convert | Harvest",
  "signal": "one sentence — the core insight extracted from this transcript"
}`;

function CopyButton({ text, label = "Copy" }) {
  const [state, setState] = useState("idle");
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setState("copied");
    setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        fontSize: 11,
        fontFamily: "monospace",
        padding: "3px 8px",
        borderRadius: 4,
        border: "none",
        background: "none",
        cursor: "pointer",
        color: state === "copied" ? "#6ee7b7" : "#3A3A60",
        transition: "color 0.15s",
      }}
      onMouseEnter={e => { if (state !== "copied") e.target.style.color = "#7070B0"; }}
      onMouseLeave={e => { if (state !== "copied") e.target.style.color = "#3A3A60"; }}
    >
      {state === "copied" ? "Copied ✓" : label}
    </button>
  );
}

const LAUNCH_BADGE = {
  Lead:    { background: "#1E0A3C", color: "#C4B5FD", borderColor: "#3B1D7E" },
  Amplify: { background: "#0A1628", color: "#93C5FD", borderColor: "#1E3A5F" },
  Unify:   { background: "#071A20", color: "#67E8F9", borderColor: "#0E4A5A" },
  Nurture: { background: "#071A12", color: "#6EE7B7", borderColor: "#0E4A30" },
  Convert: { background: "#1C1004", color: "#FCD34D", borderColor: "#5A3A0A" },
  Harvest: { background: "#1C0D04", color: "#FDBA74", borderColor: "#5A2A0A" },
};

function Dots() {
  return (
    <>
      <style>{`
        @keyframes udot { 0%,80%,100%{transform:translateY(0);opacity:.3} 40%{transform:translateY(-5px);opacity:1} }
      `}</style>
      <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#818CF8", display: "block",
            animation: "udot 1.1s infinite", animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </span>
    </>
  );
}

export default function UtopiaContentAgent() {
  const [transcript, setTranscript] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showJson, setShowJson] = useState(false);

  const runAgent = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError("");
    setOutput(null);
    setShowJson(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Transcript:\n\n${transcript}` }],
        }),
      });
      const data = await res.json();
      const raw = data.content.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, m => m.replace(/```json|```/g, "")).replace(/```/g,"").trim();
      const parsed = JSON.parse(clean);
      setOutput(parsed);
    } catch {
      setError("Something went wrong parsing the response. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const card = { background: "#0C0C18", border: "1px solid #151525", borderRadius: 10, overflow: "hidden" };
  const cardHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 17px", borderBottom: "1px solid #151525" };
  const cardLabel = { fontSize: 10, fontFamily: "monospace", color: "#3A3A60", textTransform: "uppercase", letterSpacing: "0.12em" };

  return (
    <div style={{ background: "#07070F", minHeight: "100vh", color: "#E0E0F0", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* Topbar */}
      <div style={{ borderBottom: "1px solid #111120", padding: "13px 26px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", display: "block", boxShadow: "0 0 8px #6366f188" }} />
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#45459A", letterSpacing: "0.13em", textTransform: "uppercase" }}>
            Utopia OS · Content Agent
          </span>
        </div>
        <span style={{ fontSize: 10, fontFamily: "monospace", color: "#252540" }}>Marketing & Events · M7 Go-to-Market</span>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 48px)" }}>

        {/* LEFT */}
        <div style={{ borderRight: "1px solid #111120", padding: 26, display: "flex", flexDirection: "column", gap: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#2A2A50", textTransform: "uppercase", letterSpacing: "0.12em" }}>Granola Transcript</span>
            <button
              onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
              style={{ fontSize: 11, fontFamily: "monospace", color: "#4F46E5", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onMouseEnter={e => e.target.style.color = "#818CF8"}
              onMouseLeave={e => e.target.style.color = "#4F46E5"}
            >
              Load sample →
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Paste meeting transcript here…"
            style={{
              flex: 1, background: "#0A0A15", border: "1px solid #151525", borderRadius: 9,
              padding: "13px 15px", fontSize: 12, fontFamily: "monospace", color: "#A0A0C8",
              resize: "none", outline: "none", lineHeight: 1.75, transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "#2D2D80"}
            onBlur={e => e.target.style.borderColor = "#151525"}
          />

          <div style={{ display: "flex", gap: 9 }}>
            <button
              onClick={() => { setTranscript(""); setOutput(null); setError(""); }}
              style={{
                padding: "10px 17px", fontSize: 12, fontFamily: "monospace", color: "#2A2A50",
                background: "none", border: "1px solid #151525", borderRadius: 7, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color="#5A5A80"; e.currentTarget.style.borderColor="#252540"; }}
              onMouseLeave={e => { e.currentTarget.style.color="#2A2A50"; e.currentTarget.style.borderColor="#151525"; }}
            >
              Clear
            </button>
            <button
              onClick={runAgent}
              disabled={loading || !transcript.trim()}
              style={{
                flex: 1, padding: "10px 17px", fontSize: 13, fontWeight: 600,
                background: (loading || !transcript.trim()) ? "#0F0F20" : "#4F46E5",
                color: (loading || !transcript.trim()) ? "#2A2A50" : "#fff",
                border: "none", borderRadius: 7,
                cursor: (loading || !transcript.trim()) ? "not-allowed" : "pointer",
                transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
              onMouseEnter={e => { if (!loading && transcript.trim()) e.currentTarget.style.background="#4338CA"; }}
              onMouseLeave={e => { if (!loading && transcript.trim()) e.currentTarget.style.background="#4F46E5"; }}
            >
              {loading ? <><Dots /><span>Processing</span></> : "Run agent →"}
            </button>
          </div>

          {error && <p style={{ fontSize: 11, fontFamily: "monospace", color: "#f87171", margin: 0 }}>{error}</p>}

          <div style={{ borderTop: "1px solid #0E0E1C", paddingTop: 13, display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              ["Input",  "Granola meeting transcript (any length)"],
              ["Output", "LinkedIn post · Follow-up email · Press angle"],
              ["Format", "Rendered + JSON (agent-readable)"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, fontSize: 11, fontFamily: "monospace" }}>
                <span style={{ color: "#2A2A50", width: 50, flexShrink: 0 }}>{k}</span>
                <span style={{ color: "#444470" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ padding: 26, overflowY: "auto", display: "flex", flexDirection: "column", gap: 13 }}>

          {!output && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ fontSize: 30, opacity: 0.08 }}>◈</div>
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#1E1E38", textAlign: "center", lineHeight: 1.8 }}>
                Paste a transcript and run the agent.<br />Three outputs. One run.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Dots />
              <p style={{ fontSize: 12, fontFamily: "monospace", color: "#2A2A50" }}>Extracting signal…</p>
            </div>
          )}

          {output && (
            <>
              {/* Signal */}
              <div style={{ background: "#0A0A15", border: "1px solid #151525", borderRadius: 9, padding: "11px 16px" }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#2A2A50", textTransform: "uppercase", letterSpacing: "0.1em" }}>Signal → </span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#5A5A90" }}>{output.signal}</span>
              </div>

              {/* LinkedIn */}
              <div style={card}>
                <div style={cardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={cardLabel}>LinkedIn Post</span>
                    {output.launch_stage && LAUNCH_BADGE[output.launch_stage] && (
                      <span style={{
                        fontSize: 9, fontFamily: "monospace", padding: "2px 7px", borderRadius: 4,
                        border: "1px solid",
                        ...LAUNCH_BADGE[output.launch_stage],
                      }}>
                        LAUNCH · {output.launch_stage}
                      </span>
                    )}
                  </div>
                  <CopyButton text={output.linkedin_post} />
                </div>
                <div style={{ padding: "15px 17px" }}>
                  <p style={{ fontSize: 13, color: "#C0C0E0", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{output.linkedin_post}</p>
                </div>
              </div>

              {/* Email */}
              <div style={card}>
                <div style={cardHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={cardLabel}>Follow-up Email</span>
                    {output.key_attendee && (
                      <span style={{ fontSize: 9, fontFamily: "monospace", padding: "2px 7px", borderRadius: 4, background: "#071A12", color: "#6EE7B7", border: "1px solid #0E4A30" }}>
                        → {output.key_attendee}
                      </span>
                    )}
                  </div>
                  <CopyButton text={`Subject: ${output.follow_up_email?.subject}\n\n${output.follow_up_email?.body}`} />
                </div>
                <div style={{ padding: "15px 17px" }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "#2A2A50", marginBottom: 10 }}>
                    Subject: <span style={{ color: "#606090" }}>{output.follow_up_email?.subject}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#C0C0E0", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{output.follow_up_email?.body}</p>
                </div>
              </div>

              {/* Press */}
              <div style={card}>
                <div style={cardHeader}>
                  <span style={cardLabel}>Press Angle</span>
                  <CopyButton text={output.press_angle} />
                </div>
                <div style={{ padding: "15px 17px" }}>
                  <p style={{ fontSize: 14, color: "#E8CC80", lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>"{output.press_angle}"</p>
                </div>
              </div>

              {/* JSON */}
              <div style={card}>
                <button
                  onClick={() => setShowJson(v => !v)}
                  style={{
                    width: "100%", padding: "11px 17px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "none", border: "none", cursor: "pointer", transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#2A2A50", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Agent-readable output (JSON)
                  </span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <CopyButton text={JSON.stringify(output, null, 2)} label="Copy JSON" />
                    <span style={{ fontSize: 10, color: "#2A2A50", fontFamily: "monospace" }}>{showJson ? "▲" : "▼"}</span>
                  </div>
                </button>
                {showJson && (
                  <div style={{ borderTop: "1px solid #151525", padding: "15px 17px" }}>
                    <pre style={{ fontSize: 11, fontFamily: "monospace", color: "#4A4A80", overflowX: "auto", margin: 0, lineHeight: 1.65 }}>
                      {JSON.stringify(output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
