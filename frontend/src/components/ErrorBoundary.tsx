"use client";

import { Component, type ReactNode } from "react";

/**
 * Minimal client-side error boundary. Catches render-time exceptions in its
 * subtree (e.g. a charting edge case) and shows a graceful fallback instead of
 * crashing the page or leaving it stuck. Used to harden the dashboard's
 * client-computed result sections for the prototype.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught a render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
            <p className="font-thai text-sm font-semibold text-foreground">
              ส่วนนี้แสดงผลไม่สำเร็จ
            </p>
            <p className="font-thai text-xs text-muted-foreground">
              ลองรีเฟรชหน้าอีกครั้ง หรือทำแบบประเมินใหม่ (This section could not be displayed.)
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
