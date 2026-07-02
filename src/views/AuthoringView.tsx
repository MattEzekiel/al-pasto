import { useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { useT } from "@/i18n";
import { useGameStore } from "@/store/useGameStore";

/**
 * Authoring phase — custom/mix black source with "players" authoring. Every
 * connected player writes their even share of prompts (`authoringQuota`); the
 * host builds the deck and starts the first round once everyone is in.
 *
 * Prompt text never leaves this device until the host deals it as a round's
 * prompt — the broadcast carries only counts.
 */
export function AuthoringView() {
  const t = useT();
  const view = useGameStore((s) => s.view);
  const authorBlack = useGameStore((s) => s.authorBlack);

  const quota = Math.max(1, view?.authoringQuota ?? 1);
  const [drafts, setDrafts] = useState<string[]>(() => Array(quota).fill(""));
  const [sent, setSent] = useState(false);

  if (!view) return null;

  const expected = view.players.filter((p) => p.connected).length;
  const done = view.authoredCount;

  if (sent) {
    return (
      <AppFrame>
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 px-rail">
          <span className="text-label uppercase text-ink-mute">
            {t.authoring.header}
          </span>
          <p className="display text-display-md max-w-xs">
            {t.authoring.waiting}
          </p>
          <span className="display text-display-lg tabular-nums mt-1">
            {t.authoring.progress(done, expected)}
          </span>
        </div>
      </AppFrame>
    );
  }

  const filled = drafts.filter((d) => d.trim().length > 0).length;
  const ready = filled >= 1;

  const send = () => {
    authorBlack(drafts);
    setSent(true);
  };

  const setAt = (i: number, val: string) =>
    setDrafts((d) => d.map((x, idx) => (idx === i ? val : x)));

  return (
    <AppFrame
      header={
        <div className="pt-3 pb-4 flex items-center justify-between">
          <span className="text-label uppercase text-brand">
            {t.authoring.header}
          </span>
          <span className="text-label uppercase text-ink-mute tabular-nums">
            {t.authoring.progress(done, expected)}
          </span>
        </div>
      }
    >
      <div className="pt-2 space-y-3">
        <p className="text-body text-ink-mute">{t.authoring.hint(quota)}</p>
        {drafts.map((val, i) => (
          <textarea
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size slot list; index is the identity
            key={i}
            value={val}
            onChange={(e) => setAt(i, e.target.value)}
            placeholder={t.authoring.placeholder(i + 1)}
            aria-label={t.authoring.placeholder(i + 1)}
            rows={2}
            maxLength={160}
            className="w-full bg-surface-card hairline rounded-card px-4 py-3 text-body text-ink placeholder:text-ink-faint resize-none focus:outline-none focus-visible:border-ink"
          />
        ))}
      </div>

      <div className="mt-auto pt-6 pb-2">
        <PillButton
          variant="primary"
          size="lg"
          full
          disabled={!ready}
          onClick={send}
        >
          {t.authoring.submit}
        </PillButton>
      </div>
    </AppFrame>
  );
}
