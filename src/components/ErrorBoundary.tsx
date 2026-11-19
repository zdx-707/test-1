import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || 'حدث خطأ غير متوقع في التطبيق.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        readable = `تعذر إتمام العملية (${parsed.operationType}): ${parsed.error}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#08080A] text-[#F5F3EE] flex items-center justify-center p-6"
        >
          <div className="max-w-lg w-full bg-[#111216] border border-[#F5EEE0]/10 rounded-xl p-8 space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-xl font-bold font-display">تنبيه تقني في مساحة العمل</h2>
            </div>
            <p className="text-sm text-[#C8C5BD] leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#D4A853] hover:bg-[#E5BE72] text-[#08080A] rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة تحميل مساحة العمل</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
