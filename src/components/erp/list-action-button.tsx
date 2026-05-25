type ListActionButtonProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone?: "neutral" | "danger";
  onClick: () => void;
};

export function ListActionButton({
  children,
  icon,
  tone = "neutral",
  onClick,
}: ListActionButtonProps) {
  const toneClass =
    tone === "danger"
      ? "text-[#8a2f1e] hover:border-[#d8c2bd] hover:bg-[#fff4f1] hover:text-[#6f2417] focus-visible:outline-[#8a2f1e]"
      : "text-[var(--muted)] hover:border-[var(--border-strong)] hover:bg-white hover:text-[var(--foreground)] focus-visible:outline-[var(--coral)]";

  return (
    <button
      type="button"
      className={`inline-flex h-7 items-center gap-1 whitespace-nowrap border border-transparent px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${toneClass}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}
