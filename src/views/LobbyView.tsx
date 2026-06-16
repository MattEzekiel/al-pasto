import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { Avatar } from "@/components/ui/Avatar";
import { useGameStore } from "@/store/useGameStore";
import { inviteUrl, renderInviteQR } from "@/lib/qr";
import { useT } from "@/i18n";

/**
 * Pre-game waiting room.
 *
 *   - Top: room code + QR (the only Featured Brand stamp on this screen).
 *   - Mid: settings panel (host-only editable).
 *   - Bottom: player roster with kick affordance per peer (host-only).
 *   - CTA: "Start" — disabled below 3 players.
 */
export function LobbyView() {
  const t = useT();
  const view = useGameStore((s) => s.view);
  const role = useGameStore((s) => s.role);
  const setSettings = useGameStore((s) => s.setSettings);
  const setPrompts = useGameStore((s) => s.setPrompts);
  const start = useGameStore((s) => s.start);
  const kickPlayer = useGameStore((s) => s.kickPlayer);
  const selfId = useGameStore((s) => s.selfId);

  const [qr, setQR] = useState<string | null>(null);
  // Host-authored prompts (host-only editor). Local source of truth; synced
  // into host state via setPrompts for persistence and deck building.
  const [prompts, setPromptDrafts] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    if (!view?.roomId) return;
    let cancelled = false;
    renderInviteQR(inviteUrl(view.roomId)).then((dataUrl) => {
      if (!cancelled) setQR(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [view?.roomId]);

  if (!view) return null;

  const isHost = role === "host";
  const playerCount = view.players.length;

  const isCustom = view.settings.mode === "custom";
  const authoredBlack =
    view.settings.blackCards === "custom" || view.settings.blackCards === "mix";
  const hostAuthors = authoredBlack && view.settings.blackAuthoring === "host";
  const playersAuthor = authoredBlack && view.settings.blackAuthoring === "players";
  const filledPrompts = prompts.filter((p) => p.trim().length > 0).length;

  const syncPrompts = (next: string[]) => {
    setPromptDrafts(next);
    setPrompts(next);
  };
  const setPromptAt = (i: number, val: string) =>
    syncPrompts(prompts.map((p, idx) => (idx === i ? val : p)));
  const addPrompt = () => syncPrompts([...prompts, ""]);

  const canStart =
    isHost && playerCount >= 3 && (!hostAuthors || filledPrompts >= 1);

  return (
    <AppFrame>
      <div className="space-y-6 pt-6">
        <header className="space-y-2">
          <span className="text-label uppercase text-ink-mute">{t.lobby.room}</span>
          <h1 className="display text-display-lg tracking-[-1.2px]">
            {view.roomId}
          </h1>
        </header>

        {/* QR + invite */}
        <section
          aria-label={t.lobby.shareToInvite}
          className="rounded-card hairline bg-surface-card p-5 flex items-center gap-4"
        >
          <div className="size-24 grid place-items-center rounded-card bg-canvas hairline overflow-hidden">
            {qr ? (
              <img src={qr} alt={t.lobby.shareToInvite} className="size-full" />
            ) : (
              <span className="text-ink-mute text-label">QR</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label uppercase text-ink-mute">
              {t.lobby.shareToInvite}
            </p>
            <p className="text-body break-all">
              {typeof window !== "undefined" ? inviteUrl(view.roomId) : ""}
            </p>
          </div>
        </section>

        {/* Settings */}
        <section
          aria-label={t.lobby.settings}
          className="rounded-card hairline bg-surface-card p-5 space-y-4"
        >
          <span className="text-label uppercase text-ink-mute">
            {t.lobby.settings}
          </span>

          <div className="flex items-center justify-between">
            <span className="text-body">{t.lobby.gameMode}</span>
            <span className="text-body font-semibold">
              {isCustom ? t.lobby.modeCustom : t.lobby.modeClassic}
            </span>
          </div>

          <Setting
            label={t.lobby.scoreToWin}
            value={
              view.settings.win.kind === "score"
                ? `${view.settings.win.target}`
                : "—"
            }
          >
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              aria-label={t.lobby.scoreToWin}
              disabled={!isHost}
              value={view.settings.win.kind === "score" ? view.settings.win.target : 7}
              onChange={(e) =>
                setSettings({ win: { kind: "score", target: +e.target.value } })
              }
              className="w-full accent-ink"
            />
          </Setting>

          <TimerSetting
            label={t.lobby.roundTimer}
            seconds={view.settings.timeLimitSec}
            defaultSec={120}
            disabled={!isHost}
            onChange={(timeLimitSec) => setSettings({ timeLimitSec })}
          />

          <TimerSetting
            label={t.lobby.judgeTimer}
            seconds={view.settings.judgeTimeLimitSec}
            defaultSec={60}
            disabled={!isHost}
            onChange={(judgeTimeLimitSec) => setSettings({ judgeTimeLimitSec })}
          />

          <div>
            <span className="text-body block mb-2">{t.lobby.judgeMode}</span>
            <div
              role="group"
              aria-label={t.lobby.judgeMode}
              className="grid grid-cols-2 gap-2 rounded-card bg-canvas hairline p-1"
            >
              {(
                [
                  { mode: "rotate", label: t.lobby.judgeRotate },
                  { mode: "everybody", label: t.lobby.judgeEverybody },
                ] as const
              ).map(({ mode, label }) => {
                const active = view.settings.judgeMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={active}
                    disabled={!isHost}
                    onClick={() => setSettings({ judgeMode: mode })}
                    className={[
                      "h-10 rounded-card text-label uppercase tracking-[0.4px] transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      active
                        ? "bg-ink text-canvas"
                        : "text-ink-mute hover:text-ink disabled:hover:text-ink-mute",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Custom prompts */}
        {isCustom && hostAuthors && isHost && (
          <section
            aria-label={t.lobby.prompts}
            className="rounded-card hairline bg-surface-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-label uppercase text-ink-mute">{t.lobby.prompts}</span>
              {filledPrompts < 1 && (
                <span className="text-label uppercase text-accent-rose">
                  {t.lobby.promptsNeeded(1)}
                </span>
              )}
            </div>
            {prompts.map((val, i) => (
              <textarea
                key={i}
                value={val}
                onChange={(e) => setPromptAt(i, e.target.value)}
                placeholder={t.lobby.promptPlaceholder(i + 1)}
                aria-label={t.lobby.promptPlaceholder(i + 1)}
                rows={2}
                maxLength={160}
                className="w-full bg-canvas hairline rounded-card px-4 py-3 text-body text-ink placeholder:text-ink-faint resize-none focus:outline-none focus-visible:border-ink"
              />
            ))}
            <PillButton variant="ghost" size="sm" onClick={addPrompt}>
              {t.lobby.addPrompt}
            </PillButton>
          </section>
        )}

        {isCustom && playersAuthor && (
          <section className="rounded-card hairline bg-surface-card p-5">
            <p className="text-body text-ink-mute">{t.lobby.customNotice}</p>
          </section>
        )}

        {/* Players */}
        <section aria-label={t.lobby.players(playerCount)} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-ink-mute">
              {t.lobby.players(playerCount)}
            </span>
            {playerCount < 3 && (
              <span className="text-label uppercase text-accent-rose">
                {t.lobby.needMore(3 - playerCount)}
              </span>
            )}
          </div>
          <ul className="rounded-card hairline bg-surface-card divide-y divide-hairline">
            <AnimatePresence initial={false}>
              {view.players.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar
                    name={p.name}
                    ring={p.isHost ? "host" : "hairline"}
                    size={36}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-semibold truncate">
                        {p.name}
                      </span>
                      {p.isHost && (
                        <span className="text-[10px] uppercase tracking-[0.4px] text-ink-mute">
                          {t.lobby.hostBadge}
                        </span>
                      )}
                      {p.id === selfId && (
                        <span className="text-[10px] uppercase tracking-[0.4px] text-brand">
                          {t.lobby.youBadge}
                        </span>
                      )}
                    </div>
                    {!p.connected && (
                      <span className="text-label text-ink-mute">
                        {t.lobby.reconnecting}
                      </span>
                    )}
                  </div>
                  {isHost && p.id !== selfId && (
                    <PillButton
                      variant="danger"
                      size="sm"
                      aria-label={`${t.lobby.kick} ${p.name}`}
                      onClick={() => kickPlayer(p.id)}
                    >
                      {t.lobby.kick}
                    </PillButton>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>

        {/* Start CTA */}
        <div className="pt-2 pb-6">
          <PillButton
            variant="primary"
            size="lg"
            full
            disabled={!canStart}
            onClick={start}
          >
            {isHost ? t.lobby.start : t.lobby.waiting}
          </PillButton>
        </div>
      </div>
    </AppFrame>
  );
}

function Setting({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-body">{label}</span>
        <span className="text-body font-semibold tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

/** Human-readable duration: "45s", "2 min", "1:30", or "No time" at 0. */
function formatDuration(sec: number, t: ReturnType<typeof useT>): string {
  if (sec <= 0) return t.lobby.noTime;
  if (sec < 60) return t.lobby.secondsSuffix(sec);
  if (sec % 60 === 0) return t.lobby.minutesSuffix(sec / 60);
  return t.lobby.clockSuffix(Math.floor(sec / 60), sec % 60);
}

/**
 * A duration slider (0–10 min) paired with a "No time" switch. Storing 0
 * means no limit; the switch toggles between 0 and `defaultSec` so flipping
 * it back restores a sensible value instead of the slider minimum.
 */
function TimerSetting({
  label,
  seconds,
  defaultSec,
  disabled,
  onChange,
}: {
  label: string;
  seconds: number;
  defaultSec: number;
  disabled: boolean;
  onChange: (sec: number) => void;
}) {
  const t = useT();
  const noTime = seconds <= 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-body">{label}</span>
        <span className="text-body font-semibold tabular-nums">
          {formatDuration(seconds, t)}
        </span>
      </div>
      <input
        type="range"
        min={30}
        max={600}
        step={30}
        aria-label={label}
        disabled={disabled || noTime}
        value={noTime ? defaultSec : seconds}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-ink disabled:opacity-40"
      />
      <label className="mt-2 flex items-center justify-between">
        <span className="text-label uppercase text-ink-mute">{t.lobby.noTime}</span>
        <button
          type="button"
          role="switch"
          aria-checked={noTime}
          aria-label={t.lobby.noTime}
          disabled={disabled}
          onClick={() => onChange(noTime ? defaultSec : 0)}
          className={[
            "relative h-6 w-11 rounded-pill transition-colors disabled:opacity-40",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            noTime ? "bg-ink" : "bg-surface-elevated hairline",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 size-5 rounded-full transition-transform",
              noTime ? "translate-x-[22px] bg-canvas" : "translate-x-0.5 bg-ink",
            ].join(" ")}
          />
        </button>
      </label>
    </div>
  );
}
