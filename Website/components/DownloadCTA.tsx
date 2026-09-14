import Image from "next/image";

export default function DownloadCTA() {
  return (
    <section id="download" className="relative overflow-hidden bg-ink-900 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-glow-radial opacity-70" />
      <div className="container-x relative flex flex-col items-center text-center">
        <Image src="/logo.png" alt="ConnectX" width={72} height={72} className="rounded-2xl shadow-card" />
        <h2 className="mt-8 font-display text-3xl font-bold text-white sm:text-4xl">
          Your next honest conversation is one tap away
        </h2>
        <p className="mt-4 max-w-lg text-sm text-mist sm:text-base">
          Download ConnectX and get matched with a trained expert in seconds
          — completely confidential, every time.
        </p>

        {/* <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#"
            className="btn-focus flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-left transition-colors hover:bg-white/10"
          >
            <AppleMark />
            <span>
              <span className="block text-[11px] text-mist">Download on the</span>
              <span className="block text-sm font-semibold text-white">App Store</span>
            </span>
          </a>
          <a
            href="#"
            className="btn-focus flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-left transition-colors hover:bg-white/10"
          >
            <PlayMark />
            <span>
              <span className="block text-[11px] text-mist">Get it on</span>
              <span className="block text-sm font-semibold text-white">Google Play</span>
            </span>
          </a>
        </div> */}
      </div>
    </section>
  );
}

function AppleMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
      <path d="M16.365 1.43c0 1.14-.468 2.077-1.156 2.788-.766.79-2.028 1.395-3.023 1.317-.14-1.14.41-2.36 1.13-3.13.79-.83 2.15-1.44 3.05-1.475.01.166.01.333 0 .5zm3.71 16.66c-.51 1.14-.755 1.65-1.42 2.65-.925 1.39-2.23 3.12-3.85 3.14-1.44.02-1.81-.94-3.76-.93-1.94.01-2.35.95-3.79.93-1.62-.02-2.86-1.58-3.79-2.97-2.6-3.9-2.87-8.48-1.27-10.92 1.14-1.74 2.94-2.75 4.63-2.75 1.72 0 2.8 1.01 4.22 1.01 1.37 0 2.22-1.01 4.22-1.01 1.51 0 3.11.82 4.25 2.24-3.73 2.04-3.12 7.36.55 8.6z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M4 3.5v17l9-8.5-9-8.5Z" fill="#4C6FFF" />
      <path d="M13 12 4 3.5l11.6 6.7L13 12Z" fill="#7C93FF" />
      <path d="M13 12l2.6 1.8L4 20.5 13 12Z" fill="#FF3D71" />
      <path d="M15.6 10.2 20 12.6a1 1 0 0 1 0 1.75l-4.4 2.4-2.7-2.75 2.7-2.8Z" fill="#FFC94A" />
    </svg>
  );
}
