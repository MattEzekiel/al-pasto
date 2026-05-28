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
  const start = useGameStore((s) => s.start);
  const kickPlayer = useGameStore((s) => s.kickPlayer);
  const selfId = useGameStore((s) => s.selfId);

  const [qr, setQR] = useState<string | null>(null);

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
  const canStart = isHost && playerCount >= 3;

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

          <Setting
            label={t.lobby.roundTimer}
            value={
              view.settings.timeLimitSec
                ? t.lobby.secondsSuffix(view.settings.timeLimitSec)
                : t.lobby.timerOff
            }
          >
            <input
              type="range"
              min={0}
              max={120}
              step={15}
              aria-label={t.lobby.roundTimer}
              disabled={!isHost}
              value={view.settings.timeLimitSec}
              onChange={(e) => setSettings({ timeLimitSec: +e.target.value })}
              className="w-full accent-ink"
            />
          </Setting>

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
