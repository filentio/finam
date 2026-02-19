import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { createTracker } from "../../09_analytics";
import { clearProgress } from "../../04_progress_storage";
import { WIDGET_CSS } from "./styles";
import { WidgetApp } from "./widget_app";

export type WidgetMode = "inline" | "modal";
export type WidgetOpenMode = "auto" | "manual";

export type WidgetConfig = {
  mode?: WidgetMode;
  open?: WidgetOpenMode;
  disableTracking?: boolean;
  storageNamespace?: string;
  locale?: string;
  theme?: string;
  debug?: boolean; // enables debug-only UI; default OFF
};

type Instance = {
  targetEl: Element;
  hostEl: HTMLElement;
  shadowRoot: ShadowRoot;
  reactRoot: Root;
  namespace: string;
  mode: WidgetMode;
  isOpen: boolean;
  disableTracking: boolean;
  assetBaseUrl: string;
  debug: boolean;
};

const DEFAULTS = {
  mode: "inline" as WidgetMode,
  open: "auto" as WidgetOpenMode,
  disableTracking: false,
  storageNamespace: "finam_onb_v1",
  locale: "ru",
  theme: "finam",
  debug: false,
};

const instancesByTarget = new Map<Element, Instance>();

const ASSET_BASE_URL = (() => {
  if (typeof document === "undefined") return "";
  const s = document.currentScript as HTMLScriptElement | null;
  if (!s?.src) return "";
  // script:  https://cdn/.../widget/finam-onboarding-widget.js
  // assets:  https://cdn/.../assets/...
  return new URL("../", s.src).toString();
})();

function normalizeConfig(config: WidgetConfig | undefined): Required<WidgetConfig> {
  return {
    mode: config?.mode ?? DEFAULTS.mode,
    open: config?.open ?? DEFAULTS.open,
    disableTracking: config?.disableTracking ?? DEFAULTS.disableTracking,
    storageNamespace: config?.storageNamespace ?? DEFAULTS.storageNamespace,
    locale: config?.locale ?? DEFAULTS.locale,
    theme: config?.theme ?? DEFAULTS.theme,
    debug: config?.debug ?? DEFAULTS.debug,
  };
}

function resolveTarget(target: string | Element): Element | null {
  if (typeof target === "string") {
    const el = document.querySelector(target);
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
  if (!targetEl) return;
  if (instancesByTarget.has(targetEl)) {
    unmount(targetEl);
  }

  const cfg = normalizeConfig(config);
  const { hostEl, shadowRoot, mountEl } = createShadowHost(targetEl);
  const reactRoot = createRoot(mountEl);

  const inst: Instance = {
    targetEl,
    hostEl,
    shadowRoot,
    reactRoot,
    namespace: cfg.storageNamespace,
    mode: cfg.mode,
    disableTracking: cfg.disableTracking,
    assetBaseUrl: ASSET_BASE_URL,
    isOpen: cfg.mode === "modal" ? false : true,
    debug: cfg.debug,
  };
  instancesByTarget.set(targetEl, inst);
  renderInstance(inst);

  if (cfg.mode === "modal" && cfg.open === "auto") {
    open(targetEl);
  }
}

export function unmount(target: string | Element): void {
  const targetEl = resolveTarget(target);
  if (!targetEl) return;
  const inst = instancesByTarget.get(targetEl);
  if (!inst) return;
  inst.reactRoot.unmount();
  inst.hostEl.remove();
  instancesByTarget.delete(targetEl);
}

export function open(target: string | Element): void {
  const targetEl = resolveTarget(target);
  if (!targetEl) return;
  const inst = instancesByTarget.get(targetEl);
  if (!inst) {
    mount(targetEl, { mode: "modal", open: "manual" });
    const inst2 = instancesByTarget.get(targetEl);
    if (!inst2) return;
    inst2.isOpen = true;
    renderInstance(inst2);
    return;
  }
  inst.isOpen = true;
  renderInstance(inst);
}

export function close(target: string | Element): void {
  const targetEl = resolveTarget(target);
  if (!targetEl) return;
  const inst = instancesByTarget.get(targetEl);
  if (!inst) return;
  if (inst.mode !== "modal") return;
  inst.isOpen = false;
  renderInstance(inst);
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

function parseOpen(raw: string | undefined): WidgetOpenMode | undefined {
  if (!raw) return undefined;
  if (raw === "auto" || raw === "manual") return raw;
  return undefined;
}

function renderInstance(inst: Instance): void {
  const track = createTracker({ disabled: inst.disableTracking, namespace: inst.namespace });
  inst.reactRoot.render(
    <WidgetApp
      mode={inst.mode}
      isOpen={inst.isOpen}
      storageNamespace={inst.namespace}
      assetBaseUrl={inst.assetBaseUrl}
      track={track}
      onRequestClose={() => close(inst.targetEl)}
      debug={inst.debug}
    />
  );
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
      open: parseOpen(s.dataset.open),
      disableTracking: parseBool(s.dataset.disableTracking),
      storageNamespace: s.dataset.storageNamespace ?? DEFAULTS.storageNamespace,
      locale: s.dataset.locale ?? DEFAULTS.locale,
      theme: s.dataset.theme ?? DEFAULTS.theme,
      debug: parseBool(s.dataset.debug),
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

