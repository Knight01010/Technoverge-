import Stage from "@/components/Stage";
import StorySegment from "@/components/StorySegment";
import Reveal from "@/components/Reveal";
import EmailDemo from "@/components/EmailDemo";
import MfaDemo from "@/components/MfaDemo";
import ZonesDemo from "@/components/ZonesDemo";
import Timeline from "@/components/Timeline";
import { IndustriesAndCases, Lifecycle } from "@/components/WorkSections";

const MAIL = "hello@mstechnoverge.com";

function Services({ items }: { items: [string, string][] }) {
  return (
    <div className="svc">
      {items.map(([b, s]) => (
        <div key={b}><b>{b}</b><span>{s}</span></div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Stage />

      <header style={{ position: "fixed", left: 0, right: 0, top: 16, zIndex: 30, display: "flex", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}>
        <nav aria-label="Primary" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 28, height: 54, padding: "7px 7px 7px 22px", borderRadius: 6, background: "rgba(247,247,244,.84)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(21,25,26,.08)" }}>
          <a href="#top" style={{ fontWeight: 500, fontSize: 16, letterSpacing: "-.02em", textDecoration: "none", whiteSpace: "nowrap" }}>MS Technoverge</a>
          <div className="navl" style={{ alignItems: "center", gap: 24, fontSize: 14, whiteSpace: "nowrap" }}>
            <a href="#email" style={{ textDecoration: "none", color: "var(--ink-3)" }}>Services</a>
            <a href="#industries" style={{ textDecoration: "none", color: "var(--ink-3)" }}>Industries</a>
            <a href="#cases" style={{ textDecoration: "none", color: "var(--ink-3)" }}>Case studies</a>
            <a href="#lifecycle" style={{ textDecoration: "none", color: "var(--ink-3)" }}>How we work</a>
          </div>
          <a className="btn" href="#contact" style={{ padding: "10px 16px", fontSize: 14 }}>
            <span className="btn-long">Book a security assessment</span><span className="btn-short">Book a call</span>
          </a>
        </nav>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        <StorySegment shot={0} length={2} id="top" scrim={false}>
          <div data-hero style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", background: "linear-gradient(90deg, rgba(238,240,237,.94) 0%, rgba(238,240,237,.74) 36%, rgba(238,240,237,0) 64%)" }}>
            <div className="wrap col" style={{ width: "100%", paddingBottom: 72, gap: 26 }}>
              <span className="kicker" style={{ ["--tone" as string]: "var(--accent)" }}><b>MS Technoverge</b><span>Cybersecurity for critical industries · GCC</span></span>
              <h1 data-hero-h className="disp" style={{ fontSize: "clamp(34px, calc(4px + 6.2vw), 112px)", maxWidth: "13ch", fontWeight: 600 }}>Security for industries that can’t stop.</h1>
              <p className="lead" style={{ maxWidth: "46ch" }}>We help oil and gas, banking, healthcare and manufacturing teams stop attacks, from the inbox to the plant floor. Scroll to follow one attack and see where it gets stopped.</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <a className="btn" href="#contact">Book a security assessment <span aria-hidden="true">→</span></a>
                <span className="lbl" style={{ marginLeft: 12 }}>A typical attack · names are fictional</span>
                <span className="lbl hint" style={{ marginLeft: "auto", color: "var(--ink-3)" }}>Move your cursor over the room to see what we see</span>
              </div>
            </div>
          </div>
        </StorySegment>

        <StorySegment shot={1} length={3.2}
          caption={{ tone: "alert", act: "The attack · 1 of 3", label: "Monday 06:44 · Finance office", title: "It starts with one email.", body: "A convincing invoice from a freight company lands in Finance. One click, and a fake sign-in page asks for a password." }}
          statement={{ control: "Email security", big: "ONE CLICK.\nPASSWORD GONE.", body: "What we see: the link leaves the building for a look-alike site, and the password goes with it." }} />

        <section id="email" className="d2">
          <div className="wrap sec col" style={{ gap: 56 }}>
            <div className="split" style={{ alignItems: "end" }}>
              <div className="col" style={{ gap: 22 }}><span className="lbl">Email security and awareness</span><Reveal className="disp h2">Most breaches begin in an inbox.</Reveal></div>
              <p className="lead">Attackers rarely break in. They log in with a password someone was tricked into typing. Find what gave this email away.</p>
            </div>
            <EmailDemo />
            <div className="col" style={{ gap: 18 }}>
              <span className="lbl">What we put in place</span>
              <Services items={[["Email security", "Filtering that checks senders, links and attachments before they reach anyone."], ["Awareness and phishing drills", "Short training and realistic simulations, so people pause before they click."], ["Domain protection", "SPF, DKIM and DMARC so nobody can send email that looks like yours."]]} />
            </div>
          </div>
        </section>

        <StorySegment shot={2} length={2.6}
          caption={{ tone: "alert", act: "The attack · 2 of 3", label: "Tuesday 03:12 · Network room", title: "Someone tries the stolen password.", body: "On the company VPN, from a new device in another country, in the middle of the night." }}
          statement={{ control: "Multi-factor sign-in", big: "WRONG PERSON.\nRIGHT PASSWORD.", body: "What we see: the sign-in stops at the gateway. No approval from the real user’s phone, no way in." }} />

        <section id="identity" className="d2">
          <div className="wrap sec split" style={{ alignItems: "start" }}>
            <div className="col" style={{ gap: 22 }}>
              <span className="lbl">Identity and access</span>
              <Reveal className="disp h2">A stolen password should open nothing.</Reveal>
              <p className="lead">With multi-factor sign-in, the password alone gets nobody in. Switch it off and see what the same attempt would have done.</p>
            </div>
            <div className="col" style={{ gap: 28 }}>
              <MfaDemo />
              <Services items={[["Multi-factor and conditional access", "Sign-in rules that look at device, location and risk, not just the password."], ["Privileged access", "Admin rights granted only when needed, recorded and taken back after."], ["Secure remote access", "VPN hardening and a Zero Trust roadmap for staff and vendors."]]} />
            </div>
          </div>
        </section>

        <StorySegment shot={3} length={2.8}
          caption={{ tone: "alert", act: "The attack · 3 of 3", label: "Tuesday 09:02 · Plant control room", title: "Then it reaches for the plant.", body: "Malware left on the laptop starts searching for the control systems that run the units. The firewall at the boundary records every attempt." }}
          statement={{ control: "IT/OT segmentation", big: "41 ATTEMPTS.\nNONE GET IN.", body: "What we see: every connection from the office hits the plant boundary and stops there." }} />

        <section id="ot" className="d2">
          <div className="wrap sec col" style={{ gap: 48 }}>
            <div className="split" style={{ alignItems: "end" }}>
              <div className="col" style={{ gap: 22 }}><span className="lbl">Segmentation and OT security</span><Reveal className="disp h2">The office should never reach the plant.</Reveal></div>
              <p className="lead">Networks are split into zones, and only approved traffic crosses between them. Pick a connection to see what the boundary does with it.</p>
            </div>
            <ZonesDemo />
            <Services items={[["Zones and conduits", "IT/OT segmentation designed to IEC 62443, rolled out around production."], ["OT asset discovery", "A live inventory of every controller and screen, and what each one talks to."], ["Firewall policy review", "Old rules removed, every remaining rule with an owner and a reason."], ["Secure vendor access", "Remote support through one recorded, approved path."]]} />
          </div>
        </section>

        <StorySegment shot={4} length={3}
          caption={{ tone: "ok", act: "The response", label: "Tuesday 09:08 · Security operations", title: "Three small signals become one case.", body: "The refinery’s own security team sees the click, the blocked sign-in and the denied scans side by side, and opens a case." }}
          statement={{ control: "Detection", big: "THREE SIGNALS.\nONE CASE.", body: "What the team sees: the click, the sign-in and the scans join into one story, in minutes." }} />

        <section id="detect" className="d2">
          <div className="wrap sec col" style={{ gap: 48 }}>
            <div className="split" style={{ alignItems: "end" }}>
              <div className="col" style={{ gap: 22 }}><span className="lbl">Detection and response</span><Reveal className="disp h2">Seen in minutes, not months.</Reveal></div>
              <p className="lead">We don’t run your SOC. We make the team you have see more and act faster: the right logs connected, alerts that mean something, and a plan for the first hour.</p>
            </div>
            <Timeline />
            <Services items={[["SIEM integration and tuning", "Email, identity, endpoint and OT firewall logs in one place, with the noise taken out."], ["Detection use cases", "Rules for the attacks your industry actually sees, tested before they go live."], ["Response playbooks and drills", "Who does what in the first hour, rehearsed in tabletop exercises."], ["Emergency response support", "Hands-on help to contain, clean up and recover when it matters."]]} />
          </div>
        </section>

        <StorySegment shot={5} length={2}
          caption={{ tone: "ok", act: "The response", label: "Tuesday 11:30 · Finance office", title: "Contained before lunch.", body: "Laptop isolated, password reset, sessions revoked, device rebuilt from a clean image. Finance is back at work." }} />

        <StorySegment shot={6} length={2.2}
          caption={{ tone: "ok", act: "The outcome", label: "Tuesday 18:00 · Refinery", title: "The plant never stopped.", body: "Production ran normally all day. The attempt became a short report, three fixes and the evidence the board and regulators ask for." }}
          statement={{ control: "Healthy network", big: "PRODUCTION:\nNORMAL.", body: "What we see: every flow where it should be, and nothing that shouldn’t." }} />

        <IndustriesAndCases />
        <Lifecycle />

        <StorySegment shot={7} length={1.6} id="contact" scrim={false}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", background: "linear-gradient(90deg, rgba(244,244,241,.94) 0%, rgba(244,244,241,.78) 40%, rgba(244,244,241,0) 70%)" }}>
            <div data-contact className="wrap col" style={{ width: "100%", paddingBottom: 96, gap: 26 }}>
              <span className="kicker" style={{ ["--tone" as string]: "var(--accent)" }}><b>Start with an assessment</b></span>
              <Reveal className="disp" style={{ fontSize: "clamp(34px, 5.6vw, 96px)", maxWidth: "14ch", fontWeight: 600 }}>Find the gaps before someone else does.</Reveal>
              <p className="lead" style={{ maxWidth: "46ch" }}>We review your email, identity, network zones and detection, and give you a short, prioritised plan that respects your operations.</p>
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                <a className="btn" href={`mailto:${MAIL}?subject=Security%20assessment%20request`}>Book a security assessment <span aria-hidden="true">→</span></a>
                <a href={`mailto:${MAIL}`} style={{ fontSize: 16, textUnderlineOffset: 6 }}>{MAIL}</a>
              </div>
            </div>
          </div>
        </StorySegment>
      </main>

      <footer style={{ position: "relative", zIndex: 2, background: "var(--paper)", borderTop: "1px solid rgba(21,25,26,.1)" }}>
        <div className="wrap" style={{ paddingTop: 28, paddingBottom: 44, display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", fontSize: 14, color: "var(--ink-3)" }}>
          <span style={{ fontWeight: 500, color: "var(--ink)" }}>MS Technoverge</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}><a href="#email">Services</a><a href="#industries">Industries</a><a href="#cases">Case studies</a><a href="#lifecycle">How we work</a></span>
          <span>© 2026 MS Technoverge</span>
        </div>
      </footer>
    </>
  );
}
