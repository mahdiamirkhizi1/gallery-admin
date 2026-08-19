export type StatusTone = "success" | "warning" | "info" | "danger" | "neutral";
export function StatusBadge({ children, tone }: React.PropsWithChildren<{ tone: StatusTone }>) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
