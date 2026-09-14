"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#experts", label: "For experts" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-ink-900/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="ConnectX logo" width={40} height={40} priority className="rounded-xl" />
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Connect<span className="text-brand-pink">X</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#experts"
            className="btn-focus rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-colors"
          >
            Become an Expert
          </a>
          {/* <a
            href="#download"
            className="btn-focus rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-blueLight transition-colors"
          >
            Download App
          </a> */}
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden btn-focus flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink-900 px-5 pb-6 pt-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-mist hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-3">
            <a
              href="#experts"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Become an Expert
            </a>
             {/* <a
              href="#download"
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand-blue px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Download App
            </a> */}
          </div>
        </div>
      )}
    </header>
  );
}
