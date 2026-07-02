import type { ComponentPropsWithoutRef } from "react";

/**
 * Anchor twin of `PillButton` for the prerendered marketing pages. Plain
 * `<a>` on purpose: full-page navigations serve the static HTML, and the
 * component stays SSR-pure (no framer-motion).
 */
type Variant = "primary" | "ghost";

const VARIANT: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:bg-ink/90 active:bg-ink/80",
  ghost: "bg-transparent text-ink hairline hover:bg-surface-card",
};

type Props = ComponentPropsWithoutRef<"a"> & { variant?: Variant };

export function PillLink({ variant = "primary", className = "", children, ...rest }: Props) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-pill no-select h-12 px-6 text-[15px]",
        "font-semibold tracking-[0.2px]",
        "transition-colors duration-150",
        VARIANT[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </a>
  );
}
