"use client";

import React from "react";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches runtime rendering errors in the client tree and shows a safe fallback.
 */
export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message || "Unexpected UI error" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep this lightweight and client-safe for hackathon stability.
    console.error("UI boundary caught an error", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: "" });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-10">
        <div
          className="card w-full max-w-lg rounded-2xl p-6"
          role="alert"
          aria-live="assertive"
        >
          <p className="step-num mb-1 uppercase tracking-widest">System Notice</p>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-400">
            The interface hit an unexpected error. Your funds and keys are unaffected.
          </p>
          {this.state.message && (
            <p className="mt-3 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {this.state.message}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={this.handleRetry} className="btn-primary px-4 py-2 text-sm">
              Try again
            </button>
            <button onClick={this.handleReload} className="btn-secondary px-4 py-2 text-sm">
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
