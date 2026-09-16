"use client";

import { useState } from "react";
import ExpertModal from "./ExpertModal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="pointer-events-none absolute inset-0 bg-glow-radial" />
      <div className="container-x relative pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <h1 className="hero-rise hero-rise-1 font-display text-[3.2rem] leading-[1.05] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[#7C93FF] via-[#5C7BFF] to-[#3D4FE8] sm:text-7xl md:text-8xl">
          ConnectX
        </h1>

        <p className="hero-rise hero-rise-2 mx-auto mt-7 max-w-2xl text-balance text-base leading-relaxed text-mist sm:text-lg">
          ConnectX gives you instant access to trained experts for personalised
          consultations across every walk of life. Through one-on-one audio
          calls, you get honest, confidential guidance — while an AI-generated
          avatar keeps your identity fully protected. Built to help you grow,
          gain confidence, and become the best version of yourself.
        </p>

        <div className="hero-rise hero-rise-3 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* <a
            href="#download"
            className="btn-focus w-full rounded-full bg-brand-blue px-8 py-3.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-brand-blueLight sm:w-auto"
          >
            Download the app
          </a> */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-focus w-full rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:w-auto cursor-pointer"
          >
            Become an Expert
          </button>
        </div>

        <ExpertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        <div className="hero-rise hero-rise-4 mt-16 grid gap-5 sm:grid-cols-3">
          <HighlightCard
            title="Connect anonymously"
            body="Every call runs behind an AI-generated avatar and a masked voice, so you can speak freely without ever revealing who you are."
          />
          <StatCard stat="100%" label="Confidential, every single call" />
          <HighlightCard
            title="Create your own space"
            body="Trained professionals can list their expertise, set their own hours, and earn by guiding people through real conversations."
          />
        </div>
      </div>
    </section>
  );
}

function HighlightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card-noise rounded-2xl bg-brand-gradient p-6 text-left shadow-card">
      <p className="font-display text-lg font-bold text-brand-amber">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/85">{body}</p>
    </div>
  );
}

function StatCard({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="card-noise flex flex-col items-center justify-center rounded-2xl bg-brand-gradient p-6 text-center shadow-card">
      <span className="font-display text-4xl font-extrabold text-white">{stat}</span>
      <span className="mt-2 text-sm font-medium text-white/85">{label}</span>
    </div>
  );
}
