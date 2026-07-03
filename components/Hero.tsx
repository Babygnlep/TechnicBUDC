"use client";

import { useState } from "react";
import Modal from "./ui/Modal";

/**
 * Hero — framed like a camera viewfinder to speak directly to the media
 * production subject matter. Corner brackets + a REC indicator + a
 * status line give it a set-ready, "we are live" atmosphere without
 * leaning on generic gradient-hero conventions.
 */
export default function Hero() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-canvas via-[#09111f] to-[#020617] pt-20"
    >
      {/* Ambient spotlight + animated grain texture */}
      <div className="spotlight absolute inset-0 opacity-30" />
      <div className="absolute left-10 top-36 hidden h-56 w-56 rounded-full bg-reel/10 blur-3xl md:block" />
      <div className="absolute right-10 top-28 hidden h-72 w-72 rounded-full bg-ink/10 blur-3xl md:block" />
      <div className="film-grain animate-grain" />

      {/* Viewfinder corner brackets */}
      <div className="pointer-events-none absolute inset-6 md:inset-10">
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
          (pos, i) => (
            <span
              key={pos}
              className={`absolute h-8 w-8 border-reel md:h-12 md:w-12 ${pos} ${
                i === 0 ? "border-l-2 border-t-2" : ""
              } ${i === 1 ? "border-r-2 border-t-2" : ""} ${
                i === 2 ? "border-l-2 border-b-2" : ""
              } ${i === 3 ? "border-r-2 border-b-2" : ""}`}
            />
          )
        )}
      </div>

      {/* REC indicator */}
      <div className="absolute left-8 top-24 flex items-center gap-2 md:left-14 md:top-28">
        <span className="h-2 w-2 rounded-full bg-reel animate-blinkDot" />
        <span className="text-xs tracking-[0.2em] text-ink/60">
          เปิดรับสมัครแล้ว
        </span>
      </div>

      {/* Status line, top right, decorative but on-brand */}
      <div className="absolute right-8 top-24 hidden text-xs tracking-[0.2em] text-ink/50 md:top-28 lg:block">
        ทีมงานฝ่ายโปรดักชัน / เปิดรับสมัคร
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-ink/60 opacity-0 animate-fadeUp [animation-delay:0.1s]">
          TECHNIC BUDC
        </p>

        <h1 className="font-display text-6xl leading-[0.95] text-ink opacity-0 animate-fadeUp [animation-delay:0.25s] sm:text-7xl md:text-8xl">
          รับสมัครทีมงาน
          <br />
          <span className="text-reel">TECHNIC BUDC</span>
        </h1>

        <p className="mt-8 max-w-xl text-balance text-base leading-relaxed text-ink/70 opacity-0 animate-fadeUp [animation-delay:0.4s] md:text-lg">
          ร่วมเป็นส่วนหนึ่งของทีมงานฝ่ายเทคนิค สำหรับนักศึกษาที่สนใจงานด้าน
          Production และ Media
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#apply"
            className="inline-flex items-center gap-3 rounded-full bg-reel px-10 py-5 font-display text-base tracking-wide text-canvas opacity-0 shadow-sm transition-all duration-300 animate-fadeUp [animation-delay:0.55s] hover:-translate-y-1 hover:shadow-md hover:shadow-reel/20"
          >
            สมัครเลย
            <span aria-hidden className="text-lg">
              →
            </span>
          </a>
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-reel px-10 py-5 font-display text-base tracking-wide text-reel opacity-0 transition-all duration-300 animate-fadeUp [animation-delay:0.65s] hover:bg-reel/10"
          >
            ดูผลงาน
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink/40 md:flex">
        <span className="text-[10px] tracking-[0.3em]">เลื่อนลง</span>
        <span className="h-8 w-px bg-ink/10" />
      </div>

      <Modal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} title="Show Reel TECHNIC BUDC">
        <div className="mt-6">
          <video
            src="/show-reel.mp4"
            controls
            autoPlay
            className="mx-auto w-full max-w-3xl rounded-3xl border border-line bg-black shadow-card"
          />
        </div>
      </Modal>
    </section>
  );
}
