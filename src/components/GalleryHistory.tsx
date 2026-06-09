import { TGalleryItem } from "@/types/studio";
import Image from "next/image";

type Props = {
  gallery: TGalleryItem[];
  handleTweak: (item: TGalleryItem) => void;
};

export default function GalleryHistory({ gallery, handleTweak }: Props) {
  return (
    <div className="dim-card">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ color: "var(--bone)", fontSize: "0.9375rem", fontWeight: 500 }}>
          Generation Ledger
        </h2>
        {gallery.length > 0 && (
          <span
            style={{
              color: "var(--fog)",
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {gallery.length} {gallery.length === 1 ? "asset" : "assets"}
          </span>
        )}
      </div>

      {gallery.length === 0 ? (
        <p style={{ color: "var(--fog)", fontSize: "0.75rem", textAlign: "center", padding: "16px 0" }}>
          No assets in history.
        </p>
      ) : (
        /* ── Horizontal Scrolling Tray ─────────────────────────────────────── */
        <div
          className="dim-scroll"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group"
              style={{
                flex: "none",
                width: "168px",
                background: "var(--void)",
                border: "1px solid var(--hairline)",
                borderRadius: "16px",
                padding: "10px",
                position: "relative",
                cursor: "pointer",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--hairline-focus)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--hairline)";
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "120px",
                  marginBottom: "8px",
                  overflow: "hidden",
                  borderRadius: "10px",
                  background: "var(--ink)",
                }}
              >
                <Image
                  src={item.image.url}
                  alt="History thumbnail"
                  fill
                  className="object-cover"
                  unoptimized={item.image.url.startsWith('data:') || item.image.url.startsWith('http')}
                />
              </div>

              {/* Prompt snippet */}
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--fog)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "8px",
                }}
              >
                &quot;{item.prompt}&quot;
              </p>

              {/* Hover: Load Tweak button */}
              <button
                onClick={() => handleTweak(item)}
                className="dim-btn-primary w-full py-1.5"
                style={{
                  fontSize: "0.6875rem",
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0")}
              >
                Load Settings
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}