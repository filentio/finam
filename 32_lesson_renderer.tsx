import React from "react";
import type { LessonAsset, LessonScreen } from "./30_lessons_schema";
import { IS_DEV } from "./24_env";
import { validateLessonScreen } from "./31_lessons_validate";

export function LessonScreenRenderer(props: { screen: LessonScreen; assetBaseUrl?: string }) {
  const v = validateLessonScreen(props.screen);
  if (!v.ok) {
    if (IS_DEV) {
      throw new Error(v.reason);
    }
    return (
      <div style={styles.card}>
        <h2 style={styles.h2}>Произошла ошибка</h2>
        <div style={styles.p}>Мы не смогли отобразить экран урока.</div>
      </div>
    );
  }

  const screen = props.screen;
  const assets = screen.assets ?? [];

  return (
    <div style={styles.card}>
      {screen.title ? <div style={styles.title}>{screen.title}</div> : null}
      {screen.body ? <div style={styles.p}>{screen.body}</div> : null}

      <RenderAssets assets={assets} assetBaseUrl={props.assetBaseUrl} />

      <div style={styles.body}>
        <ScreenBody screen={screen} />
      </div>
    </div>
  );
}

function ScreenBody(props: { screen: LessonScreen }) {
  const s = props.screen;
  switch (s.type) {
    case "intro": {
      const p = s.payload;
      return (
        <div>
          {p.subtitle ? <div style={styles.kicker}>{p.subtitle}</div> : null}
          {p.description ? <div style={styles.p}>{p.description}</div> : null}
          {p.heroIcon ? <div style={styles.note}>Иконка: {p.heroIcon}</div> : null}
        </div>
      );
    }
    case "content": {
      return (
        <div>
          {s.payload.paragraphs.map((t, i) => (
            <div key={i} style={styles.p}>
              {t}
            </div>
          ))}
        </div>
      );
    }
    case "cards": {
      return (
        <div style={styles.cards}>
          {s.payload.cards.map((c, i) => (
            <div key={i} style={styles.cardItem}>
              <div style={styles.cardTitle}>{c.title}</div>
              <div style={styles.cardText}>{c.text}</div>
              {c.icon ? <div style={styles.note}>Иконка: {c.icon}</div> : null}
            </div>
          ))}
        </div>
      );
    }
    case "checklist": {
      return (
        <ul style={styles.ul}>
          {s.payload.items.map((t, i) => (
            <li key={i} style={styles.li}>
              {t}
            </li>
          ))}
        </ul>
      );
    }
    case "quote": {
      return (
        <div style={styles.quoteBox}>
          <div style={styles.quoteText}>{s.payload.quote}</div>
          {s.payload.author ? <div style={styles.quoteAuthor}>{s.payload.author}</div> : null}
        </div>
      );
    }
    case "myth_reality": {
      return (
        <div style={styles.split}>
          <div style={styles.splitItem}>
            <div style={styles.kicker}>Миф</div>
            <div style={styles.p}>{s.payload.myth}</div>
          </div>
          <div style={styles.splitItem}>
            <div style={styles.kicker}>Реальность</div>
            <div style={styles.p}>{s.payload.reality}</div>
          </div>
        </div>
      );
    }
    case "selection": {
      return (
        <div style={styles.cards}>
          {s.payload.options.map((o) => (
            <div key={o.id} style={styles.cardItem}>
              <div style={styles.cardTitle}>{o.label}</div>
              {o.description ? <div style={styles.cardText}>{o.description}</div> : null}
            </div>
          ))}
        </div>
      );
    }
    case "interactive_choice": {
      return (
        <div>
          <div style={styles.p}>{s.payload.question}</div>
          <div style={styles.cards}>
            {s.payload.options.map((o) => (
              <div key={o.id} style={styles.cardItem}>
                <div style={styles.cardTitle}>{o.label}</div>
                {o.description ? <div style={styles.cardText}>{o.description}</div> : null}
              </div>
            ))}
          </div>
          {s.payload.correctOptionId ? <div style={styles.note}>Correct: {s.payload.correctOptionId}</div> : null}
        </div>
      );
    }
    case "quest": {
      return (
        <ol style={styles.ol}>
          {s.payload.steps.map((t, i) => (
            <li key={i} style={styles.li}>
              {t}
            </li>
          ))}
        </ol>
      );
    }
    case "bonus": {
      return (
        <div>
          <div style={styles.cardTitle}>{s.payload.title}</div>
          <ul style={styles.ul}>
            {s.payload.bullets.map((t, i) => (
              <li key={i} style={styles.li}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "multi_cta": {
      return (
        <div style={styles.ctaCol}>
          {s.payload.ctas.map((c, i) => (
            <a key={i} href={c.link} style={c.style === "secondary" ? styles.ctaSecondary : styles.ctaPrimary}>
              {c.label}
            </a>
          ))}
        </div>
      );
    }
    case "cta": {
      return (
        <div style={styles.ctaCol}>
          {s.payload.note ? <div style={styles.note}>{s.payload.note}</div> : null}
          <a href={s.payload.link} style={styles.ctaPrimary}>
            {s.payload.label}
          </a>
        </div>
      );
    }
    case "completion": {
      return (
        <div>
          <div style={styles.p}>{s.payload.summary}</div>
          {s.payload.nextCta ? (
            <div style={styles.ctaCol}>
              <a href={s.payload.nextCta.link} style={styles.ctaPrimary}>
                {s.payload.nextCta.label}
              </a>
            </div>
          ) : null}
        </div>
      );
    }
    default: {
      if (IS_DEV) {
        throw new Error(`Unsupported LessonScreen type: ${(s as any).type}`);
      }
      return <div style={styles.p}>Неподдерживаемый тип экрана.</div>;
    }
  }
}

function RenderAssets(props: { assets: LessonAsset[]; assetBaseUrl?: string }) {
  if (!props.assets.length) return null;
  return (
    <div style={styles.assets}>
      {props.assets.map((a, i) => {
        if (a.type === "image") {
          return <img key={i} src={resolveAssetUrl(a.src, props.assetBaseUrl)} alt={a.alt} style={styles.assetImg} loading="lazy" />;
        }
        // icon is rendered like image for now (no final design on this stage).
        return <img key={i} src={resolveAssetUrl(a.src, props.assetBaseUrl)} alt={a.alt} style={styles.assetIcon} loading="lazy" />;
      })}
    </div>
  );
}

function resolveAssetUrl(src: string, assetBaseUrl?: string): string {
  if (!assetBaseUrl) return src;
  if (!src.startsWith("assets/")) return src;
  const base = assetBaseUrl.endsWith("/") ? assetBaseUrl : `${assetBaseUrl}/`;
  return `${base}${src}`;
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E5E7EB", background: "#FFF", borderRadius: 16, padding: 16 },
  title: { marginBottom: 8, fontSize: 18, fontWeight: 700, color: "#111827" },
  h2: { margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 700, color: "#111827" },
  body: { marginTop: 8 },
  kicker: { fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 6 },
  p: { margin: "8px 0", color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" },
  note: { marginTop: 8, fontSize: 12, color: "#6B7280" },
  assets: { marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  assetImg: { width: "100%", maxWidth: 720, borderRadius: 12, border: "1px solid #E5E7EB" },
  assetIcon: { width: 40, height: 40 },
  cards: { display: "grid", gridTemplateColumns: "1fr", gap: 10 },
  cardItem: { border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, background: "#FFF" },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 },
  cardText: { fontSize: 13, color: "#374151", lineHeight: 1.4, whiteSpace: "pre-wrap" },
  ul: { margin: "8px 0", paddingLeft: 18 },
  ol: { margin: "8px 0", paddingLeft: 18 },
  li: { margin: "6px 0", color: "#374151", lineHeight: 1.4 },
  split: { display: "grid", gridTemplateColumns: "1fr", gap: 12 },
  splitItem: { border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, background: "#FFF" },
  quoteBox: { borderLeft: "3px solid #F5A623", paddingLeft: 12, marginTop: 8 },
  quoteText: { fontSize: 14, color: "#111827", lineHeight: 1.5, whiteSpace: "pre-wrap" },
  quoteAuthor: { marginTop: 6, fontSize: 12, color: "#6B7280" },
  ctaCol: { display: "flex", flexDirection: "column", gap: 10, marginTop: 12 },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    padding: "0 16px",
    background: "#F5A623",
    color: "#111827",
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid #F5A623",
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    padding: "0 16px",
    background: "#FFF",
    color: "#111827",
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid #E5E7EB",
  },
};

