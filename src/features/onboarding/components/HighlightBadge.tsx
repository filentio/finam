interface HighlightBadgeProps {
  text?: string;
}

export function HighlightBadge({ text = "Вас интересует" }: HighlightBadgeProps) {
  return <span className="ob-highlight-badge">{text}</span>;
}
