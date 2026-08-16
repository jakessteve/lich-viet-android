import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { reportError } from '../../utils/errorReporter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
        <Card className="p-6 bg-red-50/90 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800/60 rounded-2xl shadow-sm space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Đã có lỗi xảy ra khi tính toán quẻ
          </h2>
          <p className="text-sm">
            Xin lỗi, thuật toán Mai Hoa gặp phải dữ liệu không hợp lệ. Vui lòng thử lại với thời gian hoặc số khác.
          </p>
          {this.state.error?.message && (
            <pre className="text-xs bg-red-100/80 dark:bg-red-900/30 p-2.5 rounded-xl overflow-auto max-h-32 text-red-800 dark:text-red-300 font-mono">
              {this.state.error.message}
            </pre>
          )}
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="destructive"
            size="sm"
            className="gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
