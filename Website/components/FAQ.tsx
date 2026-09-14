"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does ConnectX keep my identity private?",
    a: "Every call runs through a generated avatar and a voice layer, so the person on the other end never sees your face or hears your real voice unless you choose to reveal it.",
  },
  {
    q: "Who are the experts on ConnectX?",
    a: "Experts apply, get verified, and complete a short training module before they can take calls. Their listed specialty and experience are shown before you connect.",
  },
  {
    q: "How much does a call cost?",
    a: "Pricing is per minute and varies by expert. You'll always see the rate before you connect, with no subscription required.",
  },
  {
    q: "Can I become an expert on ConnectX?",
    a: "Yes — tap \"Become an Expert\" in the app, submit your background, and complete onboarding. Once approved, you set your own hours and rate.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-ink-800 py-20 md:py-28">
      <div className="container-x max-w-3xl">
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl text-center">
          Common questions
        </h2>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="btn-focus flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-base font-medium text-white">{item.q}</span>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-mist transition-transform ${isOpen ? "rotate-45" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {isOpen && (
                  <p className="pb-6 text-sm leading-relaxed text-mist">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
