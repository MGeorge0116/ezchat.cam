"use client";
import React from "react";

type State = { hasError: boolean; message?: string };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: err?.message || "Unexpected error" };
  }

  componentDidCatch(error: any, info: any) {
    // You can post to your own logging endpoint here
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="card">
            <h3>Something went wrong.</h3>
            <p>{this.state.message}</p>
            <button className="button" onClick={() => this.setState({ hasError: false, message: undefined })}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
