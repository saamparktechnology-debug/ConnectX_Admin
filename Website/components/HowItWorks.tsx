const steps = [
  {
    number: "1",
    title: "Tell us what's on your mind",
    body: "Pick a topic — career, relationships, finance, health, or anything else — and we'll shortlist the right kind of expert for it.",
  },
  {
    number: "2",
    title: "Get matched instantly",
    body: "No waiting rooms. ConnectX connects you with an available, verified expert in seconds, day or night.",
  },
  {
    number: "3",
    title: "Talk freely, stay protected",
    body: "Your call runs through an AI-generated avatar and disguised voice, so you get honest advice without giving up your privacy.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink-900 py-20 md:py-28">
      <div className="container-x">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Three steps to your first call
          </h2>
          <p className="mt-4 text-mist">
            From opening the app to hearing an expert's voice — most people
            are connected in under a minute.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative rounded-2xl border border-white/10 bg-ink-800 p-7">
              <span className="font-display text-5xl font-extrabold text-white/10">
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{step.body}</p>
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute -right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-white/20 to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
