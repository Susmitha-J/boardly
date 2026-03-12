"use client";

import { useEffect, useRef, useState } from "react";

const phrases = [
  "Pin tasks. Drop stickers. Pretend you’re organized.",
  "Drag notes around like it’s productive.",
  "Your chaos, but aesthetic.",
];

function smoothScrollTo(targetEl: HTMLElement, duration = 1100) {
  const start = window.scrollY;
  const end = targetEl.getBoundingClientRect().top + window.scrollY;
  const dist = end - start;
  const t0 = performance.now();
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function step(now: number) {
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, start + dist * ease(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function Landing({ scrollTargetId = "canvas" }: { scrollTargetId?: string }) {
  const [text, setText] = useState("");
  const pi = useRef(0);
  const ci = useRef(0);
  const deleting = useRef(false);
  const cycles = useRef(0);

  useEffect(() => {
    const lockScroll = (lock: boolean) => {
      document.documentElement.style.overflowY = lock ? "hidden" : "";
      document.body.style.overflowY = lock ? "hidden" : "";
    };

    lockScroll(true);

    const loop = () => {
      const phrase = phrases[pi.current];

      if (!deleting.current) {
        ci.current += 1;
        setText(phrase.slice(0, ci.current));
        if (ci.current >= phrase.length) {
          deleting.current = true;
          setTimeout(loop, 800);
          return;
        }
      } else {
        ci.current -= 1;
        setText(phrase.slice(0, ci.current));
        if (ci.current <= 0) {
          deleting.current = false;
          pi.current = (pi.current + 1) % phrases.length;
          cycles.current += 1;

          if (cycles.current >= 1) {
            const target = document.getElementById(scrollTargetId);
            if (target) setTimeout(() => smoothScrollTo(target, 1100), 450);
            setTimeout(() => lockScroll(false), 600);
            return;
          }
        }
      }

      setTimeout(loop, deleting.current ? 35 : 55);
    };

    const t = setTimeout(() => {
      loop();
      setTimeout(() => lockScroll(false), 1500);
    }, 200);

    return () => {
      clearTimeout(t);
      lockScroll(false);
    };
  }, [scrollTargetId]);

  return (
    <section className="landing" id="landing">
      <div className="landingCard">
        <div className="mascot" aria-hidden="true">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="74" r="46" fill="#fff" opacity="0.95"/>
            <circle cx="55" cy="66" r="7" fill="#111827"/>
            <circle cx="85" cy="66" r="7" fill="#111827"/>
            <circle cx="52" cy="63" r="2" fill="#ffffff"/>
            <circle cx="82" cy="63" r="2" fill="#ffffff"/>
            <path d="M58 88c5 7 19 7 24 0" stroke="#111827" strokeWidth="5" strokeLinecap="round"/>
            <path d="M44 34c9-10 22-16 26-16s17 6 26 16" stroke="#efd960" strokeWidth="10" strokeLinecap="round"/>
            <path d="M32 48c5-7 12-11 18-13" stroke="#efd960" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
            <path d="M108 48c-5-7-12-11-18-13" stroke="#efd960" strokeWidth="8" strokeLinecap="round" opacity="0.9"/>
          </svg>
        </div>

        <h1 className="landingTitle">Welcome to the board</h1>
        <div className="typeLine">
          <span>{text}</span>
          <span className="caret" aria-hidden="true"></span>
        </div>
        <p className="landingHint">When the typing finishes, it scrolls down automatically.</p>
      </div>
    </section>
  );
}