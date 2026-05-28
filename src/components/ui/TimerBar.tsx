import { useEffect, useState } from "react";

/**
 * Round timer. Renders a 4px-tall progress rail beneath the prompt.
 * Below 25% time remaining, the rail flips to accent-rose to signal
 * urgency (matches the design system's "low-time warning" use of rose).
 */
export function TimerBar({
  deadline,
  totalMs,
  onExpire,
}: {
  /** Absolute deadline in ms (Date.now() comparison). */
  deadline: number | null;
  /** The original duration so we can compute % remaining. */
  totalMs: number;
  onExpire?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    if (!deadline) return;
    if (now >= deadline) onExpire?.();
  }, [deadline, now, onExpire]);

  if (!deadline) return null;

  const remaining = Math.max(0, deadline - now);
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, remaining / totalMs)) : 0;
  const isDanger = pct <= 0.25;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="w-full">
      <div className="h-1 w-full rounded-pill bg-hairline overflow-hidden">
        <div
          className={[
            "h-full transition-[width] duration-200 ease-linear",
            isDanger ? "bg-accent-rose" : "bg-ink",
          ].join(" ")}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <span
          className={[
            "text-[11px] tracking-[0.6px] uppercase font-semibold",
            isDanger ? "text-accent-rose" : "text-ink-mute",
          ].join(" ")}
        >
          {seconds}s
        </span>
      </div>
    </div>
  );
}
