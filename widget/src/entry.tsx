import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { createTracker } from "../../09_analytics";
import { clearProgress } from "../../04_progress_storage";
import { WIDGET_CSS } from "./styles";
import { WidgetApp } from "./widget_app";

export type WidgetMode = "inline" | "modal";

export type WidgetConfig = {
  mode?: WidgetMode;
  disableTracking?: boolean;
  storageNamespace?: string;
  locale?: string;
  theme?: string;
};

type Instance = {
  targetEl: Element;
  hostEl: HTMLElement;
  shadowRoot: ShadowRoot;
  reactRoot: Root;
  namespace: string;
};

const DEFAULTS = {
  mode: "inline" as WidgetMode,
  disableTracking: false,
  storageNamespace: "finam_onb_v1",
  locale: "ru",
  theme: "finam",
};

const instancesByTarget = new Map<Element, Instance>();

function normalizeConfig(config: WidgetConfig | undefined): Required<WidgetConfig> {
  return {
    mode: config?.mode ?? DEFAULTS.mode,
    disableTracking: config?.disableTracking ?? DEFAULTS.disableTracking,
    storageNamespace: config?.storageNamespace ?? DEFAULTS.storageNamespace,
    locale: config?.locale ?? DEFAULTS.locale,
    theme: config?.theme ?? DEFAULTS.theme,
  };
}

function resolveTarget(target: string | Element): Element {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) throw new Error(`FinamOnboardingWidget: target not found for selector: ${target}`);
    return el;
  }
  return target;
}

function createShadowHost(targetEl: Element): { hostEl: HTMLElement; shadowRoot: ShadowRoot; mountEl: HTMLElement } {
  const hostEl = document.createElement("div");
  hostEl.setAttribute("data-finam-onboarding-host", "1");

  // Inline host behavior: fill container, no horizontal scroll.
  hostEl.style.width = "100%";
  hostEl.style.maxWidth = "100%";

  targetEl.appendChild(hostEl);

  const shadowRoot = hostEl.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = WIDGET_CSS;
  shadowRoot.appendChild(style);

  const mountEl = document.createElement("div");
  shadowRoot.appendChild(mountEl);

  return { hostEl, shadowRoot, mountEl };
}

export function mount(target: string | Element, config?: WidgetConfig): void {
  const targetEl = resolveTarget(target);
  if (instancesByTarget.has(targetEl)) {
    unmount(targetEl);
  }

  const cfg = normalizeConfig(config);
  const { hostEl, shadowRoot, mountEl } = createShadowHost(targetEl);
  const reactRoot = createRoot(mountEl);

  const track = createTracker({ disabled: cfg.disableTracking, namespace: cfg.storageNamespace });

  reactRoot.render(<WidgetApp mode={cfg.mode} storageNamespace={cfg.storageNamespace} track={track} />);

  instancesByTarget.set(targetEl, { targetEl, hostEl, shadowRoot, reactRoot, namespace: cfg.storageNamespace });
}

export function unmount(target: string | Element): void {
  const targetEl = resolveTarget(target);
  const inst = instancesByTarget.get(targetEl);
  if (!inst) return;
  inst.reactRoot.unmount();
  inst.hostEl.remove();
  instancesByTarget.delete(targetEl);
}

export function reset(namespace: string): void {
  clearProgress(namespace);
}

function parseBool(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

function parseMode(raw: string | undefined): WidgetMode | undefined {
  if (!raw) return undefined;
  if (raw === "inline" || raw === "modal") return raw;
  return undefined;
}

function autoMountFromScriptTags(): void {
  if (typeof document === "undefined") return;
  const scripts = Array.from(document.querySelectorAll("script[data-target]")) as HTMLScriptElement[];
  for (const s of scripts) {
    // Only auto-mount scripts that load this widget bundle.
    if (!s.src || !s.src.includes("finam-onboarding-widget")) continue;
    if ((s as any).__finamOnbMounted) continue;
    const target = s.dataset.target;
    if (!target) continue;
    const cfg: WidgetConfig = {
      mode: parseMode(s.dataset.mode),
      disableTracking: parseBool(s.dataset.disableTracking),
      storageNamespace: s.dataset.storageNamespace ?? DEFAULTS.storageNamespace,
      locale: s.dataset.locale ?? DEFAULTS.locale,
      theme: s.dataset.theme ?? DEFAULTS.theme,
    };
    try {
      mount(target, cfg);
      (s as any).__finamOnbMounted = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("FinamOnboardingWidget auto-mount failed", e);
    }
  }
}

// Auto-mount on load (CDN embed).
autoMountFromScriptTags();

