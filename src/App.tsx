import { useEffect, useMemo, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { useUIStore } from "@/store/useUIStore";
import { HomeView } from "@/views/HomeView";
import { LobbyView } from "@/views/LobbyView";
import { GameplayView } from "@/views/GameplayView";
import { JudgeView } from "@/views/JudgeView";
import { RevealView } from "@/views/RevealView";
import { WinnerView } from "@/views/WinnerView";

/**
 * Phase-driven router. There is no URL routing inside the game — the
 * authoritative state.phase determines what the player sees, and that
 * matches the Host-as-server contract: routing logic that lived on the
 * server in a normal app lives in the broadcast state here.
 */
type Screen = "home" | "lobby" | "player" | "judge" | "reveal" | "winner";

function pickScreen(phase: string | undefined, hasRoom: boolean): Screen {
  if (!hasRoom) return "home";
  switch (phase) {
    case "lobby":
      return "lobby";
    case "submission":
      return "player";
    case "judging":
      return "judge";
    case "reveal":
    case "round-end":
      return "reveal";
    case "game-over":
      return "winner";
    default:
      return "lobby";
  }
}

const SCREENS: Record<Screen, () => ReactNode> = {
  home: () => <HomeView joinHint={readJoinHint() ?? undefined} />,
  lobby: () => <LobbyView />,
  player: () => <GameplayView />,
  judge: () => <JudgeView />,
  reveal: () => <RevealView />,
  winner: () => <WinnerView />,
};

function readJoinHint(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  return p.get("room");
}

export default function App() {
  const view = useGameStore((s) => s.view);
  const hasRoom = !!useGameStore((s) => s.roomId);
  const toasts = useUIStore((s) => s.toasts);

  const screen = useMemo(() => pickScreen(view?.phase, hasRoom), [view?.phase, hasRoom]);

  // Clean URL once the room is in-flight so a refresh hits Home cleanly.
  useEffect(() => {
    if (!hasRoom) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("room")) {
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
    }
  }, [hasRoom]);

  const Screen = SCREENS[screen];

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {Screen()}
        </motion.div>
      </AnimatePresence>

      {/* Toast tray */}
      <div className="fixed top-3 inset-x-0 mx-auto max-w-md px-rail flex flex-col gap-2 pointer-events-none z-50">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={[
                "pointer-events-auto rounded-card hairline bg-surface-card px-4 py-3",
                "text-body",
                t.kind === "danger" && "border-accent-rose text-accent-rose",
                t.kind === "warn" && "border-accent-amber text-accent-amber",
                t.kind === "success" && "border-accent-teal text-accent-teal",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
