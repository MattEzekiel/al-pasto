import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { GameCard, PromptText } from "@/components/ui/GameCard";
import { TimerBar } from "@/components/ui/TimerBar";
import { ScoreChip } from "@/components/ui/ScoreChip";
import { useGameStore, useSelfHand, useSelfPlayer } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import { useT } from "@/i18n";
import type { WhiteCard } from "@/types/game";

/**
 * Mouse drag-to-scroll for the hand rail. Touch devices keep native
 * momentum scrolling (we only hijack the mouse), so scroll-snap still
 * feels right on a phone. `wasDragged()` lets the tap handler ignore the
 * click that ends a drag so you don't accidentally play a card.
 */
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startLeft - dx;
  };
  const end = () => {
    drag.current.down = false;
  };

  return {
    ref,
    wasDragged: () => drag.current.moved,
    handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerLeave: end },
  };
}

/**
 * Active Gameplay — Hand View.
 *
 * Layout:
 *   - Top:    prompt (GameCard tone="black") + round meta + timer
 *   - Center: play zone (tap a hand card to stage it here)
 *   - Bottom: horizontally scroll-snapped hand carousel
 *
 * Tapping a hand card stages it (shared `layoutId` animates the move);
 * tapping it again in the zone returns it. Submit is a single tap.
 *
 * Once you've played — or if you're the rotating judge — this turns into
 * a waiting screen with live submission progress.
 */
export function GameplayView() {
  const t = useT();
  const view = useGameStore((s) => s.view);
  const role = useGameStore((s) => s.role);
  const submitCards = useGameStore((s) => s.submitCards);
  const expireSubmission = useGameStore((s) => s.expireSubmission);
  const hand = useSelfHand();
  const self = useSelfPlayer();
  const staged = useUIStore((s) => s.stagedCardIds);
  const stage = useUIStore((s) => s.stage);
  const unstage = useUIStore((s) => s.unstage);
  const clearStaged = useUIStore((s) => s.clearStaged);
  const setSubmittedCards = useUIStore((s) => s.setSubmittedCards);
  const rail = useDragScroll();

  // Track the round we've submitted for, so we can flip to the wait screen.
  const [submittedRound, setSubmittedRound] = useState(-1);

  const round = view?.round;
  const roundIndex = round?.index ?? -1;
  const black = round?.blackCard;
  const isJudge = self?.isJudge ?? false;
  const required = black?.spaces ?? 1;
  const deadline = round?.deadline ?? null;
  const phase = view?.phase;

  // Host-only: close the submission phase when the round timer runs out.
  // Whoever didn't play forfeits the round.
  useEffect(() => {
    if (role !== "host") return;
    if (phase !== "submission") return;
    if (!deadline) return;
    const id = window.setTimeout(expireSubmission, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(id);
  }, [role, phase, deadline, expireSubmission]);

  // Clear any stale staging when a new round begins.
  useEffect(() => {
    clearStaged();
    setSubmittedCards([]);
  }, [roundIndex, clearStaged, setSubmittedCards]);

  const stagedCards = useMemo(
    () => staged.map((id) => hand.find((c) => c.id === id)).filter(Boolean) as WhiteCard[],
    [staged, hand],
  );

  if (!view || !round || !self) return null;

  const hasSubmitted = submittedRound === round.index;

  // Players expected to play: everyone connected but the (rotate-mode) judge.
  const expectedPlayers = view.players.filter(
    (p) => p.connected && p.id !== round.judgeId,
  ).length;
  const submitted = round.submissionCount;

  // The judge waits, and so does anyone who has already played.
  if (isJudge || hasSubmitted) {
    return (
      <WaitScreen
        title={isJudge ? t.player.judgeBanner : t.player.waitingTitle}
        subtitle={isJudge ? t.player.judgeWait : t.player.submittedWaiting}
        accent={isJudge}
        players={t.player.playersProgress(submitted, expectedPlayers)}
        cards={required > 1 ? t.player.cardsProgress(submitted * required, expectedPlayers * required) : null}
        deadline={deadline}
        totalMs={view.settings.timeLimitSec * 1000}
      />
    );
  }

  const ready = stagedCards.length === required;
  const submit = () => {
    setSubmittedCards(stagedCards.map((c) => c.id));
    submitCards(stagedCards);
    clearStaged();
    setSubmittedRound(round.index);
  };

  const toggleStage = (c: WhiteCard) => {
    if (rail.wasDragged()) return; // ignore the click that ends a drag
    if (staged.includes(c.id)) {
      unstage(c.id);
    } else if (stagedCards.length < required) {
      stage(c.id);
    }
  };

  return (
    <AppFrame
      header={
        <div className="pt-3 pb-4 flex items-center justify-between">
          <span className="text-label uppercase text-ink-mute">
            {t.player.round(round.index)}
          </span>
          <ScoreChip value={self.score} />
        </div>
      }
    >
      {/* Prompt */}
      <section aria-label={t.player.round(round.index)} className="pt-2">
        <div className="rounded-card hairline bg-surface-card p-5 space-y-4">
          {black && <PromptText text={black.text} />}
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-ink-mute">
              {t.player.picks(required)}
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

      {/* Play zone */}
      <section
        aria-label={t.player.playZone}
        className="mt-5 rounded-card border-2 border-dashed border-hairline-strong min-h-[148px] p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-label uppercase text-ink-mute">{t.player.playZone}</span>
          <span className="text-label uppercase text-ink-mute">
            {t.player.submitProgress(stagedCards.length, required)}
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
                {t.player.dragHere(required)}
              </motion.p>
            )}
            {stagedCards.map((c) => (
              <motion.button
                key={c.id}
                layoutId={c.id}
                onClick={() => unstage(c.id)}
                className="shrink-0"
                aria-label={c.text}
                whileTap={{ scale: 0.96 }}
              >
                <GameCard tone="white">{c.text}</GameCard>
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
          {ready
            ? t.player.submit
            : `${t.player.submit} ${t.player.submitProgress(stagedCards.length, required)}`}
        </PillButton>
      </div>

      {/* Hand carousel */}
      <section aria-label={t.player.yourHand} className="mt-auto pt-6 pb-2">
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-label uppercase text-ink-mute">{t.player.yourHand}</span>
          <span className="text-label uppercase text-ink-mute">
            {t.player.cardCount(hand.length)}
          </span>
        </div>
        <div
          ref={rail.ref}
          {...rail.handlers}
          className="flex gap-3 overflow-x-auto scroll-rail snap-x snap-mandatory cursor-grab active:cursor-grabbing -mx-rail px-rail pb-2"
        >
          {hand.map((c) => {
            const isStaged = staged.includes(c.id);
            const atCapacity = stagedCards.length >= required;
            return (
              <motion.button
                key={c.id}
                type="button"
                layoutId={c.id}
                onClick={() => toggleStage(c)}
                disabled={!isStaged && atCapacity}
                aria-pressed={isStaged}
                aria-label={c.text}
                animate={{ opacity: isStaged ? 0 : 1, scale: isStaged ? 0.92 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="shrink-0 snap-start disabled:opacity-40"
              >
                <GameCard tone="white">{c.text}</GameCard>
              </motion.button>
            );
          })}
        </div>
      </section>
    </AppFrame>
  );
}

/** Shared waiting screen with live submission progress. */
function WaitScreen({
  title,
  subtitle,
  accent,
  players,
  cards,
  deadline,
  totalMs,
}: {
  title: string;
  subtitle: string;
  accent: boolean;
  players: string;
  cards: string | null;
  deadline: number | null;
  totalMs: number;
}) {
  return (
    <AppFrame>
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 px-rail">
        <span
          className={[
            "text-label uppercase",
            accent ? "text-brand" : "text-ink-mute",
          ].join(" ")}
        >
          {title}
        </span>
        <p className="display text-display-md max-w-xs">{subtitle}</p>

        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="display text-display-lg tabular-nums">{players}</span>
          {cards && (
            <span className="text-label uppercase text-ink-mute tabular-nums">
              {cards}
            </span>
          )}
        </div>

        {deadline && totalMs > 0 && (
          <div className="w-48 mt-4">
            <TimerBar deadline={deadline} totalMs={totalMs} />
          </div>
        )}
      </div>
    </AppFrame>
  );
}
