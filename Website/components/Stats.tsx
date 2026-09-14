const stats = [
  { value: "50K+", label: "Conversations hosted" },
  { value: "1,200+", label: "Trained experts" },
  { value: "4.9/5", label: "Average call rating" },
  { value: "100%", label: "Identity protected" },
];

export default function Stats() {
  return (
    <section className="border-y border-white/5 bg-ink-900 py-12">
      <div className="container-x grid grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs text-mist sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
