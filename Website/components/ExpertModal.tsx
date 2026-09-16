"use client";

import { useState, useEffect } from "react";

interface ExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  "Hindi",
  "Bengali",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Gujarati",
  "Other",
];

const timeSlots = [
  "12am to 6am",
  "6am to 12pm",
  "12pm to 6pm",
  "6pm to 12am",
];

export default function ExpertModal({ isOpen, onClose }: ExpertModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        handleClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, mobile, gender, language, timeSlot });
    setSubmitted(true);
  };

  const handleClose = () => {
    setName("");
    setMobile("");
    setGender("");
    setLanguage("");
    setTimeSlot("");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/80 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-ink-800 border border-white/10 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Details Save Successfully!</h3>
            <p className="mt-3 text-mist">We connect shortly.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Start your journey!
              </h2>
              <p className="mt-2 text-sm text-mist">
                Creators experienced a transformative financial journey after onboarding to ConnectX. Want to be one of them?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => { if (!/\d/.test(e.target.value)) setName(e.target.value); }}
                required
                className="w-full rounded-xl border border-brand-blue/50 bg-ink-800 px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none focus:border-brand-blue transition-colors"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setMobile(e.target.value); }}
                  maxLength={10}
                  required
                  className="w-full rounded-xl border border-brand-blue/50 bg-ink-800 px-5 py-3.5 text-sm text-white placeholder-white/40 outline-none focus:border-brand-blue transition-colors"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full rounded-xl border border-brand-blue/50 bg-ink-800 px-5 py-3.5 text-sm text-white outline-none focus:border-brand-blue transition-colors appearance-none cursor-pointer"
                  style={{ color: gender ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  <option value="" disabled style={{ backgroundColor: "#131834", color: "rgba(255,255,255,0.6)" }}>Gender</option>
                  <option value="Male" style={{ backgroundColor: "#131834", color: "white" }}>Male</option>
                  <option value="Female" style={{ backgroundColor: "#131834", color: "white" }}>Female</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                  className="w-full rounded-xl border border-brand-blue/50 bg-ink-800 px-5 py-3.5 text-sm text-white outline-none focus:border-brand-blue transition-colors appearance-none cursor-pointer"
                  style={{ color: language ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  <option value="" disabled style={{ backgroundColor: "#131834", color: "rgba(255,255,255,0.6)" }}>Language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang} style={{ backgroundColor: "#131834", color: "white" }}>{lang}</option>
                  ))}
                </select>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                  className="w-full rounded-xl border border-brand-blue/50 bg-ink-800 px-5 py-3.5 text-sm text-white outline-none focus:border-brand-blue transition-colors appearance-none cursor-pointer"
                  style={{ color: timeSlot ? "white" : "rgba(255,255,255,0.4)" }}
                >
                  <option value="" disabled style={{ backgroundColor: "#131834", color: "rgba(255,255,255,0.6)" }}>Time Slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot} style={{ backgroundColor: "#131834", color: "white" }}>{slot}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-gradient py-4 text-base font-semibold text-white shadow-card hover:opacity-90 transition-opacity cursor-pointer mt-2"
              >
                Submit
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
