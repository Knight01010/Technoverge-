"use client";

import { useState, type CSSProperties } from "react";
import { SIGNS } from "@/content/site";

const ALERT = "#A4512B";

export default function EmailDemo() {
  const [sign, setSign] = useState(0);
  const [page, setPage] = useState(false);
  const mark = (k: number): CSSProperties => ({
    background: sign === k ? "rgba(164,81,43,.14)" : "transparent",
    boxShadow: `0 0 0 2px rgba(164,81,43,${sign === k ? 0.5 : 0})`,
    borderRadius: 3,
    transition: "background 200ms ease-out, box-shadow 200ms ease-out",
  });

  return (
    <div className="split" style={{ alignItems: "start" }}>
      <div className="col" style={{ gap: 0, borderTop: "1px solid rgba(21,25,26,.14)", position: "sticky", top: 120 }}>
        {SIGNS.map(([title, text], k) => (
          <button key={title} type="button" className="chip" aria-pressed={sign === k} onClick={() => { setSign(k); setPage(false); }}
            style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 12, padding: "18px 12px 18px 0", border: "none", borderBottom: "1px solid rgba(21,25,26,.1)", background: "transparent", opacity: sign === k ? 1 : 0.62 }}>
            <span className="lbl" style={{ color: sign === k ? ALERT : "#8D9594", paddingTop: 3 }}>{k + 1}</span>
            <span className="col" style={{ gap: 4 }}>
              <b style={{ fontWeight: 500, fontSize: 17 }}>{title}</b>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-3)" }}>{text}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "#2B3134", color: "#EEF0EE", fontSize: 14 }}>
          <span style={{ fontWeight: 500 }}>Mail</span>
          <span className="lbl" style={{ color: "#9AA3A5", fontSize: 11 }}>f.alharbi · Finance</span>
        </div>
        {!page ? (
          <div className="col" style={{ gap: 20, padding: 28 }}>
            <div className="col" style={{ gap: 6 }}>
              <span style={{ fontSize: "clamp(20px,1.8vw,26px)", fontWeight: 500, letterSpacing: "-.02em" }}>Shipment on hold: invoice overdue</span>
              <span style={{ fontSize: 15, color: "var(--ink-3)" }}>Gulf Freight Services <span style={mark(0)}>&lt;billing@gulffreight-billing.co&gt;</span></span>
              <span style={{ fontSize: 14, color: "var(--mute)" }}>To: f.alharbi · Monday 06:44</span>
            </div>
            <div style={{ padding: "12px 16px", background: "#FBF0D2", borderLeft: "4px solid #C99A22", color: "#6E5210", fontSize: 15, fontWeight: 500 }}>
              Caution: external sender. This link goes to a domain registered 3 days ago.
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.65, color: "#24292B" }}>
              Dear customer,<br />
              <span style={mark(1)}>Your shipment GF-20931 is on hold because invoice INV-7741 is overdue. Please settle today to avoid demurrage charges at the port.</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button type="button" onClick={() => { setPage(true); setSign(2); }}
                style={{ background: "#2F6FB0", color: "#fff", border: "none", padding: "12px 22px", fontSize: 15, cursor: "pointer", boxShadow: sign === 2 ? "0 0 0 3px rgba(164,81,43,.55)" : "none" }}>
                View invoice
              </button>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: ALERT, opacity: sign === 2 ? 1 : 0, transition: "opacity 200ms ease-out" }}>
                Goes to gulffreight-billing.co/secure/invoice-login
              </span>
            </div>
          </div>
        ) : (
          <div className="col" style={{ gap: 18, padding: "24px 28px 28px", background: "#F4F5F7" }}>
            <div style={{ padding: "10px 14px", background: "#E3E6E8", borderRadius: 18, fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-3)" }}>gulffreight-billing.co/secure/invoice-login</div>
            <div className="col" style={{ border: "1px solid #DADDE0", padding: 28, gap: 14, maxWidth: 380, alignSelf: "center", width: "100%", background: "#fff" }}>
              <span style={{ fontWeight: 600, color: "#1E3A5F", letterSpacing: ".04em", fontSize: 14 }}>GULF FREIGHT SERVICES</span>
              <span style={{ fontSize: 20, fontWeight: 500 }}>Sign in to view your invoice</span>
              <span style={{ padding: 12, border: "1px solid #C9CDD0", fontSize: 15 }}>f.alharbi</span>
              <span style={{ padding: 12, border: "1px solid #2F6FB0", fontSize: 15 }}>••••••••••</span>
              <span style={{ padding: 12, background: "#1E3A5F", color: "#fff", textAlign: "center", fontSize: 15 }}>Sign in</span>
            </div>
            <div style={{ padding: "14px 16px", background: "#F6DED6", color: "#7E3A1A", fontSize: 15, fontWeight: 500, borderLeft: `4px solid ${ALERT}` }}>
              This page exists only to collect your password. It looks real because it was copied from a real one.
            </div>
            <button type="button" className="ghost" onClick={() => setPage(false)} style={{ alignSelf: "flex-start" }}>← Back to the email</button>
          </div>
        )}
      </div>
    </div>
  );
}
