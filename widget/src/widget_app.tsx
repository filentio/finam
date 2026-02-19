import React, { useEffect, useMemo, useRef } from "react";
import OnboardingShell from "../../05_onboarding_shell";
import { AnalyticsProvider } from "../../23_analytics_context";
import type { TrackFn } from "../../23_analytics_context";

export type WidgetAppProps = {
  mode: "inline" | "modal";
  isOpen: boolean;
  storageNamespace: string;
  track: TrackFn;
  assetBaseUrl: string;
  onRequestClose: () => void;
  debug: boolean;
};

export function WidgetApp(props: WidgetAppProps) {
  const content = useMemo(
    () => (
      <AnalyticsProvider track={props.track}>
        <OnboardingShell
          storageEnabled={true}
          storageNamespace={props.storageNamespace}
          assetBaseUrl={props.assetBaseUrl}
          showDebugHeader={props.debug}
          onRequestClose={props.onRequestClose}
        />
      </AnalyticsProvider>
    ),
    [props.track, props.storageNamespace, props.assetBaseUrl, props.onRequestClose, props.debug]
  );

  if (props.mode === "modal") {
    if (!props.isOpen) return null;
    return (
      <ModalFrame onRequestClose={props.onRequestClose} track={props.track}>
        {content}
      </ModalFrame>
    );
  }

  return <div className="finam-onb-root">{content}</div>;
}

let scrollLockCount = 0;
let prevBodyOverflow: string | null = null;
let prevBodyPaddingRight: string | null = null;

function lockScroll() {
  scrollLockCount += 1;
  if (scrollLockCount !== 1) return;
  const body = document.body;
  prevBodyOverflow = body.style.overflow;
  prevBodyPaddingRight = body.style.paddingRight;
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  body.style.overflow = "hidden";
  if (scrollBarWidth > 0) {
    body.style.paddingRight = `${scrollBarWidth}px`;
  }
}

function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount !== 0) return;
  const body = document.body;
  body.style.overflow = prevBodyOverflow ?? "";
  body.style.paddingRight = prevBodyPaddingRight ?? "";
  prevBodyOverflow = null;
  prevBodyPaddingRight = null;
}

function ModalFrame(props: { children: React.ReactNode; onRequestClose: () => void; track: TrackFn }) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    lockScroll();
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    requestAnimationFrame(() => {
      const el = modalRef.current;
      if (!el) return;
      const focusables = getFocusable(el);
      if (focusables.length) {
        focusables[0].focus();
      } else {
        el.focus();
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        props.onRequestClose();
        return;
      }
      if (e.key !== "Tab") return;
      const el = modalRef.current;
      if (!el) return;
      const focusables = getFocusable(el);
      if (!focusables.length) {
        e.preventDefault();
        el.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (!active || active === first || !el.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !el.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      unlockScroll();
      lastActiveRef.current?.focus?.();
    };
  }, [props]);

  return (
    <div
      className="finam-onb-overlay"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="finam-onb-modal" ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true">
        {props.children}
      </div>
    </div>
  );
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
  return candidates.filter((el) => {
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return true;
  });
}

