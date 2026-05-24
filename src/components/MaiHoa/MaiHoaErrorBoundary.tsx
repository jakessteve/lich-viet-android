import React, { Component, ErrorInfo, ReactNode } from 'react';
import { reportError } from '../../utils/errorReporter';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MaiHoaErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      component: 'MaiHoaErrorBoundary',
      action: 'componentDidCatch',
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="maihoa-error-boundary p-6 bg-red-50 text-red-900 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-2 flex items-center">
            <span className="mr-2">⚠️</span>
            Đã có lỗi xảy ra khi tính toán quẻ
          </h2>
          <p className="text-sm mb-4">
            Xin lỗi, thuật toán Mai Hoa gặp phải một dữ liệu không hợp lệ. Vui lòng thử lại với thời gian hoặc số khác.
          </p>
          <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">{this.state.error?.message}</pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
