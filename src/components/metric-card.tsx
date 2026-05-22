type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "coral" | "green" | "blue";
};

const toneClass = {
  neutral: "border-[var(--border)] bg-white",
  coral: "border-[var(--coral)]/45 bg-[var(--coral-quiet)]",
  green: "border-[#c8e2d2] bg-[#f2faf5]",
  blue: "border-[#cbdce8] bg-[#f3f8fb]",
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <article className={`min-h-[8.25rem] border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-semibold tabular-nums text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 min-h-5 text-sm leading-5 text-[var(--muted)]">
        {detail}
      </p>
    </article>
  );
}
