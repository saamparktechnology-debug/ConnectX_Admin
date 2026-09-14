const testimonials = [
  {
    quote:
      "I needed to talk through a career decision without my colleagues finding out. The anonymity made it so much easier to be honest about what I actually wanted.",
    name: "Priya S.",
    role: "Product Manager",
  },
  {
    quote:
      "As an expert, ConnectX gave me a straightforward way to take calls between client sessions and actually earn from the extra hours.",
    name: "Rohit M.",
    role: "Certified Career Coach",
  },
  {
    quote:
      "The avatar system sounds gimmicky until you use it — it genuinely removes the awkwardness of a first conversation with a stranger.",
    name: "Ananya K.",
    role: "ConnectX user",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-ink-900 py-20 md:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            What people say after a call
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-ink-800 p-7"
            >
              <blockquote className="text-sm leading-relaxed text-mist">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 border-t border-white/10 pt-4">
                <p className="font-display text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-mist">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
