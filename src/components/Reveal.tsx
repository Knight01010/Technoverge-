"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { animate, splitText, stagger, utils } from "animejs";

type Props = { as?: "h1" | "h2" | "h3" | "p"; className?: string; style?: CSSProperties; children: string };

/**
 * A headline whose words rise out of a mask when it scrolls into view.
 * Layout is final from the first frame: only transforms animate.
 */
export default function Reveal({ as = "h2", className, style, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = splitText(el, { words: { wrap: "clip" } });
    const words = split.words as HTMLElement[];
    utils.set(words, { y: "110%" });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        animate(words, { y: "0%", duration: 1000, delay: stagger(55), ease: "outExpo" });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      split.revert();
    };
  }, [children]);

  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}
