"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

import connectInstantly from "@/assets/1_ConnectX.png";
import safeAndPrivate from "@/assets/3_ConnectX.png";
import createAvatar from "@/assets/4.png";
import chooseToTalk from "@/assets/ASO_withoutFriends.png";

const cards = [
  { id: 1, image: connectInstantly, alt: "Connect Instantly - Best Quality Audio Calls" },
  { id: 2, image: safeAndPrivate, alt: "100% Safe and Private - Bad Behavior Not Allowed" },
  { id: 3, image: createAvatar, alt: "Create your own Avatar - AI Generated Avatars" },
  { id: 4, image: chooseToTalk, alt: "Choose To Talk - Build Confidence on Calls" },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const normalizedIndex = ((index % cards.length) + cards.length) % cards.length;
      const child = container.children[normalizedIndex] as HTMLElement;
      if (!child) return;
      const containerWidth = container.offsetWidth;
      const offset = child.offsetLeft - (containerWidth - child.offsetWidth) / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
      setCurrent(normalizedIndex);
    },
    []
  );

  const next = useCallback(() => {
    scrollToIndex(current + 1);
  }, [current, scrollToIndex]);

  const prev = useCallback(() => {
    scrollToIndex(current - 1);
  }, [current, scrollToIndex]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const children = Array.from(container.children) as HTMLElement[];
        const containerCenter = container.scrollLeft + container.offsetWidth / 2;
        let closest = 0;
        let minDist = Infinity;
        children.forEach((child, i) => {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const dist = Math.abs(containerCenter - childCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setCurrent(closest);
        ticking = false;
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  return (
    <section className="bg-ink-900 py-16 md:py-24 overflow-hidden">
      <div className="container-x">
        <div className="mx-auto max-w-xl text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Why Choose <span className="text-gradient">ConnectX</span>
          </h2>
          <p className="mt-4 text-mist">
            Your privacy, your way — with experts who truly care
          </p>
        </div>

        <div className="relative">
          <button
            onClick={prev}
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-ink-700/90 border border-white/10 flex items-center justify-center text-white hover:bg-ink-600 hover:text-white transition-all hover:scale-110 backdrop-blur-sm cursor-pointer"
            aria-label="Previous card"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={next}
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-ink-700/90 border border-white/10 flex items-center justify-center text-white hover:bg-ink-600 hover:text-white transition-all hover:scale-110 backdrop-blur-sm cursor-pointer"
            aria-label="Next card"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-4 md:px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`.snap-x::-webkit-scrollbar { display: none; }`}</style>
            {cards.map((card, i) => (
              <div
                key={card.id}
                className={`snap-center shrink-0 w-[280px] sm:w-[300px] md:w-[320px] rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  i === current
                    ? "scale-100 opacity-100 shadow-2xl"
                    : "scale-[0.95] opacity-70"
                }`}
                onClick={() => scrollToIndex(i)}
              >
                <div className="relative aspect-[9/16] bg-gradient-to-br from-[#6B3FA0] via-[#9B3D8E] to-[#D94A6A]">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === current ? "bg-brand-blue w-7" : "bg-white/30 w-2.5 hover:bg-white/50"
                }`}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
