import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { PillButton } from "@/components/ui/PillButton";
import { Avatar } from "@/components/ui/Avatar";
import { useGameStore } from "@/store/useGameStore";
import { inviteUrl, renderInviteQR } from "@/lib/qr";

/**
 * Pre-game waiting room.
 *
 *   - Top: room code + QR (the only Featured Brand stamp on this screen).
 *   - Mid: settings panel (host-only editable).
 *   - Bottom: player roster with kick affordance per peer (host-only).
 *   - CTA: "Start" — disabled below 3 players.
 */
export function LobbyView() {
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
          <span className="text-label uppercase text-ink-mute">Sala</span>
          <h1 className="display text-display-lg tracking-[-1.2px]">
            {view.roomId}
          </h1>
        </header>

        {/* QR + invite */}
        <section className="rounded-card hairline bg-surface-card p-5 flex items-center gap-4">
          <div className="size-24 grid place-items-center rounded-card bg-canvas hairline overflow-hidden">
            {qr ? (
              <img src={qr} alt="QR de invitación" className="size-full" />
            ) : (
              <span className="text-ink-mute text-label">QR</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label uppercase text-ink-mute">Compartí para invitar</p>
            <p className="text-body break-all">
              {typeof window !== "undefined" ? inviteUrl(view.roomId) : ""}
            </p>
          </div>
        </section>

        {/* Settings */}
        <section className="rounded-card hairline bg-surface-card p-5 space-y-4">
          <span className="text-label uppercase text-ink-mute">Ajustes</span>

          <Setting
            label="Puntos para ganar"
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
              disabled={!isHost}
              value={view.settings.win.kind === "score" ? view.settings.win.target : 7}
              onChange={(e) =>
                setSettings({ win: { kind: "score", target: +e.target.value } })
              }
              className="w-full accent-ink"
            />
          </Setting>

          <Setting
            label="Tiempo por ronda"
            value={
              view.settings.timeLimitSec
                ? `${view.settings.timeLimitSec}s`
                : "Sin límite"
            }
          >
            <input
              type="range"
              min={0}
              max={120}
              step={15}
              disabled={!isHost}
              value={view.settings.timeLimitSec}
              onChange={(e) => setSettings({ timeLimitSec: +e.target.value })}
              className="w-full accent-ink"
            />
          </Setting>
        </section>

        {/* Players */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-ink-mute">
              Jugadores ({playerCount})
            </span>
            {playerCount < 3 && (
              <span className="text-label uppercase text-accent-rose">
                Faltan {3 - playerCount}
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
                          anfitrión
                        </span>
                      )}
                      {p.id === selfId && (
                        <span className="text-[10px] uppercase tracking-[0.4px] text-brand">
                          vos
                        </span>
                      )}
                    </div>
                    {!p.connected && (
                      <span className="text-label text-ink-mute">reconectando…</span>
                    )}
                  </div>
                  {isHost && p.id !== selfId && (
                    <PillButton
                      variant="danger"
                      size="sm"
                      onClick={() => kickPlayer(p.id)}
                    >
                      Echar
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
            {isHost ? "Empezar la partida" : "Esperando al anfitrión…"}
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
