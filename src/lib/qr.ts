import QRCode from "qrcode";

/**
 * Render a high-contrast QR for an invite URL. We keep the colors locked
 * to canvas-on-ink so the result reads correctly inside dark surfaces.
 */
export async function renderInviteQR(
  url: string,
  sizePx = 256,
): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: sizePx,
    color: {
      dark: "#ffffff",
      light: "#00000000",
    },
  });
}

export function inviteUrl(roomId: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://al-pasto.vercel.app/";
  return `${origin}/?room=${encodeURIComponent(roomId)}`;
}
