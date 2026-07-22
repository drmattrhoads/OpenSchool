export function Chip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`tabular inline-flex items-center rounded-full bg-code-bg px-2.5 py-1 text-xs font-semibold text-ink-soft ${className}`}
    >
      {children}
    </span>
  );
}
