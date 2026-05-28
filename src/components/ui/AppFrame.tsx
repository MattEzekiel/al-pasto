import type { ReactNode } from "react";

/**
 * The single layout primitive every view sits inside. Locks the app to
 * the mobile viewport (max-w-md), respects safe-area insets, and gives
 * every screen the same vertical rhythm.
 */
export function AppFrame({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] text-ink flex flex-col">
      <div
        className="mx-auto w-full max-w-lg flex-1 flex flex-col"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
        }}
      >
        {header && <div className="px-rail">{header}</div>}
        <main className="flex-1 flex flex-col px-rail">{children}</main>
        {footer && (
          <div className="px-rail pt-3 hairline border-x-0 border-b-0">{footer}</div>
        )}
      </div>
    </div>
  );
}
