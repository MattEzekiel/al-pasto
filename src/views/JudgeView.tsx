import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { GameCard, PromptText } from "@/components/ui/GameCard";
import { TimerBar } from "@/components/ui/TimerBar";
import { useGameStore, useSelfPlayer } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import { useT } from "@/i18n";

const TIE_BREAK_GRACE_MS = 5_000;

/**
 * Voting Matrix — Judge / Vote View.
 *
 * Anonymous submissions arrive shuffled with author ids stripped. A voter
 * taps a card to flip it (3D rotateY), and taps again to confirm.
 *
 *   - rotate mode    — only the rotating judge picks; everyone else waits.
 *   - everybody mode — every player who played votes; the player's own
 *                      submission (matched locally by card id) is locked.
 *
 * Tie-break / deadline: if the judging deadline passes, the host fires
 * `forceTieBreak` after a 5s grace window — see `lib/host.ts`.
 */
export function JudgeView() {
  const t = useT();
  const view = useGameStore((s) => s.view);
  const pick = useGameStore((s) => s.pick);
  const vote = useGameStore((s) => s.vote);
  const forceTieBreak = useGameStore((s) => s.forceTieBreak);
  const role = useGameStore((s) => s.role);
  const self = useSelfPlayer();
  const flipped = useUIStore((s) => s.flippedSubmissionId);
  const flip = useUIStore((s) => s.flip);
  const submittedCardIds = useUIStore((s) => s.submittedCardIds);
  const [votedRound, setVotedRound] = useState(-1);

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
  const everybody = view.settings.judgeMode === "everybody";
  const isJudge = self.isJudge;
  const expectedVoters = round.anonymous.length;

  // Locally match the player's own submission so they can't vote for it.
  const ownId =
    everybody && submittedCardIds.length > 0
      ? round.anonymous.find(
          (s) =>
            s.cards.length === submittedCardIds.length &&
            s.cards.every((c) => submittedCardIds.includes(c.id)),
        )?.id ?? null
      : null;
  const playedThisRound = submittedCardIds.length > 0;

  /* -------------------- Waiting / spectator screens -------------------- */

  // Rotate mode: non-judges wait for the judge to pick.
  if (!everybody && !isJudge) {
    return (
      <WaitScreen
        title={t.judge.judgingHeader}
        subtitle={t.judge.waiting}
        deadline={round.deadline ? round.deadline + TIE_BREAK_GRACE_MS : null}
        totalMs={view.settings.timeLimitSec * 1000 + TIE_BREAK_GRACE_MS}
        timerOn={view.settings.timeLimitSec > 0}
      />
    );
  }

  // Everybody mode: forfeiters spectate; voters wait once they've voted.
  if (everybody && (!playedThisRound || votedRound === round.index)) {
    return (
      <WaitScreen
        title={t.judge.judgingHeader}
        subtitle={playedThisRound ? t.judge.votedWaiting : t.judge.waiting}
        progress={t.judge.votesProgress(round.voteCount, expectedVoters)}
        deadline={round.deadline ? round.deadline + TIE_BREAK_GRACE_MS : null}
        totalMs={view.settings.timeLimitSec * 1000 + TIE_BREAK_GRACE_MS}
        timerOn={view.settings.timeLimitSec > 0}
      />
    );
  }

  /* -------------------- Active matrix (pick or vote) ------------------- */

  const headerLabel = everybody ? t.judge.voteHeader : t.judge.youAreJudge;
  const tapMeta = everybody ? t.judge.tapToVote : t.judge.tapToPick;
  const footerHint = everybody
    ? t.judge.tapACardToVote
    : flipped
      ? t.judge.tapAgainToConfirm
      : t.judge.tapACardToReveal;

  const confirm = (id: string) => {
    if (everybody) {
      vote(id);
      setVotedRound(round.index);
    } else {
      pick(id);
    }
  };

  return (
    <AppFrame
      header={
        <div className="pt-3 pb-4 flex items-center justify-between">
          <span className="text-label uppercase text-brand">{headerLabel}</span>
          <span className="text-label uppercase text-ink-mute">
            {t.judge.round(round.index)}
          </span>
        </div>
      }
    >
      {/* Prompt */}
      <section aria-label={t.judge.round(round.index)} className="pt-2">
        <div className="rounded-card hairline bg-surface-card p-5">
          {round.blackCard && <PromptText text={round.blackCard.text} />}
        </div>
      </section>

      {/* Matrix */}
      <section
        aria-label={everybody ? t.judge.tapACardToVote : t.judge.tapACardToReveal}
        className="mt-5 grid grid-cols-2 gap-3"
      >
        {round.anonymous.map((sub, idx) => {
          const isFlipped = flipped === sub.id;
          const isOwn = sub.id === ownId;
          const label = isFlipped
            ? sub.cards.map((c) => c.text).join(" + ")
            : t.judge.cardOrdinal(idx + 1);
          return (
            <button
              key={sub.id}
              type="button"
              aria-label={label}
              aria-pressed={isFlipped}
              disabled={isOwn}
              onClick={() => (isFlipped ? confirm(sub.id) : flip(sub.id))}
              className="relative aspect-[3/4] [perspective:1000px] rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 24 }}
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <GameCard tone="black" faceDown>
                    {""}
                  </GameCard>
                </div>
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <GameCard tone="white" meta={isOwn ? undefined : tapMeta}>
                    {sub.cards.map((c) => c.text).join(" + ")}
                  </GameCard>
                </div>
              </motion.div>
            </button>
          );
        })}
      </section>

      <div className="mt-6">
        <PillButton variant="ghost" size="md" full disabled>
          {footerHint}
        </PillButton>
      </div>
    </AppFrame>
  );
}

/** Waiting screen shared across judge/vote idle states. */
function WaitScreen({
  title,
  subtitle,
  progress,
  deadline,
  totalMs,
  timerOn,
}: {
  title: string;
  subtitle: string;
  progress?: string;
  deadline: number | null;
  totalMs: number;
  timerOn: boolean;
}) {
  return (
    <AppFrame>
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 px-rail">
        <span className="text-label uppercase text-ink-mute">{title}</span>
        <p className="display text-display-md max-w-xs">{subtitle}</p>
        {progress && (
          <span className="display text-display-lg tabular-nums mt-1">{progress}</span>
        )}
        {deadline && timerOn && (
          <div className="w-48 mt-4">
            <TimerBar deadline={deadline} totalMs={totalMs} />
          </div>
        )}
      </div>
    </AppFrame>
  );
}
