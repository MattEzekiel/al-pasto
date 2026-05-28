import { motion } from "framer-motion";
import { PillButton } from "@/components/ui/PillButton";
import { Avatar } from "@/components/ui/Avatar";
import { useGameStore } from "@/store/useGameStore";
import { useT } from "@/i18n";

/**
 * Final celebration. The cobalt-violet brand stamp lives at full volume
 * here — entire frame inverts to cobalt with white type.
 *
 * The only screen in the app permitted to use `bg-brand` as the canvas.
 */
export function WinnerView() {
  const t = useT();
  const view = useGameStore((s) => s.view);
  const leave = useGameStore((s) => s.leave);
  if (!view) return null;

  const sorted = [...view.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const winnerName = winner?.name ?? "—";

  return (
    <div className="min-h-[100dvh] bg-brand text-ink flex flex-col">
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col px-rail py-10">
        <motion.header
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          <span className="text-label uppercase opacity-80">{t.winner.gameOver}</span>
          <h1 className="display text-display-xxl leading-none">
            {t.winner.wins(winnerName)}
          </h1>
        </motion.header>

        <motion.section
          aria-label={t.winner.gameOver}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 space-y-3"
        >
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-card bg-ink/10 p-3"
            >
              <span className="display text-display-sm w-8 text-center opacity-80">
                {i + 1}
              </span>
              <Avatar name={p.name} size={36} />
              <span className="flex-1 text-body font-semibold">{p.name}</span>
              <span className="display text-display-sm tabular-nums">{p.score}</span>
            </div>
          ))}
        </motion.section>

        <div className="mt-auto pt-10">
          <PillButton variant="inverted" size="lg" full onClick={leave}>
            {t.winner.back}
          </PillButton>
        </div>
      </div>
    </div>
  );
}
