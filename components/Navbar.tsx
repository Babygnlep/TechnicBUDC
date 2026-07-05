"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "หน้าแรก", href: "/" },
  { label: "เกี่ยวกับเรา", href: "/#about" },
  { label: "สมัครงาน", href: "/#apply" },
  { label: "ลงงานวันที่", href: "/schedule" },
];

/** Sticky black navbar. Collapses into a hamburger menu on small screens. */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-mist/80 backdrop-blur-xl border-b border-line transition-shadow duration-300 ${
        scrolled ? "shadow-sm shadow-black/30" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#home" className="flex items-center gap-3">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            <Image
              src="/TECNIC_LOGO.png"
              alt="Bangkok University Digital Media Logo"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <span className="font-display text-xl tracking-normal text-ink">
            TECHNIC<span className="text-reel"> BUDC</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-ink/70 transition-colors hover:text-reel"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#apply"
            className="rounded-full bg-reel px-6 py-2.5 font-display text-sm tracking-wide text-canvas transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            สมัครเลย
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="เปิด/ปิดเมนู"
          aria-expanded={isOpen}
        >
          <span
            className={`h-0.5 w-6 bg-ink transition-transform duration-300 ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-opacity duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-ink transition-transform duration-300 ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden bg-canvas transition-all duration-300 md:hidden ${
          isOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-6 pb-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="py-2.5 text-sm font-medium tracking-wide text-ink/80 hover:text-reel"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#apply"
            onClick={() => setIsOpen(false)}
            className="mt-2 rounded-full bg-reel px-6 py-3 text-center font-display text-sm tracking-wide text-canvas shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-reel/20"
          >
            สมัครเลย
          </a>
        </div>
      </div>
    </header>
  );
}
