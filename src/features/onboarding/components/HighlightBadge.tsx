interface HighlightBadgeProps {
  text?: string;
}

export function HighlightBadge({ text = "Вас интересует" }: HighlightBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        background: "rgba(255,255,255,0.24)",
        color: "#ffffff",
        fontSize: 12,
        padding: "4px 8px",
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}
