export const WIDGET_CSS = `
:host, *, *::before, *::after { box-sizing: border-box; }
:host { 
  font-family: Inter, system-ui, -apple-system, Segoe UI, sans-serif;
  color: #111827;
}

.finam-onb-root { width: 100%; max-width: 100%; }

/* Modal frame (optional) */
.finam-onb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 2147483000;
}
.finam-onb-modal {
  width: min(720px, 100%);
  max-height: min(92vh, 900px);
  overflow: auto;
  border-radius: 16px;
}
`;

