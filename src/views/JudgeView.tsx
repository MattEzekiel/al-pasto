import { useEffect } from "react";
import { motion } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { PlayingCard, PromptText } from "@/components/ui/Card";
import { TimerBar } from "@/components/ui/TimerBar";
import { useGameStore, useSelfPlayer } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";

const TIE_BREAK_GRACE_MS = 5_000;

/**
 * Voting Matrix — Judge View.
 *
 * Anonymous submissions arrive shuffled with author ids stripped. The
 * judge taps a card to flip it (3D rotateY), and taps again to confirm
 * the pick.
 *
 * Tie-break: if the judging deadline passes without a pick, the host
 * fires `forceTieBreak` after a 5s grace window — the random selector
 * lives in `lib/host.ts`.
 */
export function JudgeView() {
  const view = useGameStore((s) => s.view);
  const pick = useGameStore((s) => s.pick);
  const forceTieBreak = useGameStore((s) => s.forceTieBreak);
  const role = useGameStore((s) => s.role);
  const self = useSelfPlayer();
  const flipped = useUIStore((s) => s.flippedSubmissionId);
  const flip = useUIStore((s) => s.flip);

  // Host-only — schedule the tie-breaker after the deadline + grace.
  useEffect(() => {
    if (role !== "host") return;
    if (view?.phase !== "judging") return;
    if (!view.round.deadline) return;
    const fireAt = view.round.deadline + TIE_BREAK_GRACE_MS;
    const id = window.setTimeout(forceTieBreak, Math.max(0, fireAt - Date.now()));
    return () => window.clearTimeout(id);
  }, [role, view?.phase, view?.round.deadline, forceTieBreak]);

  if (!view || !self) return null;
  const round = view.round;
  const isJudge = self.isJudge;

  if (!isJudge) {
    return (
      <AppFrame>
        <div className="pt-10 space-y-4">
          <span className="text-label uppercase text-ink-mute">Judging</span>
          <p className="display text-display-md">
            The judge is picking. Hold tight.
          </p>
          {round.deadline && view.settings.timeLimitSec > 0 && (
            <TimerBar
              deadline={round.deadline + TIE_BREAK_GRACE_MS}
              totalMs={view.settings.timeLimitSec * 1000 + TIE_BREAK_GRACE_MS}
            />
          )}
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame
      header={
        <div className="pt-3 pb-4 flex items-center justify-between">
          <span className="text-label uppercase text-brand">You are the judge</span>
          <span className="text-label uppercase text-ink-mute">
            Round {round.index}
          </span>
        </div>
      }
    >
      {/* Prompt */}
      <section className="pt-2">
        <div className="rounded-card hairline bg-surface-card p-5">
          {round.blackCard && <PromptText text={round.blackCard.text} />}
        </div>
      </section>

      {/* Matrix */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        {round.anonymous.map((sub) => {
          const isFlipped = flipped === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => (isFlipped ? pick(sub.id) : flip(sub.id))}
              className="relative aspect-[3/4] [perspective:1000px]"
            >
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <PlayingCard tone="black" faceDown>
                    {""}
                  </PlayingCard>
                </div>
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <PlayingCard tone="white" meta="TAP TO PICK">
                    {sub.cards.map((c) => c.text).join(" + ")}
                  </PlayingCard>
                </div>
              </motion.div>
            </button>
          );
        })}
      </section>

      <div className="mt-6">
        <PillButton variant="ghost" size="md" full disabled>
          {flipped ? "Tap the flipped card again to confirm" : "Tap a card to reveal"}
        </PillButton>
      </div>
    </AppFrame>
  );
}
