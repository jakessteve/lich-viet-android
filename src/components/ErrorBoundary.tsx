import React, { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '../utils/errorReporter';

/**
 * Props for the reusable ErrorBoundary component.
 * @property children - The child component tree to protect.
 * @property viewName - Human-readable name of the view for the error message.
 * @property onReset - Optional callback invoked when the user clicks "Try again".
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  viewName: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic, reusable React Error Boundary.
 *
 * Catches uncaught JavaScript errors in the component tree below it,
 * logs them, and renders a styled fallback UI instead of crashing.
 *
 * Designed to match the app's Apple-inspired dark/light theme.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      component: `ErrorBoundary:${this.props.viewName}`,
      action: 'componentDidCatch',
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="card-surface mx-auto max-w-lg my-12" role="alert" aria-live="assertive">
          {/* Header */}
          <div className="card-header border-b border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-2xl text-red-500 dark:text-red-400" aria-hidden="true">
                error_outline
              </span>
              <div>
                <h2 className="text-base font-bold text-red-800 dark:text-red-300">Đã có lỗi xảy ra</h2>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Mục: {this.props.viewName}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              Xin lỗi, phần <strong>{this.props.viewName}</strong> gặp lỗi không mong muốn. Bạn có thể thử lại hoặc chọn
              một mục khác.
            </p>

            {/* Error Detail (collapsed by default for clean UX) */}
            {this.state.error && (
              <details className="group">
                <summary className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors select-none">
                  <span className="material-icons-round text-sm align-middle mr-1" aria-hidden="true">
                    code
                  </span>
                  Chi tiết lỗi
                </summary>
                <pre className="mt-2 text-xs leading-relaxed bg-gray-100 dark:bg-gray-800 text-red-700 dark:text-red-300 p-3 rounded-lg overflow-auto max-h-40 border border-gray-200 dark:border-gray-700">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Action */}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
              aria-label={`Thử lại ${this.props.viewName}`}
            >
              <span className="material-icons-round text-base" aria-hidden="true">
                refresh
              </span>
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
