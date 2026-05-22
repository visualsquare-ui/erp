type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "coral" | "green" | "blue";
};

const toneClass = {
  neutral: "border-[var(--border)] bg-white",
  coral: "border-[var(--coral)]/45 bg-[var(--coral-quiet)]",
  green: "border-[#C7E5D4] bg-[#F1FAF5]",
  blue: "border-[#C9DCEB] bg-[#F2F8FC]",
};

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: MetricCardProps) {
  return (
    <article className={`border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 min-h-5 text-sm text-[var(--muted)]">{detail}</p>
    </article>
  );
}
