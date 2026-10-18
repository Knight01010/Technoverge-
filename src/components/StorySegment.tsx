import type { ReactNode } from "react";

type Props = {
  /** Shot index the 3D engine plays while this segment is on screen. */
  shot: number;
  /** Scroll length in viewport heights. */
  length: number;
  id?: string;
  /** "What you see" caption, shown before the x-ray. `act` says where we are in the story. */
  caption?: { act: string; label: string; title: string; body: string; tone: "alert" | "ok" };
  /** "What we see" statement, revealed with the x-ray. `control` names what stopped the attack. */
  statement?: { control: string; big: string; body: string };
  scrim?: boolean;
  children?: ReactNode;
};

export default function StorySegment({ shot, length, id, caption, statement, scrim = true, children }: Props) {
  return (
    <section id={id} data-seg={shot} className="seg" style={{ height: `calc(var(--sh) * ${length})` }}>
      <div className="seg-stage">
        {scrim && <div data-scrim={shot} className="scrim" />}
        {statement && (
          <div data-stm={shot} className="stm">
            <span className="kicker" style={{ ["--tone" as string]: "var(--signal)" }}><b>What we see</b><span>{statement.control}</span></span>
            <p className="big">{statement.big}</p>
            <p>{statement.body}</p>
          </div>
        )}
        {caption && (
          <div data-cap={shot} className="cap">
            <span className="kicker" style={{ ["--tone" as string]: caption.tone === "alert" ? "var(--alert)" : "var(--accent)" }}><b>{caption.act}</b><span>{caption.label}</span></span>
            <h2>{caption.title}</h2>
            <p>{caption.body}</p>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
