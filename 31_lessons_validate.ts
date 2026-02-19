import type { LessonScreen, LessonScreenId } from "./30_lessons_schema";
import { IS_DEV } from "./24_env";

export type LessonScreenValidationResult = { ok: true } | { ok: false; reason: string };

function fail(reason: string): LessonScreenValidationResult {
  if (IS_DEV) {
    throw new Error(reason);
  }
  return { ok: false, reason };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export function validateLessonScreen(screen: unknown): LessonScreenValidationResult {
  if (!screen || typeof screen !== "object") return fail("LessonScreen must be an object.");
  const s = screen as any;

  if (!isNonEmptyString(s.id)) return fail("LessonScreen.id must be a non-empty string.");
  const id = s.id as LessonScreenId;
  if (!isNonEmptyString(s.type)) return fail(`LessonScreen.type must be a non-empty string. id=${id}`);

  if (s.title != null && typeof s.title !== "string") return fail(`LessonScreen.title must be a string if present. id=${id}`);
  if (s.body != null && typeof s.body !== "string") return fail(`LessonScreen.body must be a string if present. id=${id}`);

  if (s.assets != null) {
    if (!Array.isArray(s.assets)) return fail(`LessonScreen.assets must be an array if present. id=${id}`);
    for (const a of s.assets) {
      if (!a || typeof a !== "object") return fail(`LessonScreen.assets item must be an object. id=${id}`);
      if (a.type !== "image" && a.type !== "icon") return fail(`LessonAsset.type must be image|icon. id=${id}`);
      if (!isNonEmptyString(a.src)) return fail(`LessonAsset.src must be a non-empty string. id=${id}`);
      if (typeof a.alt !== "string") return fail(`LessonAsset.alt must be a string. id=${id}`);
    }
  }

  if (s.payload == null || typeof s.payload !== "object") return fail(`LessonScreen.payload must be an object. id=${id}`);

  const type = s.type as LessonScreen["type"];
  const p = s.payload as any;

  switch (type) {
    case "intro": {
      if (p.subtitle != null && typeof p.subtitle !== "string") return fail(`intro.subtitle must be string. id=${id}`);
      if (p.description != null && typeof p.description !== "string") return fail(`intro.description must be string. id=${id}`);
      if (p.heroIcon != null && typeof p.heroIcon !== "string") return fail(`intro.heroIcon must be string. id=${id}`);
      return { ok: true };
    }
    case "content": {
      if (!isStringArray(p.paragraphs) || p.paragraphs.length < 1) return fail(`content.paragraphs must be non-empty string[]. id=${id}`);
      return { ok: true };
    }
    case "cards": {
      if (!Array.isArray(p.cards) || p.cards.length < 1) return fail(`cards.cards must be non-empty array. id=${id}`);
      for (const c of p.cards) {
        if (!c || typeof c !== "object") return fail(`cards.cards item must be an object. id=${id}`);
        if (!isNonEmptyString(c.title)) return fail(`cards.cards.title must be non-empty string. id=${id}`);
        if (!isNonEmptyString(c.text)) return fail(`cards.cards.text must be non-empty string. id=${id}`);
        if (c.icon != null && typeof c.icon !== "string") return fail(`cards.cards.icon must be string. id=${id}`);
      }
      return { ok: true };
    }
    case "checklist": {
      if (!isStringArray(p.items) || p.items.length < 1) return fail(`checklist.items must be non-empty string[]. id=${id}`);
      return { ok: true };
    }
    case "quote": {
      if (!isNonEmptyString(p.quote)) return fail(`quote.quote must be non-empty string. id=${id}`);
      if (p.author != null && typeof p.author !== "string") return fail(`quote.author must be string. id=${id}`);
      return { ok: true };
    }
    case "myth_reality": {
      if (!isNonEmptyString(p.myth)) return fail(`myth_reality.myth must be non-empty string. id=${id}`);
      if (!isNonEmptyString(p.reality)) return fail(`myth_reality.reality must be non-empty string. id=${id}`);
      return { ok: true };
    }
    case "selection": {
      if (!Array.isArray(p.options) || p.options.length < 1) return fail(`selection.options must be non-empty array. id=${id}`);
      for (const o of p.options) {
        if (!o || typeof o !== "object") return fail(`selection.options item must be object. id=${id}`);
        if (!isNonEmptyString(o.id)) return fail(`selection.options.id must be non-empty string. id=${id}`);
        if (!isNonEmptyString(o.label)) return fail(`selection.options.label must be non-empty string. id=${id}`);
        if (o.description != null && typeof o.description !== "string") return fail(`selection.options.description must be string. id=${id}`);
      }
      return { ok: true };
    }
    case "interactive_choice": {
      if (!isNonEmptyString(p.question)) return fail(`interactive_choice.question must be non-empty string. id=${id}`);
      if (!Array.isArray(p.options) || p.options.length < 1) return fail(`interactive_choice.options must be non-empty array. id=${id}`);
      for (const o of p.options) {
        if (!o || typeof o !== "object") return fail(`interactive_choice.options item must be object. id=${id}`);
        if (!isNonEmptyString(o.id)) return fail(`interactive_choice.options.id must be non-empty string. id=${id}`);
        if (!isNonEmptyString(o.label)) return fail(`interactive_choice.options.label must be non-empty string. id=${id}`);
        if (o.description != null && typeof o.description !== "string") return fail(`interactive_choice.options.description must be string. id=${id}`);
      }
      if (p.correctOptionId != null && typeof p.correctOptionId !== "string") return fail(`interactive_choice.correctOptionId must be string. id=${id}`);
      if (p.feedback != null) {
        if (typeof p.feedback !== "object") return fail(`interactive_choice.feedback must be object. id=${id}`);
        if (p.feedback.correct != null && typeof p.feedback.correct !== "string") return fail(`interactive_choice.feedback.correct must be string. id=${id}`);
        if (p.feedback.incorrect != null && typeof p.feedback.incorrect !== "string") return fail(`interactive_choice.feedback.incorrect must be string. id=${id}`);
      }
      return { ok: true };
    }
    case "quest": {
      if (!isStringArray(p.steps) || p.steps.length < 1) return fail(`quest.steps must be non-empty string[]. id=${id}`);
      return { ok: true };
    }
    case "bonus": {
      if (!isNonEmptyString(p.title)) return fail(`bonus.title must be non-empty string. id=${id}`);
      if (!isStringArray(p.bullets) || p.bullets.length < 1) return fail(`bonus.bullets must be non-empty string[]. id=${id}`);
      return { ok: true };
    }
    case "multi_cta": {
      if (!Array.isArray(p.ctas) || p.ctas.length < 1) return fail(`multi_cta.ctas must be non-empty array. id=${id}`);
      for (const c of p.ctas) {
        if (!c || typeof c !== "object") return fail(`multi_cta.ctas item must be object. id=${id}`);
        if (!isNonEmptyString(c.label)) return fail(`multi_cta.ctas.label must be non-empty string. id=${id}`);
        if (!isNonEmptyString(c.link)) return fail(`multi_cta.ctas.link must be non-empty string. id=${id}`);
        if (c.style != null && c.style !== "primary" && c.style !== "secondary") return fail(`multi_cta.ctas.style must be primary|secondary. id=${id}`);
      }
      return { ok: true };
    }
    case "cta": {
      if (!isNonEmptyString(p.label)) return fail(`cta.label must be non-empty string. id=${id}`);
      if (!isNonEmptyString(p.link)) return fail(`cta.link must be non-empty string. id=${id}`);
      if (p.note != null && typeof p.note !== "string") return fail(`cta.note must be string. id=${id}`);
      return { ok: true };
    }
    case "completion": {
      if (!isNonEmptyString(p.summary)) return fail(`completion.summary must be non-empty string. id=${id}`);
      if (p.nextCta != null) {
        if (typeof p.nextCta !== "object") return fail(`completion.nextCta must be object. id=${id}`);
        if (!isNonEmptyString(p.nextCta.label)) return fail(`completion.nextCta.label must be non-empty string. id=${id}`);
        if (!isNonEmptyString(p.nextCta.link)) return fail(`completion.nextCta.link must be non-empty string. id=${id}`);
      }
      return { ok: true };
    }
    default:
      return fail(`Unknown LessonScreen.type: ${String(type)}. id=${id}`);
  }
}

