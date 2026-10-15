import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-6 rounded-3xl bg-slate-900/90 border-2 border-red-500/50 text-slate-100 max-w-xl mx-auto shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-red-400 mb-3">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <h3 className="font-mystic font-bold text-lg">
              {this.props.fallbackTitle || 'Đã xảy ra lỗi hiển thị'}
            </h3>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            Hệ thống gặp sự cố nhỏ khi hiển thị phân mục này. Vui lòng bấm nút bên dưới để khôi phục hoặc tải lại trang.
          </p>
          {this.state.error && (
            <div className="text-xs font-mono p-3 bg-slate-950 rounded-xl text-red-300/80 mb-4 overflow-x-auto border border-red-500/20">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tải Lại Phân Mục</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
