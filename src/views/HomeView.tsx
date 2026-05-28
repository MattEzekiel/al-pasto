import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { AppFrame } from "@/components/ui/AppFrame";
import { useGameStore } from "@/store/useGameStore";
import { defaultSettings } from "@/lib/host";

/**
 * Entry point. Two paths: create a room (become host) or join with a code.
 * The brand voice lives here at full volume — display-xxl headline,
 * "off-the-record" subtitle, single white pill primary CTA.
 */
export function HomeView({ joinHint }: { joinHint?: string }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState(joinHint ?? "");
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);

  const canCreate = name.trim().length >= 2;
  const canJoin = canCreate && room.trim().length >= 4;

  return (
    <AppFrame>
      <div className="flex-1 flex flex-col justify-between pt-12 pb-8">
        <header className="space-y-3">
          <span className="text-label text-ink-mute uppercase">
            El juego de cartas extraoficial
          </span>
          <h1 className="display text-display-xxl">
            corta.<span className="text-brand">_</span>
          </h1>
          <p className="text-body text-ink-mute max-w-xs">
            Multijugador. Sin cuentas. Nada sale del cuarto. El anfitrión corre la
            partida desde su propio celular — cerraste la pestaña, se terminó.
          </p>
        </header>

        <section className="space-y-3">
          <label className="block">
            <span className="text-label uppercase text-ink-mute">Tu nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mati"
              className="mt-2 w-full h-12 bg-surface-card hairline rounded-card px-4 text-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="text-label uppercase text-ink-mute">Código de sala</span>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value.toUpperCase())}
              placeholder="4F2K"
              className="mt-2 w-full h-12 bg-surface-card hairline rounded-card px-4 text-body text-ink placeholder:text-ink-faint tracking-[0.4em] uppercase focus:outline-none focus:border-ink"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <PillButton
              variant="ghost"
              size="lg"
              disabled={!canJoin}
              onClick={() => joinRoom(room.trim(), name.trim())}
            >
              Entrar
            </PillButton>
            <PillButton
              variant="primary"
              size="lg"
              disabled={!canCreate}
              onClick={() => createRoom(name.trim(), defaultSettings())}
            >
              Crear sala
            </PillButton>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
