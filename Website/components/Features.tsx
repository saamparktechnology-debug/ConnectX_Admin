const features = [
  {
    title: "AI-protected identity",
    body: "Your face and voice are never shared. Every call is masked by a generated avatar and voice layer.",
    icon: (
      <path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5l-8-3Z" />
    ),
  },
  {
    title: "Verified, trained experts",
    body: "Every expert on ConnectX goes through a screening and training process before they can take calls.",
    icon: <path d="m9 12 2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z" />,
  },
  {
    title: "Book in seconds",
    body: "Match instantly with an available expert, or schedule a call for a time that works for you.",
    icon: <path d="M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
  },
  {
    title: "Flexible, per-minute pricing",
    body: "Pay only for the time you use. No subscriptions, no hidden add-ons.",
    icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  },
  {
    title: "Available around the clock",
    body: "Someone is always online — early mornings, late nights, or in between meetings.",
    icon: <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM12 6v6l4 2" />,
  },
  {
    title: "Earn as an expert",
    body: "List your specialty, set your rate and hours, and get paid directly for every conversation you host.",
    icon: <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6M16 2h6v6M22 2l-9 9" />,
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-ink-800 py-20 md:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Everything a real conversation needs
          </h2>
          <p className="mt-4 text-mist">
            Built for people who want honest guidance without giving up their
            privacy — and for experts who want a simple way to help.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-ink-700/60 p-7 transition-colors hover:border-brand-blue/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient-soft text-brand-blueLight">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
              </div>
              <h3 className="mt-5 font-display text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
