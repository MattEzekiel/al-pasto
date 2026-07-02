import { motion } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { Avatar } from "@/components/ui/Avatar";
import { GameCard, PromptText } from "@/components/ui/GameCard";
import { PillButton } from "@/components/ui/PillButton";
import { useT } from "@/i18n";
import { useGameStore } from "@/store/useGameStore";

/**
 * Post-judging beat. Surfaces the winning submission as a cobalt-violet
 * featured card — the brand's single permitted "stamp". Host taps the CTA
 * to draw the next round.
 */
export function RevealView() {
  const t = useT();
  const view = useGameStore((s) => s.view);
  const role = useGameStore((s) => s.role);
  const advanceRound = useGameStore((s) => s.advanceRound);

  if (!view) return null;
  const round = view.round;
  const winnerSub = round.anonymous.find(
    (s) => s.id === round.winnerSubmissionId,
  );
  const winner = view.players.find((p) => p.id === round.winnerPlayerId);
  const winnerName = winner?.name ?? "—";

  return (
    <AppFrame>
      <div className="pt-6 space-y-6">
        <header className="space-y-2">
          <span className="text-label uppercase text-brand">
            {t.reveal.badge}
          </span>
          <h1 className="display text-display-md">
            {t.reveal.takesRound(winnerName)}
          </h1>
        </header>

        {round.blackCard && (
          <div className="rounded-card hairline bg-surface-card p-5">
            <PromptText text={round.blackCard.text} />
          </div>
        )}

        <motion.div
          initial={{ scale: 0.92, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="flex justify-center"
        >
          <GameCard tone="featured" meta={t.reveal.winnerTag}>
            {winnerSub?.cards.map((c) => c.text).join(" + ")}
          </GameCard>
        </motion.div>

        {winner && (
          <div className="flex items-center justify-center gap-3">
            <Avatar name={winner.name} size={40} />
            <div>
              <p className="text-body font-semibold">{winner.name}</p>
              <p className="text-label uppercase text-ink-mute">
                {t.reveal.pointPlus}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <PillButton
            variant="primary"
            size="lg"
            full
            disabled={role !== "host"}
            onClick={advanceRound}
          >
            {role === "host" ? t.reveal.nextRound : t.reveal.waitingHost}
          </PillButton>
        </div>
      </div>
    </AppFrame>
  );
}
