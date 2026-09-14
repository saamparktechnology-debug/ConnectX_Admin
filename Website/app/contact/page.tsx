import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with ConnectX support team.",
};

const contacts = [
  {
    label: "Support",
    email: "connectx24.support@gmail.com",
  },
  {
    label: "General",
    email: "connectx24.in@gmail.com",
  },
  {
    label: "Business",
    email: "connectx.md.disk@gmail.com",
  },
];

export default function ContactPage() {
  return (
    <section className="min-h-screen bg-ink-900 pt-28 pb-16">
      <div className="container-x mx-auto max-w-2xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-mist hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>

        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-mist">We&apos;d love to hear from you. Reach out through any of the following.</p>

        <div className="mt-10 space-y-4">
          {contacts.map((c) => (
            <a
              key={c.email}
              href={`mailto:${c.email}`}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-brand-pink/40 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-pink/20 font-display text-lg font-bold text-brand-pink">
                C
              </div>
              <div>
                <p className="font-display font-semibold text-white">{c.label}</p>
                <p className="text-sm text-mist">{c.email}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-pink/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <p className="font-display font-semibold text-white">Our Address</p>
              <p className="text-sm text-mist">Debra Bazar, Paschim Medinipur, West Bengal, India</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-mist">Prefer to call? Reach us at</p>
          <a href="tel:+918250766738" className="mt-1 inline-flex items-center gap-2 font-display text-lg font-semibold text-brand-pink hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            8250766738
          </a>
        </div>
      </div>
    </section>
  );
}
