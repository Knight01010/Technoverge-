"use client";

import { useState } from "react";

const ATTEMPT: [string, string][] = [["Time", "Tue 03:12"], ["User", "f.alharbi"], ["From", "203.0.113.41 · outside GCC"], ["Device", "Never seen before"]];

export default function MfaDemo() {
  const [mfa, setMfa] = useState(true);
  const result = mfa
    ? { title: "Blocked. Nobody approved it.", text: "The sign-in asked the real user’s phone for approval. Nobody tapped yes, so the session never opened, and the block was logged for the security team.", bg: "#E8F1EB", fg: "#24533A", edge: "#2F5B40" }
    : { title: "Signed in. The attacker is on your network.", text: "Without a second factor the password was enough. The attacker now has the same access as Finance, from the other side of the world.", bg: "#F8E6DF", fg: "#7E3A1A", edge: "#A4512B" };

  return (
    <div className="card col" style={{ padding: 24, gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, color: "var(--ink-3)" }}>Multi-factor sign-in</span>
        <div role="group" aria-label="Multi-factor sign-in" style={{ display: "flex", gap: 4, padding: 4, background: "rgba(21,25,26,.05)", borderRadius: 6 }}>
          {([["Off", false], ["On", true]] as const).map(([label, v]) => (
            <button key={label} type="button" className="chip" aria-pressed={mfa === v} onClick={() => setMfa(v)}
              style={{ border: "none", padding: "8px 18px", minHeight: 38, background: mfa === v ? "#fff" : "transparent", color: mfa === v ? "var(--ink)" : "var(--ink-3)", boxShadow: mfa === v ? "0 6px 14px -10px rgba(21,25,26,.5)" : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px 24px", padding: "18px 0", borderTop: "1px solid rgba(21,25,26,.08)", borderBottom: "1px solid rgba(21,25,26,.08)" }}>
        {ATTEMPT.map(([k, v]) => (
          <div key={k} className="col" style={{ gap: 4 }}><span className="lbl" style={{ fontSize: 11 }}>{k}</span><span style={{ fontSize: 16 }}>{v}</span></div>
        ))}
      </div>
      <div className="col" aria-live="polite" style={{ gap: 6, padding: "18px 20px", borderLeft: `4px solid ${result.edge}`, background: result.bg, color: result.fg, transition: "background 200ms ease-out" }}>
        <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-.01em" }}>{result.title}</span>
        <span style={{ fontSize: 15, lineHeight: 1.55 }}>{result.text}</span>
      </div>
    </div>
  );
}
