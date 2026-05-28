import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { PlayingCard, PromptText } from "@/components/ui/Card";
import { TimerBar } from "@/components/ui/TimerBar";
import { ScoreChip } from "@/components/ui/ScoreChip";
import { useGameStore, useSelfHand, useSelfPlayer } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import type { WhiteCard } from "@/types/game";

/**
 * Active Gameplay — Hand View.
 *
 * Layout:
 *   - Top:    prompt (PlayingCard tone="black") + round meta + timer
 *   - Center: drop zone (drag white cards into here to stage them)
 *   - Bottom: horizontally scrollable hand carousel
 *
 * Cards drag with a tilt + scale tilt; on drop into the zone they
 * animate to a staged slot. Submit is a single tap.
 */
export function PlayerView() {
  const view = useGameStore((s) => s.view);
  const submitCards = useGameStore((s) => s.submitCards);
  const hand = useSelfHand();
  const self = useSelfPlayer();
  const staged = useUIStore((s) => s.stagedCardIds);
  const stage = useUIStore((s) => s.stage);
  const unstage = useUIStore((s) => s.unstage);
  const clearStaged = useUIStore((s) => s.clearStaged);

  const round = view?.round;
  const black = round?.blackCard;
  const isJudge = self?.isJudge ?? false;
  const required = black?.spaces ?? 1;

  const stagedCards = useMemo(
    () => staged.map((id) => hand.find((c) => c.id === id)).filter(Boolean) as WhiteCard[],
    [staged, hand],
  );

  if (!view || !round || !self) return null;

  if (isJudge) {
    return (
      <AppFrame>
        <div className="pt-12 text-center space-y-3">
          <span className="text-label uppercase text-brand">Sos el juez</span>
          <p className="display text-display-lg">Esperá a que la sala juegue sus cartas.</p>
        </div>
      </AppFrame>
    );
  }

  const ready = stagedCards.length === required;
  const submit = () => {
    submitCards(stagedCards);
    clearStaged();
  };

  return (
    <AppFrame
      header={
        <div className="pt-3 pb-4 flex items-center justify-between">
          <span className="text-label uppercase text-ink-mute">
            Ronda {round.index}
          </span>
          <ScoreChip value={self.score} />
        </div>
      }
    >
      {/* Prompt */}
      <section className="pt-2">
        <div className="rounded-card hairline bg-surface-card p-5 space-y-4">
          {black && <PromptText text={black.text} />}
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-ink-mute">
              {required > 1 ? `${required} elecciones` : "1 elección"}
            </span>
            {round.deadline && view.settings.timeLimitSec > 0 && (
              <div className="w-32">
                <TimerBar
                  deadline={round.deadline}
                  totalMs={view.settings.timeLimitSec * 1000}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Drop zone */}
      <section
        className="mt-5 rounded-card border-2 border-dashed border-hairline-strong min-h-[148px] p-4"
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-label uppercase text-ink-mute">Zona de juego</span>
          <span className="text-label uppercase text-ink-mute">
            {stagedCards.length}/{required}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto scroll-rail">
          <AnimatePresence initial={false}>
            {stagedCards.length === 0 && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-ink-mute text-body"
              >
                Arrastrá {required > 1 ? `${required} cartas` : "una carta"} acá.
              </motion.p>
            )}
            {stagedCards.map((c) => (
              <motion.button
                key={c.id}
                layoutId={c.id}
                onClick={() => unstage(c.id)}
                className="shrink-0"
                whileTap={{ scale: 0.96 }}
              >
                <PlayingCard tone="white">{c.text}</PlayingCard>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Submit */}
      <div className="mt-5">
        <PillButton
          variant="primary"
          size="lg"
          full
          disabled={!ready}
          onClick={submit}
        >
          Submit {ready ? "" : `${stagedCards.length}/${required}`}
        </PillButton>
      </div>

      {/* Hand carousel */}
      <section className="mt-auto pt-6 pb-2">
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-label uppercase text-ink-mute">Your hand</span>
          <span className="text-label uppercase text-ink-mute">{hand.length} cards</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-rail -mx-rail px-rail pb-2">
          {hand.map((c) => {
            const isStaged = staged.includes(c.id);
            return (
              <motion.div
                key={c.id}
                layoutId={c.id}
                drag={!isStaged && stagedCards.length < required ? "y" : false}
                dragConstraints={{ top: -160, bottom: 0 }}
                dragElastic={0.35}
                whileDrag={{ rotate: -3, scale: 1.04 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -80 && stagedCards.length < required) {
                    stage(c.id);
                  }
                }}
                animate={{ opacity: isStaged ? 0 : 1, scale: isStaged ? 0.92 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="shrink-0"
              >
                <PlayingCard tone="white">{c.text}</PlayingCard>
              </motion.div>
            );
          })}
        </div>
      </section>
    </AppFrame>
  );
}
