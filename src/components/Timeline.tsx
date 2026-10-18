"use client";

import { useState } from "react";
import { STEPS2 } from "@/content/site";

const ALERT = "#A4512B";

export default function Timeline() {
  const [step, setStep] = useState(3);
  const s = STEPS2[step];
  return (
    <div className="card col tlwrap" style={{ padding: 28, gap: 26, boxShadow: "none" }}>
      <div className="tl" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 7, height: 1, background: "rgba(21,25,26,.16)" }} />
        {STEPS2.map((st, k) => (
          <button key={st[0]} type="button" className="chip" aria-pressed={step === k} onClick={() => setStep(k)}
            style={{ background: "transparent", border: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
            <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1px solid ${k <= 2 ? ALERT : "#2F5B40"}`, background: k <= step ? (k <= 2 ? ALERT : "#2F5B40") : "#fff", transition: "background 200ms ease-out" }} />
            <span className="lbl" style={{ fontSize: 11 }}>{st[0]}</span>
            <span style={{ fontSize: 16, fontWeight: step === k ? 500 : 400, color: step === k ? "var(--ink)" : "var(--ink-3)" }}>{st[1]}</span>
          </button>
        ))}
      </div>
      <div aria-live="polite" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px 32px", paddingTop: 22, borderTop: "1px solid rgba(21,25,26,.08)" }}>
        <div className="col" style={{ gap: 6 }}><span className="lbl" style={{ fontSize: 11 }}>What happened</span><span style={{ fontSize: 17, lineHeight: 1.5 }}>{s[2]}</span></div>
        <div className="col" style={{ gap: 6 }}><span className="lbl" style={{ fontSize: 11 }}>Who saw it</span><span style={{ fontSize: 17, lineHeight: 1.5 }}>{s[3]}</span></div>
        <div className="col" style={{ gap: 6 }}><span className="lbl" style={{ fontSize: 11 }}>What we set up for it</span><span style={{ fontSize: 17, lineHeight: 1.5, color: "var(--accent)" }}>{s[4]}</span></div>
      </div>
    </div>
  );
}
