export type CommonLessonId = import("./10_common_lessons_config").LessonId;
export type BranchLessonId = import("./17_branch_config").LessonId;

// A "lesson" in the flow is addressed by an ID from either common lessons or branch lessons.
export type LessonId = CommonLessonId | BranchLessonId;

// Screen IDs inside a lesson must be unique within that lesson.
// We keep it as string because branch screen IDs come from content source (e.g. s02a_start_intro).
export type LessonScreenId = string;

export type ScreenType =
  | "intro"
  | "content"
  | "cards"
  | "checklist"
  | "quote"
  | "myth_reality"
  | "selection"
  | "interactive_choice"
  | "quest"
  | "bonus"
  | "multi_cta"
  | "cta"
  | "completion";

export type LessonAsset = {
  type: "image" | "icon";
  src: string; // relative `assets/...` or absolute URL
  alt: string;
};

export type LessonScreenBase = {
  id: LessonScreenId;
  type: ScreenType;
  title?: string;
  body?: string;
  assets?: LessonAsset[];
};

export type IntroPayload = { subtitle?: string; description?: string; heroIcon?: string };
export type ContentPayload = { paragraphs: string[] };
export type CardsPayload = { cards: Array<{ title: string; text: string; icon?: string }> };
export type ChecklistPayload = { items: string[] };
export type QuotePayload = { quote: string; author?: string };
export type MythRealityPayload = { myth: string; reality: string };
export type SelectionPayload = { options: Array<{ id: string; label: string; description?: string }> };
export type InteractiveChoicePayload = {
  question: string;
  options: Array<{ id: string; label: string; description?: string }>;
  correctOptionId?: string;
  feedback?: { correct?: string; incorrect?: string };
};
export type QuestPayload = { steps: string[] };
export type BonusPayload = { title: string; bullets: string[] };
export type MultiCtaPayload = { ctas: Array<{ label: string; link: string; style?: "primary" | "secondary" }> };
export type CtaPayload = { label: string; link: string; note?: string };
export type CompletionPayload = { summary: string; nextCta?: { label: string; link: string } };

export type LessonScreen =
  | (LessonScreenBase & { type: "intro"; payload: IntroPayload })
  | (LessonScreenBase & { type: "content"; payload: ContentPayload })
  | (LessonScreenBase & { type: "cards"; payload: CardsPayload })
  | (LessonScreenBase & { type: "checklist"; payload: ChecklistPayload })
  | (LessonScreenBase & { type: "quote"; payload: QuotePayload })
  | (LessonScreenBase & { type: "myth_reality"; payload: MythRealityPayload })
  | (LessonScreenBase & { type: "selection"; payload: SelectionPayload })
  | (LessonScreenBase & { type: "interactive_choice"; payload: InteractiveChoicePayload })
  | (LessonScreenBase & { type: "quest"; payload: QuestPayload })
  | (LessonScreenBase & { type: "bonus"; payload: BonusPayload })
  | (LessonScreenBase & { type: "multi_cta"; payload: MultiCtaPayload })
  | (LessonScreenBase & { type: "cta"; payload: CtaPayload })
  | (LessonScreenBase & { type: "completion"; payload: CompletionPayload });

export type LessonData = {
  lessonId: LessonId;
  screens: LessonScreen[]; // strict order
};

