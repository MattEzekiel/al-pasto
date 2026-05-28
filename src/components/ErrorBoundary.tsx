import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Catches render-time exceptions so a thrown view becomes a readable
 * message instead of a blank screen. There is no router to fall back to —
 * the whole app is one tree — so a swallowed throw used to wipe everything
 * to black. This surfaces the error (and logs it) instead.
 */
interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the full detail in the console for debugging.
    console.error("[corta] render crash:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-[100dvh] flex flex-col justify-center gap-4 px-rail max-w-md mx-auto text-ink">
        <span className="text-label uppercase text-accent-rose">Something broke</span>
        <p className="display text-display-sm">{error.message}</p>
        {error.stack && (
          <pre className="text-body-sm text-ink-mute whitespace-pre-wrap overflow-auto max-h-64">
            {error.stack}
          </pre>
        )}
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="h-12 rounded-pill bg-ink text-canvas font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }
}
