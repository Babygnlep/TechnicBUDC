"use client";

import { ReactNode, useEffect } from "react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Centered modal with a backdrop, used here for the post-submission success state. */
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-reel/20 bg-[#0B1320]/95 p-8 text-center shadow-card animate-scaleIn">
        <div className="absolute inset-x-10 top-0 h-2 rounded-full bg-gradient-to-r from-reel via-[#FFD100] to-reel" />
        <div className="mx-auto mb-6 mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-reel/20 text-reel shadow-glow">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-reel">
            <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 20.5L17 25.5L28 14.5"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-checkDraw"
            />
          </svg>
        </div>

        <h3 id="modal-title" className="font-display text-2xl uppercase tracking-wide text-ink">
          {title}
        </h3>
        <div className="mt-3 text-sm leading-relaxed text-smoke">{children}</div>

        <Button variant="dark" className="mt-8 w-full" onClick={onClose}>
          ปิด
        </Button>
      </div>
    </div>
  );
}
