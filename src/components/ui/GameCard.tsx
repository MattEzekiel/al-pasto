import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

/**
 * `GameCard` — the only playing-card primitive. Tone switches between:
 *   - "black"    — prompt cards (surface-card + hairline)
 *   - "white"    — response cards (inverted: ink bg, canvas text)
 *   - "featured" — the winning card stamp (cobalt-violet brand surface)
 *
 * Editorial Inter-700 voice with `rounded-card` (16px) corners per
 * DESIGN.md. This component is the only surface allowed to host heavy
 * `display`-weight type at card sizes — everywhere else display is
 * reserved for single-line headlines.
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

export function GameCard({
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
