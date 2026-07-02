import { type HTMLMotionProps, motion } from "framer-motion";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

/**
 * The single canonical button shape: pill (rounded-full), 48px tall,
 * Inter 600 label, +0.2px tracking. Pressed state is a scale-down — no
 * shadows allowed per the design system.
 *
 * Variants:
 *   primary  — white pill on black. THE primary CTA.
 *   inverted — black pill on white surface (rare; used inside light cards).
 *   ghost    — transparent + 1px hairline border on dark canvas.
 *   danger   — accent-rose; reserved for the Kick action.
 */
type Variant = "primary" | "inverted" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

type Props = HTMLMotionProps<"button"> &
  Pick<ComponentPropsWithoutRef<"button">, "type"> & {
    variant?: Variant;
    size?: Size;
    full?: boolean;
  };

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-ink/90 active:bg-ink/80 disabled:bg-ink/40",
  inverted: "bg-canvas text-ink hover:bg-canvas/80",
  ghost: "bg-transparent text-ink hairline hover:bg-surface-card",
  danger: "bg-accent-rose text-ink hover:bg-accent-rose/90",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-[16px]",
};

export const PillButton = forwardRef<HTMLButtonElement, Props>(
  function PillButton(
    {
      variant = "primary",
      size = "md",
      full = false,
      className = "",
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        className={[
          "inline-flex items-center justify-center gap-2",
          "rounded-pill no-select",
          "font-semibold tracking-[0.2px]",
          "transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          full ? "w-full" : "",
          VARIANT[variant],
          SIZE[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
