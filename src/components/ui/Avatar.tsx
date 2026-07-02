/**
 * Initials-only avatar — no images, no gradients. Background tone is
 * driven from a hash of the name so each player gets a stable shade
 * inside the canvas/elevated ladder. Strictly no color-accent fills.
 */
export function Avatar({
  name,
  size = 36,
  ring = "hairline",
}: {
  name: string;
  size?: number;
  /** "judge" gives a cobalt-violet ring; "hairline" is the default. */
  ring?: "hairline" | "judge" | "host";
}) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const ringClass =
    ring === "judge"
      ? "ring-2 ring-brand"
      : ring === "host"
        ? "ring-2 ring-ink"
        : "hairline";

  return (
    <div
      className={[
        "inline-grid place-items-center rounded-pill bg-surface-elevated no-select",
        "font-semibold tracking-[0.2px]",
        ringClass,
      ].join(" ")}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {initials || "?"}
    </div>
  );
}
