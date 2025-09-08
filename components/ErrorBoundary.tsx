"use client";

import * as React from "react";

export interface ErrorBoundaryProps {
  /** Optional fallback UI to render when an error occurs */
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  /** Children to render under the boundary */
  children: React.ReactNode;
  /** Optional logger for errors */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    } else {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught error:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback(this.state.error ?? new Error("Unknown error"));
      }
      if (fallback) return fallback;

      // Default minimal fallback (keeps styling neutral)
      return (
        <div className="rounded-2xl border border-red-800/60 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="mb-1 font-semibold">Something went wrong.</div>
          <pre className="whitespace-pre-wrap break-words opacity-80">
            {(this.state.error?.message ?? "Unknown error")}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
