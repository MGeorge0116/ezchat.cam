// Reusable, strongly-typed React event helpers to replace `(e: any)`
// Import these into your components and remove the lingering `any` types.

import * as React from "react";

/** Form submit: (e: React.FormEvent<HTMLFormElement>) => void */
export type FormSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;

/** Button click: (e: React.MouseEvent<HTMLButtonElement>) => void */
export type ButtonClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

/** Select change: (e: React.ChangeEvent<HTMLSelectElement>) => void */
export type SelectChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => void;

/** Input change: (e: React.ChangeEvent<HTMLInputElement>) => void */
export type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

/** Message events (SSE, postMessage, etc.) */
export type SSEMessageHandler = (ev: MessageEvent) => void;

/** Common ref type for DIVs (useful for containers, tiles, etc.) */
export type DivRef = React.RefObject<HTMLDivElement>;

/* ────────────────────────────────────────────────────────────────────────── */
/* Factories / wrappers                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Wrap a form submit handler so it always `preventDefault()` first,
 * then passes the concrete HTMLFormElement to your logic.
 *
 * Usage:
 *   const onSubmit = withPreventDefault((form) => { ... });
 *   <form onSubmit={onSubmit}>...</form>
 */
export function withPreventDefault(
  handler: (formEl: HTMLFormElement) => void
): FormSubmitHandler {
  return (e) => {
    e.preventDefault();
    handler(e.currentTarget);
  };
}

/**
 * Strongly-typed button click handler.
 *
 * Usage:
 *   const onClick = onButtonClick((evt) => { ... });
 *   <button onClick={onClick}>...</button>
 */
export function onButtonClick(
  handler: (evt: React.MouseEvent<HTMLButtonElement>) => void
): ButtonClickHandler {
  return (e) => handler(e);
}

/**
 * Strongly-typed select change handler that also exposes the selected value.
 *
 * Usage:
 *   const onChange = onSelectChange((value, el) => { ... });
 *   <select onChange={onChange}>...</select>
 */
export function onSelectChange(
  handler: (value: string, el: HTMLSelectElement, evt: React.ChangeEvent<HTMLSelectElement>) => void
): SelectChangeHandler {
  return (e) => handler(e.currentTarget.value, e.currentTarget, e);
}

/**
 * Strongly-typed input change handler that also exposes the current value.
 *
 * Usage:
 *   const onChange = onInputChange((value) => setValue(value));
 *   <input onChange={onChange} />
 */
export function onInputChange(
  handler: (value: string, el: HTMLInputElement, evt: React.ChangeEvent<HTMLInputElement>) => void
): InputChangeHandler {
  return (e) => handler(e.currentTarget.value, e.currentTarget, e);
}

/**
 * Strongly-typed SSE message handler with safe JSON parsing.
 *
 * Usage:
 *   const onMessage = onSSEMessage<{ type: "message"; text: string }>((data) => { ... });
 *   es.addEventListener("message", onMessage);
 */
export function onSSEMessage<T = unknown>(
  handler: (data: T, ev: MessageEvent) => void,
  opts?: { json?: boolean } // you can set json=false to get raw string
): SSEMessageHandler {
  const useJson = opts?.json ?? true;
  return (ev: MessageEvent) => {
    if (!useJson) {
      // @ts-expect-error ev.data may be string | any; caller handles it
      handler(ev.data as T, ev);
      return;
    }
    try {
      const parsed = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
      handler(parsed as T, ev);
    } catch {
      // If parsing fails, pass through as-is (typed as unknown)
      // @ts-expect-error allow caller to decide how to handle bad payloads
      handler(ev.data as T, ev);
    }
  };
}

/**
 * Hook helper for a div ref (`React.useRef<HTMLDivElement | null>(null)`).
 *
 * Usage:
 *   const containerRef = useDivRef();
 *   return <div ref={containerRef}>...</div>
 */
export function useDivRef(): DivRef {
  return React.useRef<HTMLDivElement>(null);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Convenience inline types you can import directly                           */
/* ────────────────────────────────────────────────────────────────────────── */

export type {
  ReactEventHandler as ReactEventHandlerAny,
} from "react";

/* Example inline signatures you can copy if you prefer not to import helpers:

function onSubmit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); /* ... */ }
function onClick(e: React.MouseEvent<HTMLButtonElement>) { /* ... */ }
function onSelect(e: React.ChangeEvent<HTMLSelectElement>) { const v = e.currentTarget.value; /* ... */ }
function onInput(e: React.ChangeEvent<HTMLInputElement>) { const v = e.currentTarget.value; /* ... */ }
function onMessage(ev: MessageEvent) { /* ev.data is string (or JSON) */ }
const ref = React.useRef<HTMLDivElement | null>(null);

*/
