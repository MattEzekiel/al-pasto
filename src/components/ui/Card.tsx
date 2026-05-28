import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Playing-card primitives. `BlackCard` shows the prompt; `WhiteCard` shows
 * a response. Both use the editorial Inter-700 voice and the `rounded-card`
 * (16px) corner from DESIGN.md.
 *
 * The cards are deliberately the only surface in the system that hosts
 * heavy `display`-weight type — everywhere else display is reserved for
 * single-line headlines.
 */

type CardTone = "black" | "white" | "featured";

const TONE: Record<CardTone, string> = {
  // Black prompt card — sits on the canvas, has a hairline so the edge reads.
  black: "bg-surface-card text-ink hairline",
  // White response card — full inversion, no border.
  white: "bg-ink text-canvas",
  // Featured winning card — cobalt-violet brand stamp. Used STRICTLY for
  // winner reveal / final screen.
  featured: "bg-brand text-ink",
};

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  tone: CardTone;
  /** Render the card "face-down" with just the wordmark — for judging row. */
  faceDown?: boolean;
  /** Card body. For black cards this is the prompt with `_` slots. */
  children: ReactNode;
  /** Tiny meta line printed at the bottom (e.g. "1 PICK"). */
  meta?: string;
}

export function PlayingCard({
  tone,
  faceDown,
  children,
  meta,
  className = "",
  ...rest
}: CardProps) {
  return (
    <motion.div
      layout
      className={[
        "relative flex flex-col justify-between",
        "rounded-card no-select",
        "w-[244px] min-h-[326px] p-5",
        // 3:4 portrait — card-stock geometry
        "aspect-[3/4]",
        TONE[tone],
        className,
      ].join(" ")}
      {...rest}
    >
      {faceDown ? (
        <div className="grid place-items-center h-full w-full">
          <span className="display text-display-md leading-none">corta.</span>
        </div>
      ) : (
        <>
          <p className="display text-card-lg leading-[1.1]">{children}</p>
          <div className="flex items-end justify-between">
            <span className="display text-[18px] tracking-[-0.5px]">corta.</span>
            {meta && (
              <span className="text-[11px] uppercase tracking-[0.4px] text-ink-mute">
                {meta}
              </span>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

/**
 * Prompt-replacement helper — splits the black card on `_` and renders
 * placeholders as cobalt-violet underscored slots.
 */
export function PromptText({ text }: { text: string }) {
  const parts = text.split(/(_)/g);
  return (
    <p className="display text-card-lg leading-[1.1]">
      {parts.map((p, i) =>
        p === "_" ? (
          <span
            key={i}
            className="inline-block min-w-[3.5em] border-b-2 border-brand pb-[2px] mx-1 align-baseline"
          />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}
