import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { AppFrame } from "@/components/ui/AppFrame";
import { useGameStore } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import { defaultSettings } from "@/lib/host";
import { useT } from "@/i18n";

type Mode = "select" | "create" | "join";

/**
 * Entry point. First a fork — create a room (become host) or join with a
 * code — then the inputs for the chosen path. A `joinHint` (from an invite
 * link) skips the fork straight into join mode.
 *
 * All visible copy goes through `useT()` — the locale lives on the UI store
 * and the host's settings carry the chosen deck.
 */
// Room-code placeholder charset — mirrors the server's 4-char codes,
// minus ambiguous glyphs (0/O, 1/I) so the sample reads cleanly.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomCode(len = 4): string {
  let out = "";
  for (let i = 0; i < len; i++) out += randomFrom(CODE_CHARS.split(""));
  return out;
}

export function HomeView({ joinHint }: { joinHint?: string }) {
  const t = useT();
  const locale = useUIStore((s) => s.locale);
  const [mode, setMode] = useState<Mode>(joinHint ? "join" : "select");
  const [name, setName] = useState("");
  const [room, setRoom] = useState(joinHint ?? "");
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);

  // Randomised once per mount so the placeholders feel fresh, not canned.
  const [namePlaceholder] = useState(() => randomFrom(t.home.namePool));
  const [roomPlaceholder] = useState(() => randomCode());

  const canCreate = name.trim().length >= 2;
  const canJoin = canCreate && room.trim().length >= 4;

  return (
    <AppFrame>
      <div className="flex-1 flex flex-col justify-between pt-12 pb-8">
        <header className="space-y-3">
          <span className="text-label text-ink-mute uppercase">
            {t.app.tagline}
          </span>
          <h1 className="display text-display-xxl">
            <span className="sr-only">{t.app.name}</span>
            <span aria-hidden>
              corta.<span className="text-brand">_</span>
            </span>
          </h1>
          <p className="text-body text-ink-mute max-w-xs">{t.home.intro}</p>
        </header>

        {mode === "select" ? (
          <section className="space-y-3 mt-10">
            <PillButton
              variant="primary"
              size="lg"
              full
              onClick={() => setMode("create")}
            >
              {t.home.createCta}
            </PillButton>
            <PillButton
              variant="ghost"
              size="lg"
              full
              onClick={() => setMode("join")}
            >
              {t.home.joinCta}
            </PillButton>
          </section>
        ) : (
          <section className="space-y-3 mt-10">
            <label className="block">
              <span className="text-label uppercase text-ink-mute">
                {t.home.name}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                aria-label={t.home.name}
                autoComplete="nickname"
                autoFocus
                maxLength={24}
                className="mt-2 w-full h-12 bg-surface-card hairline rounded-card px-4 text-body text-ink placeholder:text-ink-faint focus:outline-none focus-visible:border-ink"
              />
            </label>

            {mode === "join" && (
              <label className="block">
                <span className="text-label uppercase text-ink-mute">
                  {t.home.roomCode}
                </span>
                <input
                  value={room}
                  onChange={(e) => setRoom(e.target.value.toUpperCase())}
                  placeholder={roomPlaceholder}
                  aria-label={t.home.roomCode}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={6}
                  inputMode="text"
                  className="mt-2 w-full h-12 bg-surface-card hairline rounded-card px-4 text-body text-ink placeholder:text-ink-faint tracking-[0.4em] uppercase focus:outline-none focus-visible:border-ink"
                />
              </label>
            )}

            {mode === "create" ? (
              <PillButton
                variant="primary"
                size="lg"
                full
                disabled={!canCreate}
                onClick={() => createRoom(name.trim(), defaultSettings(locale))}
              >
                {t.home.host}
              </PillButton>
            ) : (
              <PillButton
                variant="primary"
                size="lg"
                full
                disabled={!canJoin}
                onClick={() => joinRoom(room.trim(), name.trim())}
              >
                {t.home.join}
              </PillButton>
            )}

            <button
              type="button"
              onClick={() => setMode("select")}
              className="block w-full text-center text-label uppercase text-ink-mute py-3 focus:outline-none focus-visible:text-ink"
            >
              {t.home.back}
            </button>
          </section>
        )}
      </div>
    </AppFrame>
  );
}
