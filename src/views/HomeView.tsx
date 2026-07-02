import { useState } from "react";
import { PillButton } from "@/components/ui/PillButton";
import { AppFrame } from "@/components/ui/AppFrame";
import { useGameStore } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import { defaultSettings } from "@/lib/host";
import { useT } from "@/i18n";
import type { Locale } from "@/i18n/locale";
import countries from "@/data/countries.json";
import type {
  BlackAuthoring,
  CountryCode,
  GameSettings,
} from "@/types/game";

type Mode = "select" | "create" | "mode" | "join";
type Preset = "blank" | "customBlack" | "mix";

/** Per-locale country registry — drives the picker; data-only to extend. */
const COUNTRIES = countries as Record<Locale, { code: CountryCode; label: string }[]>;

/**
 * Entry point. Create (become host) or join with a code, then the inputs for
 * the chosen path. Create flow: name → game-mode picker (Classic vs Custom) →
 * room. A `joinHint` (from an invite link) skips straight into join mode.
 *
 * All visible copy goes through `useT()` — the locale lives on the UI store
 * and the host's settings carry the chosen deck and game mode.
 */
// Room-code placeholder charset — mirrors the server's codes, minus ambiguous
// glyphs (0/O, 1/I) so the sample reads cleanly.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomCode(len = 8): string {
  let out = "";
  for (let i = 0; i < len; i++) out += randomFrom(CODE_CHARS.split(""));
  return out;
}

/** Assemble GameSettings from the mode picker. */
function buildSettings(
  locale: Locale,
  country: CountryCode | null,
  custom: boolean,
  preset: Preset,
  authoring: BlackAuthoring,
  deckSize: number,
): GameSettings {
  const base = { ...defaultSettings(locale), country };
  if (!custom) return base;
  if (preset === "blank") {
    return { ...base, mode: "custom", whiteCards: "blank", blackCards: "deck" };
  }
  return {
    ...base,
    mode: "custom",
    whiteCards: "blank",
    blackCards: preset === "mix" ? "mix" : "custom",
    blackAuthoring: authoring,
    blackTotal: deckSize,
  };
}

export function HomeView({ joinHint }: { joinHint?: string }) {
  const t = useT();
  const locale = useUIStore((s) => s.locale);
  const [mode, setMode] = useState<Mode>(joinHint ? "join" : "select");
  const [name, setName] = useState("");
  const [room, setRoom] = useState(joinHint ?? "");
  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);

  // Game-mode picker state.
  const [custom, setCustom] = useState(false);
  const [preset, setPreset] = useState<Preset>("blank");
  const [authoring, setAuthoring] = useState<BlackAuthoring>("host");
  const [deckSize, setDeckSize] = useState(10);
  const [country, setCountry] = useState<CountryCode | null>(null);
  const localeCountries = COUNTRIES[locale] ?? [];

  // Randomised once per mount so the placeholders feel fresh, not canned.
  const [namePlaceholder] = useState(() => randomFrom(t.home.namePool));
  const [roomPlaceholder] = useState(() => randomCode());

  const canCreate = name.trim().length >= 2;
  const canJoin = canCreate && room.trim().length >= 8;
  const needsAuthoringChoice = custom && preset !== "blank";

  const create = () =>
    createRoom(
      name.trim(),
      buildSettings(locale, country, custom, preset, authoring, deckSize),
    );

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
              al pasto.<span className="text-brand">_</span>
            </span>
          </h1>
          <p className="text-body text-ink-mute max-w-xs">{t.home.intro}</p>
        </header>

        {mode === "select" && (
          <section className="space-y-3 mt-10">
            <PillButton
              variant="primary"
              size="lg"
              full
              onClick={() => setMode("create")}
            >
              {t.home.createCta}
            </PillButton>
            <PillButton variant="ghost" size="lg" full onClick={() => setMode("join")}>
              {t.home.joinCta}
            </PillButton>
          </section>
        )}

        {(mode === "create" || mode === "join") && (
          <section className="space-y-3 mt-10">
            <label className="block">
              <span className="text-label uppercase text-ink-mute">{t.home.name}</span>
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
                  maxLength={8}
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
                onClick={() => setMode("mode")}
              >
                {t.home.createCta}
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

        {mode === "mode" && (
          <section className="space-y-4 mt-8">
            <span className="text-label uppercase text-ink-mute">{t.mode.title}</span>

            <div className="grid grid-cols-2 gap-2">
              <ModeTile
                active={!custom}
                title={t.mode.classic}
                desc={t.mode.classicDesc}
                onClick={() => setCustom(false)}
              />
              <ModeTile
                active={custom}
                title={t.mode.custom}
                desc={t.mode.customDesc}
                onClick={() => setCustom(true)}
              />
            </div>

            {custom && (
              <div className="space-y-3 rounded-card hairline bg-surface-card p-4">
                <span className="text-label uppercase text-ink-mute">
                  {t.mode.presetTitle}
                </span>
                <PresetRow
                  active={preset === "blank"}
                  title={t.mode.blank}
                  desc={t.mode.blankDesc}
                  onClick={() => setPreset("blank")}
                />
                <PresetRow
                  active={preset === "customBlack"}
                  title={t.mode.customBlack}
                  desc={t.mode.customBlackDesc}
                  onClick={() => setPreset("customBlack")}
                />
                <PresetRow
                  active={preset === "mix"}
                  title={t.mode.mix}
                  desc={t.mode.mixDesc}
                  onClick={() => setPreset("mix")}
                />

                {needsAuthoringChoice && (
                  <>
                    <div className="pt-1">
                      <span className="text-body block mb-2">{t.mode.authoringTitle}</span>
                      <div
                        role="group"
                        aria-label={t.mode.authoringTitle}
                        className="grid grid-cols-2 gap-2 rounded-card bg-canvas hairline p-1"
                      >
                        {(
                          [
                            { v: "host", label: t.mode.authoringHost },
                            { v: "players", label: t.mode.authoringPlayers },
                          ] as const
                        ).map(({ v, label }) => (
                          <button
                            key={v}
                            type="button"
                            aria-pressed={authoring === v}
                            onClick={() => setAuthoring(v)}
                            className={[
                              "h-10 rounded-card text-label uppercase tracking-[0.4px] transition-colors",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                              authoring === v
                                ? "bg-ink text-canvas"
                                : "text-ink-mute hover:text-ink",
                            ].join(" ")}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body">{t.mode.deckSize}</span>
                        <span className="text-body font-semibold tabular-nums">{deckSize}</span>
                      </div>
                      <input
                        type="range"
                        min={6}
                        max={40}
                        step={1}
                        aria-label={t.mode.deckSize}
                        value={deckSize}
                        onChange={(e) => setDeckSize(+e.target.value)}
                        className="w-full accent-ink"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {localeCountries.length > 0 && (
              <div className="space-y-2">
                <span className="text-label uppercase text-ink-mute">
                  {t.mode.countryTitle}
                </span>
                <div
                  role="group"
                  aria-label={t.mode.countryTitle}
                  className="flex flex-wrap gap-2"
                >
                  <CountryPill
                    active={country === null}
                    label={t.mode.countryAll}
                    onClick={() => setCountry(null)}
                  />
                  {localeCountries.map((c) => (
                    <CountryPill
                      key={c.code}
                      active={country === c.code}
                      label={c.label}
                      onClick={() => setCountry(c.code)}
                    />
                  ))}
                </div>
              </div>
            )}

            <PillButton variant="primary" size="lg" full onClick={create}>
              {t.mode.continue}
            </PillButton>
            <button
              type="button"
              onClick={() => setMode("create")}
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

function CountryPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "h-12 px-5 rounded-pill text-label uppercase tracking-[0.4px] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active
          ? "bg-ink text-canvas"
          : "bg-surface-card hairline text-ink-mute hover:text-ink",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ModeTile({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "text-left rounded-card p-4 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active ? "bg-ink text-canvas" : "bg-surface-card hairline text-ink",
      ].join(" ")}
    >
      <span className="display text-display-sm block">{title}</span>
      <span
        className={[
          "text-label mt-1 block leading-snug",
          active ? "text-canvas/70" : "text-ink-mute",
        ].join(" ")}
      >
        {desc}
      </span>
    </button>
  );
}

function PresetRow({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "w-full text-left rounded-card p-3 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        active ? "bg-brand text-ink" : "bg-canvas hairline text-ink",
      ].join(" ")}
    >
      <span className="text-body font-semibold block">{title}</span>
      <span className={["text-label block", active ? "text-ink/70" : "text-ink-mute"].join(" ")}>
        {desc}
      </span>
    </button>
  );
}
