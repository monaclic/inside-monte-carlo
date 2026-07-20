import { ImageResponse } from "next/og";

export const alt = "Inside Monte-Carlo, les histoires que Monaco ne raconte pas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "#f4f1e9",
          color: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 3, textTransform: "uppercase" }}>
          Inside Monte-Carlo
        </div>
        <div style={{ display: "flex", fontFamily: "serif", fontSize: 92, lineHeight: 1.05, maxWidth: 920 }}>
          Les histoires que Monaco ne raconte pas.
        </div>
        <div style={{ background: "#a88a4b", display: "flex", height: 8, width: 180 }} />
      </div>
    ),
    size,
  );
}
