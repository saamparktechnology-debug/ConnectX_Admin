"use client";

import { useState } from "react";
import ExpertModal from "./ExpertModal";

const perks = [
  "Set your own rate and availability",
  "Get paid weekly, straight to your bank",
  "Free training and onboarding support",
  "Full control over the topics you take",
];

export default function ExpertCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="experts" className="bg-ink-800 py-20 md:py-28">
      <div className="container-x">
        <div className="grid items-center gap-10 rounded-3xl bg-brand-gradient p-8 shadow-card md:grid-cols-2 md:p-14">
          <div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Turn what you know into an income
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
              If you're trained in counselling, career coaching, finance,
              wellness, or any field people ask for advice on, ConnectX gives
              you an audience — and a private, structured way to help them.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-focus mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-ink-900 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Apply to become an expert
            </button>
          </div>
          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-white sm:text-base">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ExpertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
