import { useEffect, useMemo, useRef, useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { GameCard, PromptText } from "@/components/ui/GameCard";
import { PillButton } from "@/components/ui/PillButton";
import { ScoreChip } from "@/components/ui/ScoreChip";
import { TimerBar } from "@/components/ui/TimerBar";
import { useT } from "@/i18n";
import { useGameStore, useSelfHand, useSelfPlayer } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import type { WhiteCard } from "@/types/game";

// One card (244px) + gap (12px). Used by the desktop arrow buttons.
const CARD_STEP = 256;

/**
 * Active Gameplay — Hand View.
 *
 *   - Top:    prompt (GameCard tone="black") + round meta + submission timer
 *   - Mid:    horizontally snap-scrolled hand carousel. Tap a card to play it
 *             (tap again to take it back). Edges fade via a CSS mask; desktop
 *             gets prev/next arrows. No drop zone — selection is the carousel.
 *   - Bottom: Submit.
 *
 * Once you've played — or you're the rotating judge — this becomes a wait
 * screen with live submission progress.
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
  const answers = useUIStore((s) => s.blankAnswers);
  const setAnswers = useUIStore((s) => s.setBlankAnswers);
  const railRef = useRef<HTMLDivElement>(null);

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
  // Whoever didn't play forfeits the round. No deadline = no limit.
  useEffect(() => {
    if (role !== "host") return;
    if (phase !== "submission") return;
    if (!deadline) return;
    const id = window.setTimeout(
      expireSubmission,
      Math.max(0, deadline - Date.now()),
    );
    return () => window.clearTimeout(id);
  }, [role, phase, deadline, expireSubmission]);

  // Reset selection when a new round begins.

  useEffect(() => {
    clearStaged();
    setSubmittedCards([]);
    setAnswers([]);
  }, [roundIndex, clearStaged, setSubmittedCards, setAnswers]);

  const stagedCards = useMemo(
    () =>
      staged
        .map((id) => hand.find((c) => c.id === id))
        .filter(Boolean) as WhiteCard[],
    [staged, hand],
  );

  if (!view || !round || !self) return null;

  const hasSubmitted = submittedRound === round.index;

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
        cards={
          required > 1
            ? t.player.cardsProgress(
                submitted * required,
                expectedPlayers * required,
              )
            : null
        }
        deadline={deadline}
        totalMs={view.settings.timeLimitSec * 1000}
        timerOn={view.settings.timeLimitSec > 0}
      />
    );
  }

  // Blank mode: players type their own answers instead of playing a hand.
  if (view.settings.whiteCards === "blank") {
    const blankReady = Array.from({ length: required }).every(
      (_, i) => (answers[i] ?? "").trim().length > 0,
    );
    const setAnswerAt = (i: number, val: string) => {
      const next = answers.slice();
      while (next.length < required) next.push("");
      next[i] = val;
      setAnswers(next);
    };
    const submitBlank = () => {
      const cards: WhiteCard[] = Array.from({ length: required }).map(
        (_, i) => ({
          id: `ans-${round.index}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          text: (answers[i] ?? "").trim(),
        }),
      );
      setSubmittedCards(cards.map((c) => c.id));
      submitCards(cards);
      setAnswers([]);
      setSubmittedRound(round.index);
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
        <section
          aria-label={t.player.round(round.index)}
          className="pt-2 overflow-hidden"
        >
          <div className="rounded-card hairline bg-surface-card p-5 space-y-4">
            {black && <PromptText text={black.text} />}
            <div className="flex items-center justify-between">
              <span className="text-label uppercase text-ink-mute">
                {t.player.picks(required)}
              </span>
              {deadline && view.settings.timeLimitSec > 0 && (
                <div className="w-32">
                  <TimerBar
                    deadline={deadline}
                    totalMs={view.settings.timeLimitSec * 1000}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          aria-label={t.player.yourAnswer}
          className="mt-auto pt-6 pb-2 space-y-3"
        >
          <span className="text-label uppercase text-ink-mute">
            {t.player.writeAnswer(required)}
          </span>
          {Array.from({ length: required }).map((_, i) => (
            <textarea
              key={i}
              value={answers[i] ?? ""}
              onChange={(e) => setAnswerAt(i, e.target.value)}
              placeholder={t.player.answerPlaceholder(i + 1)}
              aria-label={t.player.answerPlaceholder(i + 1)}
              rows={2}
              maxLength={160}
              className="w-full bg-ink text-canvas rounded-card px-4 py-3 text-body placeholder:text-canvas/40 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          ))}
        </section>

        <div className="mt-4">
          <PillButton
            variant="primary"
            size="lg"
            full
            disabled={!blankReady}
            onClick={submitBlank}
          >
            {t.player.submit}
          </PillButton>
        </div>
      </AppFrame>
    );
  }

  const ready = stagedCards.length === required;
  const atCapacity = stagedCards.length >= required;

  const submit = () => {
    setSubmittedCards(stagedCards.map((c) => c.id));
    submitCards(stagedCards);
    clearStaged();
    setSubmittedRound(round.index);
  };

  const toggleStage = (c: WhiteCard) => {
    if (staged.includes(c.id)) unstage(c.id);
    else if (!atCapacity) stage(c.id);
  };

  const scrollRail = (dir: 1 | -1) =>
    railRef.current?.scrollBy({ left: dir * CARD_STEP, behavior: "smooth" });

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
      <section
        aria-label={t.player.round(round.index)}
        className="pt-2 overflow-hidden"
      >
        <div className="rounded-card hairline bg-surface-card p-5 space-y-4">
          {black && <PromptText text={black.text} />}
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-ink-mute">
              {t.player.picks(required)}
            </span>
            {deadline && view.settings.timeLimitSec > 0 && (
              <div className="w-32">
                <TimerBar
                  deadline={deadline}
                  totalMs={view.settings.timeLimitSec * 1000}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Hand carousel */}
      <section aria-label={t.player.yourHand} className="mt-auto pt-6 pb-2">
        <div className="flex items-center justify-between px-1 mb-3">
          <span className="text-label uppercase text-ink-mute">
            {t.player.yourHand}
          </span>
          <span className="text-label uppercase text-ink-mute">
            {t.player.tapToPlay(required)} ·{" "}
            {t.player.submitProgress(stagedCards.length, required)}
          </span>
        </div>

        <div className="relative">
          {/* Desktop-only carousel arrows */}
          <button
            type="button"
            aria-label="‹"
            onClick={() => scrollRail(-1)}
            className="hidden sm:grid absolute left-1 top-1/2 -translate-y-1/2 z-10 size-10 place-items-center rounded-full bg-surface-elevated hairline text-ink active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="›"
            onClick={() => scrollRail(1)}
            className="hidden sm:grid absolute right-1 top-1/2 -translate-y-1/2 z-10 size-10 place-items-center rounded-full bg-surface-elevated hairline text-ink active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Chevron dir="right" />
          </button>

          <div
            ref={railRef}
            className="card-rail flex gap-3 -mx-rail px-rail pb-3 pt-2"
          >
            {hand.map((c) => {
              const isStaged = staged.includes(c.id);
              const order = staged.indexOf(c.id) + 1;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleStage(c)}
                  disabled={!isStaged && atCapacity}
                  aria-pressed={isStaged}
                  aria-label={c.text}
                  className={[
                    "relative shrink-0 rounded-card transition-transform duration-150",
                    "active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    isStaged ? "ring-2 ring-brand -translate-y-2" : "",
                    !isStaged && atCapacity ? "opacity-40" : "",
                  ].join(" ")}
                >
                  <GameCard tone="white">{c.text}</GameCard>
                  {isStaged && required > 1 && (
                    <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-brand text-ink text-label tabular-nums">
                      {order}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="mt-4">
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
    </AppFrame>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  timerOn,
}: {
  title: string;
  subtitle: string;
  accent: boolean;
  players: string;
  cards: string | null;
  deadline: number | null;
  totalMs: number;
  timerOn: boolean;
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
          <span className="display text-display-lg tabular-nums">
            {players}
          </span>
          {cards && (
            <span className="text-label uppercase text-ink-mute tabular-nums">
              {cards}
            </span>
          )}
        </div>

        {deadline && timerOn && (
          <div className="w-48 mt-4">
            <TimerBar deadline={deadline} totalMs={totalMs} />
          </div>
        )}
      </div>
    </AppFrame>
  );
}
